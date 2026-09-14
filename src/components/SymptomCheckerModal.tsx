import React, { useState } from "react";
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Calendar,
  ShieldAlert
} from "lucide-react";
import { Language, SymptomAssessmentResult, HealthCheck } from "../types";
import { User } from "@supabase/supabase-js";
import { saveHealthCheck } from "../services/db";

interface SymptomCheckerModalProps {
  user: User | null;
  currentLang: Language;
  onClose: () => void;
  onOpenEmergency: () => void;
}

export const SymptomCheckerModal: React.FC<SymptomCheckerModalProps> = ({ user,
  currentLang,
  onClose,
  onOpenEmergency,
}) => {
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("2-3 days");
  const [severity, setSeverity] = useState<number>(4);
  const [ageGroup, setAgeGroup] = useState("Senior (60+ years)");
  const [existingConditions, setExistingConditions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomAssessmentResult | null>(null);

  const commonConditions = [
    "Hypertension (High BP)",
    "Diabetes (Type 2)",
    "Joint Arthritis",
    "Heart Disease",
    "Asthma / Respiratory",
  ];

  const handleToggleCondition = (cond: string) => {
    setExistingConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: `${symptoms}. Existing history: ${existingConditions.join(", ") || "None"}`,
          duration,
          severity,
          ageGroup,
          language: currentLang,
        }),
      });


      const data = await res.json();
      setResult(data);
      
      if (user) {
        try {
          const hc: HealthCheck = {
            id: "", // will be set in db
            symptoms: `${symptoms}. Existing history: ${existingConditions.join(", ") || "None"}`,
            duration,
            severity: severity.toString(),
            summary: data.summary,
            urgency: data.triage_level,
            urgencyColor: data.triage_level.includes("Emergency") ? "rose" : data.triage_level.includes("Moderate") ? "amber" : "emerald",
            careTips: data.care_recommendations,
            redFlagWarnings: data.red_flags,
            recommendedSpecialties: data.doctor_questions
          };
          await saveHealthCheck(user.id, hc);
        } catch (e) {
          console.error("Failed to save health check", e);
        }
      }

    } catch (err) {
      setResult({
        summary: "An error occurred while connecting to the medical AI. Please ensure you are connected to the internet and try again.",
        triage_level: "Mild / Routine",
        care_recommendations: ["Rest", "Drink fluids", "Seek medical attention if symptoms worsen."],
        doctor_questions: ["What could be causing these symptoms?", "Should I come in for a checkup?"],
        red_flags: ["Sudden chest tightness or shortness of breath", "Sudden confusion or one-sided facial drooping"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickSymptoms = [
    "Mild joint ache and stiffness in knees in the morning",
    "Occasional dizziness when standing up quickly",
    "Persistent dry cough for 3 days with mild fatigue",
    "Difficulty sleeping and slight headache after screen use",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E4E0] my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F5F4]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#1F4E46] border border-teal-200 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                Mitra AI Symptom Checker
              </h3>
              <p className="text-xs text-[#5B6B60]">Safe triage guidance & doctor question generator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F3F5F4] hover:bg-[#DCEAE4] flex items-center justify-center text-[#153A34] font-bold"
          >
            ✕
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleAssess} className="space-y-5 pt-4">
            
            {/* Quick symptom presets */}
            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-2">
                Describe What You Are Feeling
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {quickSymptoms.map((qs, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSymptoms(qs)}
                    className="text-[11px] bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] px-3 py-1 rounded-xl transition text-left"
                  >
                    + {qs}
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Mild headache and knee stiffness for 2 days, worse in morning..."
                className="w-full p-3.5 bg-[#FAFAFA] border border-[#E2E4E0] rounded-2xl text-sm focus:bg-white focus:border-[#1F4E46] focus:outline-none"
              />
            </div>

            {/* Duration and Age group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">
                  Duration of Symptoms
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-sm text-[#22312B] focus:bg-white focus:outline-none"
                >
                  <option value="Today (Less than 24 hours)">Today (&lt; 24 hours)</option>
                  <option value="2-3 days">2 - 3 days</option>
                  <option value="1 week">About 1 week</option>
                  <option value="More than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1.5">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E2E4E0] rounded-xl text-sm text-[#22312B] focus:bg-white focus:outline-none"
                >
                  <option value="Senior (60+ years)">Senior Citizen (60+ yrs)</option>
                  <option value="Adult (18-59 years)">Adult (18 - 59 yrs)</option>
                  <option value="Child / Adolescent">Child / Adolescent</option>
                </select>
              </div>
            </div>

            {/* Severity scale slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#35483F] uppercase">
                  Discomfort / Severity Level: <span className="text-[#1F4E46] font-bold">{severity}/10</span>
                </label>
                <span className="text-xs text-[#5B6B60]">
                  {severity <= 3 ? "Mild" : severity <= 6 ? "Moderate" : "Severe"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-[#1F4E46] h-2 bg-[#E2E4E0] rounded-lg cursor-pointer"
              />
            </div>

            {/* Existing conditions checkboxes */}
            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-2">
                Known Ongoing Conditions (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonConditions.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleToggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      existingConditions.includes(cond)
                        ? "bg-[#1F4E46] text-white border-[#1F4E46]"
                        : "bg-[#FAFAFA] text-[#5B6B60] border-[#E2E4E0] hover:bg-white"
                    }`}
                  >
                    {existingConditions.includes(cond) ? "✓ " : "+ "}
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="w-full py-3.5 bg-[#1F4E46] hover:bg-[#153A34] disabled:opacity-50 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Analyzing Symptoms with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span>Get Safe Assessment & Doctor Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Results View */
          <div className="pt-4 space-y-5">
            {/* Urgency Badge */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              result.triage_level.toLowerCase().includes("emergency") || result.triage_level.toLowerCase().includes("urgent")
                ? "bg-rose-50 border-rose-300 text-rose-900"
                : result.triage_level.toLowerCase().includes("schedule doctor") || result.triage_level.toLowerCase().includes("moderate")
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Recommended Action Timeframe</span>
                <span className="text-base font-bold font-serif">{result.triage_level}</span>
              </div>
              {(result.triage_level.toLowerCase().includes("emergency") || result.triage_level.toLowerCase().includes("urgent")) && (
                <button
                  onClick={onOpenEmergency}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Call 112 Now
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0]">
              <h4 className="font-bold text-sm text-[#153A34] mb-1">Assessment Overview</h4>
              <p className="text-xs sm:text-sm text-[#3A4E45] leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Comfort & Safe Home Care */}
            <div className="p-4 bg-white rounded-2xl border border-[#E2E4E0]">
              <h5 className="font-bold text-xs text-[#153A34] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Comfort & Safe Home Care
              </h5>
              <ul className="text-xs text-[#4A5D54] space-y-1.5 pl-4 list-disc">
                {result.care_recommendations?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Questions to ask doctor */}
            <div className="p-4 bg-[#DCEAE4]/60 rounded-2xl border border-[#B4C6BB]">
              <h5 className="font-bold text-xs text-[#153A34] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#1F4E46]" />
                Useful Questions to Ask Your Doctor
              </h5>
              <ul className="text-xs text-[#153A34] space-y-1.5 pl-4 list-disc font-medium">
                {result.doctor_questions?.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>

            {/* Red flags */}
            {result.red_flags && result.red_flags.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Red Flag Symptoms Requiring Immediate Emergency:
                </span>
                <p className="text-xs text-rose-700">
                  {result.red_flags.join(" • ")}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="flex-1 py-3 text-sm font-semibold text-[#1F4E46] bg-[#F3F5F4] hover:bg-[#DCEAE4] rounded-xl flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Check Another Symptom
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-semibold text-white bg-[#1F4E46] hover:bg-[#153A34] rounded-xl"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
