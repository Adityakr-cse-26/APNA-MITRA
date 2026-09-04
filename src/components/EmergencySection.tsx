import React, { useState } from "react";
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  MapPin, 
  Heart, 
  UserCheck, 
  Check, 
  Share2,
  Ambulance,
  Phone
} from "lucide-react";
import { Language, FamilyContact } from "../types";
import { translations } from "../data/translations";

interface EmergencySectionProps {
  currentLang: Language;
  contacts: FamilyContact[];
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({
  currentLang,
  contacts,
}) => {
  const t = translations[currentLang];
  const [sosSent, setSosSent] = useState(false);
  const [showIceCard, setShowIceCard] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [allergies, setAllergies] = useState("None reported / Penicillin sensitive");
  const [chronicConditions, setChronicConditions] = useState("Hypertension (Managed)");

  const handleTriggerSOS = () => {
    setSosSent(true);
    import("../utils/audio").then((m) => m.playSiren());
    setTimeout(() => {
      alert("🚨 Emergency SOS Alert simulated: Location (28.6139° N, 77.2090° E) & ICE details sent to saved family contacts!");
    }, 200);
  };

  const emergencyNumbers = [
    { label: "108 (Govt. Free Ambulance)", number: "108", icon: "🚑", color: "bg-red-700 hover:bg-red-800 text-white" },
    { label: "102 (Health Service Ambulance)", number: "102", icon: "🏥", color: "bg-rose-700 hover:bg-rose-800 text-white" },
    { label: "999 (Private Emergency Ambulance)", number: "999", icon: "🚨", color: "bg-amber-700 hover:bg-amber-800 text-white" },
    { label: "112 (National Emergency Helpline)", number: "112", icon: "🛡️", color: "bg-stone-800 hover:bg-stone-900 text-white" },
  ];

  return (
    <section id="emergency" className="py-16 md:py-24 bg-[#FAF0ED] border-b border-[#F6DCD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Emergency Alert Banner */}
        <article className="bg-gradient-to-br from-[#B54834] via-[#9E3927] to-[#7E291A] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden mb-12">
          
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
              <span>EMERGENCY DISPATCH &amp; SAFETY</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {t.emergencyTitle}
            </h2>

            <p className="text-base sm:text-lg text-rose-100 leading-relaxed max-w-2xl">
              {t.emergencyDesc}
            </p>

            {/* Big Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#guardian-alert"
                className="px-8 py-4 bg-white hover:bg-rose-50 active:scale-95 text-[#B54834] font-serif font-bold text-lg sm:text-xl rounded-2xl shadow-2xl flex items-center gap-3 transition"
              >
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
                <span>🚨 Trigger Guardian SOS &amp; Location</span>
              </a>

              <a
                href="#guardian-alert"
                className="px-6 py-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold text-sm rounded-2xl transition flex items-center gap-2"
              >
                <MapPin className="w-5 h-5 text-amber-300" />
                <span>Guardian 24/7 Live Location View</span>
              </a>

              <button
                type="button"
                onClick={() => setShowIceCard(!showIceCard)}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm rounded-2xl transition flex items-center gap-2"
              >
                <Heart className="w-5 h-5 text-rose-200" />
                <span>{showIceCard ? "Hide ICE Card" : "View ICE Medical Card"}</span>
              </button>
            </div>
          </div>

          {/* Quick Guardian Live Status Box */}
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl backdrop-blur-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span><strong>Guardian GPS:</strong> Active 24/7 (Gulmohar Enclave)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span><strong>Guardians:</strong> {contacts.length} Family Members Connected</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl backdrop-blur-xs">
              <Ambulance className="w-4 h-4 text-rose-300" />
              <span><strong>Nearest Trauma:</strong> AIIMS Delhi (1.4 km, 4 min)</span>
            </div>
          </div>

          {/* Quick SOS Sent Banner */}
          {sosSent && (
            <div className="mt-6 p-4 bg-white/20 border border-white/40 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-5 h-5 text-emerald-300 shrink-0" />
                Alert broadcasted to contacts (Rahul &amp; Priya) with live GPS.
              </span>
              <button
                onClick={() => setSosSent(false)}
                className="underline text-xs opacity-80 hover:opacity-100 ml-3"
              >
                Dismiss
              </button>
            </div>
          )}
        </article>

        {/* Flowchart Emergency Modules: Ambulance Numbers + Caretaker/Relative Numbers */}
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#153A34] flex items-center gap-2">
              <span>🚑 Ambulance &amp; National Emergency Numbers</span>
            </h3>
            <span className="text-xs bg-rose-100 text-rose-900 font-bold px-3 py-1 rounded-full">
              24/7 Toll-Free
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyNumbers.map((em, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-[#F6DCD3] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{em.icon}</span>
                    <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                      Direct Dial
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#5B6B60] uppercase mb-1">
                    {em.label}
                  </h4>
                  <div className="text-2xl font-bold text-[#153A34] font-mono">
                    {em.number}
                  </div>
                </div>

                <a
                  href={`tel:${em.number.replace(/-/g, "")}`}
                  className={`mt-4 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${em.color}`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {em.number}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Caretaker / Relative Numbers (Flowchart: 3 numbers can be saved, 1 at least mandatory, one-tap call) */}
          <div className="bg-white rounded-3xl p-6 border border-[#F6DCD3] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F6DCD3] pb-3">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#153A34] flex items-center gap-2">
                  <span>👥 Caretaker / Relative Speed Dial (Saved Contacts)</span>
                </h4>
                <p className="text-xs text-[#5B6B60]">
                  Max 3 family numbers can be saved • 1 mandatory • One-tap call with live SOS dispatch
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full">
                {contacts.length} / 3 Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contacts.map((contact, i) => (
                <div
                  key={contact.id}
                  className="p-4 bg-[#FAF0ED] rounded-2xl border border-[#F6DCD3] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1F4E46] text-white flex items-center justify-center font-bold text-sm">
                      {contact.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#153A34] flex items-center gap-1.5">
                        <span>{contact.name}</span>
                        {contact.isEmergencyContact && (
                          <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-sm font-bold">
                            SOS
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#5B6B60]">{contact.relation}</span>
                      <div className="text-xs font-mono font-bold text-[#1F4E46] mt-0.5">{contact.phone}</div>
                    </div>
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>One-Tap Call {contact.name.split(" ")[0]}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ICE (In Case of Emergency) Card */}
        {showIceCard && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-300 shadow-xl max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEF3EA] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  ICE
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#153A34]">
                    Emergency Medical Identity (ICE Card)
                  </h3>
                  <p className="text-xs text-[#5B6B60]">Visible to emergency first responders and doctors</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#EEF3EA] hover:bg-[#DCEAE4] text-[#1F4E46] rounded-xl text-xs font-bold"
              >
                Print Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-[#F4F7F4] rounded-2xl border border-[#D8E2DA]">
                <span className="text-[10px] font-bold text-[#5B6B60] uppercase block">Blood Group</span>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full font-bold text-lg text-[#153A34] bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-[#F4F7F4] rounded-2xl border border-[#D8E2DA]">
                <span className="text-[10px] font-bold text-[#5B6B60] uppercase block">Known Allergies</span>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full text-xs font-semibold text-[#153A34] bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-[#F4F7F4] rounded-2xl border border-[#D8E2DA]">
                <span className="text-[10px] font-bold text-[#5B6B60] uppercase block">Key Conditions</span>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  className="w-full text-xs font-semibold text-[#153A34] bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Saved Family Emergency Contacts */}
            <div>
              <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-2.5">
                Primary Emergency Contacts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-[#F4F7F4] rounded-2xl border border-[#D8E2DA] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1F4E46] text-white flex items-center justify-center text-xs font-bold">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#153A34]">{c.name} ({c.relation})</div>
                        <div className="text-[11px] text-[#5B6B60] font-mono">{c.phone}</div>
                      </div>
                    </div>

                    <a
                      href={`tel:${c.phone}`}
                      className="p-2 bg-[#E8A33D] text-white rounded-xl text-xs hover:bg-[#d4902b] transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
