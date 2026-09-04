import { Language } from "../types";

export interface Translations {
  appName: string;
  tagline: string;
  heroHeading1: string;
  heroHeading2: string;
  heroSubtitle: string;
  talkToMitra: string;
  exploreFeatures: string;
  onlineReady: string;
  startConversation: string;
  featuresTitle: string;
  featuresSubtitle: string;
  healthDashboardTitle: string;
  healthDashboardSubtitle: string;
  mitraAiSectionTitle: string;
  mitraAiSectionSubtitle: string;
  askPlaceholder: string;
  askButton: string;
  disclaimerShort: string;
  emergencyTitle: string;
  emergencyDesc: string;
  getEmergencyHelp: string;
  privacyTitle: string;
  privacySubtitle: string;
  dailyCheckinTitle: string;
  howAreYouFeeling: string;
  saveCheckin: string;
  streakCount: string;
  daysLabel: string;
  streakSub: string;
  seniorSchemesTitle: string;
  seniorSchemesSubtitle: string;
  prepDoctorVisit: string;
  sampleReportAnalysis: string;
  guardianSectionTitle: string;
  guardianSectionSubtitle: string;
  guardianEmergencySos: string;
  guardianLiveLocation: string;
  guardianAlwaysAccess: string;
  guardianSafeZoneText: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Apna Mitra",
    tagline: "Your AI Health Companion",
    heroHeading1: "Your health,",
    heroHeading2: "your Mitra.",
    heroSubtitle: "Apna Mitra is your AI health companion for understanding health information, organizing medical records, tracking health, managing reminders, and preparing for doctor visits.",
    talkToMitra: "Talk to Mitra AI",
    exploreFeatures: "Explore Features",
    onlineReady: "Ready to help",
    startConversation: "Start Conversation",
    featuresTitle: "Healthcare made simpler",
    featuresSubtitle: "Useful tools designed to help you understand, track, and organize your health information.",
    healthDashboardTitle: "Your health at a glance",
    healthDashboardSubtitle: "Keep your important health measurements organized in one dashboard.",
    mitraAiSectionTitle: "A smarter way to understand your health.",
    mitraAiSectionSubtitle: "Mitra AI helps turn complicated health information into simple, understandable guidance while encouraging professional medical care when appropriate.",
    askPlaceholder: "Type your health question here (e.g., 'What should I ask my doctor about high blood pressure?')...",
    askButton: "Ask Mitra AI",
    disclaimerShort: "Apna Mitra provides general health information and does not replace professional medical advice.",
    emergencyTitle: "Emergency Help",
    emergencyDesc: "If you are experiencing a serious or life-threatening medical emergency, do not wait for an AI response. Seek immediate professional emergency medical assistance.",
    getEmergencyHelp: "Get Emergency Help",
    privacyTitle: "Your health information matters.",
    privacySubtitle: "Apna Mitra is built around privacy, security, transparency, and user-controlled data sharing.",
    dailyCheckinTitle: "Wellbeing Check-in",
    howAreYouFeeling: "How are you feeling today?",
    saveCheckin: "Save Today's Check-in",
    streakCount: "Days",
    daysLabel: "days",
    streakSub: "of check-ins this week",
    seniorSchemesTitle: "Senior Citizen Welfare & Government Schemes",
    seniorSchemesSubtitle: "Explore subsidized healthcare, pension, and assistive device support for elders in India.",
    prepDoctorVisit: "Prepare for Doctor Visit",
    sampleReportAnalysis: "Analyze Lab Report",
    guardianSectionTitle: "Guardian Alert & 24/7 Live Location",
    guardianSectionSubtitle: "Direct emergency SOS broadcast to family caregivers with real-time GPS location access, safe-zone geofencing, and battery telemetry.",
    guardianEmergencySos: "Instant Guardian Emergency SOS",
    guardianLiveLocation: "Live Elder GPS Location Tracking",
    guardianAlwaysAccess: "Always-On Guardian Location Access",
    guardianSafeZoneText: "Inside Safe Home Geofence",
  },
  hi: {
    appName: "अपना मित्र (Apna Mitra)",
    tagline: "आपका AI स्वास्थ्य साथी",
    heroHeading1: "आपका स्वास्थ्य,",
    heroHeading2: "आपका मित्र।",
    heroSubtitle: "अपना मित्र (Apna Mitra) आपका AI स्वास्थ्य साथी है — जो स्वास्थ्य रिपोर्ट समझने, वाइटल्स ट्रैक करने, दवा याद रखने और डॉक्टर से मिलने की तैयारी में मदद करता है।",
    talkToMitra: "मित्र AI से बात करें",
    exploreFeatures: "सुविधाएँ देखें",
    onlineReady: "मदद के लिए तैयार",
    startConversation: "बातचीत शुरू करें",
    featuresTitle: "स्वास्थ्य सेवा हुई आसान",
    featuresSubtitle: "आपकी सेहत को समझने, ट्रैक करने और व्यवस्थित रखने के लिए विशेष साधन।",
    healthDashboardTitle: "आपकी सेहत एक नज़र में",
    healthDashboardSubtitle: "अपने ब्लड प्रेशर, पल्स, शुगर और वजन का पूरा हिसाब रखें।",
    mitraAiSectionTitle: "सेहत को समझने का सरल और सुरक्षित तरीका",
    mitraAiSectionSubtitle: "मित्र AI जटिल मेडिकल रिपोर्ट और लक्षणों को सरल भाषा में समझाता है और डॉक्टर से पूछने योग्य सवाल तैयार करता है।",
    askPlaceholder: "अपना स्वास्थ्य संबंधी सवाल यहाँ लिखें (उदा. 'ब्लड प्रेशर 130/85 है, क्या सावधानी रखूँ?')...",
    askButton: "मित्र AI से पूछें",
    disclaimerShort: "अपना मित्र केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है और डॉक्टर के परामर्श का विकल्प नहीं है।",
    emergencyTitle: "आपातकालीन सहायता (SOS)",
    emergencyDesc: "यदि आपको सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ या अन्य गंभीर समस्या है, तो तुरंत 112 या 108 पर कॉल करें।",
    getEmergencyHelp: "आपातकालीन मदद प्राप्त करें (112 / 108)",
    privacyTitle: "आपकी स्वास्थ्य जानकारी सुरक्षित है",
    privacySubtitle: "गोपनीयता, सुरक्षा और उपयोगकर्ता नियंत्रण हमारी सर्वोच्च प्राथमिकता है।",
    dailyCheckinTitle: "दैनिक स्वास्थ्य जाँच (Check-in)",
    howAreYouFeeling: "आज आपका स्वास्थ्य और मन कैसा है?",
    saveCheckin: "आज का चेक-इन सहेजें",
    streakCount: "दिन",
    daysLabel: "दिन",
    streakSub: "इस सप्ताह के चेक-इन",
    seniorSchemesTitle: "वरिष्ठ नागरिक सरकारी योजनाएँ",
    seniorSchemesSubtitle: "आयुष्मान भारत 70+ मुफ्त ₹5 लाख बीमा, पेंशन और राष्ट्रीय वयोश्री योजना की जानकारी।",
    prepDoctorVisit: "डॉक्टर विजिट की तैयारी करें",
    sampleReportAnalysis: "मेडिकल रिपोर्ट का विश्लेषण करें",
    guardianSectionTitle: "अभिभावक अलर्ट और 24/7 लाइव लोकेशन (Guardian Alert)",
    guardianSectionSubtitle: "आपातकाल में परिजनों को तुरंत SOS अलर्ट, लाइव GPS लोकेशन ट्रैकिंग, सेफ-ज़ोन और टेलीमेट्री।",
    guardianEmergencySos: "अभिभावक आपातकालीन SOS अलर्ट",
    guardianLiveLocation: "लाइव GPS लोकेशन ट्रैकिंग",
    guardianAlwaysAccess: "अभिभावक के लिए हमेशा सुलभ लोकेशन",
    guardianSafeZoneText: "सुरक्षित होम ज़ोन के भीतर",
  },
  bn: {
    appName: "আপন মিত্র (Apna Mitra)",
    tagline: "আপনার AI স্বাস্থ্য সঙ্গী",
    heroHeading1: "আপনার স্বাস্থ্য,",
    heroHeading2: "আপনার মিত্র।",
    heroSubtitle: "আপন মিত্র আপনার AI স্বাস্থ্য সঙ্গী — রিপোর্ট বুঝতে, শারীরিক মাপ ট্র্যাক করতে, ওষুধের সময় মনে রাখতে এবং ডাক্তারের কাছে যাওয়ার প্রস্তুতি নিতে সাহায্য করে।",
    talkToMitra: "মিত্র AI-এর সাথে কথা বলুন",
    exploreFeatures: "বৈশিষ্ট্যগুলি দেখুন",
    onlineReady: "সাহায্যের জন্য প্রস্তুত",
    startConversation: "কথোপকথন শুরু করুন",
    featuresTitle: "স্বাস্থ্যসেবা আরও সহজ",
    featuresSubtitle: "আপনার স্বাস্থ্য সম্পর্কিত তথ্য বুঝতে এবং ট্র্যাক করতে সাহায্য করার জন্য প্রয়োজনীয় টুলস।",
    healthDashboardTitle: "এক নজরে আপনার স্বাস্থ্য",
    healthDashboardSubtitle: "ব্লাড প্রেশার, সুগার ও হার্ট রেটের মতো গুরুত্বপূর্ণ পরিমাপ এক জায়গায় রাখুন।",
    mitraAiSectionTitle: "স্বাস্থ্য বোঝার আরও স্মার্ট উপায়",
    mitraAiSectionSubtitle: "মিত্র AI জটিল মেডিকেল পরিভাষা সহজ ভাষায় ব্যাখ্যা করে এবং ডাক্তারের জন্য উপযুক্ত প্রশ্ন তৈরি করে।",
    askPlaceholder: "আপনার স্বাস্থ্য সংক্রান্ত প্রশ্ন এখানে লিখুন...",
    askButton: "মিত্র AI কে জিজ্ঞাসা করুন",
    disclaimerShort: "আপন মিত্র শুধুমাত্র সাধারণ স্বাস্থ্য নির্দেশিকা প্রদান করে এবং ডাক্তারের বিকল্প নয়।",
    emergencyTitle: "জরুরি সাহায্য",
    emergencyDesc: "মারাত্মক বা জীবনঘাতী জরুরি পরিস্থিতিতে অবিলম্বে অ্যাম্বুলেন্স বা হাসপাতালে যোগাযোগ করুন (১১২ / ১০৮)।",
    getEmergencyHelp: "জরুরি সহায়তা পান",
    privacyTitle: "আপনার তথ্যের গোপনীয়তা",
    privacySubtitle: "নিরাপত্তা ও ব্যবহারকারীর সম্পূর্ণ নিয়ন্ত্রণে স্বাস্থ্য ডেটা সংরক্ষিত থাকে।",
    dailyCheckinTitle: "দৈনিক সুস্থতা চেক-ইন",
    howAreYouFeeling: "আজ আপনার কেমন লাগছে?",
    saveCheckin: "আজকের চেক-ইন সেভ করুন",
    streakCount: "দিন",
    daysLabel: "দিন",
    streakSub: "এই সপ্তাহের চেক-ইন",
    seniorSchemesTitle: "প্রবীণ নাগরিকদের সরকারি প্রকল্প",
    seniorSchemesSubtitle: "আয়ুষ্মান ভারত ৭০+ স্বাস্থ্য কার্ড, পেনশন ও প্রবীণ সহায়তার সরকারি তথ্য।",
    prepDoctorVisit: "ডাক্তার দেখানোর প্রস্তুতি",
    sampleReportAnalysis: "ল্যাব রিপোর্ট বিশ্লেষণ",
    guardianSectionTitle: "অভিভাবক সতর্কতা ও লাইভ লোকেশন (Guardian Alert)",
    guardianSectionSubtitle: "জরুরি অবস্থায় পরিবারের কাছে তাৎক্ষণিক SOS নোটিফিকেশন ও ২৪/৭ লাইভ জিপিএস লোকেশন।",
    guardianEmergencySos: "অভিভাবক জরুরি এসওএস সতর্কতা",
    guardianLiveLocation: "লাইভ জিপিএস লোকেশন ট্র্যাকিং",
    guardianAlwaysAccess: "অভিভাবকের জন্য সার্বক্ষণিক লোকেশন অ্যাক্সেস",
    guardianSafeZoneText: "নিরাপদ হোম জোনের ভিতরে",
  },
};
