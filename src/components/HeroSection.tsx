import React, { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  CalendarCheck, 
  Activity,
  Mic,
  Volume2,
  Stethoscope
} from "lucide-react";
import { Language } from "../types";
import { translations } from "../data/translations";

interface HeroSectionProps {
  currentLang: Language;
  onOpenSymptomChecker: () => void;
  onOpenReportAnalyzer: () => void;
  onOpenDoctorPrep: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onOpenSymptomChecker,
  onOpenReportAnalyzer,
  onOpenDoctorPrep,
}) => {
  const t = translations[currentLang];

  return (
    <section id="home" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Subtle organic background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#DCEAE4]/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#FBE8C8]/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* AI badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F4E46]/10 border border-[#1F4E46]/20 text-[#1F4E46] text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>🤖 AI-POWERED HEALTHCARE</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#153A34] leading-[1.12]">
              {t.heroHeading1}{" "}
              <span className="text-[#E8A33D] underline decoration-[#E8A33D]/30 decoration-wavy underline-offset-8">
                {t.heroHeading2}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#4A5D54] max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#1F4E46] bg-white hover:bg-[#EEF3EA] border border-[#D8E2DA] rounded-2xl shadow-sm transition"
              >
                <span>{t.exploreFeatures}</span>
                <ArrowRight className="w-4 h-4 text-[#1F4E46]" />
              </a>
            </div>

            {/* Feature quick links / pills */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#35483F]">
              <button 
                onClick={onOpenSymptomChecker}
                className="flex items-center gap-2 p-2.5 bg-white/80 hover:bg-white rounded-xl border border-[#D8E2DA] transition text-left"
              >
                <Stethoscope className="w-4 h-4 text-[#2D6A5D] shrink-0" />
                <span className="font-medium">Symptom Checker</span>
              </button>
              <button 
                onClick={onOpenReportAnalyzer}
                className="flex items-center gap-2 p-2.5 bg-white/80 hover:bg-white rounded-xl border border-[#D8E2DA] transition text-left"
              >
                <Activity className="w-4 h-4 text-[#E8A33D] shrink-0" />
                <span className="font-medium">Report Analyzer</span>
              </button>
              <button 
                onClick={onOpenDoctorPrep}
                className="flex items-center gap-2 p-2.5 bg-white/80 hover:bg-white rounded-xl border border-[#D8E2DA] transition text-left"
              >
                <CalendarCheck className="w-4 h-4 text-[#2D6A5D] shrink-0" />
                <span className="font-medium">Doctor Visit Prep</span>
              </button>
            </div>
          </div>

          {/* Right Column: Empty or future feature graphic could go here */}
          <div className="lg:col-span-5 hidden lg:block">
            {/* Kept structure for visual balance */}
          </div>

        </div>
      </div>
    </section>
  );
};
