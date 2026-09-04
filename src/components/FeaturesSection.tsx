import React from "react";
import { 
  Bot, 
  Stethoscope, 
  FileText, 
  Pill, 
  Activity, 
  Users, 
  Calendar, 
  Mic, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { Language } from "../types";
import { translations } from "../data/translations";

interface FeaturesSectionProps {
  currentLang: Language;
  onOpenSymptomChecker: () => void;
  onOpenReportAnalyzer: () => void;
  onOpenMedicineReminder: () => void;
  onOpenVitalsTracker: () => void;
  onOpenFamilyCare: () => void;
  onOpenDoctorPrep: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenEmergency: () => void;
  onOpenGuardianAlert: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  currentLang,
  onOpenSymptomChecker,
  onOpenReportAnalyzer,
  onOpenMedicineReminder,
  onOpenVitalsTracker,
  onOpenFamilyCare,
  onOpenDoctorPrep,
  onOpenVoiceAssistant,
  onOpenEmergency,
  onOpenGuardianAlert,
}) => {
  const t = translations[currentLang];

  const features = [
    {
      id: "symptom",
      icon: "🩺",
      lucideIcon: Stethoscope,
      title: currentLang === "hi" ? "लक्षण जाँचकर्ता (Symptom Checker)" : currentLang === "bn" ? "লক্ষণ পরীক্ষক" : "Symptom Checker",
      desc: currentLang === "hi" 
        ? "लक्षणों का विवरण दें और उचित अगले कदमों व चेतावनी संकेतों के बारे में मार्गदर्शन पाएं।" 
        : currentLang === "bn" 
        ? "লক্ষণ বর্ণনা করুন এবং পরবর্তী পদক্ষেপ ও সতর্কতামূলক লক্ষণ সম্পর্কে পরামর্শ নিন।" 
        : "Describe symptoms and get guidance about appropriate next steps and warning signs.",
      action: onOpenSymptomChecker,
      tag: "Interactive Triage",
      color: "bg-teal-50 text-teal-800 border-teal-200",
    },
    {
      id: "report",
      icon: "📄",
      lucideIcon: FileText,
      title: currentLang === "hi" ? "रिपोर्ट विश्लेषक (Report Analyzer)" : currentLang === "bn" ? "রিপোর্ট বিশ্লেষক" : "Report Analyzer",
      desc: currentLang === "hi" 
        ? "मेडिकल लैब रिपोर्ट अपलोड करें और महत्वपूर्ण मानों को सरल भाषा में समझें।" 
        : currentLang === "bn" 
        ? "মেডিকেল রিপোর্ট আপলোড করুন এবং সাধারণ ভাষায় গুরুত্বপূর্ণ মানগুলি বুঝুন।" 
        : "Upload medical reports and understand important values in simple language.",
      action: onOpenReportAnalyzer,
      tag: "OCR & Lab Insights",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      id: "meds",
      icon: "💊",
      lucideIcon: Pill,
      title: currentLang === "hi" ? "दवा अनुस्मारक (Medicine Reminder)" : currentLang === "bn" ? "ওষুধের রিমাইন্ডার" : "Medicine Reminder",
      desc: currentLang === "hi" 
        ? "निर्धारित दवाएं व्यवस्थित करें और समय पर खुराक लेने के लिए अनुस्मारक प्राप्त करें।" 
        : currentLang === "bn" 
        ? "প্রেসক্রিপশন অনুযায়ী ওষুধ সাজান এবং নির্দিষ্ট সময়ের অনুস্মারক পান।" 
        : "Organize prescribed medicines and receive reminders for scheduled doses.",
      action: onOpenMedicineReminder,
      tag: "Pill Scheduler",
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      id: "vitals",
      icon: "📈",
      lucideIcon: Activity,
      title: currentLang === "hi" ? "स्वास्थ्य निगरानी (Health Monitoring)" : currentLang === "bn" ? "স্বাস্থ্য পর্যবেক্ষণ" : "Health Monitoring",
      desc: currentLang === "hi" 
        ? "ब्लड प्रेशर, ग्लूकोज, SpO2, वजन और हृदय गति जैसे मापों को ट्रैक करें।" 
        : currentLang === "bn" 
        ? "রক্তচাপ, গ্লুকোজ, SpO2, ওজন এবং হৃদস্পন্দনের মতো পরিমাপ ট্র্যাক করুন।" 
        : "Track measurements such as blood pressure, glucose, SpO2, weight, and heart rate.",
      action: onOpenVitalsTracker,
      tag: "Vitals Log",
      color: "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      id: "family",
      icon: "👨‍👩‍👧",
      lucideIcon: Users,
      title: currentLang === "hi" ? "पारिवारिक देखभाल (Family Care)" : currentLang === "bn" ? "পারিবারিক যত্ন" : "Family Care",
      desc: currentLang === "hi" 
        ? "विश्वसनीय परिवार के सदस्यों या देखभाल करने वालों के साथ स्वास्थ्य अपडेट साझा करें।" 
        : currentLang === "bn" 
        ? "বিশ্বস্ত পরিবারের সদস্য বা যত্নশীলদের সাথে নির্বাচিত স্বাস্থ্য আপডেট শেয়ার করুন।" 
        : "Share selected health updates with trusted family members or caregivers.",
      action: onOpenFamilyCare,
      tag: "Caregiver Sync",
      color: "bg-purple-50 text-purple-800 border-purple-200",
    },
    {
      id: "doctor",
      icon: "📅",
      lucideIcon: Calendar,
      title: currentLang === "hi" ? "डॉक्टर विजिट की तैयारी" : currentLang === "bn" ? "ডাক্তার ভিজিটের প্রস্তুতি" : "Doctor Visit Prep",
      desc: currentLang === "hi" 
        ? "लक्षण सारांश, दवाओं की सूची और डॉक्टर के लिए उपयोगी सवाल तैयार करें।" 
        : currentLang === "bn" 
        ? "লক্ষণ সারাংশ, ওষুধের তালিকা এবং ডাক্তারের জন্য প্রয়োজনীয় প্রশ্ন প্রস্তুত করুন।" 
        : "Prepare symptom summaries, medicine lists, and useful questions for your doctor.",
      action: onOpenDoctorPrep,
      tag: "Printable Sheet",
      color: "bg-indigo-50 text-indigo-800 border-indigo-200",
    },
    {
      id: "voice",
      icon: "🎙️",
      lucideIcon: Mic,
      title: currentLang === "hi" ? "आवाज़ सहायक (Voice Assistant)" : currentLang === "bn" ? "ভয়েস সহকারী" : "Voice Assistant",
      desc: currentLang === "hi" 
        ? "अधिक सुलभ स्वास्थ्य अनुभव के लिए आवाज़ इनपुट और आउटपुट का उपयोग करें।" 
        : currentLang === "bn" 
        ? "অ্যাক্সেসযোগ্য অভিজ্ঞতার জন্য ভয়েস ইনপুট ও আউটপুট ব্যবহার করুন।" 
        : "Use voice input and output for a more accessible healthcare experience.",
      action: onOpenVoiceAssistant,
      tag: "Speech & Audio",
      color: "bg-orange-50 text-orange-800 border-orange-200",
    },
    {
      id: "guardian",
      icon: "🛰️",
      lucideIcon: MapPin,
      title: currentLang === "hi" ? "अभिभावक अलर्ट और लाइव लोकेशन" : currentLang === "bn" ? "অভিভাবক সতর্কতা ও লাইভ লোকেশন" : "Guardian Alert & Live Location",
      desc: currentLang === "hi" 
        ? "मरीज़ के आपातकाल में सीधे अभिभावक को लाइव जीपीएस, सायरन व टेलीमेट्री के साथ त्वरित अलर्ट और 24/7 लोकेशन एक्सेस।" 
        : currentLang === "bn" 
        ? "জরুরি অবস্থায় রিয়েল-টাইম জিপিএস, সাইরেন ও সার্বক্ষণিক লোকেশন ট্র্যাক করার অভিভাবক ড্যাশবোর্ড।" 
        : "Direct patient emergency broadcast to guardians with real-time GPS telemetry, geofence, and 24/7 location access.",
      action: onOpenGuardianAlert,
      tag: "24/7 Live GPS SOS",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      id: "emergency",
      icon: "🚨",
      lucideIcon: AlertTriangle,
      title: currentLang === "hi" ? "आपातकालीन सहायता (Emergency Help)" : currentLang === "bn" ? "জরুরি সাহায্য" : "Emergency Help",
      desc: currentLang === "hi" 
        ? "कॉन्फ़िगर किए गए आपातकालीन संपर्कों और महत्वपूर्ण आपातकालीन जानकारी तक तुरंत पहुँचें।" 
        : currentLang === "bn" 
        ? "সংরক্ষিত জরুরি পরিচিতি ও জরুরি নম্বরে এক ক্লিকে যোগাযোগ করুন।" 
        : "Quickly access configured emergency contacts and important emergency information.",
      action: onOpenEmergency,
      tag: "112 / 108 SOS",
      color: "bg-red-50 text-red-800 border-red-200",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-white border-y border-[#D8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-block mb-3">
            Everything in one place
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-4">
            {t.featuresTitle}
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B60]">
            {t.featuresSubtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {features.map((item) => (
            <article
              key={item.id}
              onClick={item.action}
              className="group cursor-pointer bg-[#F4F7F4] hover:bg-white rounded-3xl p-7 border border-[#D8E2DA] hover:border-[#1F4E46]/40 shadow-sm hover:shadow-xl hover:shadow-[#1F4E46]/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-white group-hover:bg-[#EEF3EA] border border-[#D8E2DA] flex items-center justify-center text-2xl shadow-xs transition-colors">
                    {item.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.color}`}>
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#153A34] mb-2.5 group-hover:text-[#1F4E46] transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#1F4E46]" />
                </h3>

                <p className="text-sm text-[#5B6B60] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2ECE5] flex items-center justify-between text-xs font-semibold text-[#1F4E46]">
                <span>Launch tool</span>
                <span className="text-base font-bold transition-transform group-hover:translate-x-1">→</span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
