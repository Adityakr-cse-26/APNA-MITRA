import fs from 'fs';

let code = fs.readFileSync('src/services/db.ts', 'utf8');

// Add import
code = 'import { supabase } from "../supabase";\n' + code;

// Find saveAppointment and replace
const newSaveAppt = `export const saveAppointment = async (userId: string, appointment: any) => {
  try {
    // 1. Save to Firebase (Fallback/Local UI)
    const docRef = doc(collection(db, \`users/\${userId}/appointments\`));
    await setDoc(docRef, {
      ...appointment,
      id: docRef.id,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Save to Supabase
    try {
      // Map to Supabase schema
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: "00000000-0000-0000-0000-000000000000", // Placeholder UUID as Firebase UID isn't UUID
            patient_name: appointment.patientName,
            doctor_id: appointment.doctorId || "doc-unknown",
            doctor_name: appointment.doctorName,
            doctor_specialty: "General", 
            hospital: appointment.hospital,
            appointment_date: appointment.date, // YYYY-MM-DD
            time_slot: appointment.time,
            status: 'confirmed',
            symptoms: appointment.reason || ''
          }
        ]);
        
      if (error) {
        console.error("Supabase Save Error:", error);
      } else {
        console.log("Successfully saved to Supabase:", data);
      }
    } catch (supaErr) {
      console.error("Supabase Request Failed:", supaErr);
    }
    
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, \`users/\${userId}/appointments\`);
    throw error;
  }
};`;

code = code.replace(/export const saveAppointment = async [\s\S]*?throw error;\n  }\n};/, newSaveAppt);

fs.writeFileSync('src/services/db.ts', code);
console.log("Patched db.ts with Supabase.");
