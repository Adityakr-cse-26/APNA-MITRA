const fs = require('fs');
let content = fs.readFileSync('src/components/PatientDashboardView.tsx', 'utf8');

const target = `          if (insertError) {
            console.error("SOS Insert Error:", insertError);
            setSosStatus('error');
            setSosMessage("Failed to create SOS Alert. Please try again or call emergency services directly.");
          }`;

const replacement = `          if (insertError) {
            console.error("SOS Insert Error:", insertError);
            setSosStatus('error');
            if (insertError.code === '42501' || insertError.message?.includes('row-level security')) {
              setSosMessage("Database Error: Row-Level Security (RLS) is blocking the insertion. Please run the provided SQL in your Supabase SQL Editor to allow patients to insert SOS alerts.");
            } else {
              setSosMessage("Failed to create SOS Alert. Please try again or call emergency services directly.");
            }
          }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/PatientDashboardView.tsx', content);
    console.log("Patched error message");
} else {
    console.log("Could not find target block");
}
