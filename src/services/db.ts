import { supabase } from '../supabase';
import { VitalReading, Medication, DailyCheckin, ElderlyProfile, Appointment, HealthCheck } from '../types';

export const subscribeToUserProfile = (userId: string, callback: (profile: ElderlyProfile | null) => void) => {
  let isMounted = true;
  
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && isMounted) {
        // Synchronize caretaker info from profiles to caretakers table on load
        if (data.guardian_name || data.guardian_phone) {
          const { data: existing, error: checkErr } = await supabase.from('caretakers').select('id').eq('patient_id', userId).limit(1);
          if (!checkErr) {
            if (existing && existing.length > 0) {
              const { error: syncError } = await supabase.from('caretakers').update({ name: data.guardian_name || '', phone: data.guardian_phone || '' }).eq('id', existing[0].id);
              if (syncError) console.warn("Could not synchronize caretaker info:", syncError?.message || syncError);
            } else {
              const { error: syncError } = await supabase.from('caretakers').insert([{ patient_id: userId, name: data.guardian_name || '', phone: data.guardian_phone || '', is_primary: true }]);
              if (syncError) console.warn("Could not synchronize caretaker info:", syncError?.message || syncError);
            }
          }
        }

        // Fetch caretakers as well
        const { data: caretakersData } = await supabase
          .from('caretakers')
          .select('*')
          .eq('patient_id', userId);
          
        callback({
          id: data.id,
          role: data.role || "user",
          name: (data.name || data.full_name) || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          bloodGroup: data.blood_group || '',
          basicHealthInfo: data.health_info || '',
          passionsLifestyle: data.lifestyle || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          caretakers: (caretakersData || []).map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            age: c.age?.toString() || '',
            gender: c.gender || '',
            relation: c.relation || '',
            isPrimary: !!c.is_primary,
          }))
        } as any);
      }
    } catch (error) {
      console.warn("Could not fetch profile:", error?.message || error);
    }
  };
  
  fetchProfile();
  
  return () => { isMounted = false; };
};

export const saveUserProfile = async (userId: string, profile: ElderlyProfile) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profile.name,
        phone: profile.phone,
        age: parseInt(profile.age) || 0,
        gender: profile.gender,
        blood_group: profile.bloodGroup,
        health_info: profile.basicHealthInfo,
        lifestyle: profile.passionsLifestyle,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        emergency_contact_relationship: profile.emergency_contact_relationship,
        role: profile.role || 'patient',
      });
      
    if (error) throw error;

    // 2. PRIMARY CARETAKER IDENTIFICATION & SAVE
    // Synchronize caretakers array with caretakers table
    if (profile.caretakers && profile.caretakers.length > 0) {
      console.log("[saveUserProfile] Saving caretakers:", profile.caretakers);
      
      // Upsert all caretakers sent from the frontend
      // For any caretaker marked as primary, others will be non-primary
      let primaryFound = false;
      const incomingIds = [];
      
      const caretakersToUpsert = profile.caretakers.map(c => {
        let isPrimary = c.isPrimary;
        if (isPrimary) {
           if (primaryFound) isPrimary = false; // only one primary allowed
           primaryFound = true;
        }
        return {
          id: c.id && c.id.length === 36 ? c.id : undefined, // Only use UUIDs if they exist, let Supabase generate if new
          patient_id: userId,
          name: c.name,
          phone: c.phone,
          email: c.email,
          age: c.age ? parseInt(c.age) || null : null,
          gender: c.gender,
          relation: c.relation,
          is_primary: isPrimary
        };
      });

      console.log("[saveUserProfile] caretakersToUpsert:", caretakersToUpsert);
      
      for (const ct of caretakersToUpsert) {
         if (ct.id) {
           const { error: syncError } = await supabase.from('caretakers').update(ct).eq('id', ct.id);
           if (syncError) {
              console.error("Failed to update caretaker:", syncError);
              throw syncError;
           }
           incomingIds.push(ct.id);
         } else {
           // For new inserts, remove the undefined id
           const { id, ...insertData } = ct;
           console.log("[saveUserProfile] Authenticated User ID:", userId);
           console.log("[saveUserProfile] Inserting new caretaker payload:", insertData);
           const { data: newRow, error: syncError } = await supabase.from('caretakers').insert([insertData]).select('id').single();
           if (syncError) {
              console.error("Failed to insert caretaker:", syncError);
              throw syncError;
           }
           if (newRow) incomingIds.push(newRow.id);
         }
      }
      
      // Cleanup any deleted caretakers
      if (incomingIds.length > 0) {
        await supabase.from('caretakers').delete().eq('patient_id', userId).not('id', 'in', `(${incomingIds.join(',')})`);
      } else {
        await supabase.from('caretakers').delete().eq('patient_id', userId);
      }
    } else {
      // If array is empty, delete all caretakers for this patient
      await supabase.from('caretakers').delete().eq('patient_id', userId);
    }
  } catch (error) {
    console.error("Failed to save profile:", error);
    throw error;
  }
};

