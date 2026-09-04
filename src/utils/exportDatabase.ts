import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

export const exportDatabaseToCSV = async (user: User | null) => {
  if (!user) {
    alert("Please log in first to export data.");
    return;
  }
  
  try {
    const csvRows = [];
    
    // Add a title header
    csvRows.push("APNA MITRA HEALTH DATABASE EXPORT");
    csvRows.push(`Exported Date:,${new Date().toLocaleString()}`);
    csvRows.push("");

    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, guardian_name, guardian_phone')
      .eq('id', user.id)
      .single();
    if (profile) {
      csvRows.push("--- USER PROFILE ---");
      csvRows.push("Name,Phone,Guardian Name,Guardian Phone");
      csvRows.push(`"${(profile.full_name) || ''}","${profile.phone || ''}","${profile.guardian_name || ''}","${profile.guardian_phone || ''}"`);
      csvRows.push("");
    }

    // 2. Fetch Vitals
    const { data: vitals } = await supabase.from('vitals').select('*').eq('patient_id', user.id);
    if (vitals && vitals.length > 0) {
      csvRows.push("--- VITALS HISTORY ---");
      csvRows.push("Date/Time,Type,Value,Unit,Status");
      vitals.forEach(data => {
        csvRows.push(`"${data.timestamp || ''}","${data.type || ''}","${data.value || ''}","${data.unit || ''}","${data.status || ''}"`);
      });
      csvRows.push("");
    }

    // 3. Fetch Medications
    const { data: meds } = await supabase.from('medications').select('*').eq('patient_id', user.id);
    if (meds && meds.length > 0) {
      csvRows.push("--- MEDICATIONS ---");
      csvRows.push("Name,Dosage,Timing,Instructions,Taken Today");
      meds.forEach(data => {
        csvRows.push(`"${data.name || ''}","${data.dosage || ''}","${data.timing || ''}","${data.instructions || ''}","${data.taken_today ? 'Yes' : 'No'}"`);
      });
      csvRows.push("");
    }

    // 4. Fetch Appointments
    const { data: appts } = await supabase.from('appointments').select('*').eq('patient_id', user.id);
    if (appts && appts.length > 0) {
      csvRows.push("--- APPOINTMENTS ---");
      csvRows.push("Date,Time,Doctor Name,Hospital,Status,Reason");
      appts.forEach(data => {
        csvRows.push(`"${data.appointment_date || data.date || ''}","${data.appointment_time || data.time || ''}","${data.doctor_name || ''}","${data.hospital || ''}","${data.status || ''}","${data.reason || ''}"`);
      });
      csvRows.push("");
    }

    // 5. Fetch Check-ins
    const { data: checkins } = await supabase.from('daily_checkins').select('*').eq('patient_id', user.id);
    if (checkins && checkins.length > 0) {
      csvRows.push("--- DAILY CHECK-INS ---");
      csvRows.push("Date,Mood,Notes");
      checkins.forEach(data => {
        csvRows.push(`"${data.date || ''}","${data.mood || ''}","${data.notes || ''}"`);
      });
      csvRows.push("");
    }

    // Create the CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ApnaMitra_HealthData_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (err) {
    console.error("Error exporting database:", err);
    alert("Failed to export database. Please try again.");
  }
};
