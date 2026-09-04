const fs = require('fs');

const code = `import { supabase } from '../supabase';
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
        // Fetch caretakers as well
        const { data: caretakersData } = await supabase
          .from('caretakers')
          .select('*')
          .eq('patient_id', userId);
          
        callback({
          id: data.id,
          name: data.full_name || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          bloodGroup: data.blood_group || '',
          basicHealthInfo: data.health_info || '',
          passionsLifestyle: data.lifestyle || '',
          caretakers: (caretakersData || []).map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            age: c.age?.toString() || '',
            gender: c.gender || '',
            relation: c.relation || '',
          }))
        } as any);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
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
      });
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
};

export const subscribeToVitals = (userId: string, callback: (vitals: VitalReading[]) => void) => {
  let isMounted = true;
  
  const fetchVitals = async () => {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', userId)
      .order('timestamp', { ascending: false });
      
    if (!error && data && isMounted) {
      callback(data.map(d => ({
        id: d.id,
        type: d.type,
        value: d.value,
        unit: d.unit,
        timestamp: d.timestamp,
        status: d.status,
        note: d.note
      }) as VitalReading));
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
  } catch (error) {
    console.error("Failed to save vital:", error);
  }
};

export const subscribeToMedications = (userId: string, callback: (medications: Medication[]) => void) => {
  let isMounted = true;
  const fetchMeds = async () => {
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
    }
  };
  fetchMeds();
  return () => { isMounted = false; };
};

export const saveMedication = async (userId: string, medication: Medication) => {
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
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save medication:", error);
  }
};

export const subscribeToCheckins = (userId: string, callback: (checkins: DailyCheckin[]) => void) => {
  let isMounted = true;
  const fetchCheckins = async () => {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('patient_id', userId)
      .order('date', { ascending: false });
      
    if (!error && data && isMounted) {
      callback(data.map(d => ({
        id: d.id,
        date: d.date,
        mood: d.mood,
        symptoms: d.symptoms || [],
        notes: d.notes
      }) as DailyCheckin));
    }
  };
  fetchCheckins();
  return () => { isMounted = false; };
};

export const saveCheckin = async (userId: string, checkin: DailyCheckin) => {
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
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save checkin:", error);
  }
};

export const subscribeToAppointments = (userId: string, callback: (appointments: Appointment[]) => void) => {
  let isMounted = true;
  const fetchAppts = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', userId)
      .order('date', { ascending: false });
      
    if (!error && data && isMounted) {
      callback(data.map(d => ({
        id: d.id,
        doctorId: d.doctor_id,
        doctorName: d.doctor_name,
        hospital: d.hospital,
        date: d.date,
        time: d.time,
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
        care_tips: healthCheck.careTips,
        red_flag_warnings: healthCheck.redFlagWarnings,
        recommended_specialties: healthCheck.recommendedSpecialties
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
    return data as Doctor[];
  } catch (error) {
    console.error("Fetch doctors error:", error);
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
  reason: string
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
        status: 'booked',
        reason: reason || ''
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
        patient_name: appointment.patientName,
        doctor_id: appointment.doctorId || "doc-unknown",
        doctor_name: appointment.doctorName,
        hospital: appointment.hospital,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status || 'Requested',
        reason: appointment.reason || ''
      }]);
    if (error) throw error;
  } catch (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
};
`;

fs.writeFileSync('src/services/db.ts', code);
