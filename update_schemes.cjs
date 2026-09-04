const fs = require('fs');

let content = fs.readFileSync('src/components/SeniorSchemesSection.tsx', 'utf8');

const newSchemes = `const ALL_SCHEMES: SchemeInfo[] = [
    {
      id: "pmjay",
      name: "Ayushman Bharat PM-JAY (Senior 70+)",
      category: "Health & Medical",
      coverage: "Up to ₹5 Lakh/year cashless hospitalization",
      eligibility: "All senior citizens aged 70 years and above irrespective of income",
      benefits: "Secondary and tertiary healthcare coverage across 29,000+ empanelled private and public hospitals with dedicated Ayushman Vay Vandana card.",
      howToApply: "Register at beneficiary.nha.gov.in with Aadhaar e-KYC or visit nearest Ayushman Arogya Mandir / CSC center.",
      contact: "National Toll-Free: 14555",
      officialUrl: "https://pmjay.gov.in",
    },
    {
      id: "cghs",
      name: "Central Government Health Scheme (CGHS)",
      category: "Health & Medical",
      coverage: "Comprehensive OPD, IPD, and medicine dispensary",
      eligibility: "Retired central government pensioners and dependent spouses",
      benefits: "Full reimbursement of hospital bills, diagnostic tests, wellness centers, and lifetime pension health cards.",
      howToApply: "Apply online at cghs.nic.in with PPO number and retirement certificate.",
      contact: "CGHS Helpline: 1800-208-8900",
      officialUrl: "https://cghs.nic.in",
    },
    {
      id: "nphce",
      name: "National Programme for Health Care of Elderly (NPHCE)",
      category: "Health & Medical",
      coverage: "Dedicated geriatric healthcare facilities",
      eligibility: "All elderly people visiting government healthcare facilities",
      benefits: "Dedicated geriatric wards, OPDs, and physiotherapy units at district hospitals and primary health centres.",
      howToApply: "Visit your nearest Government District Hospital or PHC.",
      contact: "State Health Dept Helplines (104)",
      officialUrl: "https://main.mohfw.gov.in",
    },
    {
      id: "ignoaps",
      name: "Indira Gandhi National Old Age Pension (IGNOAPS)",
      category: "Pension & Financial",
      coverage: "Monthly direct bank transfer pension",
      eligibility: "BPL senior citizens aged 60+ (₹200-₹500/month basic + state top-ups)",
      benefits: "Unconditional monthly financial allowance deposited directly into DBT bank/post office account.",
      howToApply: "Apply via Gram Panchayat, Block Development Office (BDO), or NSAP online portal.",
      contact: "NSAP Portal Helpdesk",
      officialUrl: "https://nsap.nic.in",
    },
    {
      id: "pmvvy",
      name: "Pradhan Mantri Vaya Vandana Yojana (PMVVY)",
      category: "Pension & Financial",
      coverage: "Assured pension with guaranteed returns",
      eligibility: "Senior Citizens aged 60 years and above",
      benefits: "Assured return of 7.4% p.a. payable monthly. Max investment up to ₹15 Lakh for a term of 10 years.",
      howToApply: "Purchase through Life Insurance Corporation of India (LIC) online or offline.",
      contact: "LIC Call Center: 022-68276827",
      officialUrl: "https://licindia.in",
    },
    {
      id: "scss",
      name: "Senior Citizens Savings Scheme (SCSS)",
      category: "Pension & Financial",
      coverage: "High-yield, safe savings plan",
      eligibility: "Individuals aged 60+ (or 55+ for retirees under VRS/Superannuation)",
      benefits: "Attractive interest rate (approx 8.2% p.a.), quarterly interest payout, and tax benefits under Section 80C. Max investment ₹30 Lakh.",
      howToApply: "Open an account at any Post Office or authorized scheduled commercial bank.",
      contact: "India Post Helpline: 1800-266-6868",
      officialUrl: "https://www.indiapost.gov.in",
    },
    {
      id: "benefits",
      name: "Income Tax Benefits (Section 80TTB)",
      category: "Pension & Financial",
      coverage: "₹50,000 interest deduction & Higher FD Rates",
      eligibility: "All resident Indian senior citizens aged 60 and above",
      benefits: "Higher Fixed Deposit interest rates (+0.50%), ₹50,000 deduction on bank interest under 80TTB.",
      howToApply: "Submit Form 15H at banks to avoid TDS deduction.",
      contact: "Income Tax Helpline: 1800-180-1961",
      officialUrl: "https://incometax.gov.in",
    },
    {
      id: "transport",
      name: "Air India & State Transport Concessions",
      category: "Travel & Transport",
      coverage: "Discounted air and bus fares",
      eligibility: "Senior citizens aged 60+ (varies by state/airline)",
      benefits: "Up to 50% discount on basic fare for Air India domestic flights and discounted state transport bus tickets.",
      howToApply: "Select Senior Citizen concession during booking and carry valid age proof (Aadhaar/Voter ID).",
      contact: "Air India / State Transport Office",
      officialUrl: "https://www.airindia.com",
    },
    {
      id: "ipsrc",
      name: "Integrated Programme for Senior Citizens (IPSrC)",
      category: "Housing & Care",
      coverage: "Support for Old Age Homes",
      eligibility: "Indigent senior citizens with no family support",
      benefits: "Provides food, shelter, healthcare, and entertainment in government-assisted old age homes and continuous care homes.",
      howToApply: "Contact District Social Welfare Officer or NGOs running the supported homes.",
      contact: "Social Justice Dept Helpline",
      officialUrl: "https://socialjustice.gov.in",
    },
    {
      id: "mwpsc",
      name: "Maintenance & Welfare of Parents Act, 2007",
      category: "Legal & Protection",
      coverage: "Legal right to claim maintenance from children",
      eligibility: "Parents and senior citizens unable to maintain themselves",
      benefits: "Legal mechanism to mandate adult children or heirs to provide a monthly maintenance amount (up to ₹10,000) for a dignified life.",
      howToApply: "File an application before the Maintenance Tribunal presided by the Sub-Divisional Magistrate (SDM).",
      contact: "National Elderline: 14567",
      officialUrl: "https://socialjustice.gov.in",
    },
    {
      id: "rvy",
      name: "Rashtriya Vayoshri Yojana (RVY Assistive Devices)",
      category: "Assistive Devices",
      coverage: "Free assisted-living devices & mobility aids",
      eligibility: "Senior citizens (60+) suffering from age-related locomotor/sensory disabilities",
      benefits: "Free branded wheelchairs, walking sticks with LED light, elbow crutches, digital hearing aids, walkers, and spectacles.",
      howToApply: "Register at ALIMCO assessment camps or through District Social Welfare Officer.",
      contact: "ALIMCO Toll-Free: 1800-180-5129",
      officialUrl: "https://alimco.in",
    }
  ];

  useEffect(() => {
    // For simplicity, just set all schemes directly since there's no real backend for this demo.
    setSchemes(ALL_SCHEMES);
  }, []);

  const categories = [
    "All",
    "Health & Medical",
    "Pension & Financial",
    "Housing & Care",
    "Travel & Transport",
    "Legal & Protection",
    "Assistive Devices",
  ];
`;

content = content.replace(/const ALL_SCHEMES: SchemeInfo\[\] = \[[\s\S]*?\];\n/g, newSchemes);

fs.writeFileSync('src/components/SeniorSchemesSection.tsx', content);

console.log("Updated sub-sections successfully");
