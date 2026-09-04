import React from "react";
import { Heart, ShieldCheck, PhoneCall, Bot } from "lucide-react";
import { Language } from "../types";
import { ApnaMitraLogo } from "./ApnaMitraLogo";

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  return (
    <footer className="bg-[#153A34] text-white pt-16 pb-12 border-t border-[#1F4E46]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#1F4E46]">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white/95 rounded-2xl p-3.5 inline-block shadow-md">
              <ApnaMitraLogo size="sm" variant="horizontal" showTagline={true} />
            </div>

            <p className="text-sm text-[#B4C6BB] max-w-md leading-relaxed">
              Your AI health companion for understanding health information, tracking important health data, and preparing for better conversations with healthcare professionals.
            </p>
          </div>

          {/* Links Col */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-amber-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#DCEAE4]">
              <li>
                <a href="#home" className="hover:text-white transition">Home</a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">Features</a>
              </li>
              <li>
                <a href="#health" className="hover:text-white transition">Health Dashboard</a>
              </li>
              <li>
                <a href="#ai" className="hover:text-white transition">Mitra AI Assistant</a>
              </li>
              <li>
                <a href="#schemes" className="hover:text-white transition">Senior Schemes</a>
              </li>
            </ul>
          </div>

          {/* Emergency & Safety Col */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-rose-300">
              Emergency &amp; Trust
            </h4>
            <ul className="space-y-2 text-sm text-[#DCEAE4]">
              <li>
                <a href="#emergency" className="hover:text-rose-200 text-rose-300 font-semibold transition">
                  Emergency Help (112 / 108)
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition">Privacy &amp; Data Control</a>
              </li>
              <li>
                <span className="text-xs text-[#8DA094] block pt-1">
                  National Senior Helpline: <strong className="text-white">14567</strong>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8DA094]">
          <div className="space-y-1 text-center sm:text-left">
            <p>© 2026 Apna Mitra. All rights reserved.</p>
            <p>Apna Mitra is an AI health assistant and does not replace professional medical advice.</p>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-medium text-[#DCEAE4] flex items-center justify-center sm:justify-end gap-1">
              Creator 🤝 Aditya Kumar
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
