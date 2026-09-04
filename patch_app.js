import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
      {/* Main Content Sections */}
      <main className="flex-1">
        
        <PatientDashboardView 
          user={currentUser} 
          onLogout={handleLogout}
          onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
        />
        
        {/* FLOWCHART MODULE 1: WEEKLY HEALTH CHECKUP */}
        <WeeklyCheckupSection
          currentLang={currentLang}
          vitals={vitals}
          onOpenDoctorPrep={() => setIsDoctorVisitPrepOpen(true)}
          onOpenConsultation={() => {
            const el = document.getElementById("find-doctor");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          onOpenEmergency={() => {
            const el = document.getElementById("emergency-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* FLOWCHART MODULE 2: CARE & HEALTH DASHBOARD */}
        <HealthDashboard
          currentLang={currentLang}
          vitals={vitals}
          onAddVital={handleAddVital}
          onOpenCheckin={() => setIsDailyCheckinOpen(true)}
          streakCount={Math.min(checkins.length + 1, 7)}
        />

        {/* FLOWCHART MODULE 3: BRAIN GAMES & DAILY ACTIVITIES */}
        <GamesActivitySection
          currentLang={currentLang}
        />

        {/* FLOWCHART MODULE 4: NEARBY DOCTORS, HOSPITALS & MEDICINE SHOPS */}
        <NearbyDirectorySection
          currentLang={currentLang}
          user={currentUser}
        />
        
        {/* FLOWCHART MODULE 5: GOVERNMENT WELFARE SCHEMES */}
        <SeniorSchemesSection
          currentLang={currentLang}
        />

        {/* EMERGENCY SOS & SPEED DIAL DISPATCH */}
        <div id="emergency-section">
          <EmergencySection
            currentLang={currentLang}
            contacts={contacts}
          />
        </div>

      </main>
`;

code = code.replace(/\{\/\* Main Content Sections \*\/\}[\s\S]*?<\/main>/, replacement.trim());

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
