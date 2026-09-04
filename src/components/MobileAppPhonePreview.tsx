import React, { useState } from "react";
import { 
  Heart, 
  Phone, 
  Sparkles, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  Mic, 
  Check, 
  ChevronRight,
  Smartphone,
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { Language, DailyCheckin } from "../types";
import { ApnaMitraLogo } from "./ApnaMitraLogo";

interface MobileAppPhonePreviewProps {
  onClose: () => void;
  initialLang?: Language;
}

export const MobileAppPhonePreview: React.FC<MobileAppPhonePreviewProps> = ({
  onClose,
  initialLang = "en",
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [activeTab, setActiveTab] = useState<"home" | "checkin" | "awareness" | "connect" | "more">("home");
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [selectedMood, setSelectedMood] = useState<string>("great");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [activeAwarenessCat, setActiveAwarenessCat] = useState<"psych" | "phys" | "social">("psych");
  const [checkinsCount, setCheckinsCount] = useState<number>(3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const awarenessData = {
    psych: [
      {
        en: ["Stay socially connected", "A short daily call or visit with family or friends helps reduce loneliness and lifts mood."],
        hi: ["सामाजिक जुड़ाव बनाए रखें", "परिवार या मित्रों से रोज़ थोड़ी बातचीत अकेलापन कम करती है और मूड अच्छा रखती है।"],
        bn: ["সামাজিক সংযোগ বজায় রাখুন", "পরিবার বা বন্ধুদের সাথে প্রতিদিন কিছুক্ষণ কথা বললে একাকীত্ব কমে ও মন ভালো থাকে।"],
      },
      {
        en: ["Watch for low mood", "Ongoing sadness or loss of interest for more than two weeks is worth discussing with a doctor."],
        hi: ["उदासी पर ध्यान दें", "दो हफ़्तों से अधिक लगातार उदासी या रुचि में कमी हो तो डॉक्टर से बात करें।"],
        bn: ["মন খারাপ লক্ষ্য করুন", "দুই সপ্তাহের বেশি ক্রমাগত মন খারাপ থাকলে চিকিৎসকের সাথে কথা বলুন।"],
      },
      {
        en: ["Exercise the memory", "Simple habits — puzzles, reading, naming the day's date — keep the mind active."],
        hi: ["स्मृति का अभ्यास करें", "पहेलियाँ, पढ़ना, तारीख़ याद रखना जैसी आदतें मन को सक्रिय रखती हैं।"],
        bn: ["স্মৃতি চর্চা করুন", "ধাঁধা, পড়া, তারিখ মনে রাখার মতো অভ্যাস মনকে সক্রিয় রাখে।"],
      },
    ],
    phys: [
      {
        en: ["Protect your eyesight", "A yearly eye check-up helps catch cataract and glaucoma early, when they're easiest to treat."],
        hi: ["आँखों की सुरक्षा करें", "वार्षिक नेत्र जाँच मोतियाबिंद व ग्लूकोमा को शुरुआत में पकड़ने में मदद करती है।"],
        bn: ["দৃষ্টিশক্তি রক্ষা করুন", "বার্ষিক চোখ পরীক্ষা ছানি ও গ্লুকোমা প্রথম দিকে শনাক্ত করতে সাহায্য করে।"],
      },
      {
        en: ["Ease joint pain", "Gentle daily movement like walking or stretching can help hearing, joints, and overall stiffness."],
        hi: ["जोड़ों का दर्द कम करें", "रोज़ हल्की सैर या स्ट्रेचिंग जोड़ों की अकड़न को कम करने में मदद करती है।"],
        bn: ["জয়েন্টের ব্যথা কমান", "প্রতিদিন হালকা হাঁটা বা স্ট্রেচিং জয়েন্টের শক্ততা কমাতে সাহায্য করে।"],
      },
      {
        en: ["Track sugar & pressure", "Regular home checks for diabetes and blood pressure catch problems before they grow serious."],
        hi: ["शुगर व दबाव जाँचें", "मधुमेह व रक्तचाप की नियमित घरेलू जाँच समस्याओं को गंभीर होने से पहले पकड़ लेती है।"],
        bn: ["সুগার ও চাপ পরীক্ষা করুন", "ডায়াবেটিস ও রক্তচাপের নিয়মিত ঘরোয়া পরীক্ষা সমস্যাকে গুরুতর হওয়ার আগেই ধরতে পারে।"],
      },
    ],
    social: [
      {
        en: ["Plan family time", "A weekly family visit or video call keeps bonds strong and gives everyone peace of mind."],
        hi: ["पारिवारिक समय तय करें", "साप्ताहिक मुलाक़ात या वीडियो कॉल रिश्तों को मज़बूत रखती है।"],
        bn: ["পারিবারিক সময় পরিকল্পনা করুন", "সাপ্তাহিক দেখা বা ভিডিও কল সম্পর্ক দৃঢ় রাখে।"],
      },
      {
        en: ["Plan for retirement finances", "A simple monthly budget, reviewed with family, eases money-related worry."],
        hi: ["सेवानिवृत्ति के वित्त की योजना बनाएं", "परिवार के साथ मासिक बजट बनाने से आर्थिक चिंता कम होती है।"],
        bn: ["অবসরকালীন অর্থব্যবস্থা পরিকল্পনা করুন", "পরিবারের সাথে মাসিক বাজেট চিন্তা কমায়।"],
      },
      {
        en: ["Stay independent", "Small daily tasks done solo — with support nearby — help maintain confidence and dignity."],
        hi: ["थोड़ी स्वतंत्रता बनाए रखें", "पास में सहायता के साथ छोटे दैनिक कार्य स्वयं करना आत्मविश्वास बनाए रखता है।"],
        bn: ["কিছুটা স্বাধীন থাকুন", "কাছে সহায়তা থাকলে ছোট দৈনন্দিন কাজ নিজে করা আত্মবিশ্বাস বজায় রাখে।"],
      },
    ],
  };

  const handleSavePhoneCheckin = () => {
    setCheckinsCount((c) => Math.min(c + 1, 7));
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    showToast(currentLang === "hi" ? "चेक-इन सहेजा गया। धन्यवाद!" : currentLang === "bn" ? "চেক-ইন সংরক্ষিত হয়েছে।" : "Check-in saved. Thank you!");
    setTimeout(() => setActiveTab("home"), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative flex flex-col items-center">
        
        {/* Close Button on Top Right */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 sm:-right-10 w-9 h-9 rounded-full bg-white text-[#153A34] hover:bg-[#EEF3EA] flex items-center justify-center font-bold shadow-lg"
          title="Close Phone View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Smartphone Frame */}
        <div 
          className="w-[390px] max-w-full bg-[#EEF3EA] rounded-[44px] shadow-[0_30px_60px_-20px_rgba(21,58,52,0.5),0_0_0_12px_#101816] overflow-hidden relative border border-[#101816] flex flex-col h-[740px]"
          style={{ fontSize: `${15 * fontScale}px` }}
        >
          
          {/* Top Notch & Status Bar */}
          <div className="bg-[#EEF3EA] pt-3 pb-1 px-6 flex justify-between items-center text-xs font-semibold text-[#22312B] relative select-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#101816] rounded-b-2xl z-20"></div>
            <span>9:41</span>
            <span>🔋 100%</span>
          </div>

          {/* App Header inside phone */}
          <div className="px-5 py-2 flex items-center justify-between border-b border-[#D8E2DA] bg-[#EEF3EA]">
            <ApnaMitraLogo size="xs" variant="horizontal" showTagline={false} />

            {/* Language Switcher */}
            <div className="flex bg-white p-0.5 rounded-full border border-[#D8E2DA]">
              {(["en", "hi", "bn"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setCurrentLang(l)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition ${
                    currentLang === l ? "bg-[#1F4E46] text-white" : "text-[#5B6B60]"
                  }`}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : "বাং"}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Screen Contents */}
          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
            
            {/* Screen 1: HOME */}
            {activeTab === "home" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Sun Greeting Card */}
                <div className="bg-gradient-to-b from-[#1F4E46] to-[#153A34] text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-[#E8A33D]/90 blur-xs"></div>
                  <div className="text-[11px] uppercase tracking-wider text-[#DCEAE4]">
                    {currentLang === "hi" ? "सुप्रभात" : currentLang === "bn" ? "শুভ সকাল" : "Good morning"}
                  </div>
                  <div className="font-serif text-2xl font-bold my-1">
                    {currentLang === "hi" ? "नमस्ते, दादी 🌼" : currentLang === "bn" ? "নমস্কার, দিদা 🌼" : "Namaste, Dadi 🌼"}
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-white/10 flex items-center justify-center font-bold text-base font-serif">
                      {checkinsCount}/7
                    </div>
                    <div className="text-xs">
                      <b className="text-sm block">{checkinsCount} {currentLang === "hi" ? "दिन" : currentLang === "bn" ? "দিন" : "days"}</b>
                      <span className="opacity-80">of check-ins this week</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions grid */}
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#153A34] mb-2.5">
                    {currentLang === "hi" ? "त्वरित कार्य" : currentLang === "bn" ? "দ্রুত কাজ" : "Quick actions"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setActiveTab("checkin")}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8E2DA] text-left hover:border-[#1F4E46] transition active:scale-97"
                    >
                      <span className="text-xl block mb-1">📝</span>
                      <h5 className="font-bold text-xs text-[#153A34]">
                        {currentLang === "hi" ? "आज का चेक-इन" : "Today's check-in"}
                      </h5>
                      <p className="text-[10px] text-[#5B6B60]">2 min wellbeing survey</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("connect")}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8E2DA] text-left hover:border-[#1F4E46] transition active:scale-97"
                    >
                      <span className="text-xl block mb-1">👨‍👩‍👧</span>
                      <h5 className="font-bold text-xs text-[#153A34]">
                        {currentLang === "hi" ? "परिवार को कॉल" : "Call family"}
                      </h5>
                      <p className="text-[10px] text-[#5B6B60]">Reach a loved one</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("awareness")}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8E2DA] text-left hover:border-[#1F4E46] transition active:scale-97"
                    >
                      <span className="text-xl block mb-1">🛡️</span>
                      <h5 className="font-bold text-xs text-[#153A34]">
                        {currentLang === "hi" ? "स्वास्थ्य सुझाव" : "Health tips"}
                      </h5>
                      <p className="text-[10px] text-[#5B6B60]">Simple preventive care</p>
                    </button>

                    <button
                      onClick={() => setActiveTab("connect")}
                      className="bg-white p-3.5 rounded-2xl border border-[#D8E2DA] text-left hover:border-[#1F4E46] transition active:scale-97"
                    >
                      <span className="text-xl block mb-1">📋</span>
                      <h5 className="font-bold text-xs text-[#153A34]">
                        {currentLang === "hi" ? "सरकारी योजनाएँ" : "Govt schemes"}
                      </h5>
                      <p className="text-[10px] text-[#5B6B60]">Senior citizen support</p>
                    </button>
                  </div>
                </div>

                {/* Tip of the day */}
                <div className="p-3.5 bg-[#FBE8C8] rounded-2xl border border-[#E8A33D]/40 flex gap-3 items-start">
                  <span className="text-xl">💡</span>
                  <div>
                    <h5 className="font-bold text-xs text-[#7A4E12]">Keep your eyes healthy</h5>
                    <p className="text-[11px] text-[#8A5A13] leading-tight mt-0.5">
                      A yearly eye check-up catches cataract early. Ask family to help book one this month.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Screen 2: CHECK-IN */}
            {activeTab === "checkin" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#153A34]">
                    {currentLang === "hi" ? "स्वास्थ्य जाँच" : "Wellbeing check-in"}
                  </h4>
                  <p className="text-xs text-[#5B6B60]">A quick, simple survey — just for you.</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#35483F] uppercase block mb-2">
                    How are you feeling today?
                  </span>
                  <div className="flex justify-between">
                    {["😄", "🙂", "😐", "😕", "😔"].map((em, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedMood(em)}
                        className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl transition ${
                          selectedMood === em ? "bg-[#FBE8C8] border-[#E8A33D] scale-110" : "bg-white border-[#D8E2DA]"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#35483F] uppercase block mb-2">
                    Any of these today?
                  </span>
                  <div className="space-y-2 text-xs">
                    {[
                      "Body ache or joint pain",
                      "Trouble sleeping",
                      "Felt lonely or low",
                      "Forgot something important",
                      "Spoke with family today",
                    ].map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 bg-white border border-[#D8E2DA] rounded-xl cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedChecks.includes(item)}
                          onChange={() => {
                            setSelectedChecks((prev) =>
                              prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                            );
                          }}
                          className="accent-[#1F4E46]"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSavePhoneCheckin}
                  className="w-full py-3 bg-[#1F4E46] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#153A34]"
                >
                  Save Today's Check-in
                </button>
              </div>
            )}

            {/* Screen 3: AWARENESS */}
            {activeTab === "awareness" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#153A34]">
                    Awareness &amp; Prevention
                  </h4>
                  <p className="text-xs text-[#5B6B60]">Simple tips for healthy ageing.</p>
                </div>

                <div className="flex gap-2">
                  {[
                    { id: "psych", label: "🧠 Mind" },
                    { id: "phys", label: "🫀 Body" },
                    { id: "social", label: "👥 Social" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveAwarenessCat(cat.id as any)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        activeAwarenessCat === cat.id ? "bg-[#1F4E46] text-white" : "bg-white text-[#5B6B60] border border-[#D8E2DA]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {awarenessData[activeAwarenessCat].map((item, idx) => {
                    const [h, p] = (item as any)[currentLang] || item.en;
                    return (
                      <div key={idx} className="p-3.5 bg-white rounded-2xl border border-[#D8E2DA] space-y-1">
                        <h5 className="font-bold text-xs text-[#153A34]">{h}</h5>
                        <p className="text-[11px] text-[#5B6B60] leading-normal">{p}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Screen 4: CONNECT */}
            {activeTab === "connect" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#153A34]">
                    Connect &amp; Support
                  </h4>
                  <p className="text-xs text-[#5B6B60]">Family, healthcare, and welfare in one place.</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#35483F] uppercase block">Family Contacts</span>
                  <div className="p-3 bg-white rounded-2xl border border-[#D8E2DA] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#DCEAE4] text-[#1F4E46] flex items-center justify-center font-bold text-sm">
                        R
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#153A34]">Rahul</div>
                        <div className="text-[10px] text-[#5B6B60]">Son • Primary Contact</div>
                      </div>
                    </div>
                    <a href="tel:112" className="p-2 bg-[#FBE8C8] text-[#8A5A13] rounded-full text-xs">
                      📞
                    </a>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-[#D8E2DA] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#DCEAE4] text-[#1F4E46] flex items-center justify-center font-bold text-sm">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#153A34]">Priya</div>
                        <div className="text-[10px] text-[#5B6B60]">Daughter</div>
                      </div>
                    </div>
                    <a href="tel:112" className="p-2 bg-[#FBE8C8] text-[#8A5A13] rounded-full text-xs">
                      📞
                    </a>
                  </div>
                </div>

                {/* Share Status Toggle */}
                <div className="p-3 bg-white rounded-2xl border border-[#D8E2DA] flex items-center justify-between text-xs">
                  <span>Share check-in status with family</span>
                  <button
                    onClick={() => setShareStatus(!shareStatus)}
                    className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                      shareStatus ? "bg-[#1F4E46]" : "bg-[#D8E2DA]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition ${shareStatus ? "translate-x-4" : ""}`}></div>
                  </button>
                </div>

                {/* Guardian 24/7 Live Location Access Toggle */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Guardian Live GPS Access</span>
                    </div>
                    <button
                      onClick={() => setShareLocation(!shareLocation)}
                      className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                        shareLocation ? "bg-emerald-600" : "bg-[#D8E2DA]"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition ${shareLocation ? "translate-x-4" : ""}`}></div>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    {shareLocation 
                      ? "Guardians Rahul & Priya have 24/7 access to your real-time coordinates (28.6139° N, 77.2090° E)." 
                      : "Location sharing is paused. SOS will re-activate automatically in emergency."}
                  </p>
                </div>

                {/* Schemes */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#35483F] uppercase block">Senior Schemes</span>
                  <div className="p-3 bg-[#DCEAE4] rounded-2xl text-xs space-y-1">
                    <h5 className="font-bold text-[#1F4E46]">Ayushman Bharat (Senior 70+)</h5>
                    <p className="text-[11px] text-[#4A5D54]">₹5 Lakh free annual hospitalization coverage.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Screen 5: MORE & SETTINGS */}
            {activeTab === "more" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Emergency SOS Big Panel */}
                <div className="p-5 bg-gradient-to-b from-[#B54834] to-[#8F3625] text-white rounded-3xl text-center space-y-2">
                  <span className="text-xs opacity-90 block">In case of emergency</span>
                  <button
                    onClick={() => showToast("🚨 Alert dispatched to Rahul & Priya")}
                    className="w-24 h-24 rounded-full bg-white text-[#B54834] font-serif font-bold text-xl mx-auto flex items-center justify-center shadow-xl active:scale-95 transition"
                  >
                    SOS
                  </button>
                  <p className="text-[10px] opacity-80">Alerts saved family &amp; emergency contacts</p>
                </div>

                {/* Text Sizing */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#D8E2DA] space-y-2">
                  <span className="text-xs font-bold text-[#35483F]">Text Size Adjustment</span>
                  <div className="flex gap-2 text-xs font-bold">
                    <button
                      onClick={() => setFontScale(0.9)}
                      className={`flex-1 py-1.5 rounded-xl border ${fontScale === 0.9 ? "bg-[#1F4E46] text-white" : "bg-[#EEF3EA]"}`}
                    >
                      Small
                    </button>
                    <button
                      onClick={() => setFontScale(1.0)}
                      className={`flex-1 py-1.5 rounded-xl border ${fontScale === 1.0 ? "bg-[#1F4E46] text-white" : "bg-[#EEF3EA]"}`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setFontScale(1.2)}
                      className={`flex-1 py-1.5 rounded-xl border ${fontScale === 1.2 ? "bg-[#1F4E46] text-white" : "bg-[#EEF3EA]"}`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* Voice Assist */}
                <button
                  onClick={() => showToast("Listening… (Demo) heard: 'Call Rahul'")}
                  className="w-full p-3.5 bg-[#FBE8C8] text-[#7A4E12] rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Try a Voice Command</span>
                </button>

                {/* Guardian Portal Link */}
                <a
                  href="#guardian-alert"
                  onClick={onClose}
                  className="w-full p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition"
                >
                  <span>🛡️ Open Verified Guardian Dashboard</span>
                </a>
              </div>
            )}

          </div>

          {/* Toast inside phone */}
          {toastMessage && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#22312B] text-white px-4 py-2 rounded-xl text-xs shadow-xl animate-in fade-in duration-150 z-30 text-center max-w-[85%]">
              {toastMessage}
            </div>
          )}

          {/* Phone Bottom Navigation Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#D8E2DA] flex justify-around py-2 px-1 z-20">
            {[
              { id: "home", icon: "🏠", label: "Home" },
              { id: "checkin", icon: "📝", label: "Check-in" },
              { id: "awareness", icon: "🛡️", label: "Awareness" },
              { id: "connect", icon: "🤝", label: "Connect" },
              { id: "more", icon: "⋯", label: "More" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-0.5 text-center flex-1 py-1 ${
                  activeTab === tab.id ? "text-[#1F4E46] font-bold" : "text-[#5B6B60]"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
