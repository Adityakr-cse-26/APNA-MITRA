import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HealthDashboard } from "./components/HealthDashboard";
import { PatientDashboardView } from "./components/PatientDashboardView";
import { GamesActivitySection } from "./components/GamesActivitySection";
import { NearbyDirectorySection } from "./components/NearbyDirectorySection";
import { SeniorSchemesSection } from "./components/SeniorSchemesSection";
import { EmergencySection } from "./components/EmergencySection";
import { BooksSection } from "./components/BooksSection";
import { TrustPrivacySection } from "./components/TrustPrivacySection";
import { Footer } from "./components/Footer";
import { RegistrationModal } from "./components/RegistrationModal";
import { SymptomCheckerModal } from "./components/SymptomCheckerModal";
import { ReportAnalyzerModal } from "./components/ReportAnalyzerModal";
import { MedicineReminderModal } from "./components/MedicineReminderModal";
import { DoctorVisitPrepModal } from "./components/DoctorVisitPrepModal";
import { DailyCheckinModal } from "./components/DailyCheckinModal";
import { MobileAppPhonePreview } from "./components/MobileAppPhonePreview";
import { Language, VitalReading, Medication, FamilyContact, DailyCheckin, ElderlyProfile, CaretakerDetail } from "./types";
import { Smartphone, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import { AuthScreen } from "./components/AuthScreen";
import { ResetPasswordScreen } from "./components/ResetPasswordScreen";
import { ForgotPasswordScreen } from "./components/ForgotPasswordScreen";
import { AdminDashboard } from "./components/AdminDashboard";
import { SpreadsheetViewModal } from "./components/SpreadsheetViewModal";
import { supabase, isRecoveryMode } from "./supabase";
import { User } from "@supabase/supabase-js";
import { subscribeToUserProfile, saveUserProfile, subscribeToVitals, saveVitalReading, subscribeToMedications, saveMedication, deleteMedicationRemote, subscribeToCheckins, saveCheckin, fetchVitalsData } from "./services/db";

import { exportDatabaseToCSV } from './utils/exportDatabase';
import { Download, Table2 } from 'lucide-react';

import { GuardianMap } from "./components/GuardianMap";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { ActiveAlarmModal } from "./components/ActiveAlarmModal";
import { useMedicationAlarmScheduler } from "./utils/useMedicationAlarmScheduler";

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    name: "Amlodipine",
    dosage: "5mg",
    timing: "Morning",
    takenToday: false,
    instructions: "After breakfast with water (Blood Pressure)",
    scheduledTime: "08:00",
  },
  {
    id: "med-2",
    name: "Metformin",
    dosage: "500mg",
    timing: "Afternoon",
    takenToday: false,
    instructions: "With lunch (Blood Sugar)",
    scheduledTime: "13:00",
  },
  {
    id: "med-3",
    name: "Shelcal 500",
    dosage: "1 tablet",
    timing: "Night",
    takenToday: false,
    instructions: "After dinner before bedtime (Calcium)",
    scheduledTime: "21:00",
  },
];

