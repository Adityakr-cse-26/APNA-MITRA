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
import { AdminDashboard } from "./components/AdminDashboard";
import { SpreadsheetViewModal } from "./components/SpreadsheetViewModal";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";
import { subscribeToUserProfile, saveUserProfile, subscribeToVitals, saveVitalReading, subscribeToMedications, saveMedication, subscribeToCheckins, saveCheckin } from "./services/db";

import { exportDatabaseToCSV } from './utils/exportDatabase';
import { Download, Table2 } from 'lucide-react';

import { ChatbotWidget } from "./components/ChatbotWidget";

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

  // Vitals State with localStorage persistence
  const [vitals, setVitals] = useState<VitalReading[]>(() => {
    const saved = localStorage.getItem("apna_mitra_vitals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "v1", type: "bp", value: "124/82", unit: "mmHg", timestamp: "Today, 8:30 AM", status: "normal" },
      { id: "v2", type: "sugar", value: "108", unit: "mg/dL", timestamp: "Today, 7:45 AM (Fasting)", status: "normal" },
      { id: "v3", type: "hr", value: "74", unit: "BPM", timestamp: "Today, 8:30 AM", status: "normal" },
      { id: "v4", type: "spo2", value: "98", unit: "%", timestamp: "Today, 8:30 AM", status: "normal" },
      { id: "v5", type: "weight", value: "66.5", unit: "kg", timestamp: "Yesterday", status: "normal" },
    ];
  });

  // Medications State with localStorage persistence
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem("apna_mitra_meds");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "m1", name: "Amlodipine (Blood Pressure)", dosage: "5 mg", timing: "Morning", instructions: "After breakfast", takenToday: true },
      { id: "m2", name: "Metformin (Blood Sugar)", dosage: "500 mg", timing: "Morning", instructions: "With breakfast", takenToday: true },
      { id: "m3", name: "Shelcal (Calcium + Vitamin D3)", dosage: "500 mg", timing: "Afternoon", instructions: "After lunch with water", takenToday: false },
      { id: "m4", name: "Atorvastatin (Cholesterol)", dosage: "10 mg", timing: "Night", instructions: "After dinner before sleep", takenToday: false },
    ];
  });

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
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() => {
    const saved = localStorage.getItem("apna_mitra_checkins");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "chk-1", date: new Date(Date.now() - 86400000).toISOString(), mood: "good", symptoms: ["Mild knee stiffness"], notes: "Morning park walk" },
      { id: "chk-2", date: new Date(Date.now() - 172800000).toISOString(), mood: "great", symptoms: [], notes: "Felt very active" },
    ];
  });

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
  const [roleChecked, setRoleChecked] = useState(false);

  // Supabase Auth Effect
  useEffect(() => {
    let mounted = true;
    let isChecking = false;

    const checkAdmin = async (user) => {
      if (isChecking) return;
      isChecking = true;

      try {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        const dbRole = data?.role?.toLowerCase()?.trim();
        const metaRole = user.user_metadata?.role?.toLowerCase()?.trim();
        const role = dbRole || metaRole || 'patient';
        
        const intendedPortal = sessionStorage.getItem('intended_portal');
        if (intendedPortal) {
          sessionStorage.removeItem('intended_portal');
          
          if (intendedPortal === 'guardian' && role !== 'guardian') {
            await supabase.auth.signOut();
            sessionStorage.setItem('authError', "This is a patient account. Please use Patient Login.");
            if (mounted) {
              setCurrentUser(null);
              setRoleChecked(true);
            }
            isChecking = false;
            return;
          }
          
          if (intendedPortal === 'patient' && role === 'guardian') {
            await supabase.auth.signOut();
            sessionStorage.setItem('authError', "This is a guardian account. Please use Guardian Login.");
            if (mounted) {
              setCurrentUser(null);
              setRoleChecked(true);
            }
            isChecking = false;
            return;
          }
        }
        
        if (mounted) {
          setIsAdmin(role === 'admin');
          if (role === 'admin') setShowAdminDashboard(true);
        }
      } catch (err) {
        console.error("Error checking role:", err);
        if (mounted) {
          setIsAdmin(false);
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
  }, [medications]);

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
      setVitals(v.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || -1));
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

  const handleSaveProfile = (updated: ElderlyProfile) => {
    setUserProfile(updated);
    if (currentUser) {
      saveUserProfile(currentUser.id, updated);
    }
  };

  const handleAddVital = (newVital: Omit<VitalReading, "id" | "timestamp">) => {
    const item: VitalReading = {
      ...newVital,
      id: `v-${Date.now()}`,
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
    setVitals((prev) => [item, ...prev]);
    if (currentUser) {
      saveVitalReading(currentUser.id, item);
    }
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
    // Ideally delete from Firebase too, but omitting delete functionality from db.ts for brevity.
  };

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

  
  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordScreen />;
  }

  if (authChecking || (currentUser && !roleChecked)) {
    return <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center font-sans">Loading...</div>;
  }

  if (!currentUser && !isGuest) {
    return <AuthScreen onSuccess={() => {}} currentLang={currentLang} onGuestLogin={() => setIsGuest(true)} />;
  }



  const effectiveUser = currentUser || {
    id: "00000000-0000-0000-0000-000000000000",
    app_metadata: {},
    user_metadata: { role: 'patient', full_name: 'Demo User' },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "demo@example.com"
  } as User;

  if (isAdmin) {
    return <AdminDashboard user={effectiveUser} onLogout={handleLogout} />;
  }

  return (
    <div 
      className="min-h-screen bg-[#F4F7F4] text-[#22312B] flex flex-col font-sans transition-all duration-150"
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
        onOpenRegistration={() => setIsRegistrationOpen(true)}
        user={effectiveUser}
        onLogout={handleLogout}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        <PatientDashboardView 
          user={effectiveUser} 
          onLogout={handleLogout}
          onOpenSymptomChecker={() => setIsSymptomCheckerOpen(true)}
         currentLang={currentLang}
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
          user={effectiveUser}
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

      <BooksSection currentLang={currentLang} />

      {/* Footer */}
      <Footer currentLang={currentLang} />

      {/* Floating Action Buttons (Accessibility & Quick SOS) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
        {/* AI Health Assistant Chatbot */}
        <ChatbotWidget />
        
        {/* Profile / Caretaker Button */}
        <button
          onClick={() => setIsRegistrationOpen(true)}
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
          medications={medications}
          onToggleMedication={handleToggleMedication}
          onAddMedication={handleAddMedication}
          onDeleteMedication={handleDeleteMedication}
          onClose={() => setIsMedicineReminderOpen(false)}
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
