import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  BrainCircuit, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Language } from "../types";
import { translations } from "../data/translations";

interface TrustPrivacySectionProps {
  currentLang: Language;
}

export const TrustPrivacySection: React.FC<TrustPrivacySectionProps> = ({
  currentLang,
}) => {
  const t = translations[currentLang];

  return (
    <section id="privacy" className="py-16 md:py-24 bg-white border-b border-[#D8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-block mb-3">
            Trust &amp; Safety
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-4">
            {t.privacyTitle}
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B60]">
            {t.privacySubtitle}
          </p>
        </div>

        {/* 3 Privacy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          
          <article className="bg-[#F4F7F4] rounded-3xl p-7 border border-[#D8E2DA] shadow-xs flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs">
                🔐
              </div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                Secure by Design
              </h3>
              <p className="text-sm text-[#5B6B60] leading-relaxed">
                We implement local-first privacy principles, encrypted storage, and granular access controls for all personal health measurements and report logs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D8E2DA] text-xs font-semibold text-[#1F4E46] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Protected Health Data</span>
            </div>
          </article>

          <article className="bg-[#F4F7F4] rounded-3xl p-7 border border-[#D8E2DA] shadow-xs flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs">
                👤
              </div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                User Control
              </h3>
              <p className="text-sm text-[#5B6B60] leading-relaxed">
                You decide who sees your readings. Share vitals or doctor prep sheets with designated family caregivers or doctors only when you explicitly choose.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D8E2DA] text-xs font-semibold text-[#1F4E46] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Consent-Driven Sharing</span>
            </div>
          </article>

          <article className="bg-[#F4F7F4] rounded-3xl p-7 border border-[#D8E2DA] shadow-xs flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-xs">
                🧠
              </div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                AI Safety Protocols
              </h3>
              <p className="text-sm text-[#5B6B60] leading-relaxed">
                Mitra AI follows strict clinical safety boundaries: it avoids definitive unverified diagnoses, prevents unsafe prescription modifications, and guides you to professional care.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D8E2DA] text-xs font-semibold text-[#1F4E46] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Medically Responsible AI</span>
            </div>
          </article>

        </div>

        {/* Big CTA Box */}
        <div className="bg-gradient-to-br from-[#1F4E46] to-[#153A34] text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Meet your new health companion.
            </h2>
            <p className="text-base sm:text-lg text-[#DCEAE4]">
              Understand. Track. Prepare. Connect.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
