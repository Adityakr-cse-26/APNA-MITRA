import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newMain = `
      {/* Main Content Sections */}
      <main className="flex-1">
        <PatientDashboardView 
          user={currentUser} 
          onLogout={handleLogout}
          onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
        />
        
        {/* FLOWCHART MODULE 4: NEARBY DOCTORS, HOSPITALS & MEDICINE SHOPS */}
        <NearbyDirectorySection
          currentLang={currentLang}
          user={currentUser}
        />

        {/* EMERGENCY SOS & SPEED DIAL DISPATCH */}
        <EmergencySection
          currentLang={currentLang}
          contacts={contacts}
        />
      </main>
`;

code = code.replace(/\{\/\* Main Content Sections \*\/\}[\s\S]*?<\/main>/, newMain.trim());

// Add the import
code = code.replace(
  'import { HealthDashboard } from "./components/HealthDashboard";',
  'import { HealthDashboard } from "./components/HealthDashboard";\nimport { PatientDashboardView } from "./components/PatientDashboardView";'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App main block");
