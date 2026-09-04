const fs = require('fs');
let code = fs.readFileSync('src/services/db.ts', 'utf8');

// Replace supabase import
code = code.replace(/import \{ supabase \} from '\.\.\/supabase';/g, `import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, addDoc, onSnapshot } from 'firebase/firestore';`);

// Helper to replace supabase logic with firestore logic
// This requires a very intelligent regex or just rewriting the file completely.

const newCode = `import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { VitalReading, Medication, DailyCheckin, ElderlyProfile, Appointment, HealthCheck } from '../types';

export const subscribeToUserProfile = (userId: string, callback: (profile: ElderlyProfile | null) => void) => {
  const unsubProfile = onSnapshot(doc(db, 'profiles', userId), async (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const caretakersSnap = await getDocs(query(collection(db, 'caretakers'), where('patient_id', '==', userId)));
      const caretakers = caretakersSnap.docs.map(c => ({ id: c.id, ...c.data() }));
      
      callback({
        id: snap.id,
        name: data.full_name || '',
        phone: data.phone || '',
        age: data.age?.toString() || '',
        gender: data.gender || '',
        bloodGroup: data.blood_group || '',
        basicHealthInfo: data.health_info || '',
        passionsLifestyle: data.lifestyle || '',
        caretakers: caretakers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          age: c.age?.toString() || '',
          gender: c.gender || '',
          relation: c.relation || '',
        })) as any
      });
    } else {
      callback(null);
    }
  });
  return unsubProfile;
};

export const saveUserProfile = async (userId: string, profile: ElderlyProfile) => {
  await setDoc(doc(db, 'profiles', userId), {
    full_name: profile.name,
    phone: profile.phone,
    age: parseInt(profile.age) || 0,
    gender: profile.gender,
    blood_group: profile.bloodGroup,
    health_info: profile.basicHealthInfo,
    lifestyle: profile.passionsLifestyle,
  }, { merge: true });
};

export const subscribeToVitals = (userId: string, callback: (vitals: VitalReading[]) => void) => {
  const q = query(collection(db, 'vitals'), where('patient_id', '==', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp,
        status: data.status,
        note: data.note
      } as VitalReading;
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  });
};

export const saveVitalReading = async (userId: string, vital: VitalReading) => {
  await addDoc(collection(db, 'vitals'), {
    patient_id: userId,
    type: vital.type,
    value: vital.value,
    unit: vital.unit,
    timestamp: new Date().toISOString(),
    status: vital.status,
    note: vital.note
  });
};

export const subscribeToMedications = (userId: string, callback: (medications: Medication[]) => void) => {
  const q = query(collection(db, 'medications'), where('patient_id', '==', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        dosage: data.dosage,
        timing: data.timing,
        takenToday: data.taken_today || false,
        instructions: data.instructions,
        scheduledTime: data.scheduled_time,
        remainingPills: data.remaining_pills,
        totalPills: data.total_pills,
        critical: data.critical,
        snoozedUntil: data.snoozed_until
      } as Medication;
    }));
  });
};

export const saveMedication = async (userId: string, medication: Medication) => {
  if (medication.id && !medication.id.startsWith('m-')) {
    await setDoc(doc(db, 'medications', medication.id), {
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
    }, { merge: true });
  } else {
    await addDoc(collection(db, 'medications'), {
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
  }
};

export const subscribeToCheckins = (userId: string, callback: (checkins: DailyCheckin[]) => void) => {
  const q = query(collection(db, 'daily_checkins'), where('patient_id', '==', userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        date: data.date,
        mood: data.mood,
        symptoms: data.symptoms || [],
        notes: data.notes
      } as DailyCheckin;
    }));
  });
};

export const saveCheckin = async (userId: string, checkin: DailyCheckin) => {
  await addDoc(collection(db, 'daily_checkins'), {
    patient_id: userId,
    date: checkin.date,
    mood: checkin.mood,
    symptoms: checkin.symptoms,
    notes: checkin.notes
  });
};

export const subscribeToAppointments = (userId: string, callback: (appointments: Appointment[]) => void) => {
  const q = query(collection(db, 'appointments'), where('patient_id', '==', userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        doctorId: data.doctor_id,
        doctorName: data.doctor_name,
        hospital: data.hospital,
        date: data.date,
        time: data.time,
        reason: data.reason,
        patientName: data.patient_name,
        patientEmail: '',
        status: data.status
      } as Appointment;
    }));
  });
};

export const saveHealthCheck = async (userId: string, healthCheck: HealthCheck) => {
  await addDoc(collection(db, 'health_checks'), {
    patient_id: userId,
    symptoms: healthCheck.symptoms,
    severity: healthCheck.severity,
    summary: healthCheck.summary,
    urgency: healthCheck.urgency,
    urgency_color: healthCheck.urgencyColor,
    care_tips: healthCheck.careTips,
    red_flag_warnings: healthCheck.redFlagWarnings,
    recommended_specialties: healthCheck.recommendedSpecialties,
    created_at: new Date().toISOString()
  });
};

export const subscribeToHealthChecks = (userId: string, callback: (checks: HealthCheck[]) => void) => {
  const q = query(collection(db, 'health_checks'), where('patient_id', '==', userId), orderBy('created_at', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        symptoms: data.symptoms,
        severity: data.severity,
        summary: data.summary,
        urgency: data.urgency,
        urgencyColor: data.urgency_color,
        careTips: data.care_tips,
        redFlagWarnings: data.red_flag_warnings,
        recommendedSpecialties: data.recommended_specialties,
        createdAt: data.created_at
      } as HealthCheck;
    }));
  });
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
  const q = query(collection(db, 'doctors'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
};

export const fetchBookedTimes = async (doctorId: string, date: string) => {
  const q = query(collection(db, 'appointments'), where('doctor_id', '==', doctorId), where('appointment_date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.filter(d => d.data().status !== 'cancelled').map(d => d.data().appointment_time);
};

export const bookDoctorAppointment = async (
  patientId: string, 
  doctorId: string, 
  date: string, 
  time: string, 
  reason: string
) => {
  // Check if already booked
  const q = query(collection(db, 'appointments'), where('doctor_id', '==', doctorId), where('appointment_date', '==', date), where('appointment_time', '==', time));
  const existing = await getDocs(q);
  if (!existing.empty && existing.docs.some(d => d.data().status !== 'cancelled')) {
    throw new Error("This time slot is already booked.");
  }
  
  const docRef = await addDoc(collection(db, 'appointments'), {
    patient_id: patientId,
    doctor_id: doctorId,
    appointment_date: date,
    appointment_time: time,
    status: 'booked',
    reason: reason || ''
  });
  
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() };
};
`;

fs.writeFileSync('src/services/db.ts', newCode);
