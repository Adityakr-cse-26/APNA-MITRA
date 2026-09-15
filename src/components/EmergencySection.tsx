import React, { useState, useEffect } from "react";
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
import { Language, FamilyContact, ElderlyProfile } from "../types";
import { getCurrentLocation } from "../utils/geolocation";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { translations } from "../data/translations";

interface EmergencySectionProps {
  currentLang: Language;
  contacts: FamilyContact[];
  user: User;
  profile?: ElderlyProfile;
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({
  currentLang,
  contacts,
  user,
  profile,
}) => {
  const t = translations[currentLang];
  const [sosSent, setSosSent] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [showIceCard, setShowIceCard] = useState(false);
  const [showIceCardBack, setShowIceCardBack] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || "B+");
  const [allergies, setAllergies] = useState(profile?.allergies || "None reported");
  const [chronicConditions, setChronicConditions] = useState(profile?.basicHealthInfo || "None");

  const [nearestHospital, setNearestHospital] = useState<{name: string, distanceKm: number, timeMins: number} | null>(null);
  const [loadingHospital, setLoadingHospital] = useState(true);

  // Helper to calculate distance in km using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  useEffect(() => {
    let mounted = true;
    const fetchHospital = async () => {
      try {
        const loc = await getCurrentLocation();
        if (!loc || !mounted) {
            setLoadingHospital(false);
            return;
        }
        
        // Use Nominatim API for faster and more reliable hospital search within ~5.5km
        const size = 0.05;
        const viewbox = `${loc.longitude - size},${loc.latitude + size},${loc.longitude + size},${loc.latitude - size}`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${viewbox}&bounded=1&limit=10`;
        
        const res = await fetch(url, {
           headers: { 
             'Accept': 'application/json',
             'User-Agent': 'ApnaMitraApp/1.0'
           },
           signal: AbortSignal.timeout(15000)
        });
        
        if (!res.ok) throw new Error("Nominatim API failed");
        const data = await res.json();
        
        if (data && data.length > 0 && mounted) {
           let closest = null;
           let minDistance = Infinity;
           
           data.forEach((el: any) => {
             if (el.name) {
               const elLat = parseFloat(el.lat);
               const elLon = parseFloat(el.lon);
               if (!isNaN(elLat) && !isNaN(elLon)) {
                 const dist = calculateDistance(loc.latitude, loc.longitude, elLat, elLon);
                 if (dist < minDistance) {
                   minDistance = dist;
                   closest = el.name;
                 }
               }
             }
           });
           
           if (closest) {
             setNearestHospital({
               name: closest,
               distanceKm: Number(minDistance.toFixed(1)),
               timeMins: Math.max(1, Math.ceil(minDistance * 4)) // Roughly 4 mins per km in city traffic
             });
           }
        }
      } catch (err) {
        console.error("Failed to fetch nearest hospital:", err);
      } finally {
        if (mounted) setLoadingHospital(false);
      }
    };
    
    fetchHospital();
    return () => { mounted = false; };
  }, []);

  const handleTriggerSOS = async () => {
    setSosSent(true);
    setSosMessage("Sending SOS...");
    import("../utils/audio").then((m) => {
        if (m.playSiren) m.playSiren();
    }).catch(() => {});

    let loc = null;
    try {
      loc = await getCurrentLocation();
    } catch(e) {
      console.warn("Could not get location", e);
    }
    
    try {
      const { data: primaryCaretaker } = await supabase
        .from('caretakers')
        .select('*')
        .eq('patient_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (!primaryCaretaker) {
        alert("🚨 Emergency SOS Alert simulated: Please add an emergency contact to broadcast real alerts!");
        return;
      }
      
      const { data: alertData, error: insertError } = await supabase.from('emergency_alerts').insert([{
        patient_id: user.id,
        emergency_contact_name: primaryCaretaker.name,
        emergency_contact_phone: primaryCaretaker.phone,
        emergency_contact_relationship: primaryCaretaker.relation || primaryCaretaker.relationship || 'Primary Contact',
        alert_type: "SOS",
        status: "created",
        notification_status: "pending",
        location_lat: loc ? loc.latitude : null,
        location_lng: loc ? loc.longitude : null,
        location_accuracy: loc ? loc.accuracy : null,
        location_timestamp: loc ? loc.timestamp : null
      }]).select('id').single();

      if (insertError) {
        alert("Unable to create SOS alert. Please try again.");
      } else {
        await supabase.from('notifications').insert([{
          patient_id: user.id,
          patient_name: 'Patient',
          title: "🚨 Emergency SOS Alert",
          message: "Emergency SOS Alert",
          type: "SOS",
          is_read: false
        }]);

        await supabase.functions.invoke('send-sos-sms', {
          body: { alert_id: alertData.id }
        });
        setSosMessage(loc ? "📍 Location shared with Primary Caretaker" : "⚠️ SOS sent, but location was unavailable.");
      }
    } catch (err) {
      console.error(err);
    }
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
        <article id="guardian-alert" className="bg-gradient-to-br from-[#B54834] via-[#9E3927] to-[#7E291A] text-white rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden mb-12">
          
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
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleTriggerSOS(); }}
                className="px-8 py-4 bg-white hover:bg-rose-50 active:scale-95 text-[#B54834] font-serif font-bold text-lg sm:text-xl rounded-2xl shadow-2xl flex items-center gap-3 transition"
              >
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
                <span>🚨 Trigger Guardian SOS &amp; Location</span>
              </button>

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
              <Ambulance className="w-4 h-4 text-rose-300 shrink-0" />
              <span className="truncate">
                <strong>Nearest Hospital:</strong>{" "}
                {loadingHospital 
                  ? "Locating nearby hospitals..." 
                  : nearestHospital 
                    ? `${nearestHospital.name} (${nearestHospital.distanceKm} km, ~${nearestHospital.timeMins} min)` 
                    : "No hospitals found within 10km"}
              </span>
            </div>
          </div>

          {/* Quick SOS Sent Banner */}
          {sosSent && (
            <div className="mt-6 p-4 bg-white/20 border border-white/40 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-5 h-5 text-emerald-300 shrink-0" />
                {sosMessage}
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
                className="bg-white rounded-2xl p-5 border border-[#F6DCD3] shadow-sm flex flex-col justify-between"
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
          <div className="bg-white rounded-2xl p-6 border border-[#F6DCD3] shadow-sm space-y-4">
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

        {/* ICE (In Case of Emergency) Card Modal */}
        {showIceCard && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl my-8 animate-in fade-in zoom-in duration-200 relative">
              
              {/* Close and Print Actions */}
              <div className="absolute -top-12 right-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-[#1F4E46] rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowIceCard(false)}
                  className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              {/* CARD FLIPPING LOGIC */}
              {!showIceCardBack ? (
                /* CARD 1: FRONT */
                <div 
                  onClick={() => setShowIceCardBack(true)}
                  className="bg-[#f9fafb] rounded-[2rem] border-2 border-gray-200 shadow-xl overflow-hidden relative w-full aspect-auto sm:aspect-[1.58] max-h-none sm:max-h-[500px] flex flex-col pb-16 sm:pb-0 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="absolute top-4 right-4 z-10 text-[10px] sm:text-xs font-bold text-gray-500 bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-gray-200">
                    Tap to flip <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5"/><polyline points="9 22 5 15 9 8"/></svg>
                  </div>
                  
                  {/* Header */}
                  <div className="bg-[#D32F2F] text-white text-center py-3 sm:py-4 px-6 rounded-t-[1.7rem] mx-2 mt-2 shadow-sm">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-wide pr-24 sm:pr-0">APNA MITRA • EMERGENCY HEALTH CARD</h2>
                  </div>
                  <div className="text-center mt-1 sm:mt-2">
                    <span className="text-[#00897B] font-bold text-xs sm:text-sm tracking-wide">अपनों का साथ, हर उम्र में खास ♡</span>
                  </div>
                  
                  {/* Body */}
                  <div className="flex flex-col sm:flex-row px-4 sm:px-8 py-4 sm:py-4 gap-4 sm:gap-6 flex-1 items-center sm:items-stretch">
                    {/* Photo section */}
                    <div className="w-24 h-32 sm:w-32 sm:h-40 bg-[#E3F2FD] rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center p-2 shadow-inner shrink-0">
                      <span className="text-[#1565C0] font-bold text-base sm:text-lg mb-1">PHOTO</span>
                      <span className="text-[#546E7A] text-[9px] sm:text-[10px]">Upload profile photo</span>
                    </div>

                    {/* Details section */}
                    <div className="flex-1 grid grid-cols-2 gap-y-4 sm:gap-y-4 gap-x-2 w-full">
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[#D32F2F] text-[10px] sm:text-xs font-bold uppercase mb-0.5">NAME</div>
                        <div className="text-[#263238] font-bold text-base sm:text-lg truncate uppercase">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "[FULL NAME]"}</div>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[#D32F2F] text-[10px] sm:text-xs font-bold uppercase mb-0.5">BLOOD GROUP</div>
                        <select 
                            value={bloodGroup} 
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setBloodGroup(e.target.value)} 
                            className="text-[#263238] font-bold text-base sm:text-lg bg-transparent border-b border-dashed border-gray-300 w-full max-w-[120px] focus:outline-none uppercase appearance-none cursor-pointer"
                        >
                          <option value="">[Select]</option>
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

                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[#D32F2F] text-[10px] sm:text-xs font-bold uppercase mb-0.5">DATE OF BIRTH</div>
                        <div className="text-[#263238] font-bold text-base sm:text-lg">
                          {profile?.dob && profile.dob.split('-').length === 3
                            ? `${profile.dob.split('-')[2]} / ${profile.dob.split('-')[1]} / ${profile.dob.split('-')[0]}`
                            : "[DD / MM / YYYY]"}
                        </div>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[#D32F2F] text-[10px] sm:text-xs font-bold uppercase mb-0.5">EMERGENCY ID</div>
                        <div className="text-[#263238] font-bold text-base sm:text-lg">AM-{user?.id?.substring(0,4).toUpperCase()}-{user?.id?.substring(4,8).toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Right corner QR & Icon */}
                    <div className="hidden sm:flex flex-col items-center justify-between shrink-0 pl-2 py-2">
                      <div className="w-16 h-16 border border-gray-300 rounded-xl flex items-center justify-center flex-col shadow-sm bg-white">
                        <span className="text-[#1565C0] font-bold text-sm">QR</span>
                        <span className="text-[6px] text-gray-500 leading-tight text-center mt-1">Scan for<br/>health profile</span>
                      </div>
                      <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex items-center justify-center mt-2 relative bg-white shadow-sm">
                         <div className="w-8 h-2.5 bg-[#D32F2F] absolute rounded-sm"></div>
                         <div className="h-8 w-2.5 bg-[#D32F2F] absolute rounded-sm"></div>
                         <span className="absolute bottom-1 right-2 text-[10px] text-[#00897B]">♡</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-[#D32F2F] text-white text-center py-2 sm:py-3 px-4 sm:px-6 rounded-b-[1.7rem] mx-2 mb-2 absolute bottom-0 left-0 right-0 shadow-sm">
                    <p className="text-[9px] sm:text-xs font-bold tracking-wider uppercase">IN AN EMERGENCY • CHECK THIS CARD FIRST • CALL LOCAL EMERGENCY SERVICES</p>
                  </div>
                </div>
              ) : (
                /* CARD 2: BACK */
                <div 
                  onClick={() => setShowIceCardBack(false)}
                  className="bg-[#f9fafb] rounded-[2rem] border-2 border-gray-200 shadow-xl overflow-hidden relative w-full flex flex-col pt-2 pb-2 cursor-pointer hover:shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowIceCardBack(false); }}
                    className="absolute top-4 left-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 shadow-sm hover:bg-white border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>

                  {/* Header */}
                  <div className="bg-[#D32F2F] text-white text-center py-3 sm:py-4 px-6 rounded-t-[1.7rem] mx-2 mt-0 shadow-sm">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-wide">APNA MITRA • EMERGENCY HEALTH CARD</h2>
                  </div>
                  <div className="text-center mt-1 sm:mt-2 mb-3 sm:mb-4">
                    <span className="text-[#00897B] font-bold text-xs sm:text-sm tracking-wide">अपनों का साथ, हर उम्र में खास ♡</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row px-4 sm:px-6 gap-4 sm:gap-6 mb-16 sm:mb-20" onClick={(e) => e.stopPropagation()}>
                    {/* Contacts side */}
                    <div className="flex-1 flex flex-col">
                      <div className="bg-[#D32F2F] text-white text-center py-2 px-4 rounded-t-xl font-bold text-[11px] sm:text-sm tracking-wide shadow-sm">
                        IN CASE OF EMERGENCY, CALL
                      </div>
                      <div className="border-x border-b border-red-100 rounded-b-xl p-4 bg-red-50/50 shadow-sm flex-1">
                        <div className="mb-4">
                          <div className="text-[#D32F2F] text-[10px] font-bold uppercase mb-0.5">Primary Contact</div>
                          <div className="text-[#263238] font-bold text-sm sm:text-base">{contacts[0]?.name || "[Guardian / Family]"} {contacts[0]?.relation ? `(${contacts[0].relation})` : ''}</div>
                          <div className="text-[#546E7A] text-xs sm:text-sm font-mono mt-0.5">Phone: {contacts[0]?.phone || "[XXXXXXXXXX]"}</div>
                        </div>
                        {contacts.length > 1 && (
                        <div>
                          <div className="text-[#D32F2F] text-[10px] font-bold uppercase mb-0.5">Secondary Contact</div>
                          <div className="text-[#263238] font-bold text-sm sm:text-base">{contacts[1].name} {contacts[1].relation ? `(${contacts[1].relation})` : ''}</div>
                          <div className="text-[#546E7A] text-xs sm:text-sm font-mono mt-0.5">Phone: {contacts[1].phone}</div>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Health Info Side */}
                    <div className="flex-1 flex flex-col">
                      <div className="bg-[#D32F2F] text-white text-center py-2 px-4 rounded-t-xl font-bold text-[11px] sm:text-sm tracking-wide shadow-sm">
                        IMPORTANT HEALTH INFORMATION
                      </div>
                      <div className="border-x border-b border-red-100 rounded-b-xl p-4 bg-red-50/50 shadow-sm flex flex-col justify-center gap-3 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[#D32F2F] text-[10px] font-bold uppercase sm:w-24 shrink-0">Allergies</span>
                          <input 
                            value={allergies} 
                            onChange={(e) => setAllergies(e.target.value)}
                            className="text-[#263238] font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-full" 
                            placeholder="[None / Specify]"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[#D32F2F] text-[10px] font-bold uppercase sm:w-24 shrink-0">Conditions</span>
                          <input 
                            value={chronicConditions} 
                            onChange={(e) => setChronicConditions(e.target.value)}
                            className="text-[#263238] font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-full" 
                            placeholder="[Asthma / Diabetes / etc.]"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[#D32F2F] text-[10px] font-bold uppercase sm:w-24 shrink-0">Medications</span>
                          <input 
                            defaultValue="[Medicine + dose]"
                            className="text-[#263238] font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-full placeholder-gray-400" 
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[#D32F2F] text-[10px] font-bold uppercase sm:w-24 shrink-0">Special Notes</span>
                          <input 
                            defaultValue="[Critical information]"
                            className="text-[#263238] font-bold text-xs sm:text-sm bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-full placeholder-gray-400" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-[#D32F2F] text-white text-center py-2 sm:py-3 px-4 sm:px-6 rounded-b-[1.7rem] mx-2 mb-2 absolute bottom-0 left-0 right-0 shadow-sm pointer-events-none">
                    <p className="text-[8px] sm:text-[10px] font-bold tracking-wider uppercase">KEEP THIS CARD WITH YOU • UPDATE YOUR DETAILS REGULARLY • USE ONLY WITH CONSENT</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