const CaretakerDashboard = ({ user, onLogout }) => (
  <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans p-4 text-center">
    <h2 className="text-2xl font-bold text-blue-800 mb-2">Caretaker Dashboard</h2>
    <p className="text-gray-700 mb-6">Welcome, {user.user_metadata?.full_name || 'Caretaker'}. Monitoring tools coming soon.</p>
    <button onClick={onLogout} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Sign Out</button>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Global Language & Accessibility State
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem("apna_mitra_lang") as Language) || "en";
  });

  const [fontScale, setFontScale] = useState<number>(() => {
    return parseFloat(localStorage.getItem("apna_mitra_font_scale") || "1.0");
  });

  // User & Caretaker Profile State (Flowchart Registration)
  const [userProfile, setUserProfile] = useState<ElderlyProfile>(() => {
    const saved = localStorage.getItem("apna_mitra_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: "usr-1",
      name: "Ram Prakash Sharma",
      age: 72,
      gender: "male",
      phone: "+91 98765 43210",
      address: "B-42, Gulmohar Park, New Delhi",
      bloodGroup: "B+",
      chronicConditions: ["Hypertension", "Mild Knee Arthritis"],
      allergies: ["Penicillin"],
      isRegistered: true,
      caretakers: [
        {
          id: "c-1",
          name: "Rahul Sharma",
          relation: "Son (Primary Caregiver)",
          phone: "+91 98765 43210",
          email: "rahul.sharma@example.com",
          isPrimary: true,
        },
        {
          id: "c-2",
          name: "Priya Sharma",
          relation: "Daughter",
          phone: "+91 98111 22334",
          email: "priya.sharma@example.com",
          isPrimary: false,
        },
      ],
    };
  });

  // Registration Modal State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationTab, setRegistrationTab] = useState<"welcome" | "elderly" | "caretakers">("welcome");

  // Vitals State with localStorage persistence
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [vitalsError, setVitalsError] = useState<string | null>(null);

  // Medications State with localStorage persistence & sensible defaults
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem("apna_mitra_meds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load initial meds", e);
    }
    return DEFAULT_MEDICATIONS;
  });

  // Active ringing alarm modal state
  const [activeAlarmMedication, setActiveAlarmMedication] = useState<Medication | null>(null);

  // Family Contacts State (Mapped from userProfile caretakers)
  const [contacts, setContacts] = useState<FamilyContact[]>(() => {
    return userProfile.caretakers.map((c, i) => ({
      id: c.id,
      name: c.name,
      relation: c.relation,
      phone: c.phone,
      avatar: i === 0 ? "👨" : "👩",
      isEmergencyContact: true,
    }));
  });

  // Daily Checkins State
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);

  // Modals state
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [isReportAnalyzerOpen, setIsReportAnalyzerOpen] = useState(false);
  const [isMedicineReminderOpen, setIsMedicineReminderOpen] = useState(false);
  const [isDoctorVisitPrepOpen, setIsDoctorVisitPrepOpen] = useState(false);
  const [isDailyCheckinOpen, setIsDailyCheckinOpen] = useState(false);
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [isSpreadsheetViewOpen, setIsSpreadsheetViewOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [invalidRole, setInvalidRole] = useState<boolean>(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [isRecovery, setIsRecovery] = useState(isRecoveryMode);

  // Supabase Auth Effect
  useEffect(() => {
    let mounted = true;
    let isChecking = false;

    const checkAdmin = async (user, retryCount = 0) => {
      if (isChecking && retryCount === 0) return;
      if (retryCount === 0) isChecking = true;

      try {
        const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        
        if (error && error.code === 'PGRST303' && retryCount < 3) {
          console.warn('JWT clock skew, retrying in 1s...', retryCount);
          setTimeout(() => { if (mounted) checkAdmin(user, retryCount + 1); }, 1000);
          return;
        }

        let role = data?.role?.toLowerCase()?.trim();
        
        // If profile or role is not yet created, auto-fallback safely to 'patient'
        if (!role || !['patient', 'admin', 'caretaker', 'guardian'].includes(role)) {
          role = 'patient';
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient',
              role: 'patient'
            });
          } catch (profileErr) {
            console.warn("Could not auto-create profile role:", profileErr);
          }
        }

        // Clean up intended portal session marker without kicking out valid users
        sessionStorage.removeItem('intended_portal');

        if (mounted) {
          setUserRole(role);
          setIsAdmin(role === 'admin');
          if (role === 'admin') setShowAdminDashboard(true);
        }
      } catch (err) {
        console.error("Error checking role:", err);
        if (mounted) {
          setInvalidRole(true);
        }
      } finally {
        if (mounted) {
          setRoleChecked(true);
        }
        isChecking = false;
      }
    };
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (mounted) {
        setCurrentUser(user);
        if (user) {
          checkAdmin(user);
        } else {
          setRoleChecked(true);
        }
        setAuthChecking(false);
      }
    }).catch(err => {
      console.error("Supabase session error:", err);
      if (mounted) {
        setAuthChecking(false);
        setRoleChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
      
      const user = session?.user ?? null;
      if (mounted) {
        setCurrentUser(user);
        if (user) {
          setRoleChecked(false);
          checkAdmin(user);
        } else {
          setRoleChecked(true);
        }
        setAuthChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("apna_mitra_lang", currentLang);
  }, [currentLang]);

  useEffect(() => {
    localStorage.setItem("apna_mitra_font_scale", fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem("apna_mitra_profile", JSON.stringify(userProfile));
    // Keep contacts list synchronized
    setContacts(
      userProfile.caretakers.map((c, i) => ({
        id: c.id,
        name: c.name,
        relation: c.relation,
        phone: c.phone,
        avatar: i === 0 ? "👨" : i === 1 ? "👩" : "🧑",
        isEmergencyContact: true,
      }))
    );
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("apna_mitra_vitals", JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem("apna_mitra_meds", JSON.stringify(medications));
    if (medications && medications.length > 0) {
      const patientId = currentUser?.id || "anonymous";
      const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Asia/Kolkata";
      fetch("/api/medication-reminders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          medications,
          timezone: tz,
        }),
      }).catch((e) => console.warn("Medication schedule sync notice:", e));
    }
  }, [medications, currentUser]);

  useEffect(() => {
    localStorage.setItem("apna_mitra_checkins", JSON.stringify(checkins));
  }, [checkins]);

  // Firebase Data Sync Effect
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribeProfile = subscribeToUserProfile(currentUser.id, (profile) => {
      if (profile) setUserProfile(profile);
    });
    
    const unsubscribeVitals = subscribeToVitals(currentUser.id, (v) => {
      setVitals(v); // Already sorted descending by DB
    });

    const unsubscribeMeds = subscribeToMedications(currentUser.id, (m) => {
      setMedications(m);
    });

    const unsubscribeCheckins = subscribeToCheckins(currentUser.id, (c) => {
      setCheckins(c.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeVitals();
      unsubscribeMeds();
      unsubscribeCheckins();
    };
  }, [currentUser]);

  // Handlers
  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSaveProfile = async (updated: ElderlyProfile) => {
    setUserProfile(updated);
    if (currentUser) {
      const { saveUserProfile, subscribeToUserProfile, savePushSubscription } = await import('./services/db');
      await saveUserProfile(currentUser.id, updated);
      
      // Re-fetch to get real UUIDs for newly inserted caretakers
      subscribeToUserProfile(currentUser.id, (profile) => {
        if (profile) setUserProfile(profile);
      });
      
      if ((window as any).__pendingPushSubscription) {
        await savePushSubscription(currentUser.id, (window as any).__pendingPushSubscription);
        (window as any).__pendingPushSubscription = null;
      }
    }
  };

  const loadHealthDashboard = async () => {
    if (!currentUser) return;
    try {
      setVitalsError(null);
      const v = await fetchVitalsData(currentUser.id);
      setVitals(v);
    } catch (e: any) {
      console.error("Failed to refresh health dashboard", e);
      setVitalsError(e.message || "Failed to load health readings.");
    }
  };

  const handleAddVital = async (newVital: Omit<VitalReading, "id" | "timestamp">) => {
    if (!currentUser) throw new Error("Not logged in");
    
    const item: VitalReading = {
      ...newVital,
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    await saveVitalReading(currentUser.id, item);
    
    // Refresh strictly from database to guarantee dashboard is in sync
    await loadHealthDashboard();
  };

  const handleToggleMedication = (id: string) => {
    setMedications((prev) => {
      const updatedList = prev.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m));
      const toggledMed = updatedList.find(m => m.id === id);
      if (currentUser && toggledMed) {
        saveMedication(currentUser.id, toggledMed);
      }
      return updatedList;
    });
  };

  const handleAddMedication = (newMed: Omit<Medication, "id" | "takenToday">) => {
    const item: Medication = {
      ...newMed,
      id: `m-${Date.now()}`,
      takenToday: false,
    };
    setMedications((prev) => [...prev, item]);
    if (currentUser) {
      saveMedication(currentUser.id, item);
    }
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (currentUser) {
      deleteMedicationRemote(currentUser.id, id);
    }
  };

  // Alarm Modal and Scheduler Handlers
  const handleMarkTakenFromAlarm = (id: string) => {
    setMedications((prev) => {
      const updatedList = prev.map((m) => (m.id === id ? { ...m, takenToday: true } : m));
      const toggledMed = updatedList.find(m => m.id === id);
      if (currentUser && toggledMed) {
        saveMedication(currentUser.id, toggledMed);
      }
      return updatedList;
    });
    setActiveAlarmMedication(null);
  };

  const handleSnoozeFromAlarm = (id: string, minutes: number = 5) => {
    const snoozeTime = Date.now() + minutes * 60 * 1000;
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, snoozedUntil: snoozeTime } : m))
    );
    setActiveAlarmMedication(null);
  };

  const handleDismissAlarm = () => {
    setActiveAlarmMedication(null);
  };

  // Automated medication scheduler with audible chime, speech & modal alert
  useMedicationAlarmScheduler({
    medications,
    currentLang,
    onTriggerAlarm: (med) => {
      setActiveAlarmMedication(med);
    },
  });

  const handleSaveCheckin = (checkinData: Omit<DailyCheckin, "id">) => {
    const item: DailyCheckin = {
      ...checkinData,
      id: `chk-${Date.now()}`,
    };
    setCheckins((prev) => [item, ...prev]);
    if (currentUser) {
      saveCheckin(currentUser.id, item);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleGoHome = () => {
      // Close all modals
      setIsRegistrationOpen(false);
      setIsSymptomCheckerOpen(false);
      setIsReportAnalyzerOpen(false);
      setIsMedicineReminderOpen(false);
      setIsDoctorVisitPrepOpen(false);
      setIsDailyCheckinOpen(false);
      setIsPhonePreviewOpen(false);
      setIsSpreadsheetViewOpen(false);
    };
    window.addEventListener('navigateHome', handleGoHome);
    return () => window.removeEventListener('navigateHome', handleGoHome);
  }, []);

  
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
  
  // Bulletproof detection of recovery flow:
  // 1. Explicit path matches
  const isResetPath = currentPath === '/reset-password' || currentPath.endsWith('/reset-password');
  // 2. Hash or query params containing 'type=recovery' (often dropped by strict routing but preserved in location)
  const hasRecoveryParam = typeof window !== 'undefined' && (window.location.href.includes('type=recovery') || window.location.href.includes('access_token='));
  // 3. Error states from expired/scanned links (Supabase adds ?error_description=...)
  const hasAuthError = typeof window !== 'undefined' && (window.location.href.includes('error_description=') || window.location.href.includes('error_code='));

  if (isResetPath || isRecovery || hasRecoveryParam || (hasAuthError && !currentUser && !authSuccess)) {
    return (
      <ResetPasswordScreen 
        onResetComplete={() => {
          setIsRecovery(false);
          window.location.href = '/';
        }} 
      />
    );
  }

  if (window.location.pathname === '/forgot-password') {
    return <ForgotPasswordScreen />;
  }

  const path = window.location.pathname;
  if (path.startsWith('/guardian/map/')) {
    const alertId = path.replace('/guardian/map/', '');
    return <GuardianMap alertId={alertId} />;
  }

  if (authChecking || (currentUser && !roleChecked)) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">Loading...</div>;
  }

  if (!currentUser && !isGuest) {
    return <AuthScreen onSuccess={() => {}} currentLang={currentLang}
 onGuestLogin={() => setIsGuest(true)} />;
  }



  const effectiveUser = currentUser || {
    id: "00000000-0000-0000-0000-000000000000",
    app_metadata: {},
    user_metadata: { role: 'patient', full_name: 'Demo User' },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "demo@example.com"
  } as User;

  if (invalidRole) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans p-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-700 mb-6">Your account role is not configured. Please contact the administrator.</p>
        <button onClick={handleLogout} className="px-6 py-2 bg-[#153A34] text-white rounded-lg">Sign Out</button>
      </div>
    );
  }

  if (userRole === 'admin') {
    return <AdminDashboard user={effectiveUser} onLogout={handleLogout} />;
  }
  
  if (userRole === 'caretaker' || userRole === 'guardian') {
      return <CaretakerDashboard user={effectiveUser} onLogout={handleLogout} />;
  }

  return (
    <div 
      className="min-h-screen bg-[#FAFAFA] text-[#22312B] flex flex-col font-sans transition-all duration-150"
      style={{ fontSize: `${16 * fontScale}px` }}
    >
      {/* Top Navigation */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdminDashboard={() => setShowAdminDashboard(true)}
        currentLang={currentLang}

        onLanguageChange={setCurrentLang}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        onOpenRegistration={() => { setRegistrationTab("welcome"); setIsRegistrationOpen(true); }}
        user={effectiveUser}
        onLogout={handleLogout}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        <PatientDashboardView onOpenMedicineReminder={() => setIsMedicineReminderOpen(true)}
          onOpenProfile={() => { setRegistrationTab("elderly"); setIsRegistrationOpen(true); }} 
          user={effectiveUser} 
          onLogout={handleLogout}
          onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
         currentLang={currentLang}


        />
        
        {/* FLOWCHART MODULE 2: CARE & HEALTH DASHBOARD */}
        <HealthDashboard
          currentLang={currentLang}


          vitals={vitals}
          vitalsError={vitalsError}
          onAddVital={handleAddVital}
          onOpenCheckin={() => setIsDailyCheckinOpen(true)}
          streakCount={Math.min(checkins.length + 1, 7)}
        />

        {/* FLOWCHART MODULE 3: BRAIN GAMES & DAILY ACTIVITIES */}
        <GamesActivitySection
          currentLang={currentLang}


          user={effectiveUser}
        />

        {/* FLOWCHART MODULE 4: NEARBY DOCTORS, HOSPITALS & MEDICINE SHOPS */}
        <NearbyDirectorySection
          currentLang={currentLang}


          user={effectiveUser}
        />
        
        {/* FLOWCHART MODULE 5: GOVERNMENT WELFARE SCHEMES */}
        <SeniorSchemesSection
          currentLang={currentLang}


        />

      </main>

      <BooksSection currentLang={currentLang}
 />

      {/* EMERGENCY SOS & SPEED DIAL DISPATCH */}
      <div id="emergency-section">
        <EmergencySection
          currentLang={currentLang}
          user={effectiveUser}
          contacts={contacts}
          profile={userProfile}
        />
      </div>

      <TrustPrivacySection currentLang={currentLang} />

      {/* Footer */}
      <Footer currentLang={currentLang}
 />

      {/* Floating Action Buttons (Accessibility & Quick SOS) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
        {/* Healthcare AI Chatbot */}
        <ChatbotWidget currentLang={currentLang} />

        {/* Profile / Caretaker Button */}
        <button
          onClick={() => { setRegistrationTab("elderly"); setIsRegistrationOpen(true); }}
          className="px-3.5 py-2 bg-white text-[#153A34] hover:bg-[#EEF3EA] rounded-full shadow-lg flex items-center gap-1.5 border border-[#D8E2DA] text-xs font-bold transition transform hover:scale-105 active:scale-95"
          title="Senior Profile & Caretaker Settings"
        >
          <span>👤</span>
          <span className="hidden sm:inline">Profile</span>
        </button>

        {/* Guardian Live GPS Button */}
        <a
          href="#guardian-alert"
          className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-2xl flex items-center gap-2 border-2 border-white text-xs font-bold transition transform hover:scale-105 active:scale-95"
          title="Guardian 24/7 Live Location & Emergency Broadcast"
        >
          <MapPin className="w-4 h-4 text-emerald-300 animate-bounce" />
          <span className="hidden sm:inline">Guardian Live GPS</span>
        </a>

        {/* Quick SOS Floating Button */}
        <a
          href="#guardian-alert"
          className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white transition transform hover:scale-110 active:scale-95"
          title="Emergency Help SOS & Guardian Dispatch"
        >
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </a>
      </div>

      {/* FLOWCHART WELCOME & REGISTRATION MODAL */}
      {isRegistrationOpen && (
        <RegistrationModal
          currentLang={currentLang}
          profile={userProfile}
          initialTab={registrationTab}
          onSaveProfile={handleSaveProfile}
          onClose={() => setIsRegistrationOpen(false)}
        />
      )}

      {/* Modals */}
      {isSymptomCheckerOpen && (
        <SymptomCheckerModal
          currentLang={currentLang}


          user={effectiveUser}
          onClose={() => setIsSymptomCheckerOpen(false)}
          onOpenEmergency={() => {
            setIsSymptomCheckerOpen(false);
            scrollToSection("emergency");
          }}
        />
      )}

      {isReportAnalyzerOpen && (
        <ReportAnalyzerModal
          currentLang={currentLang}


          onClose={() => setIsReportAnalyzerOpen(false)}
        />
      )}

      {isMedicineReminderOpen && (
        <MedicineReminderModal
          currentLang={currentLang}
          userId={currentUser?.id}
          medications={medications}
          onToggleMedication={handleToggleMedication}
          onAddMedication={handleAddMedication}
          onDeleteMedication={handleDeleteMedication}
          onClose={() => setIsMedicineReminderOpen(false)}
          onTestAlarmNow={(med) => setActiveAlarmMedication(med || medications[0] || DEFAULT_MEDICATIONS[0])}
        />
      )}

      {/* Active Audio & Screen Alarm Reminder Modal */}
      {activeAlarmMedication && (
        <ActiveAlarmModal
          medication={activeAlarmMedication}
          currentLang={currentLang}
          onMarkTaken={handleMarkTakenFromAlarm}
          onSnooze={handleSnoozeFromAlarm}
          onDismiss={handleDismissAlarm}
        />
      )}

      {isDoctorVisitPrepOpen && (
        <DoctorVisitPrepModal
          currentLang={currentLang}


          vitals={vitals}
          medications={medications}
          onClose={() => setIsDoctorVisitPrepOpen(false)}
          user={effectiveUser}
        />
      )}

      {isDailyCheckinOpen && (
        <DailyCheckinModal
          currentLang={currentLang}


          checkins={checkins}
          onSaveCheckin={handleSaveCheckin}
          onClose={() => setIsDailyCheckinOpen(false)}
        />
      )}

      {isPhonePreviewOpen && (
        <MobileAppPhonePreview
          initialLang={currentLang}
          onClose={() => setIsPhonePreviewOpen(false)}
        />
      )}

      {isSpreadsheetViewOpen && (
        <SpreadsheetViewModal
          user={effectiveUser}
          onClose={() => setIsSpreadsheetViewOpen(false)}
        />
      )}
    </div>
  );
}
