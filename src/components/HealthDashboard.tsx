import React, { useState } from "react";
import { 
  Activity, 
  Heart, 
  Droplet, 
  Scale, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileDown,
  Sparkles,
  Calendar
} from "lucide-react";
import { VitalReading, Language } from "../types";
import { translations } from "../data/translations";

interface HealthDashboardProps {
  currentLang: Language;
  vitals: VitalReading[];
  onAddVital: (reading: Omit<VitalReading, "id" | "timestamp">) => void;
  onOpenCheckin: () => void;
  streakCount: number;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  currentLang,
  vitals,
  onAddVital,
  onOpenCheckin,
  streakCount,
}) => {
  const t = translations[currentLang];
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeType, setActiveType] = useState<"bp" | "hr" | "spo2" | "sugar" | "weight">("bp");
  const [inputValue, setInputValue] = useState("");
  const [inputNote, setInputNote] = useState("");

  // Get most recent reading for each type
  const getLatest = (type: "bp" | "hr" | "spo2" | "sugar" | "weight", fallbackVal: string, fallbackUnit: string) => {
    const found = vitals.find((v) => v.type === type);
    return found ? { value: found.value, unit: found.unit, timestamp: found.timestamp, status: found.status } : { value: fallbackVal, unit: fallbackUnit, timestamp: "Today", status: "normal" as const };
  };

  const bp = getLatest("bp", "120/80", "mmHg");
  const hr = getLatest("hr", "72", "BPM");
  const spo2 = getLatest("spo2", "98", "%");
  const weight = getLatest("weight", "68", "kg");
  const sugar = getLatest("sugar", "104", "mg/dL");

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let unit = "mmHg";
    let status: "normal" | "warning" | "alert" = "normal";

    if (activeType === "hr") unit = "BPM";
    if (activeType === "spo2") unit = "%";
    if (activeType === "sugar") unit = "mg/dL";
    if (activeType === "weight") unit = "kg";

    // Simple status calculation
    if (activeType === "bp") {
      const parts = inputValue.split("/");
      const sys = parseInt(parts[0], 10);
      if (sys > 140) status = "warning";
      if (sys > 160) status = "alert";
    } else if (activeType === "spo2") {
      const num = parseInt(inputValue, 10);
      if (num < 95) status = "warning";
      if (num < 90) status = "alert";
    }

    onAddVital({
      type: activeType,
      value: inputValue.trim(),
      unit,
      status,
      note: inputNote.trim() || undefined,
    });

    setInputValue("");
    setInputNote("");
    setShowLogModal(false);
  };

  return (
    <section id="health" className="py-16 md:py-24 bg-[#EEF3EA]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-block mb-3">
              My Health Dashboard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-3">
              {t.healthDashboardTitle}
            </h2>
            <p className="text-base text-[#5B6B60] max-w-2xl">
              {t.healthDashboardSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Wellbeing checkin button with streak */}
            <button
              type="button"
              onClick={onOpenCheckin}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#E8A33D] hover:bg-[#d8932d] text-white font-semibold text-sm rounded-2xl shadow-sm transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Check-in ({streakCount}/7 Days)</span>
            </button>

            {/* Log new reading */}
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white font-semibold text-sm rounded-2xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Reading</span>
            </button>
          </div>
        </div>

        {/* 5 Core Vitals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          
          {/* Blood Pressure */}
          <article className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Pressure</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
              {bp.value}
            </div>
            <div className="text-xs text-[#5B6B60] mt-1">{bp.unit}</div>
            <div className="mt-4 pt-3 border-t border-[#EEF3EA] flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Recent reading
              </span>
              <span className="text-[11px] text-[#7A8B80]">Optimal</span>
            </div>
          </article>

          {/* Heart Rate */}
          <article className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#1F4E46] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
              {hr.value}{" "}
              <span className="text-sm font-normal text-[#5B6B60]">{hr.unit}</span>
            </div>
            <div className="text-xs text-[#5B6B60] mt-1">Resting Pulse</div>
            <div className="mt-4 pt-3 border-t border-[#EEF3EA] flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Normal
              </span>
              <span className="text-[11px] text-[#7A8B80]">60-100 BPM</span>
            </div>
          </article>

          {/* SpO2 */}
          <article className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Oxygen</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
              {spo2.value}{spo2.unit}
            </div>
            <div className="text-xs text-[#5B6B60] mt-1">SpO₂ Oxygen Saturation</div>
            <div className="mt-4 pt-3 border-t border-[#EEF3EA] flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Healthy
              </span>
              <span className="text-[11px] text-[#7A8B80]">&gt; 95%</span>
            </div>
          </article>

          {/* Blood Glucose */}
          <article className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Glucose</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
              {sugar.value}{" "}
              <span className="text-xs font-normal text-[#5B6B60]">{sugar.unit}</span>
            </div>
            <div className="text-xs text-[#5B6B60] mt-1">Fasting Reading</div>
            <div className="mt-4 pt-3 border-t border-[#EEF3EA] flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Controlled
              </span>
              <span className="text-[11px] text-[#7A8B80]">70-110</span>
            </div>
          </article>

          {/* Weight */}
          <article className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Body Weight</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
              {weight.value}{" "}
              <span className="text-sm font-normal text-[#5B6B60]">{weight.unit}</span>
            </div>
            <div className="text-xs text-[#5B6B60] mt-1">BMI ~ 22.4 (Normal)</div>
            <div className="mt-4 pt-3 border-t border-[#EEF3EA] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#1F4E46] bg-[#DCEAE4] px-2 py-0.5 rounded-full">
                ● Stable
              </span>
              <span className="text-[11px] text-[#7A8B80]">Weekly</span>
            </div>
          </article>

        </div>

        {/* History / Recent logs table */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D8E2DA] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg font-bold text-[#153A34] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1F4E46]" />
              Recent Measurement Logs
            </h3>
            <span className="text-xs text-[#5B6B60]">
              Showing {vitals.length} recorded entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#22312B]">
              <thead className="bg-[#F4F7F4] text-xs uppercase font-semibold text-[#5B6B60] border-y border-[#D8E2DA]">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Reading</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3EA]">
                {vitals.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F4F7F4]/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#153A34] capitalize">
                      {v.type === "bp" ? "Blood Pressure" : v.type === "hr" ? "Heart Rate" : v.type === "spo2" ? "Blood Oxygen" : v.type === "sugar" ? "Blood Glucose" : "Body Weight"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {v.value} {v.unit}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5B6B60]">
                      {new Date(v.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        v.status === "normal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : v.status === "warning"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {v.status === "normal" ? "Normal" : v.status === "warning" ? "Borderline" : "Action Needed"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5B6B60]">
                      {v.note || "Routine record"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal to Log Vital */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D8E2DA] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EEF3EA]">
              <h3 className="font-serif text-xl font-bold text-[#153A34]">Log New Health Reading</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="text-[#5B6B60] hover:text-[#153A34] text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-2">
                  Select Vital Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "bp", label: "Blood Pressure" },
                    { type: "hr", label: "Heart Rate" },
                    { type: "spo2", label: "SpO₂" },
                    { type: "sugar", label: "Sugar" },
                    { type: "weight", label: "Weight" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setActiveType(item.type as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        activeType === item.type
                          ? "bg-[#1F4E46] text-white border-[#1F4E46]"
                          : "bg-[#F4F7F4] text-[#5B6B60] border-[#D8E2DA] hover:bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">
                  {activeType === "bp"
                    ? "Reading (e.g. 120/80)"
                    : activeType === "hr"
                    ? "Heart Rate (BPM, e.g. 72)"
                    : activeType === "spo2"
                    ? "SpO₂ Percentage (e.g. 98)"
                    : activeType === "sugar"
                    ? "Blood Sugar (mg/dL, e.g. 110)"
                    : "Weight (kg, e.g. 68.5)"}
                </label>
                <input
                  type="text"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={activeType === "bp" ? "120/80" : activeType === "hr" ? "72" : activeType === "spo2" ? "98" : activeType === "sugar" ? "110" : "68.5"}
                  className="w-full px-4 py-3 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">
                  Context / Note (Optional)
                </label>
                <input
                  type="text"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="e.g. Morning before medicine, after 10 min rest"
                  className="w-full px-4 py-2.5 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 text-sm font-semibold text-[#5B6B60] bg-[#EEF3EA] hover:bg-[#E2ECE5] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-semibold text-white bg-[#1F4E46] hover:bg-[#153A34] rounded-xl shadow-sm transition"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
