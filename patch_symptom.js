import fs from 'fs';
let code = fs.readFileSync('src/components/SymptomCheckerModal.tsx', 'utf8');

// Update imports
code = code.replace(
  'import { Language, SymptomAssessmentResult } from "../types";',
  'import { Language, SymptomAssessmentResult, HealthCheck } from "../types";\nimport { User } from "firebase/auth";\nimport { saveHealthCheck } from "../services/db";'
);

// Update Props interface
code = code.replace(
  'interface SymptomCheckerModalProps {',
  'interface SymptomCheckerModalProps {\n  user: User | null;'
);

// Update Component signature
code = code.replace(
  'const SymptomCheckerModal: React.FC<SymptomCheckerModalProps> = ({',
  'const SymptomCheckerModal: React.FC<SymptomCheckerModalProps> = ({ user,'
);

// Add save logic
const saveLogic = `
      const data = await res.json();
      setResult(data);
      
      if (user) {
        try {
          const hc: HealthCheck = {
            id: "", // will be set in db
            symptoms: \`\${symptoms}. Existing history: \${existingConditions.join(", ") || "None"}\`,
            duration,
            severity: severity.toString(),
            summary: data.summary,
            urgency: data.triage_level,
            urgencyColor: data.triage_level.includes("Emergency") ? "rose" : data.triage_level.includes("Moderate") ? "amber" : "emerald",
            careTips: data.care_recommendations,
            redFlagWarnings: data.red_flags,
            recommendedSpecialties: data.doctor_questions
          };
          await saveHealthCheck(user.uid, hc);
        } catch (e) {
          console.error("Failed to save health check", e);
        }
      }
`;

code = code.replace(
  `      const data = await res.json();
      setResult(data);`,
  saveLogic
);

fs.writeFileSync('src/components/SymptomCheckerModal.tsx', code);
console.log("Patched SymptomCheckerModal.tsx");