export const subscribeToVitals = (userId: string, callback: (vitals: VitalReading[]) => void) => {
  let isMounted = true;
  
  const fetchVitals = async () => {
    try {
      const data = await fetchVitalsData(userId);
      if (isMounted) callback(data);
    } catch(e) {
      console.warn("Notice loading vitals:", e);
    }
  };
  
  fetchVitals();
  
  return () => { isMounted = false; };
};

export const saveVitalReading = async (userId: string, vital: VitalReading) => {
  try {
    const { error } = await supabase
      .from('vitals')
      .insert([{
        patient_id: userId,
        type: vital.type,
        value: vital.value,
        unit: vital.unit,
        timestamp: new Date().toISOString(),
        status: vital.status,
        note: vital.note
      }]);
    if (error) throw error;
  } catch (error: any) {
    if (error?.code === 'PGRST205' || error?.code === 'PGRST116' || error?.code === '42703' || error?.message?.includes('schema cache') || error?.message?.includes('Failed to fetch')) {
       console.warn("Vitals table not found. Falling back to local storage.", error);
       
       // Fallback to local storage
       try {
         const key = `apna_mitra_vitals_${userId}`;
         const existing = localStorage.getItem(key);
         const list = existing ? JSON.parse(existing) : [];
         list.unshift({
           ...vital,
           timestamp: new Date().toISOString()
         });
         localStorage.setItem(key, JSON.stringify(list));
         return;
       } catch (e) {
         console.error("Local storage fallback failed", e);
       }
    }
    console.error("Failed to save vital:", error);
    throw error;
  }
};

export const subscribeToMedications = (userId: string, callback: (medications: Medication[]) => void) => {
  let isMounted = true;
  const fetchMeds = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', userId);
        
      if (!error && data && isMounted) {
        callback(data.map(d => ({
          id: d.id,
          name: d.name,
          dosage: d.dosage,
          timing: d.timing,
          takenToday: d.taken_today || false,
          instructions: d.instructions,
          scheduledTime: d.scheduled_time,
          remainingPills: d.remaining_pills,
          totalPills: d.total_pills,
          critical: d.critical,
          snoozedUntil: d.snoozed_until
        }) as Medication));
        return;
      }
      if (error) throw error;
    } catch (err: any) {
      console.warn("Medications remote query notice:", err?.message || err);
      try {
        const key = `apna_mitra_meds_${userId}`;
        const local = localStorage.getItem(key);
        if (local && isMounted) {
          callback(JSON.parse(local));
        }
      } catch (e) {
        console.warn("Meds local fallback error:", e);
      }
    }
  };
  fetchMeds();
  return () => { isMounted = false; };
};

