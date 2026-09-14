import React, { useState } from "react";
import { AlertTriangle, Pill, Bell, ChevronRight, X, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { SmartHealthAlert, SmartMedicationAlert, Language } from "../types";

interface SmartNotificationBannerProps {
  currentLang: Language;
  activeHealthAlerts: SmartHealthAlert[];
  dueMedications: SmartMedicationAlert[];
  missedMedications: SmartMedicationAlert[];
  onOpenAlertsSection: () => void;
  onOpenMitraChat: (prompt?: string) => void;
  onTakeMedication: (id: string) => void;
}

export const SmartNotificationBanner: React.FC<SmartNotificationBannerProps> = ({
  currentLang,
  activeHealthAlerts,
  dueMedications,
  missedMedications,
  onOpenAlertsSection,
  onOpenMitraChat,
  onTakeMedication,
}) => {
  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState(false);

  const criticalHealthAlert = activeHealthAlerts.find((a) => a.severity === "CRITICAL") || activeHealthAlerts[0];
  const urgentMissedMed = missedMedications[0];
  const urgentDueMed = dueMedications[0];

  if (isDismissedTemporarily || (!criticalHealthAlert && !urgentMissedMed && !urgentDueMed)) {
    return null;
  }

  return (
    <div className="sticky top-20 z-30 px-4 sm:px-6 lg:px-8 py-2 max-w-7xl mx-auto animate-in slide-in-from-top-4 duration-300">
      {criticalHealthAlert ? (
        <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${
          criticalHealthAlert.severity === "CRITICAL"
            ? "bg-rose-600 text-white border-rose-700"
            : "bg-amber-500 text-white border-amber-600"
        }`}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold block sm:inline mr-2">
                ⚠️ Health Alert: {criticalHealthAlert.title}
              </span>
              <span className="opacity-90">
                ({criticalHealthAlert.currentValue}) - Step-by-step guidance available
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onOpenAlertsSection}
              className="px-3 py-1.5 bg-white text-[#153A34] hover:bg-[#F3F5F4] rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <span>View Guidance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenMitraChat(`I have an active alert: ${criticalHealthAlert.title} (${criticalHealthAlert.currentValue}). Please guide me on immediate safe steps.`)}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-xl text-xs font-semibold transition"
            >
              Ask Mitra
            </button>

            <button
              type="button"
              onClick={() => setIsDismissedTemporarily(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
              title="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : urgentMissedMed ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-600 text-white border border-amber-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Missed Dose: {urgentMissedMed.medicationName} ({urgentMissedMed.dosage})</span>
              <span className="opacity-90 ml-1.5">was scheduled for {urgentMissedMed.scheduledTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onTakeMedication(urgentMissedMed.medicationId)}
              className="px-3.5 py-1.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold transition"
            >
              Take Now ✓
            </button>
            <button
              type="button"
              onClick={onOpenAlertsSection}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-xl text-xs font-semibold transition"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setIsDismissedTemporarily(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : urgentDueMed ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1F4E46] text-white border border-[#153A34] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4 text-[#E8A33D]" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Medicine Due: {urgentDueMed.medicationName} ({urgentDueMed.dosage})</span>
              <span className="opacity-90 ml-1.5">• {urgentDueMed.instructions}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onTakeMedication(urgentDueMed.medicationId)}
              className="px-3.5 py-1.5 bg-[#E8A33D] hover:bg-[#d4902b] text-[#153A34] rounded-xl text-xs font-bold transition"
            >
              Take Dose ✓
            </button>
            <button
              type="button"
              onClick={() => setIsDismissedTemporarily(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
