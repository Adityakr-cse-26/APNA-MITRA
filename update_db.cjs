const fs = require('fs');
let code = fs.readFileSync('src/services/db.ts', 'utf8');

const newCode = `
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

    const { error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: date,
        appointment_time: time,
        status: 'booked',
        reason: reason || ''
      }]);
    if (error) throw error;
  } catch (error) {
    console.error("Supabase Book Appointment Error:", error);
    throw error;
  }
};
`;

if (!code.includes('fetchDoctors')) {
  fs.writeFileSync('src/services/db.ts', code + '\n' + newCode);
}
