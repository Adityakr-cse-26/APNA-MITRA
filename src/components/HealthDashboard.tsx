import React, { useState } from "react";
import { 
  Activity, 
  Heart, 
  Droplet, 
  Scale, 
  Plus, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { VitalReading, Language } from "../types";
import { translations } from "../data/translations";
import { BloodDrop3D, Heart3D, Lungs3D, Sugar3D, Scale3D } from "./VitalIcons3D";
import { calculateVitalStatus, getStatusLabel, getStatusColors, formatDateTime } from "../utils/healthCalculations";

interface HealthDashboardProps {
  currentLang: Language;
  vitals: VitalReading[];
  vitalsError?: string | null;
  onAddVital: (reading: Omit<VitalReading, "id" | "timestamp">) => Promise<void> | void;
  onOpenCheckin: () => void;
  streakCount: number;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  currentLang,
  vitals,
  vitalsError,
  onAddVital,
  onOpenCheckin,
  streakCount,
}) => {
  const t = translations[currentLang];
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeType, setActiveType] = useState<"bp" | "hr" | "spo2" | "sugar" | "weight">("bp");
  const [formState, setFormState] = useState({
    bpSys: "",
    bpDia: "",
    hr: "",
    spo2: "",
    sugar: "",
    sugarType: "Fasting",
    weight: ""
  });
  const [error, setError] = useState<string | null>(null);

  // Get most recent reading for each type
  const getLatest = (type: "bp" | "hr" | "spo2" | "sugar" | "weight") => {
    // Vitals array is already sorted descending by timestamp in App.tsx
    const found = vitals.find((v) => v.type === type);
    return found;
  };

  const bp = getLatest("bp");
  const hr = getLatest("hr");
  const spo2 = getLatest("spo2");
  const weight = getLatest("weight");
  const sugar = getLatest("sugar");

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    let savedAny = false;
    let localError = null;
    
    // Check BP first
    const bpSys = formState.bpSys.trim();
    const bpDia = formState.bpDia.trim();
    if (bpSys || bpDia) {
      let bpVal = "";
      if (bpSys && bpDia) {
        bpVal = `${bpSys}/${bpDia}`;
      } else if (bpSys) {
        bpVal = bpSys + "/";
      } else {
        bpVal = `/${bpDia}`;
      }
      
      const status = calculateVitalStatus("bp", bpVal);
      const res = onAddVital({
        type: "bp",
        value: bpVal,
        systolic: bpSys ? parseInt(bpSys, 10) : undefined,
        diastolic: bpDia ? parseInt(bpDia, 10) : undefined,
        unit: "mmHg",
        status,
        note: undefined
      });
      if (res && typeof res.then === 'function') {
        await res;
      }
      savedAny = true;
    }
    
    const keys = [
      { key: "hr", unit: "BPM" },
      { key: "spo2", unit: "%" },
      { key: "sugar", unit: "mg/dL" },
      { key: "weight", unit: "kg" }
    ] as const;
    
    for (const { key, unit } of keys) {
      const val = formState[key as keyof typeof formState]?.trim();
      if (val) {
        let note = undefined;
        let status = "";
        let test_type = undefined;
        if (key === "sugar") {
          test_type = formState.sugarType;
          note = formState.sugarType;
          status = calculateVitalStatus(key, val, note);
        } else {
          status = calculateVitalStatus(key, val);
        }
        
        const res = onAddVital({
          type: key as any,
          value: val,
          unit,
          status,
          note,
          test_type
        });
        if (res && typeof res.then === 'function') {
          await res;
        }
        savedAny = true;
      }
    }
    
    if (savedAny) {
      setFormState({ bpSys: "", bpDia: "", hr: "", spo2: "", sugar: "", sugarType: "Fasting", weight: "" });
      setShowLogModal(false);
      setError(null);
    } else {
      setError("Please enter at least one reading.");
    }
  };

  const renderStatusPill = (status: "normal" | "warning" | "alert" | "unknown" | string) => {
    if (!status) return null;
    const colors = getStatusColors(status as any);
    const label = getStatusLabel(status as any);
    
    return (
      <span className={`text-[11px] font-medium ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full flex items-center gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
        {label}
      </span>
    );
  };

  return (
    <section id="health" className="py-16 md:py-24 bg-[#F3F5F4]/70">
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
          <article className="health-card-3d flex flex-col justify-between p-6">
            <BloodDrop3D className="vital-3d-icon" />
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Pressure</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            {bp ? (
                            <>
                <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
                  {bp.value?.startsWith("/") ? `Diastolic: ${bp.value.substring(1)}` : bp.value?.endsWith("/") ? `Systolic: ${bp.value.substring(0, bp.value.length - 1)}` : bp.value} <span className="text-sm font-normal text-[#5B6B60]">{bp.unit}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(bp.status)}
                    {bp.type === 'sugar' && bp.note && (
                      <span className="text-xs text-[#5B6B60] font-medium">({bp.note})</span>
                    )}
                  </div>
                  
                  {/* Warnings */}
                  {bp.type === 'bp' && bp.status === 'Critical - seek immediate medical attention' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Very high blood pressure. Seek immediate medical attention.
                    </div>
                  )}
                  {bp.type === 'spo2' && bp.status === 'Critical' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Critically low oxygen saturation. Seek prompt medical attention.
                    </div>
                  )}
                  
                  <div className="text-[11px] text-[#7A8B80] mt-1">
                    {formatDateTime(bp.timestamp)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-[#7A8B80]">No reading</div>
            )}
          </article>

          {/* Heart Rate */}
          <article className="health-card-3d flex flex-col justify-between p-6">
            <Heart3D className="vital-3d-icon" />
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#1F4E46] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            {hr ? (
              <>
                <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
                  {hr.value} <span className="text-sm font-normal text-[#5B6B60]">{hr.unit}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(hr.status)}
                    {hr.type === 'sugar' && hr.note && (
                      <span className="text-xs text-[#5B6B60] font-medium">({hr.note})</span>
                    )}
                  </div>
                  
                  {/* Warnings */}
                  {hr.type === 'bp' && hr.status === 'Critical - seek immediate medical attention' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Very high blood pressure. Seek immediate medical attention.
                    </div>
                  )}
                  {hr.type === 'spo2' && hr.status === 'Critical' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Critically low oxygen saturation. Seek prompt medical attention.
                    </div>
                  )}
                  
                  <div className="text-[11px] text-[#7A8B80] mt-1">
                    {formatDateTime(hr.timestamp)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-[#7A8B80]">No reading</div>
            )}
          </article>

          {/* Blood Oxygen */}
          <article className="health-card-3d flex flex-col justify-between p-6">
            <Lungs3D className="vital-3d-icon" />
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Oxygen</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            {spo2 ? (
              <>
                <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
                  {spo2.value} <span className="text-sm font-normal text-[#5B6B60]">{spo2.unit}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(spo2.status)}
                    {spo2.type === 'sugar' && spo2.note && (
                      <span className="text-xs text-[#5B6B60] font-medium">({spo2.note})</span>
                    )}
                  </div>
                  
                  {/* Warnings */}
                  {spo2.type === 'bp' && spo2.status === 'Critical - seek immediate medical attention' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Very high blood pressure. Seek immediate medical attention.
                    </div>
                  )}
                  {spo2.type === 'spo2' && spo2.status === 'Critical' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Critically low oxygen saturation. Seek prompt medical attention.
                    </div>
                  )}
                  
                  <div className="text-[11px] text-[#7A8B80] mt-1">
                    {formatDateTime(spo2.timestamp)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-[#7A8B80]">No reading</div>
            )}
          </article>

          {/* Blood Glucose */}
          <article className="health-card-3d flex flex-col justify-between p-6">
            <Sugar3D className="vital-3d-icon" />
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Blood Glucose</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            {sugar ? (
              <>
                <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
                  {sugar.value} <span className="text-sm font-normal text-[#5B6B60]">{sugar.unit}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(sugar.status)}
                    {sugar.type === 'sugar' && sugar.note && (
                      <span className="text-xs text-[#5B6B60] font-medium">({sugar.note})</span>
                    )}
                  </div>
                  
                  {/* Warnings */}
                  {sugar.type === 'bp' && sugar.status === 'Critical - seek immediate medical attention' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Very high blood pressure. Seek immediate medical attention.
                    </div>
                  )}
                  {sugar.type === 'spo2' && sugar.status === 'Critical' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Critically low oxygen saturation. Seek prompt medical attention.
                    </div>
                  )}
                  
                  <div className="text-[11px] text-[#7A8B80] mt-1">
                    {formatDateTime(sugar.timestamp)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-[#7A8B80]">No reading</div>
            )}
          </article>

          {/* Body Weight */}
          <article className="health-card-3d flex flex-col justify-between p-6">
            <Scale3D className="vital-3d-icon" />
            <div className="flex items-center justify-between text-[#5B6B60] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Body Weight</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            {weight ? (
              <>
                <div className="text-3xl font-bold text-[#153A34] tracking-tight font-serif">
                  {weight.value} <span className="text-sm font-normal text-[#5B6B60]">{weight.unit}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusPill(weight.status)}
                    {weight.type === 'sugar' && weight.note && (
                      <span className="text-xs text-[#5B6B60] font-medium">({weight.note})</span>
                    )}
                  </div>
                  
                  {/* Warnings */}
                  {weight.type === 'bp' && weight.status === 'Critical - seek immediate medical attention' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Very high blood pressure. Seek immediate medical attention.
                    </div>
                  )}
                  {weight.type === 'spo2' && weight.status === 'Critical' && (
                    <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-md">
                      Critically low oxygen saturation. Seek prompt medical attention.
                    </div>
                  )}
                  
                  <div className="text-[11px] text-[#7A8B80] mt-1">
                    {formatDateTime(weight.timestamp)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-[#7A8B80]">No reading</div>
            )}
          </article>
        

        </div>

        {/* History / Recent logs table */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E4E0] shadow-sm">
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
              <thead className="bg-[#FAFAFA] text-xs uppercase font-semibold text-[#5B6B60] border-y border-[#E2E4E0]">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4">Reading</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F5F4]">
                {vitals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5B6B60]">
                      No medical readings have been recorded yet.
                    </td>
                  </tr>
                ) : null}
                {vitals.map((v) => {
                  const colors = getStatusColors(v.status as any);
                  const label = getStatusLabel(v.status as any);
                  return (
                    <tr key={v.id} className="hover:bg-[#FAFAFA]/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-[#153A34] capitalize">
                        {v.type === "bp" ? "Blood Pressure" : v.type === "hr" ? "Heart Rate" : v.type === "spo2" ? "Blood Oxygen" : v.type === "sugar" ? "Blood Glucose" : "Body Weight"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {v.value} {v.unit}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5B6B60]">
                        {formatDateTime(v.timestamp)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}>
                          {label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#5B6B60]">
                        {v.note || "Routine record"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal to Log Vital */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E4E0] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F3F5F4]">
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
              {error && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-sm flex items-start gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">Blood Pressure (mmHg)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formState.bpSys}
                      onChange={(e) => setFormState({...formState, bpSys: e.target.value})}
                      placeholder="Systolic (e.g. 120)"
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                    />
                    <span className="text-[#5B6B60] font-bold text-lg">/</span>
                    <input
                      type="text"
                      value={formState.bpDia}
                      onChange={(e) => setFormState({...formState, bpDia: e.target.value})}
                      placeholder="Diastolic (e.g. 80)"
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">Heart Rate (BPM)</label>
                  <input
                    type="text"
                    value={formState.hr}
                    onChange={(e) => setFormState({...formState, hr: e.target.value})}
                    placeholder="Enter Heart Rate"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">SpO₂ Percentage (%)</label>
                  <input
                    type="text"
                    value={formState.spo2}
                    onChange={(e) => setFormState({...formState, spo2: e.target.value})}
                    placeholder="Enter Blood Oxygen"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">Blood Sugar (mg/dL)</label>
                  <input
                    type="text"
                    value={formState.sugar}
                    onChange={(e) => setFormState({...formState, sugar: e.target.value})}
                    placeholder="Enter Blood Sugar"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none mb-2"
                  />
                  <select
                    value={formState.sugarType}
                    onChange={(e) => setFormState({...formState, sugarType: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                  >
                    <option value="Fasting">Fasting</option>
                    <option value="After Meal">After Meal</option>
                    <option value="Random">Random</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">Weight (kg)</label>
                  <input
                    type="text"
                    value={formState.weight}
                    onChange={(e) => setFormState({...formState, weight: e.target.value})}
                    placeholder="Enter Body Weight"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-[#22312B] focus:bg-white focus:border-[#1F4E46] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 text-sm font-semibold text-[#5B6B60] bg-[#F3F5F4] hover:bg-[#E2ECE5] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-semibold text-white bg-[#1F4E46] hover:bg-[#153A34] rounded-xl shadow-sm transition"
                >
                  Save Readings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