export const saveMedication = async (userId: string, medication: Medication) => {
  try {
    const key = `apna_mitra_meds_${userId}`;
    const local = localStorage.getItem(key);
    let list: Medication[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(m => m.id === medication.id);
    if (idx >= 0) {
      list[idx] = medication;
    } else {
      list.push(medication);
    }
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn("Meds local save error:", e);
  }

  try {
    const { error } = await supabase
      .from('medications')
      .upsert({
        id: medication.id.startsWith('m-') ? undefined : medication.id,
        patient_id: userId,
        name: medication.name,
        dosage: medication.dosage,
        timing: medication.timing,
        taken_today: medication.takenToday,
        instructions: medication.instructions,
        scheduled_time: medication.scheduledTime,
        remaining_pills: medication.remainingPills,
        total_pills: medication.totalPills,
        critical: medication.critical,
        snoozed_until: medication.snoozedUntil
      });
    if (error) console.warn("Remote saveMedication notice:", error.message || error);
  } catch (error) {
    console.warn("Failed to save medication remotely:", error);
  }
};

export const deleteMedicationRemote = async (userId: string, medicationId: string) => {
  try {
    const key = `apna_mitra_meds_${userId}`;
    const local = localStorage.getItem(key);
    if (local) {
      const list: Medication[] = JSON.parse(local);
      localStorage.setItem(key, JSON.stringify(list.filter(m => m.id !== medicationId)));
    }
  } catch (e) {
    console.warn("Meds local delete error:", e);
  }

  try {
    if (!medicationId.startsWith('m-')) {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId)
        .eq('patient_id', userId);
      if (error) console.warn("Remote deleteMedication notice:", error.message || error);
    }
  } catch (error) {
    console.warn("Failed to delete medication remotely:", error);
  }
};

export const subscribeToCheckins = (userId: string, callback: (checkins: DailyCheckin[]) => void) => {
  let isMounted = true;
  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('patient_id', userId)
        .order('appointment_date', { ascending: false });
        
      if (!error && data && isMounted) {
        callback(data.map(d => ({
          id: d.id,
          date: d.appointment_date,
          mood: d.mood,
          symptoms: d.symptoms || [],
          notes: d.notes
        }) as DailyCheckin));
        return;
      }
      if (error) throw error;
    } catch (err: any) {
      console.warn("Daily checkins remote query notice:", err?.message || err);
      try {
        const key = `apna_mitra_checkins_${userId}`;
        const local = localStorage.getItem(key);
        if (local && isMounted) {
          callback(JSON.parse(local));
        }
      } catch (e) {
        console.warn("Checkins local fallback error:", e);
      }
    }
  };
  fetchCheckins();
  return () => { isMounted = false; };
};

export const saveCheckin = async (userId: string, checkin: DailyCheckin) => {
  try {
    const key = `apna_mitra_checkins_${userId}`;
    const local = localStorage.getItem(key);
    const list = local ? JSON.parse(local) : [];
    localStorage.setItem(key, JSON.stringify([checkin, ...list]));
  } catch (e) {
    console.warn("Checkins local save error:", e);
  }

  try {
    const { error } = await supabase
      .from('daily_checkins')
      .insert([{
        patient_id: userId,
        date: checkin.date,
        mood: checkin.mood,
        symptoms: checkin.symptoms,
        notes: checkin.notes
      }]);
    if (error) console.warn("Remote saveCheckin notice:", error.message || error);
  } catch (error) {
    console.warn("Failed to save checkin remotely:", error);
  }
};

export const subscribeToAppointments = (userId: string, callback: (appointments: Appointment[]) => void) => {
  let isMounted = true;
  const fetchAppts = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', userId)
      .order('appointment_date', { ascending: false });
      
    if (!error && data && isMounted) {
      callback(data.map(d => ({
        id: d.id,
        doctorId: d.doctor_id,
        doctorName: d.doctor_name,
        hospital: d.hospital,
        date: d.appointment_date,
        time: d.appointment_time,
        reason: d.reason,
        patientName: d.patient_name,
        patientEmail: '',
        status: d.status
      }) as Appointment));
    }
  };
  fetchAppts();
  return () => { isMounted = false; };
};

export const saveHealthCheck = async (userId: string, healthCheck: HealthCheck) => {
  try {
    const { error } = await supabase
      .from('health_checks')
      .insert([{
        patient_id: userId,
        symptoms: healthCheck.symptoms,
        severity: healthCheck.severity,
        summary: healthCheck.summary,
        urgency: healthCheck.urgency,
        urgency_color: healthCheck.urgencyColor,
        // Omitted to match schema

      }]);
    if (error) throw error;
  } catch (error) {
    console.error("Supabase Save Error (Health Check):", error);
    throw error;
  }
};

