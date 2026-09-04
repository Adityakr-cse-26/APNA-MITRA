import React, { useState } from "react";
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
  Smile
} from "lucide-react";
import { ElderlyProfile, CaretakerDetail, Language } from "../types";
import { ApnaMitraLogo } from "./ApnaMitraLogo";

interface RegistrationModalProps {
  currentLang: Language;
  profile: ElderlyProfile;
  onSaveProfile: (profile: ElderlyProfile) => void;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  currentLang,
  profile,
  onSaveProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"welcome" | "elderly" | "caretakers">("welcome");

  // Elderly Form State
  const [elderlyName, setElderlyName] = useState(profile.name || "Dada Ji (Ramakant Sharma)");
  const [elderlyPhone, setElderlyPhone] = useState(profile.phone || "+91 98765 43210");
  const [elderlyAge, setElderlyAge] = useState(profile.age || "72");
  const [elderlyGender, setElderlyGender] = useState(profile.gender || "Male");
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || "B+");
  const [basicHealthInfo, setBasicHealthInfo] = useState(
    profile.basicHealthInfo || "Mild Hypertension (managed with Telmisartan 40mg), Early Osteoarthritis in knees."
  );
  const [allergies, setAllergies] = useState(profile.allergies || "Sulfa antibiotics, Dust pollen");
  const [passionsLifestyle, setPassionsLifestyle] = useState(
    profile.passionsLifestyle || "Morning garden walks, Classical Indian Hindustani music, Reading spiritual texts, Playing Sudoku."
  );

  // Caretaker Form State (Min 1, Max 3)
  const [caretakers, setCaretakers] = useState<CaretakerDetail[]>(() => {
    if (profile.caretakers && profile.caretakers.length > 0) {
      return profile.caretakers;
    }
    return [
      {
        id: "c1",
        name: "Rahul Sharma",
        phone: "+91 98111 22334",
        email: "rahul.sharma@example.com",
        age: "42",
        gender: "Male",
        relation: "Son (Son)",
        isPrimary: true,
      },
      {
        id: "c2",
        name: "Priya Sharma",
        phone: "+91 98222 33445",
        email: "priya.care@example.com",
        age: "39",
        gender: "Female",
        relation: "Daughter (Daughter)",
        isPrimary: false,
      },
    ];
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successSaved, setSuccessSaved] = useState(false);

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

  const handleUpdateCaretaker = (id: string, field: keyof CaretakerDetail, value: any) => {
    setCaretakers(
      caretakers.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderlyName.trim() || !elderlyPhone.trim()) {
      setErrorMsg("Please provide Senior Citizen's Name and Phone Number.");
      return;
    }
    if (caretakers.length < 1 || !caretakers[0].name.trim() || !caretakers[0].phone.trim()) {
      setErrorMsg("At least 1 Caretaker details (Name & Phone) is mandatory.");
      return;
    }

    const updatedProfile: ElderlyProfile = {
      name: elderlyName,
      phone: elderlyPhone,
      age: elderlyAge,
      gender: elderlyGender,
      bloodGroup,
      basicHealthInfo,
      allergies,
      passionsLifestyle,
      caretakers,
      isRegistered: true,
    };

    onSaveProfile(updatedProfile);
    setSuccessSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8FAF8] border border-[#D8E2DA] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        
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
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                  Step 1 & 2 & 3 • App Flowchart
                </span>
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
              <div className="bg-gradient-to-br from-[#EBF3EF] to-[#F3F7F4] p-6 rounded-2xl border border-[#D8E2DA] space-y-4 text-center">
                <div className="bg-white p-4 rounded-3xl inline-block shadow-sm mx-auto border border-[#D8E2DA]">
                  <ApnaMitraLogo size="xl" variant="full" showTagline={true} />
                </div>
                <p className="text-sm text-[#4A5D54] max-w-xl mx-auto leading-relaxed">
                  A dedicated, supportive health companion for senior citizens and their loving family caretakers. Designed with simple large buttons, voice AI assistance, emergency one-tap SOS, and comprehensive wellness monitoring.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left text-xs text-[#2A3D34]">
                  <div className="p-3 bg-white rounded-xl border border-[#D8E2DA]">
                    <span className="font-bold text-[#1F4E46] block mb-1">❤️ Weekly Health Check</span>
                    <span>Regular vitals monitoring &amp; 4-tier AI preventive care tips.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D8E2DA]">
                    <span className="font-bold text-[#1F4E46] block mb-1">🧠 Games &amp; Activity</span>
                    <span>Sudoku, Memory training, Chair Yoga, and Morning Pranayama.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D8E2DA]">
                    <span className="font-bold text-[#1F4E46] block mb-1">🚨 24/7 Caretaker SOS</span>
                    <span>Direct 108 ambulance dispatch and 1-tap family notifications.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-stone-500">Press Next to configure details</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("elderly")}
                  className="px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition"
                >
                  <span>Continue to Elderly Details</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Senior's Full Name *</label>
                  <input
                    type="text"
                    value={elderlyName}
                    onChange={(e) => setElderlyName(e.target.value)}
                    placeholder="e.g. Ramakant Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    value={elderlyPhone}
                    onChange={(e) => setElderlyPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Age</label>
                    <input
                      type="number"
                      value={elderlyAge}
                      onChange={(e) => setElderlyAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Gender</label>
                    <select
                      value={elderlyGender}
                      onChange={(e) => setElderlyGender(e.target.value)}
                      className="w-full px-2 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    >
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
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, Sulfa"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                  />
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
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8E2DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("welcome")}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  ← Back to Welcome
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("caretakers")}
                  className="px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition"
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
                    className="p-4 bg-white rounded-2xl border border-[#D8E2DA] shadow-2xs space-y-3 relative"
                  >
                    <div className="flex items-center justify-between border-b border-[#EEF3EA] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1F4E46] text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-[#153A34]">
                          Caretaker {index + 1} {caretaker.isPrimary ? "(Primary Contact)" : ""}
                        </span>
                      </div>

                      {caretakers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCaretaker(caretaker.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
                          title="Remove Caretaker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Full Name *</label>
                        <input
                          type="text"
                          value={caretaker.name}
                          onChange={(e) => handleUpdateCaretaker(caretaker.id, "name", e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D8E2DA] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
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
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D8E2DA] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
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
                          className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D8E2DA] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Relation with User</label>
                          <input
                            type="text"
                            value={caretaker.relation}
                            onChange={(e) => handleUpdateCaretaker(caretaker.id, "relation", e.target.value)}
                            placeholder="e.g. Son / Daughter"
                            className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D8E2DA] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#2A3D34] mb-0.5">Age / Gender</label>
                          <input
                            type="text"
                            value={caretaker.age ? `${caretaker.age}, ${caretaker.gender}` : ""}
                            onChange={(e) => {
                              const parts = e.target.value.split(",");
                              handleUpdateCaretaker(caretaker.id, "age", parts[0]?.trim() || "");
                              if (parts[1]) handleUpdateCaretaker(caretaker.id, "gender", parts[1]?.trim());
                            }}
                            placeholder="e.g. 42, Male"
                            className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D8E2DA] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EEF3EA]">
                <button
                  type="button"
                  onClick={() => setActiveTab("elderly")}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  ← Back to Elderly Details
                </button>

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
