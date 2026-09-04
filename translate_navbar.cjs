const fs = require('fs');

const replacements = {
  "Care &amp; Vitals": { hi: "देखभाल और रिकॉर्ड", bn: "যত্ন ও রেকর্ড" },
  "Brain Games": { hi: "दिमागी खेल", bn: "ব্রেইন গেমস" },
  "Nearby Care": { hi: "निकटवर्ती सेवाएं", bn: "কাছাকাছি পরিষেবা" },
  "Guardian GPS": { hi: "गार्जियन जीपीएस", bn: "গার্ডিয়ান জিপিএস" },
  "SOS": { hi: "एसओएस", bn: "এসওএস" },
  "👤 Profile": { hi: "👤 प्रोफ़ाइल", bn: "👤 প্রোফাইল" },
  "Admin": { hi: "एडमिन", bn: "অ্যাডমিন" },
  "Smart Health &amp; Medication Alerts": { hi: "स्मार्ट स्वास्थ्य और दवा अलर्ट", bn: "স্মার্ট স্বাস্থ্য এবং ঔষধ অ্যালার্ট" },
  "1. Weekly Health Checkup": { hi: "1. साप्ताहिक स्वास्थ्य जांच", bn: "১. সাপ্তাহিক স্বাস্থ্য পরীক্ষা" },
  "2. Care &amp; Health Records": { hi: "2. देखभाल और स्वास्थ्य रिकॉर्ड", bn: "২. যত্ন এবং স্বাস্থ্য রেকর্ড" },
  "3. Brain Games &amp; Daily Activity": { hi: "3. दिमागी खेल और दैनिक गतिविधि", bn: "৩. ব্রেইন গেম এবং দৈনন্দিন কাজ" },
  "Recommended Books": { hi: "अनुशंसित किताबें", bn: "প্রস্তাবিত বই" },
  "4. Nearby Doctors &amp; Chemists": { hi: "4. निकटवर्ती डॉक्टर और केमिस्ट", bn: "৪. কাছাকাছি ডাক্তার ও রসায়নবিদ" },
  "5. Government Welfare Schemes": { hi: "5. सरकारी कल्याणकारी योजनाएं", bn: "৫. সরকারি কল্যাণ প্রকল্প" },
  "Guardian Alert &amp; Live Location": { hi: "गार्जियन अलर्ट और लाइव लोकेशन", bn: "গার্ডিয়ান অ্যালার্ট এবং লাইভ লোকেশন" },
  "Emergency Help \\(SOS\\)": { hi: "आपातकालीन मदद (SOS)", bn: "জরুরী সাহায্য (SOS)" },
  "👤 Senior Profile &amp; Caretaker Settings": { hi: "👤 वरिष्ठ प्रोफ़ाइल और केयरटेकर सेटिंग्स", bn: "👤 সিনিয়র প্রোফাইল এবং কেয়ারটেকার সেটিংস" },
  "Admin Dashboard": { hi: "एडमिन डैशबोर्ड", bn: "অ্যাডমিন ড্যাশবোর্ড" },
  "Log Out": { hi: "लॉग आउट", bn: "লগ আউট" }
};

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
for (const [eng, trans] of Object.entries(replacements)) {
  const regex = new RegExp(`>\\s*${eng}\\s*<`, 'g');
  const cleanEng = eng.replace(/\\/g, '').replace(/&amp;/g, '&');
  content = content.replace(regex, `>{currentLang === 'hi' ? '${trans.hi}' : currentLang === 'bn' ? '${trans.bn}' : '${cleanEng}'}<`);
}
fs.writeFileSync('src/components/Navbar.tsx', content);
console.log("Navbar fully patched");
