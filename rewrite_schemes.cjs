const fs = require('fs');

let content = fs.readFileSync('src/components/SeniorSchemesSection.tsx', 'utf8');

const replacement = `const ALL_SCHEMES: SchemeInfo[] = [
    {
      id: "pmjay",
      name: "Ayushman Bharat PM-JAY (Senior 70+)",
      category: "Health Schemes",
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
      category: "Health Schemes",
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
      category: "Health Schemes",
      coverage: "Dedicated geriatric healthcare facilities",
      eligibility: "All elderly people visiting government healthcare facilities",
      benefits: "Dedicated geriatric wards, OPDs, and physiotherapy units at district hospitals and primary health centres.",
      howToApply: "Visit your nearest Government District Hospital or PHC.",
      contact: "State Health Dept Helplines (104)",
      officialUrl: "https://main.mohfw.gov.in/major-programmes/other-national-health-programmes/national-programme-health-care-elderly-nphce",
    },
    {
      id: "ignoaps",
      name: "Indira Gandhi National Old Age Pension (IGNOAPS)",
      category: "Pension Schemes",
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
      category: "Pension Schemes",
      coverage: "Assured pension with guaranteed returns",
      eligibility: "Senior Citizens aged 60 years and above",
      benefits: "Assured return of 7.4% p.a. payable monthly. Max investment up to ₹15 Lakh for a term of 10 years.",
      howToApply: "Purchase through Life Insurance Corporation of India (LIC) online or offline.",
      contact: "LIC Call Center: 022-68276827",
      officialUrl: "https://licindia.in",
    },
    {
      id: "apy",
      name: "Atal Pension Yojana (APY)",
      category: "Pension Schemes",
      coverage: "Guaranteed monthly pension of ₹1,000 to ₹5,000",
      eligibility: "Indian citizens enrolled prior to age 40, maturing after age 60",
      benefits: "Government co-contribution and lifelong monthly fixed pension with spouse nominee security.",
      howToApply: "Visit bank branch or apply through net-banking portal.",
      contact: "PFRDA Toll-Free: 1800-110-069",
      officialUrl: "https://npscra.nsdl.co.in",
    },
    {
      id: "rvy",
      name: "Rashtriya Vayoshri Yojana (RVY Assistive Devices)",
      category: "Others (Welfare & Support)",
      coverage: "Free assisted-living devices & mobility aids",
      eligibility: "Senior citizens (60+) suffering from age-related locomotor/sensory disabilities",
      benefits: "Free branded wheelchairs, walking sticks with LED light, elbow crutches, digital hearing aids, walkers, and spectacles.",
      howToApply: "Register at ALIMCO assessment camps or through District Social Welfare Officer.",
      contact: "ALIMCO Toll-Free: 1800-180-5129",
      officialUrl: "https://alimco.in",
    },
    {
      id: "scss",
      name: "Senior Citizens Savings Scheme (SCSS)",
      category: "Others (Welfare & Support)",
      coverage: "High-yield, safe savings plan",
      eligibility: "Individuals aged 60+ (or 55+ for retirees under VRS/Superannuation)",
      benefits: "Attractive interest rate (approx 8.2% p.a.), quarterly interest payout, and tax benefits under Section 80C. Max investment ₹30 Lakh.",
      howToApply: "Open an account at any Post Office or authorized scheduled commercial bank.",
      contact: "India Post Helpline: 1800-266-6868",
      officialUrl: "https://www.indiapost.gov.in",
    },
    {
      id: "annapurna",
      name: "Annapurna Scheme",
      category: "Others (Welfare & Support)",
      coverage: "Food security for indigent seniors",
      eligibility: "Indigent senior citizens (65+) who are eligible for but not receiving NOAPS",
      benefits: "10 kgs of food grains (wheat/rice) distributed free of cost every month.",
      howToApply: "Apply through Gram Panchayat or local municipal authority.",
      contact: "Local Panchayat / Block Office",
      officialUrl: "https://dfpd.gov.in",
    },
    {
      id: "benefits",
      name: "Senior Citizen Concessions & Section 80TTB",
      category: "Others (Welfare & Support)",
      coverage: "Special transit concessions & ₹50,000 interest deduction",
      eligibility: "All resident Indian senior citizens aged 60 and above",
      benefits: "Higher Fixed Deposit interest rates (+0.50%), ₹50,000 deduction on bank interest under 80TTB, and priority queues at airports and trains.",
      howToApply: "Submit Form 15H at banks to avoid TDS deduction; carry Senior Citizen Identity Card for transit.",
      contact: "Income Tax Helpline: 1800-180-1961",
      officialUrl: "https://incometax.gov.in",
    }
  ];

  useEffect(() => {
    // For simplicity, just set all schemes directly since there's no real backend for this demo.
    setSchemes(ALL_SCHEMES);
  }, []);

  const categories = [
    "All",
    "Health Schemes",
    "Pension Schemes",
    "Others (Welfare & Support)",
  ];
`;

content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\];\n/g, replacement);

fs.writeFileSync('src/components/SeniorSchemesSection.tsx', content);

console.log("Rewritten schemes in SeniorSchemesSection.tsx");
