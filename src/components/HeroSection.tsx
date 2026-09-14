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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* AI badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#153A34] border border-[#1F4E46] text-emerald-50 text-[11px] sm:text-xs font-bold tracking-widest uppercase shadow-md shadow-emerald-900/10 transition-transform hover:scale-105 cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI-POWERED HEALTHCARE</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#153A34] leading-[1.05] mb-6">
          {t.heroHeading1}{" "}
          <span className="text-[#E8A33D] block mt-2 font-style-italic italic">
            {t.heroHeading2}
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#5B6B60] max-w-2xl leading-relaxed mb-10">
          {t.heroSubtitle}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-[#153A34] hover:bg-[#1F4E46] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <span>{t.exploreFeatures}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Feature quick links / pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#153A34] w-full max-w-3xl">
          <button 
            onClick={onOpenSymptomChecker}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-[#E2E4E0] hover:border-[#B4C6BB] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5 text-teal-700" />
            </div>
            <span className="font-bold">Symptom Checker</span>
          </button>
          <button 
            onClick={onOpenReportAnalyzer}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-[#E2E4E0] hover:border-[#B4C6BB] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <span className="font-bold">Report Analyzer</span>
          </button>
          <button 
            onClick={onOpenDoctorPrep}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-[#E2E4E0] hover:border-[#B4C6BB] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold">Doctor Visit Prep</span>
          </button>
        </div>
      </div>
    </section>
  );
};
