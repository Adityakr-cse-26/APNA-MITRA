import fs from 'fs';

let code = fs.readFileSync('src/services/db.ts', 'utf8');

const newSaveHc = `export const saveHealthCheck = async (userId: string, healthCheck: HealthCheck) => {
  try {
    const docRef = doc(collection(db, \`users/\${userId}/health_checks\`));
    await setDoc(docRef, {
      ...healthCheck,
      id: docRef.id,
      ownerId: userId,
      createdAt: serverTimestamp()
    });

    // 2. Save to Supabase
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .insert([
          {
            patient_id: "00000000-0000-0000-0000-000000000000", // Need valid UUID
            symptoms: healthCheck.symptoms,
            severity: healthCheck.severity,
            summary: healthCheck.summary,
            urgency: healthCheck.urgency,
            urgency_color: healthCheck.urgencyColor,
            care_tips: healthCheck.careTips,
            red_flag_warnings: healthCheck.redFlagWarnings,
            recommended_specialties: healthCheck.recommendedSpecialties
          }
        ]);
        
      if (error) {
        console.error("Supabase Save Error (Health Check):", error);
      }
    } catch (supaErr) {
      console.error("Supabase Request Failed:", supaErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, \`users/\${userId}/health_checks\`);
    throw error;
  }
};`;

code = code.replace(/export const saveHealthCheck = async [\s\S]*?throw error;\n  }\n};/, newSaveHc);

fs.writeFileSync('src/services/db.ts', code);
console.log("Patched db.ts with Supabase for health checks.");
