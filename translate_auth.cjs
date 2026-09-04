const fs = require('fs');

let content = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

if (!content.includes('currentLang: Language;')) {
  content = content.replace('interface AuthScreenProps {', 'import { Language } from "../types";\ninterface AuthScreenProps {\n  currentLang: Language;');
  content = content.replace('export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {', 'export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, currentLang }) => {');
}

const replacements = {
  "Testing connection...": { hi: "कनेक्शन की जांच हो रही है...", bn: "সংযোগ পরীক্ষা করা হচ্ছে..." },
  "Supabase credentials missing. Please check AI Studio Settings.": { hi: "सुपाबेस क्रेडेंशियल गायब हैं।", bn: "সুপাবেস শংসাপত্র অনুপস্থিত।" },
  "Supabase connected successfully": { hi: "सुपाबेस सफलतापूर्वक कनेक्ट हो गया", bn: "সুপাবেস সফলভাবে সংযুক্ত হয়েছে" },
  "Failed to connect to Supabase": { hi: "सुपाबेस से कनेक्ट करने में विफल", bn: "সুপাবেসের সাথে সংযোগ করতে ব্যর্থ" },
  "Apna Mitra": { hi: "अपना मित्र", bn: "আপন মিত্র" },
  "Your Health & Guardian Dashboard": { hi: "आपका स्वास्थ्य और गार्जियन डैशबोर्ड", bn: "আপনার স্বাস্থ্য এবং অভিভাবক ড্যাশবোর্ড" },
  "Admin Portal": { hi: "एडमिन पोर्टल", bn: "অ্যাডমিন পোর্টাল" },
  "Patient Portal": { hi: "रोगी पोर्टल", bn: "রোগীর পোর্টাল" },
  "Switch to": { hi: "स्विच करें", bn: "এতে স্যুইच করুন" },
  "Sign in to": { hi: "में साइन इन करें", bn: "লগ ইন করুন" },
  "Create an account": { hi: "खाता बनाएं", bn: "অ্যাকাউন্ট তৈরি করুন" },
  "Email Address": { hi: "ईमेल पता", bn: "ইমেইল ঠিকানা" },
  "Password": { hi: "पासवर्ड", bn: "পাসওয়ার্ড" },
  "Full Name": { hi: "पूरा नाम", bn: "পুরো নাম" },
  "Confirm Password": { hi: "पासवर्ड की पुष्टि करें", bn: "পাসওয়ার্ড নিশ্চিত করুন" },
  "Reset Password": { hi: "पासवर्ड रीसेट करें", bn: "পাসওয়ার্ড রিসেট করুন" },
  "Send Reset Link": { hi: "रीसेट लिंक भेजें", bn: "রিসেট লিঙ্ক পাঠান" },
  "Password reset email sent! Please check your inbox.": { hi: "पासवर्ड रीसेट ईमेल भेजा गया! कृपया अपना इनबॉक्स जांचें।", bn: "পাসওয়ার্ড রিসেট ইমেল পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন." },
  "Remembered your password?": { hi: "अपना पासवर्ड याद है?", bn: "আপনার পাসওয়ার্ড মনে আছে?" },
  "Sign in here": { hi: "यहाँ साइन इन करें", bn: "এখানে সাইন ইন করুন" },
  "By proceeding, you agree to our strict Medical Privacy Policy and Guardian Terms of Service.": { hi: "आगे बढ़कर, आप हमारी सख्त चिकित्सा गोपनीयता नीति और गार्जियन सेवा की शर्तों से सहमत होते हैं।", bn: "এগিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের কঠোর চিকিৎসা গোপনীয়তা নীতি এবং অভিভাবক পরিষেবার শর্তাবলীতে সম্মত হন।" },
  "Sign In": { hi: "साइन इन करें", bn: "লগ ইন" },
  "Create Account": { hi: "खाता बनाएं", bn: "অ্যাকাউন্ট তৈরি করুন" },
  "Don't have an account?": { hi: "खाता नहीं है?", bn: "অ্যাকাউন্ট নেই?" },
  "Sign up": { hi: "साइन अप करें", bn: "সাইন আপ করুন" },
  "Already have an account?": { hi: "पहले से खाता है?", bn: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?" }
};

for (const [eng, trans] of Object.entries(replacements)) {
  // Replace simple strings in tags
  let regex = new RegExp(`>\\s*${eng.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}\\s*<`, 'g');
  content = content.replace(regex, `>{currentLang === 'hi' ? '${trans.hi}' : currentLang === 'bn' ? '${trans.bn}' : '${eng}'}<`);
  
  // Replace in single quotes
  regex = new RegExp(`'${eng.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}'`, 'g');
  content = content.replace(regex, `(currentLang === 'hi' ? '${trans.hi}' : currentLang === 'bn' ? '${trans.bn}' : '${eng}')`);
  
  // Replace in double quotes (watch out for attributes!)
  regex = new RegExp(`"${eng.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}"`, 'g');
  content = content.replace(regex, `(currentLang === 'hi' ? '${trans.hi}' : currentLang === 'bn' ? '${trans.bn}' : '${eng}')`);
}

// Fix JSX attribute issues where we replaced string literals but they were unbracketed props like placeholder="Email Address"
content = content.replace(/placeholder=\(currentLang/g, "placeholder={currentLang");
content = content.replace(/'\)\s+\/>/g, "'} />");
content = content.replace(/"\)\s+\/>/g, '"} />');

fs.writeFileSync('src/components/AuthScreen.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  /<AuthScreen\s+onSuccess=\{[^\}]+\}\s*\/>/g,
  (match) => {
    if (match.includes('currentLang=')) return match;
    return match.replace('/>', ' currentLang={currentLang} />');
  }
);
fs.writeFileSync('src/App.tsx', appContent);

console.log("AuthScreen patched");