export const subscribeToHealthChecks = (userId: string, callback: (checks: HealthCheck[]) => void) => {
  let isMounted = true;
  const fetchChecks = async () => {
    const { data, error } = await supabase
      .from('health_checks')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });
      
    if (!error && data && isMounted) {
      callback(data.map(d => ({
        id: d.id,
        symptoms: d.symptoms,
        severity: d.severity,
        summary: d.summary,
        urgency: d.urgency,
        urgencyColor: d.urgency_color,
        careTips: d.care_tips,
        redFlagWarnings: d.red_flag_warnings,
        recommendedSpecialties: d.recommended_specialties,
        createdAt: d.created_at
      }) as HealthCheck));
    }
  };
  fetchChecks();
  return () => { isMounted = false; };
};

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;  
  experience: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
  available_days: string[] | string;
  available_time_start: string;
  available_time_end: string;
}

export const fetchDoctors = async () => {
  try {
    const { data, error } = await supabase.from('doctors').select('*').order('name');
    if (error) throw error;
    return (data || []) as Doctor[];
  } catch (error: any) {
    console.warn("Fetch doctors notice:", error?.message || error);
    return [];
  }
};

export const fetchBookedTimes = async (doctorId: string, date: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');
    if (error) throw error;
    return data.map(row => row.appointment_time);
  } catch (error) {
    console.error("Fetch booked times error:", error);
    return [];
  }
};

export const bookDoctorAppointment = async (
  patientId: string, 
  doctorId: string, 
  date: string, 
  time: string, 
  reason: string,
  doctorName?: string,
  hospital?: string,
  patientName?: string
) => {
  try {
    // Check if already booked
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled');
      
    if (existing && existing.length > 0) {
      throw new Error("This time slot is already booked.");
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: date,
        appointment_time: time,
        status: 'pending',
        reason: reason || '',
        
        
        // removed old date/time aliases
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Supabase Book Appointment Error:", error);
    throw error;
  }
};

// also adding back saveAppointment which might have been deleted
export const saveAppointment = async (userId: string, appointment: any) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: userId,
        doctor_id: appointment.doctorId || "doc-unknown",
        
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        status: appointment.status || 'pending',
        reason: appointment.reason || ''
      }]);
    if (error) throw error;
  } catch (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
};

// --- BRAIN GAMES POINTS SYSTEM ---

export interface GameResult {
  id?: string;
  user_id: string;
  game_id: string;
  difficulty?: string;
  score?: number;
  points_earned: number;
  content_id?: string;
  accuracy?: number;
  completion_status?: boolean;
  played_at?: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  current_level: string;
  games_completed: number;
  daily_streak: number;
  last_played_at?: string;
}

export const saveGameResult = async (result: GameResult) => {
  try {
    const { data, error } = await supabase.from('game_results').insert([result]);
    if (error) throw error;
    
    // Update user points
    await updateUserPoints(result.user_id, result.points_earned);
    
    return data;
  } catch (error) {
    console.error("Save game result error:", error);
  }
};

export const fetchUserPoints = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('user_points').select('*').eq('user_id', userId).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    
    if (!data) {
       // Initialize if not exists
       const initial: UserPoints = {
         user_id: userId,
         total_points: 0,
         current_level: 'Bronze',
         games_completed: 0,
         daily_streak: 0,
       };
       try {
         await supabase.from('user_points').insert([initial]);
       } catch (insertErr) {
         console.warn("Could not insert initial points:", insertErr);
       }
       return initial;
    }
    
    return data as UserPoints;
  } catch (error: any) {
    console.warn("Fetch user points notice:", error?.message || error);
    return {
      user_id: userId,
      total_points: 0,
      current_level: 'Bronze',
      games_completed: 0,
      daily_streak: 0,
    };
  }
};

