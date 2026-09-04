const fs = require('fs');

let content = fs.readFileSync('src/components/SeniorSchemesSection.tsx', 'utf8');

const newSchemes = `    ,{
      id: "esanjeevani",
      name: "eSanjeevani OPD (National Teleconsultation)",
      category: "Health & Medical",
      coverage: "Free online medical consultations",
      eligibility: "All citizens, highly beneficial for homebound senior citizens",
      benefits: "Access to specialized doctors via video call from home, free e-prescriptions.",
      howToApply: "Register on esanjeevaniopd.in or download the eSanjeevani app.",
      contact: "National Health Authority: 104",
      officialUrl: "https://esanjeevani.mohfw.gov.in",
    },
    {
      id: "vpby",
      name: "Varishtha Pension Bima Yojana (VPBY)",
      category: "Pension & Financial",
      coverage: "Income security through annuity",
      eligibility: "Senior citizens aged 60 years and above",
      benefits: "Guaranteed rate of return (historically 8-9%) for 10 years, payable monthly, quarterly, or yearly.",
      howToApply: "Administered through Life Insurance Corporation of India (LIC).",
      contact: "LIC Helpline",
      officialUrl: "https://licindia.in",
    },
    {
      id: "annapurna",
      name: "Annapurna Scheme (Food Security)",
      category: "Housing & Care",
      coverage: "Free food grains for destitute seniors",
      eligibility: "Indigent senior citizens (65+) not receiving any national old age pension",
      benefits: "10 kgs of free food grains (wheat or rice) provided every month.",
      howToApply: "Apply via local Gram Panchayat or Municipal ward office.",
      contact: "Local Panchayat / Block Office",
      officialUrl: "https://dfpd.gov.in",
    },
    {
      id: "railways",
      name: "Indian Railways Senior Quota & Facilities",
      category: "Travel & Transport",
      coverage: "Priority lower berths and wheelchair assistance",
      eligibility: "Men aged 60+, Women aged 58+",
      benefits: "Automatic lower berth allocation quota on trains. Free wheelchair and battery-operated car facilities at major stations.",
      howToApply: "Select 'Senior Citizen' option while booking tickets on IRCTC.",
      contact: "Railway Helpline: 139",
      officialUrl: "https://www.irctc.co.in",
    },
    {
      id: "sacred",
      name: "SACRED Portal (Re-Employment)",
      category: "Legal & Protection",
      coverage: "Employment opportunities for senior citizens",
      eligibility: "Senior citizens (60+) seeking employment or volunteering",
      benefits: "A platform connecting retired seniors with private enterprises, NGOs, and voluntary organizations for dignified work.",
      howToApply: "Register online on the SACRED portal.",
      contact: "Elderline: 14567",
      officialUrl: "https://sacred.dosje.gov.in",
    },
    {
      id: "adip",
      name: "ADIP Scheme (Aids & Appliances)",
      category: "Assistive Devices",
      coverage: "Financial assistance for mobility aids",
      eligibility: "Disabled seniors with monthly income below ₹22,500",
      benefits: "Free or subsidized advanced assistive devices (hearing aids, motorized tricycles, smart canes).",
      howToApply: "Apply through District Disability Rehabilitation Centres (DDRCs) or ALIMCO camps.",
      contact: "Ministry of Social Justice: 1800-180-5129",
      officialUrl: "https://disabilityaffairs.gov.in",
    },
    {
      id: "reverse_mortgage",
      name: "Reverse Mortgage Loan Scheme",
      category: "Pension & Financial",
      coverage: "Monetize property for monthly income",
      eligibility: "House owners aged 60+ (spouse 55+)",
      benefits: "Pledge residential property to a bank to receive regular tax-free monthly income while continuing to live in the house.",
      howToApply: "Approach any nationalized bank or housing finance company (e.g., SBI, LIC HFL).",
      contact: "National Housing Bank / Local Banks",
      officialUrl: "https://nhb.org.in",
    }
  ];`;

// Replace the array closing bracket
content = content.replace(/\s*\];\s*useEffect\(\(\) => \{/g, newSchemes + '\n\n  useEffect(() => {');

fs.writeFileSync('src/components/SeniorSchemesSection.tsx', content);
console.log("Added more schemes successfully");
