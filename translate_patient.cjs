const fs = require('fs');

const replacements = {
  "AI Health Checker": { hi: "AI स्वास्थ्य जांचकर्ता", bn: "এআই স্বাস্থ্য পরীক্ষক" },
  "Analyze your symptoms": { hi: "अपने लक्षणों का विश्लेषण करें", bn: "আপনার লক্ষণ বিশ্লেষণ করুন" },
  "Blood Group": { hi: "रक्त समूह", bn: "রক্তের গ্রুপ" },
  "Book an Appointment": { hi: "अपॉइंटमेंट बुक करें", bn: "একটি অ্যাপয়েন্টমেন্ট বুক করুন" },
  "Email": { hi: "ईमेल", bn: "ইমেইল" },
  "Emergency SOS": { hi: "आपातकालीन SOS", bn: "জরুরী এসওএস" },
  "Find a Doctor": { hi: "डॉक्टर खोजें", bn: "ডাক্তার খুঁজুন" },
  "Health History & Checks": { hi: "स्वास्थ्य इतिहास और जांच", bn: "স্বাস্থ্য ইতিহাস এবং চেক" },
  "Here is your health overview for today.": { hi: "यहाँ आज के लिए आपका स्वास्थ्य अवलोकन है।", bn: "আজকের জন্য আপনার স্বাস্থ্যের ওভারভিউ এখানে।" },
  "Loading your health dashboard...": { hi: "आपका स्वास्थ्य डैशबोर्ड लोड हो रहा है...", bn: "আপনার স্বাস্থ্য ড্যাশবোর্ড লোড হচ্ছে..." },
  "Log Out": { hi: "लॉग आउट", bn: "লগ আউট" },
  "Manage your personal health data": { hi: "अपना व्यक्तिगत स्वास्थ्य डेटा प्रबंधित करें", bn: "আপনার ব্যক্তিগত স্বাস্থ্য ডেটা পরিচালনা করুন" },
  "No health checks recorded yet.": { hi: "अभी तक कोई स्वास्थ्य जांच दर्ज नहीं की गई है।", bn: "এখনও কোন স্বাস্থ্য পরীক্ষা রেকর্ড করা হয়নি।" },
  "No previous appointments found.": { hi: "कोई पिछला अपॉइंटमेंट नहीं मिला।", bn: "আগের কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।" },
  "No upcoming appointments": { hi: "कोई आगामी अपॉइंटमेंट नहीं", bn: "আসন্ন কোনো অ্যাপয়েন্টমেন্ট নেই" },
  "Patient Profile": { hi: "रोगी प्रोफ़ाइल", bn: "রোগীর প্রোফাইল" },
  "Phone": { hi: "फ़ोन", bn: "ফোন" },
  "Previous Appointments": { hi: "पिछले अपॉइंटमेंट", bn: "আগের অ্যাপয়েন্টমেন্ট" },
  "Role": { hi: "भूमिका", bn: "ভূমিকা" },
  "Upcoming Appointments": { hi: "आगामी अपॉइंटमेंट", bn: "আসন্ন অ্যাপয়েন্টমেন্ট" },
  "Your scheduled consultations": { hi: "आपके निर्धारित परामर्श", bn: "আপনার নির্ধারিত পরামর্শ" }
};

let content = fs.readFileSync('src/components/PatientDashboardView.tsx', 'utf8');

// Also inject currentLang into props
if (!content.includes('currentLang: Language;')) {
  content = content.replace('interface PatientDashboardProps {', 'import { Language } from "../types";\ninterface PatientDashboardProps {\n  currentLang: Language;');
  content = content.replace('export const PatientDashboardView: React.FC<PatientDashboardProps> = ({ user, onLogout, onOpenSymptomChecker }) => {', 'export const PatientDashboardView: React.FC<PatientDashboardProps> = ({ user, onLogout, onOpenSymptomChecker, currentLang }) => {');
}

for (const [eng, trans] of Object.entries(replacements)) {
  const regex = new RegExp(`>\\s*${eng.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}\\s*<`, 'g');
  content = content.replace(regex, `>{currentLang === 'hi' ? '${trans.hi}' : currentLang === 'bn' ? '${trans.bn}' : '${eng}'}<`);
}

// Handle some partials or specific formats
content = content.replace(/>\s*ID: \{appt\.id\?\.slice\(0, 8\)\.toUpperCase\(\)\}\s*</g, `>{currentLang === 'hi' ? 'आईडी:' : currentLang === 'bn' ? 'আইডি:' : 'ID:'} {appt.id?.slice(0, 8).toUpperCase()}<`);
content = content.replace(/'Doctor Appointment'/g, `currentLang === 'hi' ? 'डॉक्टर अपॉइंटमेंट' : currentLang === 'bn' ? 'ডাক্তার অ্যাপয়েন্টমেন্ট' : 'Doctor Appointment'`);
content = content.replace(/'Clinic'/g, `currentLang === 'hi' ? 'क्लिनिक' : currentLang === 'bn' ? 'ক্লিনিক' : 'Clinic'`);
content = content.replace(/'General Assessment'/g, `currentLang === 'hi' ? 'सामान्य मूल्यांकन' : currentLang === 'bn' ? 'সাধারণ মূল্যায়ন' : 'General Assessment'`);
content = content.replace(/'General'/g, `currentLang === 'hi' ? 'सामान्य' : currentLang === 'bn' ? 'সাধারণ' : 'General'`);
content = content.replace(/'Completed'/g, `currentLang === 'hi' ? 'पूरा हुआ' : currentLang === 'bn' ? 'সম্পন্ন' : 'Completed'`);

fs.writeFileSync('src/components/PatientDashboardView.tsx', content);
console.log("PatientDashboardView fully patched");
