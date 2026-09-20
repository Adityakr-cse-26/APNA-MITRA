import React, { useState, useEffect } from "react";
import { 
  Heart, 
  User, 
  Users, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Activity, 
  AlertCircle,
  FileText,
  Calendar,
  Smile,
  RefreshCw,
  Bell,
  BellOff,
  Check,
  Camera,
  Upload,
  Eye
} from "lucide-react";
import { ElderlyProfile, CaretakerDetail, Language } from "../types";
import { ApnaMitraLogo } from "./ApnaMitraLogo";
import { validateIndianMobile, maskPhoneNumber } from "../utils/phoneUtils";

export function generatePatternUserId(phoneStr?: string, existing?: string): string {
  if (existing && /^AM-UID-\d{4}-\d{4}$/.test(existing)) {
    return existing;
  }
  const currentYear = new Date().getFullYear();
  const cleanDigits = (phoneStr || "").replace(/\D/g, "");
  const suffix = cleanDigits.length >= 4 ? cleanDigits.slice(-4) : "1001";
  return `AM-UID-${currentYear}-${suffix}`;
}

export function isValidUserIdPattern(id: string): boolean {
  return /^AM-UID-\d{4}-\d{4}$/.test(id);
}

interface RegistrationModalProps {
  currentLang: Language;
  profile: ElderlyProfile;
  onSaveProfile: (profile: ElderlyProfile) => Promise<void> | void;
  onClose: () => void;
  initialTab?: "welcome" | "elderly" | "caretakers";
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  currentLang,
  profile,
  onSaveProfile,
  onClose,
  initialTab = "welcome",
}) => {
  const [activeTab, setActiveTab] = useState<"welcome" | "elderly" | "caretakers">(initialTab);

  // Elderly Form State
  const [patientId, setPatientId] = useState(() => 
    generatePatternUserId(profile.phone, profile.patientId || profile.id)
  );
  const [isManualId, setIsManualId] = useState(false);
  const [smsRemindersEnabled, setSmsRemindersEnabled] = useState(profile.smsRemindersEnabled !== false);
  const [elderlyName, setElderlyName] = useState(profile.name || "Dada Ji (Ramakant Sharma)");
  const [elderlyPhone, setElderlyPhone] = useState(profile.phone || "+91 98765 43210");
  const [elderlyDob, setElderlyDob] = useState(profile.dob || "");
  const [elderlyAge, setElderlyAge] = useState(profile.age || "72");

  // Passport Photo State & Handler
  const [patientPhoto, setPatientPhoto] = useState<string | null>(() => {
    return profile.photo_url || profile.avatar_url || (typeof window !== 'undefined' ? localStorage.getItem(`apna_mitra_patient_photo_${profile.id || profile.patientId || 'current'}`) : null);
  });
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);
  const photoFileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoFeedback('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setPhotoFeedback('Image size too large. Please select a photo under 12MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 350;
        const targetHeight = 450;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

        if (imgAspect > targetAspect) {
          srcW = img.height * targetAspect;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / targetAspect;
          srcY = (img.height - srcH) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setPatientPhoto(photoDataUrl);
        setPhotoFeedback('Passport size photo attached successfully (35×45mm)!');
        try {
          if (profile.id) localStorage.setItem(`apna_mitra_patient_photo_${profile.id}`, photoDataUrl);
        } catch {}
        setTimeout(() => setPhotoFeedback(null), 3500);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePhoneChange = (val: string) => {
    setElderlyPhone(val);
    if (!isManualId) {
      const clean = val.replace(/\D/g, "");
      if (clean.length >= 4) {
        const currentYear = new Date().getFullYear();
        setPatientId(`AM-UID-${currentYear}-${clean.slice(-4)}`);
      }
    }
  };

  const handleUserIdChange = (val: string) => {
    setIsManualId(true);
    setPatientId(val.toUpperCase());
  };

  const handleRegenerateId = () => {
    const currentYear = new Date().getFullYear();
    const cleanDigits = elderlyPhone.replace(/\D/g, "");
    const suffix = cleanDigits.length >= 4 
      ? cleanDigits.slice(-4) 
      : Math.floor(1000 + Math.random() * 9000).toString();
    setPatientId(`AM-UID-${currentYear}-${suffix}`);
    setIsManualId(false);
  };
  
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setElderlyDob(newDob);
    if (newDob) {
      const birthDate = new Date(newDob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0) {
        setElderlyAge(age.toString());
      }
    }
  };

  const [elderlyGender, setElderlyGender] = useState(profile.gender || "Male");
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || "B+");
  const [basicHealthInfo, setBasicHealthInfo] = useState(
    profile.basicHealthInfo || "Mild Hypertension (managed with Telmisartan 40mg), Early Osteoarthritis in knees."
  );
  const [allergies, setAllergies] = useState(profile.allergies || "Sulfa antibiotics, Dust pollen");
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergency_contact_name || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergency_contact_phone || "");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(profile.emergency_contact_relationship || "");
  const [passionsLifestyle, setPassionsLifestyle] = useState(
    profile.passionsLifestyle || "Morning garden walks, Classical Indian Hindustani music, Reading spiritual texts, Playing Sudoku."
  );

  // Caretaker Form State (Min 1, Max 3)
  const [caretakers, setCaretakers] = useState<CaretakerDetail[]>(() => {
    if (profile.caretakers && profile.caretakers.length > 0) {
      return profile.caretakers;
    }
    const initName = profile.guardian_name || profile.emergency_contact_name || "";
    const initPhone = profile.guardian_phone || profile.emergency_contact_phone || "";
    const initRel = profile.guardian_relation || profile.emergency_contact_relationship || "Guardian";
    if (initName || initPhone) {
      return [
        {
          id: "c1",
          name: initName,
          phone: initPhone,
          email: "",
          age: "42",
          gender: "Other",
          relation: initRel,
          isPrimary: true,
        },
      ];
    }
    return [
      {
        id: "c1",
        name: "",
        phone: "",
        email: "",
        age: "42",
        gender: "Other",
        relation: "Guardian",
        isPrimary: true,
      },
    ];
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successSaved, setSuccessSaved] = useState(false);

  // Synchronize Emergency Contact changes with Primary Caretaker
  const handleEmergencyNameChange = (val: string) => {
    setEmergencyContactName(val);
    setCaretakers((prev) => {
      if (prev.length === 0) {
        return [{
          id: "c1",
          name: val,
          phone: emergencyContactPhone,
          email: "",
          age: "42",
          gender: "Other",
          relation: emergencyContactRelationship || "Guardian",
          isPrimary: true,
        }];
      }
      return prev.map((c, idx) => (c.isPrimary || idx === 0 ? { ...c, name: val } : c));
    });
  };

  const handleEmergencyPhoneChange = (val: string) => {
    setEmergencyContactPhone(val);
    setCaretakers((prev) => {
      if (prev.length === 0) {
        return [{
          id: "c1",
          name: emergencyContactName,
          phone: val,
          email: "",
          age: "42",
          gender: "Other",
          relation: emergencyContactRelationship || "Guardian",
          isPrimary: true,
        }];
      }
      return prev.map((c, idx) => (c.isPrimary || idx === 0 ? { ...c, phone: val } : c));
    });
  };

  const handleEmergencyRelChange = (val: string) => {
    setEmergencyContactRelationship(val);
    setCaretakers((prev) => {
      if (prev.length === 0) {
        return [{
          id: "c1",
          name: emergencyContactName,
          phone: emergencyContactPhone,
          email: "",
          age: "42",
          gender: "Other",
          relation: val,
          isPrimary: true,
        }];
      }
      return prev.map((c, idx) => (c.isPrimary || idx === 0 ? { ...c, relation: val } : c));
    });
  };

  // Push Notification State
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'enabled' | 'blocked' | 'in_iframe'>('idle');
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setPushStatus('enabled');
      } else if (Notification.permission === 'denied') {
        setPushStatus('blocked');
      }
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const { isPushNotificationSupported, isInsideIframe, subscribeUserToPush } = await import("../utils/webPush");

      if (!isPushNotificationSupported()) {
        setPushStatus('blocked');
        setPushFeedback("Browser push notifications are not supported on this device. Emergency audio alarms and SMS alerts remain fully active.");
        return;
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
        setPushStatus('blocked');
        setPushFeedback("Notifications are currently blocked in your browser settings. Emergency SMS and audible alarms remain active. To enable browser notifications, allow them in your browser address bar.");
        return;
      }

      if (isInsideIframe()) {
        setPushStatus('in_iframe');
        setPushFeedback("Browser push alerts require opening the app in a new tab (outside the preview frame). In-app sound and SMS alerts are active!");
        return;
      }

      setPushStatus('loading');
      setPushFeedback(null);

      const sub = await subscribeUserToPush();
      if (sub) {
        setPushStatus('enabled');
        setPushFeedback("Device push notifications activated! Save your profile to link this device.");
        (window as any).__pendingPushSubscription = sub;
      }
    } catch (e: any) {
      console.warn("Push subscription notice:", e?.message || e);
      const msg = e?.message || "";
      if (msg.toLowerCase().includes("denied") || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied')) {
        setPushStatus('blocked');
        setPushFeedback("Notifications blocked by browser settings. In-app audio alarms & emergency SMS alerts are active! You can allow notifications in your browser address bar.");
      } else {
        setPushStatus('blocked');
        setPushFeedback(msg || "Could not enable device push in this environment. In-app alarms and SMS alerts remain active.");
      }
    }
  };

  const handleAddCaretaker = () => {
    if (caretakers.length >= 3) {
      setErrorMsg("Maximum 3 caretakers / relatives can be added as per flowchart guidelines.");
      return;
    }
    const newCaretaker: CaretakerDetail = {
      id: `c-${Date.now()}`,
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "Other",
      relation: "Relative",
      isPrimary: caretakers.length === 0,
    };
    setCaretakers([...caretakers, newCaretaker]);
    setErrorMsg("");
  };

  const handleRemoveCaretaker = (id: string) => {
    if (caretakers.length <= 1) {
      setErrorMsg("At least 1 caretaker / relative is mandatory for emergency SOS calling.");
      return;
    }
    setCaretakers(caretakers.filter((c) => c.id !== id));
    setErrorMsg("");
  };

  const handleSetPrimaryCaretaker = (id: string) => {
    const chosen = caretakers.find((c) => c.id === id);
    if (chosen) {
      if (chosen.name) setEmergencyContactName(chosen.name);
      if (chosen.phone) setEmergencyContactPhone(chosen.phone);
      if (chosen.relation) setEmergencyContactRelationship(chosen.relation);
    }
    setCaretakers(
      caretakers.map((c) => ({ ...c, isPrimary: c.id === id }))
    );
  };

  const handleUpdateCaretaker = (id: string, field: keyof CaretakerDetail, value: any) => {
    setCaretakers(
      caretakers.map((c, idx) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          if (c.isPrimary || (idx === 0 && !caretakers.some((k) => k.isPrimary))) {
            if (field === "name") setEmergencyContactName(value);
            if (field === "phone") setEmergencyContactPhone(value);
            if (field === "relation") setEmergencyContactRelationship(value);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim()) {
      setErrorMsg("Please provide Senior Citizen's Name and Phone Number.");
      return;
    }

    const indianValidation = validateIndianMobile(elderlyPhone);
    if (!indianValidation.isValid) {
      setErrorMsg(indianValidation.error || "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }
    
    if (!emergencyContactName.trim()) {
      setErrorMsg("Emergency Contact Name cannot be empty.");
      return;
    }
    const cleanPhone = emergencyContactPhone.replace(/\D/g, '').slice(-10);
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!emergencyContactPhone.trim() || !phoneRegex.test(cleanPhone)) {
      setErrorMsg("Emergency Contact Phone must be a valid Indian 10-digit mobile number.");
      return;
    }
    if (!emergencyContactRelationship.trim()) {
      setErrorMsg("Emergency Contact Relationship cannot be empty.");
      return;
    }

    const finalEmergencyPhone = emergencyContactPhone.trim();
    const finalEmergencyName = emergencyContactName.trim();
    const finalEmergencyRel = emergencyContactRelationship.trim();

    // Ensure caretakers has at least 1 caretaker and that primary caretaker is synchronized with emergency contact
    let targetCaretakers = caretakers.filter((c) => c.name.trim() || c.phone.trim());
    if (targetCaretakers.length === 0) {
      targetCaretakers = [
        {
          id: "c1",
          name: finalEmergencyName || "Guardian",
          phone: finalEmergencyPhone,
          email: "",
          age: "42",
          gender: "Other",
          relation: finalEmergencyRel || "Guardian",
          isPrimary: true,
        },
      ];
    } else {
      const hasPrimary = targetCaretakers.some((c) => c.isPrimary);
      targetCaretakers = targetCaretakers.map((c, idx) => {
        const isPrimary = c.isPrimary || (!hasPrimary && idx === 0);
        if (isPrimary) {
          return {
            ...c,
            name: finalEmergencyName || c.name,
            phone: finalEmergencyPhone || c.phone,
            relation: finalEmergencyRel || c.relation,
            isPrimary: true,
          };
        }
        return c;
      });
    }

    const finalUserId = patientId.trim() || generatePatternUserId(elderlyPhone);
    if (!isValidUserIdPattern(finalUserId)) {
      setErrorMsg("User ID must follow the standard pattern: AM-UID-YYYY-XXXX (e.g. AM-UID-2026-3210).");
      return;
    }

    const updatedProfile: ElderlyProfile = {
      patientId: finalUserId,
      name: elderlyName.trim(),
      phone: indianValidation.e164,
      age: elderlyAge,
      dob: elderlyDob,
      gender: elderlyGender,
      bloodGroup,
      basicHealthInfo,
      allergies,
      passionsLifestyle,
      caretakers: targetCaretakers,
      isRegistered: true,
      smsRemindersEnabled,
      photo_url: patientPhoto || undefined,
      avatar_url: patientPhoto || undefined,
      emergency_contact_name: finalEmergencyName,
      emergency_contact_phone: finalEmergencyPhone,
      emergency_contact_relationship: finalEmergencyRel,
      guardian_name: finalEmergencyName,
      guardian_phone: finalEmergencyPhone,
      guardian_relation: finalEmergencyRel,
    };

    try {
      await onSaveProfile(updatedProfile);
      setSuccessSaved(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to save profile. Please check if you have permissions or try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#F8FAF8] border border-[#E2E4E0] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F4E46] via-[#2A655A] to-[#1F4E46] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1.5 shadow-md flex items-center justify-center">
              <ApnaMitraLogo size="sm" variant="icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Apna Mitra
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold">Welcome & User Registration</h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-black/20 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("welcome")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "welcome"
                  ? "bg-white text-[#1F4E46] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1. Welcome Splash</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("elderly")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "elderly"
                  ? "bg-white text-[#1F4E46] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>2. Elderly Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("caretakers")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === "caretakers"
                  ? "bg-white text-[#1F4E46] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. Caretaker Details ({caretakers.length}/3)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Profile and Caretaker Details successfully saved to Apna Mitra!</span>
            </div>
          )}

          {/* TAB 1: Welcome Splash */}
          {activeTab === "welcome" && (
            <div className="space-y-6 py-2">
              <div className="bg-gradient-to-br from-[#EBF3EF] to-[#F3F7F4] p-6 rounded-2xl border border-[#E2E4E0] space-y-4 text-center">
                <div className="bg-white p-4 rounded-2xl inline-block shadow-sm mx-auto border border-[#E2E4E0]">
                  <ApnaMitraLogo size="xl" variant="full" showTagline={true} />
                </div>
                <p className="text-sm text-[#4A5D54] max-w-xl mx-auto leading-relaxed">
                  A dedicated, supportive health companion for senior citizens and their loving family caretakers. Designed with simple large buttons, voice AI assistance, emergency one-tap SOS, and comprehensive wellness monitoring.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left text-xs text-[#2A3D34]">
                  <div className="p-3 bg-white rounded-xl border border-[#E2E4E0]">
                    <span className="font-bold text-[#1F4E46] block mb-1">❤️ Weekly Health Check</span>
                    <span>Regular vitals monitoring &amp; 4-tier AI preventive care tips.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E2E4E0]">
                    <span className="font-bold text-[#1F4E46] block mb-1">🧠 Games &amp; Activity</span>
                    <span>Sudoku, Memory training, Chair Yoga, and Morning Pranayama.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E2E4E0]">
                    <span className="font-bold text-[#1F4E46] block mb-1">🚨 24/7 Caretaker SOS</span>
                    <span>Direct 108 ambulance dispatch and 1-tap family notifications.</span>
                  </div>
                </div>
              </div>


              
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("elderly")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Elderly Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          
          {/* TAB 2: Elderly Details */}
          {activeTab === "elderly" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#153A34]">B. Elderly (User) Profile Details</h3>
                  <p className="text-xs text-[#586C62]">Personalized medical records &amp; lifestyle preferences</p>
                </div>
                <span className="text-[10px] bg-[#EBF3EF] text-[#1F4E46] px-2.5 py-1 rounded-full font-bold">
                  User Form
                </span>
              </div>

              {/* Patient Passport Size Photo Upload Slot */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                <div 
                  onClick={() => photoFileInputRef.current?.click()}
                  className={`w-20 h-24 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden transition-all shrink-0 bg-stone-50 ${
                    patientPhoto 
                      ? "border-emerald-500 hover:border-emerald-600 shadow-xs" 
                      : "border-dashed border-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/50"
                  }`}
                  title={patientPhoto ? "Click to change photo" : "Click to upload passport photo"}
                >
                  {patientPhoto ? (
                    <>
                      <img src={patientPhoto} alt="Patient Passport" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5">
                        <Camera className="w-4 h-4" />
                        <span>Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 text-center flex flex-col items-center justify-center">
                      <Camera className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-[9px] font-bold text-emerald-900 leading-tight">Passport Photo</span>
                      <span className="text-[8px] text-emerald-600">35×45mm</span>
                    </div>
                  )}
                  <input 
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-xs font-bold text-[#153A34]">Patient Passport Size Photo (35×45mm)</span>
                    <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Standard Ratio</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Upload official passport size photo for visual patient identification, emergency responders, and digital health cards.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-[#1F4E46] text-white rounded-lg hover:bg-[#153A34] transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{patientPhoto ? "Change Passport Photo" : "Upload Passport Photo"}</span>
                    </button>
                    {patientPhoto && (
                      <button
                        type="button"
                        onClick={() => setPatientPhoto(null)}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {photoFeedback && (
                    <p className="text-[11px] text-emerald-700 font-medium pt-1">✓ {photoFeedback}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2A3D34]">User ID *</label>
                    <span className="text-[9px] font-mono text-[#1F4E46] bg-[#EBF3EF] px-1.5 py-0.5 rounded font-semibold">
                      AM-UID-YYYY-XXXX
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => handleUserIdChange(e.target.value)}
                      placeholder="AM-UID-2026-1001"
                      className={`w-full pl-3.5 pr-8 py-2 bg-white border rounded-xl text-xs font-mono font-bold transition focus:outline-none ${
                        isValidUserIdPattern(patientId)
                          ? "border-[#1F4E46] text-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46]"
                          : "border-amber-400 text-amber-900 focus:ring-1 focus:ring-amber-500 bg-amber-50/40"
                      }`}
                      title="User ID Pattern: AM-UID-[YEAR]-[4 DIGITS] (e.g. AM-UID-2026-3210)"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-[#1F4E46] hover:bg-stone-100 rounded-lg transition"
                      title="Format/regenerate structured User ID based on Year and Phone suffix"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className={`text-[10px] block mt-1 ${isValidUserIdPattern(patientId) ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}`}>
                    {isValidUserIdPattern(patientId)
                      ? `✓ Pattern: [AM]-[UID]-[${patientId.split("-")[2] || "2026"}]-[${patientId.split("-")[3] || "XXXX"}]`
                      : "Required Pattern: AM-UID-YYYY-XXXX (e.g. AM-UID-2026-3210)"}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">User Full Name *</label>
                  <input
                    type="text"
                    value={elderlyName}
                    onChange={(e) => setElderlyName(e.target.value)}
                    placeholder="e.g. Ramakant Sharma"
                    className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Registered Indian Mobile *</label>
                  <input
                    type="tel"
                    value={elderlyPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="e.g. 9876543210 or +91 98765 43210"
                    className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                  <span className="text-[10px] text-[#1F4E46] font-semibold block mt-0.5">
                    {validateIndianMobile(elderlyPhone).isValid ? "✓ Valid Indian mobile (+91)" : "10 digits starting with 6-9"}
                  </span>
                </div>
              </div>

              {/* Automatic SMS Medication Reminder Destination Guarantee */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Automated SMS Reminder Destination Guarantee</span>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[11px] text-emerald-800">
                      <input
                        type="checkbox"
                        checked={smsRemindersEnabled}
                        onChange={(e) => setSmsRemindersEnabled(e.target.checked)}
                        className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                      />
                      SMS Alarms Active
                    </label>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Medication reminders for Patient <strong className="font-mono">{patientId}</strong> are strictly delivered <em>only</em> to the registered number above. The system never cross-sends reminders to other patients.
                  </p>
                </div>
              </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={elderlyDob}
                      onChange={handleDobChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Age</label>
                    <input
                      type="number"
                      value={elderlyAge}
                      onChange={(e) => setElderlyAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Gender</label>
                    <select
                      value={elderlyGender}
                      onChange={(e) => setElderlyGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Blood</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46] text-[#2A3D34]"
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              
              <div>
                <label className="block text-xs font-bold text-[#2A3D34] mb-1">
                  Basic Health Information (Medical conditions, ongoing medications)
                </label>
                <textarea
                  rows={2}
                  value={basicHealthInfo}
                  onChange={(e) => setBasicHealthInfo(e.target.value)}
                  placeholder="e.g. Mild Hypertension, Type 2 Diabetes, Knee joint stiffness..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2A3D34] mb-1">
                  Passion, Lifestyle &amp; Hobbies
                </label>
                <textarea
                  rows={2}
                  value={passionsLifestyle}
                  onChange={(e) => setPassionsLifestyle(e.target.value)}
                  placeholder="e.g. Morning walk in park, Classical music, Gardening, Spiritual reading, Sudoku..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                />
              </div>
              
              <div className="pt-4 mt-4 border-t border-[#E2E4E0]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#153A34] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Guardian & Emergency Contact (SOS Alerts Destination)</span>
                  </h4>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                    🚨 Primary SOS Contact
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B60] mb-3">
                  All SOS alerts, emergency calls, and caregiver SMS notifications are immediately routed to this contact.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Guardian / Contact Name *</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => handleEmergencyNameChange(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Emergency Mobile Number *</label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                    <span className="text-[10px] text-[#1F4E46] font-semibold block mt-0.5">
                      {emergencyContactPhone.replace(/\D/g, '').slice(-10).length === 10 ? "✓ SOS will route to this number" : "10-digit mobile number"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Relationship *</label>
                    <input
                      type="text"
                      value={emergencyContactRelationship}
                      onChange={(e) => handleEmergencyRelChange(e.target.value)}
                      placeholder="e.g. Son / Daughter / Guardian"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-800" />
                        <h4 className="font-bold text-emerald-900 text-sm">Emergency Web Push Notifications</h4>
                        {pushStatus === 'enabled' && (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Active
                          </span>
                        )}
                        {pushStatus === 'blocked' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BellOff className="w-3 h-3 text-amber-700" />
                            In-App Alarms Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Receive instant SOS alerts and medication reminders on this device.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pushStatus !== 'enabled' && (
                        <button
                          type="button"
                          onClick={handleEnablePush}
                          disabled={pushStatus === 'loading'}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{pushStatus === 'loading' ? "Enabling..." : "Enable Device Push"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {pushFeedback && (
                    <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                      pushStatus === 'enabled' 
                        ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {pushStatus === 'enabled' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 leading-relaxed">
                        <p>{pushFeedback}</p>
                        {pushStatus === 'blocked' && (
                          <p className="text-[11px] text-amber-800 mt-1 font-medium">
                            💡 Tip: To enable browser-level push, click the lock or tune icon in the browser address bar next to the URL, set Notifications to "Allow", and reload.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("caretakers")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Caretaker Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Caretakers Details */}
          {activeTab === "caretakers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#153A34]">A. Caretaker / Relative Details</h3>
                  <p className="text-xs text-[#586C62]">
                    Add 1 to 3 trusted family members (Min 1 mandatory for emergency alerts)
                  </p>
                </div>
                {caretakers.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddCaretaker}
                    className="px-3 py-1.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Caretaker ({caretakers.length}/3)</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {caretakers.map((caretaker, index) => (
                  <div
                    key={caretaker.id}
                    className="p-4 bg-white rounded-2xl border border-[#E2E4E0] shadow-2xs space-y-3 relative"
                  >
                    <div className="flex items-center justify-between border-b border-[#F3F5F4] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1F4E46] text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-[#153A34]">
                          Caretaker {index + 1} {caretaker.isPrimary ? "(Primary Contact)" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {!caretaker.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryCaretaker(caretaker.id)}
                            className="text-[#1F4E46] hover:text-[#153A34] text-xs flex items-center gap-1 font-medium"
                            title="Set as Primary Caretaker"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Set Primary</span>
                          </button>
                        )}
                        {caretakers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCaretaker(caretaker.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-medium"
                            title="Remove Caretaker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Full Name *</label>
                        <input
                          type="text"
                          value={caretaker.name}
                          onChange={(e) => handleUpdateCaretaker(caretaker.id, "name", e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Phone Number *</label>
                        <input
                          type="tel"
                          value={caretaker.phone}
                          onChange={(e) => handleUpdateCaretaker(caretaker.id, "phone", e.target.value)}
                          placeholder="e.g. +91 98111 22334"
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">E-mail Address</label>
                        <input
                          type="email"
                          value={caretaker.email}
                          onChange={(e) => handleUpdateCaretaker(caretaker.id, "email", e.target.value)}
                          placeholder="e.g. rahul@example.com"
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Relation</label>
                          <input
                            type="text"
                            value={caretaker.relation}
                            onChange={(e) => handleUpdateCaretaker(caretaker.id, "relation", e.target.value)}
                            placeholder="e.g. Son"
                            className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Age</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={caretaker.age}
                            onChange={(e) => handleUpdateCaretaker(caretaker.id, "age", e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="e.g. 42"
                            className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Gender</label>
                          <select
                            value={caretaker.gender}
                            onChange={(e) => handleUpdateCaretaker(caretaker.id, "gender", e.target.value)}
                            className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#1F4E46] hover:bg-[#153A34] active:scale-95 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save Registration &amp; Launch Main Dashboard</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