export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  try {
    const current = await fetchUserPoints(userId);
    if (!current) return;
    
    const newTotal = current.total_points + pointsToAdd;
    let newLevel = current.current_level;
    
    if (newTotal >= 1000) newLevel = 'Platinum';
    else if (newTotal >= 500) newLevel = 'Gold';
    else if (newTotal >= 200) newLevel = 'Silver';
    else newLevel = 'Bronze';
    
    // Simple streak logic (could be improved with real dates)
    let newStreak = current.daily_streak;
    const now = new Date();
    if (current.last_played_at) {
       const lastPlayed = new Date(current.last_played_at);
       const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       
       if (diffDays === 1 || diffDays === 0) { // Same day or next day
         if(diffDays === 1) newStreak += 1;
       } else {
         newStreak = 1;
       }
    } else {
       newStreak = 1;
    }
    
    const updates = {
      total_points: newTotal,
      current_level: newLevel,
      games_completed: current.games_completed + 1,
      daily_streak: newStreak,
      last_played_at: now.toISOString(),
    };
    
    await supabase.from('user_points').update(updates).eq('user_id', userId);
  } catch (error) {
    console.error("Update user points error:", error);
  }
};

export const fetchRecentGameResults = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('game_results').select('*').eq('user_id', userId).order('played_at', { ascending: false }).limit(5);
    if (error) throw error;
    return data as GameResult[];
  } catch (error) {
    console.error("Fetch game results error:", error);
    return [];
  }
};


export const savePushSubscription = async (userId: string, subscription: PushSubscription) => {
  try {
    const subJSON = subscription.toJSON();
    const userTimezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';
    
    // Find the primary caretaker for this patient
    const { data: primaryCaretaker } = await supabase
      .from('caretakers')
      .select('id')
      .eq('patient_id', userId)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle();

    let caretakerId = primaryCaretaker?.id;
    if (!caretakerId) {
      const { data: firstCaretaker } = await supabase
        .from('caretakers')
        .select('id')
        .eq('patient_id', userId)
        .limit(1)
        .maybeSingle();
      caretakerId = firstCaretaker?.id;
    }

    // Try upserting with timezone and reminders_enabled
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        patient_uid: userId,
        caretaker_id: caretakerId || null,
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth,
        timezone: userTimezone,
        reminders_enabled: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'endpoint' });
      
    if (error) {
      // Fallback in case table doesn't have custom columns yet
      console.warn("Save push subscription with timezone warning, retrying baseline:", error.message);
      const { error: fallbackError } = await supabase
        .from('push_subscriptions')
        .upsert({
          patient_uid: userId,
          caretaker_id: caretakerId || null,
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth,
        }, { onConflict: 'endpoint' });
      if (fallbackError) throw fallbackError;
    }
  } catch (error) {
    console.error("Save Push Subscription Error:", error);
    throw error;
  }
};

export const updateRemindersEnabled = async (userId: string, enabled: boolean) => {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ reminders_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('patient_uid', userId);
    if (error) console.warn("Update reminders_enabled notice:", error.message);
  } catch (err) {
    console.warn("Update reminders error:", err);
  }
};

export const getPatientReminderSettings = async (userId: string): Promise<{ remindersEnabled: boolean; hasSubscription: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('reminders_enabled')
      .eq('patient_uid', userId)
      .limit(1);

    if (!error && data && data.length > 0) {
      return {
        remindersEnabled: data[0].reminders_enabled !== false,
        hasSubscription: true,
      };
    }
    return { remindersEnabled: true, hasSubscription: false };
  } catch {
    return { remindersEnabled: true, hasSubscription: false };
  }
};

export const checkPushSubscription = async (userId: string, endpoint: string) => {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('patient_uid', userId)
      .eq('endpoint', endpoint)
      .maybeSingle();
      
    return !!data;
  } catch (error) {
    return false;
  }
};


export const fetchVitalsData = async (userId: string): Promise<VitalReading[]> => {
  try {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', userId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    if (!data) return [];
    
    const vitals = data.map(d => ({
      id: d.id,
      type: d.type,
      value: d.value,
      unit: d.unit,
      timestamp: d.timestamp,
      status: d.status,
      note: d.note
    }) as VitalReading);

    // Synchronize to local storage cache for offline availability
    try {
      const key = `apna_mitra_vitals_${userId}`;
      localStorage.setItem(key, JSON.stringify(vitals));
    } catch {
      // ignore
    }

    return vitals;
  } catch (error: any) {
    console.warn("Vitals fetch remote notice, using local cache:", error?.message || error);
    try {
      const key = `apna_mitra_vitals_${userId}`;
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  }
};
