const fs = require('fs');

function patchFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [eng, translation] of Object.entries(replacements)) {
    // If it's a simple text replacement inside tags:
    const regex = new RegExp(`>\\s*${eng}\\s*<`, 'g');
    content = content.replace(regex, `>{currentLang === 'hi' ? '${translation.hi}' : currentLang === 'bn' ? '${translation.bn}' : '${eng}'}<`);
    
    // Also handle cases without tags if needed, but let's stick to tags to be safe
  }
  fs.writeFileSync(file, content);
}

const navbarStrings = {
  "Smart Alerts": { hi: "स्मार्ट अलर्ट", bn: "স্মার্ট অ্যালার্ট" },
  "Weekly Checkup": { hi: "साप्ताहिक जांच", bn: "সাপ্তাহিক চেকআপ" },
  "Nearby Directory": { hi: "निकटवर्ती डायरेक्टरी", bn: "কাছাকাছি ডিরেক্টরি" },
  "Games": { hi: "खेल", bn: "গেমস" },
  "Books": { hi: "किताबें", bn: "বই" },
  "Govt Schemes": { hi: "सरकारी योजनाएं", bn: "সরকারি প্রকল্প" },
  "Guardian Alert": { hi: "गार्जियन अलर्ट", bn: "অভিভাবক অ্যালার্ট" },
  "Trust & Privacy": { hi: "विश्वास और गोपनीयता", bn: "বিশ্বাস এবং গোপনীয়তা" },
  "Emergency SOS": { hi: "आपातकालीन SOS", bn: "জরুরী SOS" },
  "Sign In": { hi: "साइन इन करें", bn: "লগ ইন" },
  "Sign Out": { hi: "साइन आउट", bn: "লগ আউট" },
  "Settings": { hi: "सेटिंग्स", bn: "সেটিংস" }
};

patchFile('src/components/Navbar.tsx', navbarStrings);
console.log("Navbar patched");

