import React, { useState } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Pill, 
  Clock, 
  Bell, 
  BellRing, 
  Check, 
  Sparkles, 
  Volume2, 
  MessageSquare, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  PhoneCall, 
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Info
} from "lucide-react";
import confetti from "canvas-confetti";
import { VitalReading, Medication, Language, ElderlyProfile, SmartHealthAlert, SmartMedicationAlert } from "../types";
import { evaluateHealthAlerts, evaluateMedicationAlerts, playAlertTone } from "../utils/alertEngine";

interface SmartAlertsHubProps {
  currentLang: Language;
  vitals: VitalReading[];
  medications: Medication[];
  userProfile: ElderlyProfile;
  onToggleMedication: (id: string) => void;
  onAddVital: (reading: Omit<VitalReading, "id" | "timestamp">) => void;
  onOpenMitraChat: (prompt?: string) => void;
  onOpenEmergency: () => void;
  onOpenDoctorPrep: () => void;
  onOpenMedicineModal: () => void;
}

export const SmartAlertsHub: React.FC<SmartAlertsHubProps> = ({
  currentLang,
  vitals,
  medications,
  userProfile,
  onToggleMedication,
  onAddVital,
  onOpenMitraChat,
  onOpenEmergency,
  onOpenDoctorPrep,
  onOpenMedicineModal,
}) => {
  const [dismissedHealthAlerts, setDismissedHealthAlerts] = useState<string[]>([]);
  const [notifiedCaregiverAlerts, setNotifiedCaregiverAlerts] = useState<Record<string, string>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "health" | "medication">("all");

  const healthAlerts = evaluateHealthAlerts(vitals, dismissedHealthAlerts);
  const activeHealthAlerts = healthAlerts.filter((a) => !a.isDismissed);
  const medicationAlerts = evaluateMedicationAlerts(medications);

  const dueMedications = medicationAlerts.filter((m) => m.status === "DUE_NOW");
  const missedMedications = medicationAlerts.filter((m) => m.status === "MISSED");
  const totalAlertsCount = activeHealthAlerts.length + dueMedications.length + missedMedications.length;

  const primaryCaregiver = userProfile.caretakers.find((c) => c.isPrimary) || userProfile.caretakers[0];

  const handleDismissHealthAlert = (id: string) => {
    setDismissedHealthAlerts((prev) => [...prev, id]);
  };

  const handleNotifyCaregiver = (alertKey: string, alertTitle: string, detailText: string) => {
    if (soundEnabled) {
      playAlertTone("health_warning");
    }
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setNotifiedCaregiverAlerts((prev) => ({
      ...prev,
      [alertKey]: `Alert dispatched to ${primaryCaregiver?.name || "Caregiver"} (${primaryCaregiver?.phone || "Primary"}) at ${timestamp}`,
    }));
  };

  const handleTakeMedication = (medId: string) => {
    if (soundEnabled) {
      playAlertTone("success_bell");
    }
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.75 },
    });
    onToggleMedication(medId);
  };

  // Quick Simulation buttons to test alerts
  const handleSimulateHighBP = () => {
    onAddVital({
      type: "bp",
      value: "168/104",
      unit: "mmHg",
      status: "alert",
      note: "Simulated BP spike test",
    });
    if (soundEnabled) {
      playAlertTone("health_critical");
    }
  };

  const handleSimulateLowSugar = () => {
    onAddVital({
      type: "sugar",
      value: "62",
      unit: "mg/dL",
      status: "alert",
      note: "Simulated hypoglycemia test",
    });
    if (soundEnabled) {
      playAlertTone("health_critical");
    }
  };

  const handleSimulateNormalVitals = () => {
    onAddVital({
      type: "bp",
      value: "122/80",
      unit: "mmHg",
      status: "normal",
      note: "Baseline restored",
    });
    onAddVital({
      type: "sugar",
      value: "102",
      unit: "mg/dL",
      status: "normal",
      note: "Normal fasting glucose",
    });
    onAddVital({
      type: "spo2",
      value: "98",
      unit: "%",
      status: "normal",
    });
    if (soundEnabled) {
      playAlertTone("success_bell");
    }
  };

  return (
    <section id="smart-alerts" className="py-16 md:py-24 bg-[#F8FAF8] border-b border-[#D8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 animate-pulse text-[#E8A33D]" />
                SMART ALERT SYSTEM
              </span>
              {totalAlertsCount > 0 ? (
                <span className="text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  {totalAlertsCount} Active Attention Item{totalAlertsCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> All Vitals & Doses Normal
                </span>
              )}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-3">
              {currentLang === "hi" ? "स्मार्ट स्वास्थ्य एवं दवा अलर्ट" : currentLang === "bn" ? "স্মার্ট স্বাস্থ্য ও ওষুধ অ্যালার্ট" : "Smart Health & Medication Alerts"}
            </h2>
            <p className="text-[#5B6B60] text-base max-w-2xl">
              {currentLang === "hi" 
                ? "स्वचालित वाइटल्स विश्लेषण, दवा लेने के समय के रिमाइंडर, और केयरटेकर सूचना प्रणाली।"
                : currentLang === "bn"
                ? "স্বয়ংক্রিয় স্বাস্থ্য লক্ষণ পর্যবেক্ষণ, ওষুধের সময়সূচি সতর্কতা এবং অভিভাবক সংযোগ।"
                : "Real-time vitals threshold analysis, timely dose reminders, and automated caregiver escalation."}
            </p>
          </div>

          {/* Action and sound controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                soundEnabled 
                  ? "bg-white text-[#1F4E46] border-[#D8E2DA] hover:bg-[#EEF3EA]" 
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
              title="Toggle audio chime on alerts"
            >
              <Volume2 className="w-4 h-4" />
              <span>{soundEnabled ? "Alert Sound: ON" : "Alert Sound: MUTED"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMedicineModal}
              className="px-4 py-2 bg-[#1F4E46] text-white hover:bg-[#153A34] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Pill className="w-4 h-4" />
              <span>Full Pill Schedule</span>
            </button>
          </div>
        </div>

        {/* Top Overview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Vitals Health Status */}
          <div className={`p-6 rounded-3xl border transition-all ${
            activeHealthAlerts.some((a) => a.severity === "CRITICAL")
              ? "bg-rose-50 border-rose-200 shadow-sm"
              : activeHealthAlerts.length > 0
              ? "bg-amber-50/70 border-amber-200"
              : "bg-white border-[#D8E2DA]"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                activeHealthAlerts.length > 0 ? "bg-rose-500 text-white" : "bg-emerald-100 text-emerald-800"
              }`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#5B6B60]">Vitals Sentinel</span>
            </div>
            <h4 className="font-serif font-bold text-lg text-[#153A34] mb-1">
              {activeHealthAlerts.length > 0 
                ? `${activeHealthAlerts.length} Vital Warning${activeHealthAlerts.length > 1 ? "s" : ""}`
                : "All Vitals in Safe Range"}
            </h4>
            <p className="text-xs text-[#5B6B60] leading-relaxed">
              {activeHealthAlerts.length > 0
                ? "Immediate clinical home care measures suggested below."
                : "Blood pressure, glucose, oxygen, and pulse are within healthy senior thresholds."}
            </p>
          </div>

          {/* Card 2: Today's Medication Adherence */}
          <div className="p-6 rounded-3xl border border-[#D8E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#5B6B60]">Pill Adherence</span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="font-serif font-bold text-lg text-[#153A34]">
                {medications.filter((m) => m.takenToday).length} / {medications.length} Doses Taken
              </h4>
              <span className="text-xs font-bold text-[#1F4E46]">
                {medications.length > 0 ? Math.round((medications.filter((m) => m.takenToday).length / medications.length) * 100) : 100}%
              </span>
            </div>
            <p className="text-xs text-[#5B6B60] leading-relaxed">
              {missedMedications.length > 0
                ? `⚠️ ${missedMedications.length} dose past scheduled time requires attention.`
                : dueMedications.length > 0
                ? `🔔 ${dueMedications.length} dose currently due.`
                : "Great job! All scheduled doses for today are up to date."}
            </p>
          </div>

          {/* Card 3: Caregiver Link */}
          <div className="p-6 rounded-3xl border border-[#D8E2DA] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#5B6B60]">Guardian Sync</span>
            </div>
            <h4 className="font-serif font-bold text-lg text-[#153A34] mb-1">
              {primaryCaregiver?.name || "Rahul Sharma"}
            </h4>
            <p className="text-xs text-[#5B6B60] leading-relaxed">
              Primary Caregiver • {primaryCaregiver?.phone || "+91 98765 43210"}
              <br />
              <span className="text-emerald-700 font-medium">● Connected for SMS & WhatsApp health alerts</span>
            </p>
          </div>

        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#D8E2DA] pb-3">
          {[
            { id: "all", label: `All Alerts (${totalAlertsCount})` },
            { id: "health", label: `Health & Vitals (${activeHealthAlerts.length})` },
            { id: "medication", label: `Medication Doses (${dueMedications.length + missedMedications.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "bg-white text-[#5B6B60] hover:bg-[#EEF3EA] border border-[#D8E2DA]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alert List Container */}
        <div className="space-y-6 mb-12">
          
          {/* SECTION A: SMART HEALTH ALERTS */}
          {(activeTab === "all" || activeTab === "health") && activeHealthAlerts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Active Health Telemetry Warnings
              </h3>

              {activeHealthAlerts.map((alert) => {
                const isDispatched = !!notifiedCaregiverAlerts[alert.id];
                return (
                  <div
                    key={alert.id}
                    className={`rounded-3xl p-6 sm:p-7 border transition-all ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-50/90 border-rose-300 shadow-md"
                        : "bg-amber-50/80 border-amber-300 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pb-4 border-b border-rose-200/60">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}>
                            {alert.severity} ALERT
                          </span>
                          <span className="text-xs font-bold text-[#153A34]">
                            Recorded Value: <span className="underline font-mono">{alert.currentValue}</span>
                          </span>
                          <span className="text-xs text-[#5B6B60]">
                            (Target: {alert.safeThreshold})
                          </span>
                          <span className="text-xs text-[#7A8B80] ml-auto">
                            {alert.timestamp}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-xl text-[#153A34]">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-[#3E4D45] mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>

                      {/* Dismiss / Resolve button */}
                      <button
                        type="button"
                        onClick={() => handleDismissHealthAlert(alert.id)}
                        className="self-start px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-[#5B6B60] transition shrink-0"
                      >
                        Dismiss / Mark Resolved
                      </button>
                    </div>

                    {/* Immediate Step-by-Step Action List */}
                    <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-rose-200/70 mb-5">
                      <h5 className="text-xs font-bold text-[#153A34] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#1F4E46]" />
                        Recommended Immediate Actions for Patient / Caregiver:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#22312B]">
                        {alert.immediateAction.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#DCEAE4] text-[#1F4E46] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                              {sIdx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Caregiver Notification Button */}
                      <button
                        type="button"
                        onClick={() => handleNotifyCaregiver(alert.id, alert.title, alert.currentValue)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                          isDispatched
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-[#1F4E46] hover:bg-[#153A34] text-white shadow-xs"
                        }`}
                      >
                        {isDispatched ? <Check className="w-4 h-4 text-emerald-700" /> : <PhoneCall className="w-4 h-4" />}
                        <span>
                          {isDispatched 
                            ? "Caregiver Alert Dispatched ✓" 
                            : `Notify Caregiver (${primaryCaregiver?.name || "Rahul Sharma"})`}
                        </span>
                      </button>

                      {/* Ask Mitra AI Button */}
                      <button
                        type="button"
                        onClick={() => onOpenMitraChat(`My recorded ${alert.vitalType.toUpperCase()} is ${alert.currentValue}. What should I do right now to stabilize it safely?`)}
                        className="px-4 py-2.5 bg-white hover:bg-[#EEF3EA] border border-[#D8E2DA] text-[#1F4E46] rounded-xl text-xs font-bold transition flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-[#E8A33D]" />
                        <span>Ask Mitra AI About This Reading</span>
                      </button>

                      {/* Doctor prep brief */}
                      <button
                        type="button"
                        onClick={onOpenDoctorPrep}
                        className="px-4 py-2.5 bg-white hover:bg-[#EEF3EA] border border-[#D8E2DA] text-[#1F4E46] rounded-xl text-xs font-bold transition flex items-center gap-2"
                      >
                        <Stethoscope className="w-4 h-4 text-[#1F4E46]" />
                        <span>Generate Doctor Brief</span>
                      </button>

                      {alert.severity === "CRITICAL" && (
                        <button
                          type="button"
                          onClick={onOpenEmergency}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition ml-auto flex items-center gap-1.5 shadow-xs"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>SOS 112 Ambulance</span>
                        </button>
                      )}
                    </div>

                    {/* Dispatched feedback log */}
                    {isDispatched && (
                      <div className="mt-3 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                        {notifiedCaregiverAlerts[alert.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION B: SMART MEDICATION ALERTS */}
          {(activeTab === "all" || activeTab === "medication") && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F4E46] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#1F4E46]" />
                Timely Medication Reminders & Dose Schedule
              </h3>

              {medicationAlerts.map((medAlert) => {
                const isDue = medAlert.status === "DUE_NOW";
                const isMissed = medAlert.status === "MISSED";
                const isTaken = medAlert.status === "TAKEN";
                const isLowStock = (medAlert.remainingPills ?? 10) <= 5;
                const isDispatched = !!notifiedCaregiverAlerts[medAlert.id];

                return (
                  <div
                    key={medAlert.id}
                    className={`rounded-3xl p-5 sm:p-6 border transition-all ${
                      isMissed
                        ? "bg-rose-50/70 border-rose-200"
                        : isDue
                        ? "bg-amber-50/70 border-amber-200 shadow-sm"
                        : isTaken
                        ? "bg-white/90 border-[#D8E2DA] opacity-80"
                        : "bg-white border-[#D8E2DA]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isTaken
                            ? "bg-emerald-100 text-emerald-800"
                            : isMissed
                            ? "bg-rose-500 text-white"
                            : isDue
                            ? "bg-amber-500 text-white animate-bounce"
                            : "bg-[#EEF3EA] text-[#1F4E46]"
                        }`}>
                          <Pill className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-serif font-bold text-base text-[#153A34]">
                              {medAlert.medicationName}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-[#4A5D54]">
                              {medAlert.dosage}
                            </span>
                            
                            {/* Status Pill */}
                            {isMissed && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                                Missed Dose ({medAlert.minutesOverdue}m ago)
                              </span>
                            )}
                            {isDue && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                                Due Now • {medAlert.scheduledTime}
                              </span>
                            )}
                            {isTaken && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Taken Today ✓
                              </span>
                            )}
                            {!isDue && !isMissed && !isTaken && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-[#5B6B60]">
                                Scheduled at {medAlert.scheduledTime}
                              </span>
                            )}

                            {isLowStock && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Low Stock: {medAlert.remainingPills} pills left
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B60]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#E8A33D]" />
                              {medAlert.timingCategory} ({medAlert.scheduledTime})
                            </span>
                            <span>•</span>
                            <span>{medAlert.instructions}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {!isTaken ? (
                          <button
                            type="button"
                            onClick={() => handleTakeMedication(medAlert.medicationId)}
                            className="px-4 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark Taken</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTakeMedication(medAlert.medicationId)}
                            className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl text-xs font-semibold transition"
                          >
                            Taken (Undo)
                          </button>
                        )}

                        {isMissed && (
                          <button
                            type="button"
                            onClick={() => handleNotifyCaregiver(medAlert.id, `Missed Dose: ${medAlert.medicationName}`, `${medAlert.medicationName} (${medAlert.dosage}) was not taken at ${medAlert.scheduledTime}.`)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                              isDispatched
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-200"
                            }`}
                          >
                            {isDispatched ? "Caregiver Alerted ✓" : "Alert Caregiver on Missed Dose"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenMitraChat(`I missed my dose of ${medAlert.medicationName} (${medAlert.dosage}) scheduled for ${medAlert.scheduledTime}. What should I do?`)}
                          className="p-2.5 bg-white hover:bg-[#EEF3EA] border border-[#D8E2DA] text-[#1F4E46] rounded-xl text-xs font-bold transition"
                          title="Ask Mitra AI guidance for this medicine"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isDispatched && (
                      <div className="mt-2.5 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        {notifiedCaregiverAlerts[medAlert.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state if no alerts */}
          {activeHealthAlerts.length === 0 && dueMedications.length === 0 && missedMedications.length === 0 && (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#D8E2DA]">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#153A34] mb-2">
                All Health Systems Normal
              </h4>
              <p className="text-sm text-[#5B6B60] max-w-md mx-auto mb-6">
                All monitored vital readings are in safe target zones and medications are on schedule. Mitra AI will automatically notify you if any parameter requires attention.
              </p>
              <button
                type="button"
                onClick={handleSimulateHighBP}
                className="text-xs text-[#1F4E46] underline font-bold"
              >
                Want to test how alerts work? Click to simulate a test reading.
              </button>
            </div>
          )}

        </div>

        {/* Simulation & Diagnostic Testing Box for Demo / User Verification */}
        <div className="p-6 bg-white rounded-3xl border border-[#D8E2DA] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-[#1F4E46] uppercase tracking-wider block">
                Interactive Diagnostic &amp; Alert Testing Sandbox
              </span>
              <p className="text-xs text-[#5B6B60]">
                Test how the automated health alert engine analyzes vitals and dispatches caregiver warnings in real-time:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-700">Real-Time Monitor Active</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSimulateHighBP}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Simulate High BP (168/104 mmHg)</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateLowSugar}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Simulate Low Sugar (62 mg/dL)</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateNormalVitals}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Healthy Baseline (122/80 mmHg)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
