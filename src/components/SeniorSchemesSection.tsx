import React, { useState, useEffect } from "react";
import { 
  Building2, 
  ShieldCheck, 
  HeartHandshake, 
  ExternalLink, 
  Phone, 
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { SchemeInfo, Language } from "../types";
import { translations } from "../data/translations";

interface SeniorSchemesSectionProps {
  currentLang: Language;
}

export const SeniorSchemesSection: React.FC<SeniorSchemesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeScheme, setActiveScheme] = useState<SchemeInfo | null>(null);

  const ALL_SCHEMES: SchemeInfo[] = [
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
    }    ,{
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


  const filteredSchemes = selectedCategory === "All"
    ? schemes
    : schemes.filter((s) => s.category.includes(selectedCategory) || selectedCategory.includes(s.category));

  return (
    <section id="schemes" className="py-16 md:py-24 bg-white border-b border-[#E2E4E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-block mb-3">
            Government Welfare &amp; Elder Support
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-4">
            {t.seniorSchemesTitle}
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B60]">
            {t.seniorSchemesSubtitle}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#1F4E46] text-white shadow-sm"
                  : "bg-[#FAFAFA] text-[#5B6B60] hover:bg-[#F3F5F4] border border-[#E2E4E0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <article
              key={scheme.id}
              className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-7 border border-[#E2E4E0] hover:border-[#1F4E46]/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCEAE4] text-[#1F4E46] border border-[#B4C6BB]">
                    {scheme.category}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-sm shadow-2xs">
                    🏛️
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#153A34] leading-snug">
                  {scheme.name}
                </h3>

                <div className="p-3 bg-white rounded-2xl border border-[#E2E4E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#1F4E46] uppercase tracking-wider block">
                    Coverage &amp; Entitlement
                  </span>
                  <p className="text-xs font-semibold text-[#153A34]">
                    {scheme.coverage}
                  </p>
                </div>

                <div className="text-xs text-[#5B6B60] space-y-2">
                  <p>
                    <strong className="text-[#35483F]">Eligibility:</strong> {scheme.eligibility}
                  </p>
                  <p>
                    <strong className="text-[#35483F]">How to Apply:</strong> {scheme.howToApply}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2E4E0] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E46]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{scheme.contact}</span>
                </div>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white hover:bg-[#F3F5F4] border border-[#E2E4E0] text-[#1F4E46] text-xs font-semibold flex items-center gap-1 transition"
                  title="Official portal"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* National Helpline Banner */}
        <div className="mt-12 p-6 sm:p-7 bg-[#1F4E46] text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif text-xl sm:text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
              <span>National Elder Helpline (Elderline)</span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-400 text-stone-900 rounded-full font-bold">
                14567
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-[#DCEAE4]">
              Toll-free dedicated support for senior citizens across India for healthcare, rescue, pensions, and legal guidance.
            </p>
          </div>

          <a
            href="tel:14567"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-sm rounded-2xl shrink-0 shadow-sm transition flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call Elderline 14567</span>
          </a>
        </div>

      </div>
    </section>
  );
};
