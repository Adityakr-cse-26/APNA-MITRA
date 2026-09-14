import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Sparkles, 
  Menu, 
  X, 
  Type, 
  PhoneCall, 
  Activity, 
  Bot, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  Lock,
  LogOut
} from "lucide-react";
import { Language } from "../types";
import { ApnaMitraLogo } from "./ApnaMitraLogo";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
  onOpenRegistration?: () => void;
  alertCount?: number;
  user?: User | null;
  onLogout?: () => void;
  isAdmin?: boolean;
  onOpenAdminDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  fontScale,
  onFontScaleChange,
  onOpenRegistration,
  alertCount = 0,
  user,
  onLogout,
  isAdmin,
  onOpenAdminDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  const langLabels: Record<Language, string> = {
    en: "English",
    hi: "हिन्दी",
    bn: "বাংলা",
  };

  // Scroll spy to detect active section dynamically as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 130; // offset for sticky header height
      const sectionIds = [
        "home",
        "smart-alerts",
        "health",
        "games",
        "books",
        "nearby-directory",
        "schemes",
        "guardian-alert",
        "privacy",
        "emergency",
      ];

      // If near bottom of the document, highlight the last section
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isBottom) {
        setActiveSection("emergency");
        return;
      }

      // Check section offsets from bottom to top
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            return;
          }
        }
      }

      setActiveSection("home");
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleGoHome = () => {
      setActiveSection('home');
      setMobileMenuOpen(false);
    };
    window.addEventListener('navigateHome', handleGoHome);
    return () => window.removeEventListener('navigateHome', handleGoHome);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveSection(targetId);
    setMobileMenuOpen(false);
    
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E2E4E0] transition-all">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center">
            {/* Brand Logo */}
            <div className="flex items-center group py-1">
              <ApnaMitraLogo size="sm" variant="horizontal" showTagline={true} />
            </div>
            
            {user?.user_metadata?.full_name && (
              <button 
                onClick={onOpenRegistration}
                className="hidden lg:flex flex-col ml-4 pl-4 border-l-2 border-[#E2E4E0] justify-center hover:bg-[#1F4E46]/5 px-3 py-1.5 rounded-xl cursor-pointer transition-all text-left"
                title="View Patient Profile"
              >
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider leading-none mb-1">Welcome</span>
                <span className="text-sm font-bold text-[#153A34] leading-none truncate max-w-[150px]">{user.user_metadata?.full_name}</span>
              </button>
            )}
          </div>

          {/* Desktop Nav Links with Active State Highlighting */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1.5 text-xs font-medium">
            {/* Smart Alerts */}
            <a
              href="#smart-alerts"
              onClick={(e) => handleNavClick(e, "smart-alerts")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "smart-alerts"
                  ? "bg-rose-100/90 text-rose-950 font-bold border border-rose-300 shadow-2xs"
                  : alertCount > 0
                  ? "text-rose-700 hover:text-rose-800 hover:bg-rose-50 font-semibold"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              <span className="relative flex items-center">
                <span className={`w-2 h-2 rounded-full ${alertCount > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`}></span>
              </span>
              <span>{currentLang === 'hi' ? 'स्मार्ट अलर्ट' : currentLang === 'bn' ? 'স্মার্ট অ্যালার্ট' : 'Smart Alerts'}</span>
              {alertCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {alertCount}
                </span>
              )}
            </a>

            {/* 2. Care & Vitals */}
            <a
              href="#health"
              onClick={(e) => handleNavClick(e, "health")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "health"
                  ? "bg-[#1F4E46]/10 text-[#1F4E46] font-bold border border-[#1F4E46]/25 shadow-2xs"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${activeSection === "health" ? "text-[#1F4E46]" : "text-[#2D6A5D]"}`} />
              <span>{currentLang === 'hi' ? 'देखभाल और रिकॉर्ड' : currentLang === 'bn' ? 'যত্ন ও রেকর্ড' : 'Care & Vitals'}</span>
            </a>

            {/* 3. Games & Activity */}
            <a
              href="#games"
              onClick={(e) => handleNavClick(e, "games")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "games"
                  ? "bg-[#1F4E46]/10 text-[#1F4E46] font-bold border border-[#1F4E46]/25 shadow-2xs"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              {activeSection === "games" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4E46] shrink-0 animate-pulse"></span>
              )}
              <span>{currentLang === 'hi' ? 'दिमागी खेल' : currentLang === 'bn' ? 'ব্রেইন গেমস' : 'Brain Games'}</span>
            </a>

            {/* Books */}
            <a
              href="#books"
              onClick={(e) => handleNavClick(e, "books")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "books"
                  ? "bg-[#1F4E46]/10 text-[#1F4E46] font-bold border border-[#1F4E46]/25 shadow-2xs"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              {activeSection === "books" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4E46] shrink-0 animate-pulse"></span>
              )}
              <span>{currentLang === 'hi' ? 'किताबें' : currentLang === 'bn' ? 'বই' : 'Books'}</span>
            </a>

            {/* 4. Nearby Care */}
            <a
              href="#nearby-directory"
              onClick={(e) => handleNavClick(e, "nearby-directory")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "nearby-directory"
                  ? "bg-[#1F4E46]/10 text-[#1F4E46] font-bold border border-[#1F4E46]/25 shadow-2xs"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              {activeSection === "nearby-directory" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4E46] shrink-0 animate-pulse"></span>
              )}
              <span>{currentLang === 'hi' ? 'निकटवर्ती सेवाएं' : currentLang === 'bn' ? 'কাছাকাছি পরিষেবা' : 'Nearby Care'}</span>
            </a>

            {/* 5. Senior Welfare */}
            <a
              href="#schemes"
              onClick={(e) => handleNavClick(e, "schemes")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "schemes"
                  ? "bg-[#1F4E46]/10 text-[#1F4E46] font-bold border border-[#1F4E46]/25 shadow-2xs"
                  : "text-[#374940] hover:text-[#1F4E46] hover:bg-[#1F4E46]/5"
              }`}
            >
              <span>{currentLang === 'hi' ? 'सरकारी योजनाएं' : currentLang === 'bn' ? 'সরকারি প্রকল্প' : 'Govt Schemes'}</span>
            </a>

            {/* Guardian & Location */}
            <a
              href="#guardian-alert"
              onClick={(e) => handleNavClick(e, "guardian-alert")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "guardian-alert"
                  ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-2xs"
                  : "text-[#1F4E46] hover:text-[#153A34] hover:bg-emerald-50/70 font-semibold"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentLang === 'hi' ? 'गार्जियन जीपीएस' : currentLang === 'bn' ? 'গার্ডিয়ান জিপিএস' : 'Guardian GPS'}</span>
            </a>

            {/* Emergency SOS */}
            <a
              href="#emergency"
              onClick={(e) => handleNavClick(e, "emergency")}
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSection === "emergency"
                  ? "bg-rose-100 text-rose-900 font-bold border border-rose-300 ring-2 ring-rose-400/30 shadow-2xs"
                  : "text-rose-700 hover:text-rose-800 hover:bg-rose-50 font-semibold"
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-rose-500 ${activeSection === "emergency" ? "animate-bounce" : "animate-ping"}`}></span>
              <span>{currentLang === 'hi' ? 'एसओएस' : currentLang === 'bn' ? 'এসওএস' : 'SOS'}</span>
            </a>
          </nav>

          {/* Right Controls: Accessibility, Language, Profile, Phone Mockup, CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* User Profile / Registration Button */}
            {onOpenRegistration && (
              <button
                type="button"
                onClick={onOpenRegistration}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#153A34] bg-white hover:bg-[#F3F5F4] rounded-xl border border-[#E2E4E0] transition shadow-2xs"
                title="View &amp; Edit Profile or Caretaker Settings"
              >
                <span>{currentLang === 'hi' ? '👤 प्रोफ़ाइल' : currentLang === 'bn' ? '👤 প্রোফাইল' : '👤 Profile'}</span>
              </button>
            )}

            {isAdmin && onOpenAdminDashboard && (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition shadow-2xs"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentLang === 'hi' ? 'एडमिन' : currentLang === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
              </button>
            )}

            {/* Auth Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 rounded-xl border border-rose-200 transition shadow-2xs"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{currentLang === 'hi' ? 'लॉग आउट' : currentLang === 'bn' ? 'লগ আউট' : 'Log Out'}</span>
            </button>

            {/* Font scaling control */}
            <div className="flex items-center bg-white rounded-xl border border-[#E2E4E0] p-1 shadow-sm" title="Adjust Text Size">
              <button
                type="button"
                onClick={() => onFontScaleChange(0.9)}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  fontScale === 0.9 ? "bg-[#1F4E46] text-white" : "text-[#5B6B60] hover:bg-[#F3F5F4]"
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onFontScaleChange(1.0)}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  fontScale === 1.0 ? "bg-[#1F4E46] text-white" : "text-[#5B6B60] hover:bg-[#F3F5F4]"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onFontScaleChange(1.15)}
                className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                  fontScale === 1.15 ? "bg-[#1F4E46] text-white" : "text-[#5B6B60] hover:bg-[#F3F5F4]"
                }`}
              >
                A+
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-white rounded-xl border border-[#E2E4E0] p-1 shadow-sm">
              {(["en", "hi", "bn"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                    currentLang === lang
                      ? "bg-[#1F4E46] text-white shadow-sm"
                      : "text-[#5B6B60] hover:text-[#1F4E46] hover:bg-[#F3F5F4]"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "hi" ? "हिं" : "বাং"}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onLanguageChange(currentLang === "en" ? "hi" : currentLang === "hi" ? "bn" : "en")}
              className="px-2.5 py-1 text-xs font-bold bg-white border border-[#E2E4E0] rounded-lg text-[#1F4E46]"
            >
              {currentLang.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#1F4E46] hover:bg-white/60 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-[#E2E4E0] px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F5F4]">
            <span className="text-xs font-medium text-[#5B6B60]">Language:</span>
            <div className="flex gap-1">
              {(["en", "hi", "bn"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    currentLang === lang ? "bg-[#1F4E46] text-white" : "bg-[#F3F5F4] text-[#5B6B60]"
                  }`}
                >
                  {langLabels[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 text-sm font-medium text-[#22312B]">
            {/* Smart Alerts */}
            <a
              href="#smart-alerts"
              onClick={(e) => handleNavClick(e, "smart-alerts")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "smart-alerts"
                  ? "bg-rose-600 text-white font-bold shadow-xs"
                  : alertCount > 0
                  ? "bg-rose-50 text-rose-800 font-bold border border-rose-200"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${alertCount > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`}></span>
                <span>{currentLang === 'hi' ? 'स्मार्ट स्वास्थ्य और दवा अलर्ट' : currentLang === 'bn' ? 'স্মার্ট স্বাস্থ্য এবং ঔষধ অ্যালার্ট' : 'Smart Health & Medication Alerts'}</span>
              </div>
              {alertCount > 0 && (
                <span className="text-xs bg-rose-700 text-white px-2 py-0.5 rounded-full font-bold">
                  {alertCount} Active
                </span>
              )}
            </a>

            {/* 2. Health & Vitals Care */}
            <a
              href="#health"
              onClick={(e) => handleNavClick(e, "health")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "health"
                  ? "bg-[#1F4E46] text-white font-bold shadow-xs"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <span>{currentLang === 'hi' ? '2. देखभाल और स्वास्थ्य रिकॉर्ड' : currentLang === 'bn' ? '২. যত্ন এবং স্বাস্থ্য রেকর্ড' : '2. Care & Health Records'}</span>
              <Activity className={`w-4 h-4 ${activeSection === "health" ? "text-emerald-200" : "text-[#1F4E46]"}`} />
            </a>

            {/* 3. Games & Activity */}
            <a
              href="#games"
              onClick={(e) => handleNavClick(e, "games")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "games"
                  ? "bg-[#1F4E46] text-white font-bold shadow-xs"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <span>{currentLang === 'hi' ? '3. दिमागी खेल और दैनिक गतिविधि' : currentLang === 'bn' ? '৩. ব্রেইন গেম এবং দৈনন্দিন কাজ' : '3. Brain Games & Daily Activity'}</span>
              {activeSection === "games" && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>}
            </a>

            {/* Books */}
            <a
              href="#books"
              onClick={(e) => handleNavClick(e, "books")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "books"
                  ? "bg-[#1F4E46] text-white font-bold shadow-xs"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <span>{currentLang === 'hi' ? 'अनुशंसित किताबें' : currentLang === 'bn' ? 'প্রস্তাবিত বই' : 'Recommended Books'}</span>
              {activeSection === "books" && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>}
            </a>

            {/* 4. Nearby Care */}
            <a
              href="#nearby-directory"
              onClick={(e) => handleNavClick(e, "nearby-directory")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "nearby-directory"
                  ? "bg-[#1F4E46] text-white font-bold shadow-xs"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <span>{currentLang === 'hi' ? '4. निकटवर्ती डॉक्टर और केमिस्ट' : currentLang === 'bn' ? '৪. কাছাকাছি ডাক্তার ও রসায়নবিদ' : '4. Nearby Doctors & Chemists'}</span>
              {activeSection === "nearby-directory" && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>}
            </a>

            {/* 5. Senior Schemes */}
            <a
              href="#schemes"
              onClick={(e) => handleNavClick(e, "schemes")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "schemes"
                  ? "bg-[#1F4E46] text-white font-bold shadow-xs"
                  : "hover:bg-[#F3F5F4] text-[#22312B]"
              }`}
            >
              <span>{currentLang === 'hi' ? '5. सरकारी कल्याणकारी योजनाएं' : currentLang === 'bn' ? '৫. সরকারি কল্যাণ প্রকল্প' : '5. Government Welfare Schemes'}</span>
              {activeSection === "schemes" && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>}
            </a>

            {/* Guardian Alert */}
            <a
              href="#guardian-alert"
              onClick={(e) => handleNavClick(e, "guardian-alert")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "guardian-alert"
                  ? "bg-emerald-700 text-white font-bold shadow-xs"
                  : "bg-emerald-50 text-emerald-800 font-semibold"
              }`}
            >
              <span>{currentLang === 'hi' ? 'गार्जियन अलर्ट और लाइव लोकेशन' : currentLang === 'bn' ? 'গার্ডিয়ান অ্যালার্ট এবং লাইভ লোকেশন' : 'Guardian Alert & Live Location'}</span>
              <ShieldCheck className={`w-4 h-4 ${activeSection === "guardian-alert" ? "text-emerald-200" : "text-emerald-600"}`} />
            </a>

            {/* Emergency SOS */}
            <a
              href="#emergency"
              onClick={(e) => handleNavClick(e, "emergency")}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === "emergency"
                  ? "bg-rose-600 text-white font-bold shadow-xs"
                  : "bg-rose-50 text-rose-700 font-semibold"
              }`}
            >
              <span>{currentLang === 'hi' ? 'आपातकालीन मदद (SOS)' : currentLang === 'bn' ? 'জরুরী সাহায্য (SOS)' : 'Emergency Help (SOS)'}</span>
              <PhoneCall className={`w-4 h-4 ${activeSection === "emergency" ? "text-white" : "text-rose-600"}`} />
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onOpenRegistration && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegistration();
                }}
                className="w-full py-2.5 bg-white border border-[#E2E4E0] text-[#153A34] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>{currentLang === 'hi' ? '👤 वरिष्ठ प्रोफ़ाइल और केयरटेकर सेटिंग्स' : currentLang === 'bn' ? '👤 সিনিয়র প্রোফাইল এবং কেয়ারটেকার সেটিংস' : '👤 Senior Profile & Caretaker Settings'}</span>
              </button>
            )}
            
            {isAdmin && onOpenAdminDashboard && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDashboard();
                }}
                className="w-full py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{currentLang === 'hi' ? 'एडमिन डैशबोर्ड' : currentLang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}</span>
              </button>
            )}

            {/* Mobile Auth Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if(onLogout) onLogout();
              }}
              className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentLang === 'hi' ? 'लॉग आउट' : currentLang === 'bn' ? 'লগ আউট' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
