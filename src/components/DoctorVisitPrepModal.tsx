import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Stethoscope, 
  Pill, 
  Activity, 
  FileText,
  Download,
  RotateCcw,
  Clock,
  History
} from "lucide-react";
import { VitalReading, Medication, Language, DoctorVisitPrepData, Appointment } from "../types";
import { User } from "@supabase/supabase-js";
import { subscribeToAppointments } from "../services/db";

interface DoctorVisitPrepModalProps {
  currentLang: Language;
  vitals: VitalReading[];
  medications: Medication[];
  onClose: () => void;
  user: User | null;
}

export const DoctorVisitPrepModal: React.FC<DoctorVisitPrepModalProps> = ({
  currentLang,
  vitals,
  medications,
  onClose,
  user
}) => {
  const [patientName, setPatientName] = useState(user?.user_metadata?.full_name || user?.email || "Dadi / Senior Patient");
  const [age, setAge] = useState("68");
  const [chiefComplaints, setChiefComplaints] = useState("Follow-up on blood pressure, knee joint stiffness in morning, and routine medicine refill");
  const [coreConcerns, setCoreConcerns] = useState("Want to check if my blood sugar medicine dosage needs adjustment and whether I should do a bone density scan.");
  const [isLoading, setIsLoading] = useState(false);
  const [prepData, setPrepData] = useState<DoctorVisitPrepData | null>(null);
  
  const [activeTab, setActiveTab] = useState<"prep" | "history">("prep");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAppointments(user.id, (data) => {
      // Sort chronologically (newest first for history or upcoming first)
      const sorted = [...data].sort((a, b) => {
        return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
      });
      setAppointments(sorted);
    });
    return () => unsubscribe();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const bpLatest = vitals.find((v) => v.type === "bp")?.value || "120/80";
    const hrLatest = vitals.find((v) => v.type === "hr")?.value || "72";
    const sugarLatest = vitals.find((v) => v.type === "sugar")?.value || "104";

    try {
      const res = await fetch("/api/doctor-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          age,
          vitals: { bp: bpLatest, hr: hrLatest, sugar: sugarLatest },
          symptoms: chiefComplaints,
          currentMedications: medications.map((m) => `${m.name} (${m.dosage}, ${m.timing})`),
          mainConcerns: coreConcerns,
          language: currentLang,
        }),
      });

      const data = await res.json();
      setPrepData(data);
    } catch (err) {
      setPrepData({
        summaryTitle: `Doctor Consultation Brief for ${patientName}`,
        keyVitalsSnapshot: `BP: ${bpLatest} mmHg | Pulse: ${hrLatest} BPM | Sugar: ${sugarLatest} mg/dL`,
        chiefComplaints: [
          "Follow-up on blood pressure regulation and routine refill.",
          "Mild morning knee joint stiffness.",
        ],
        medicationsList: medications.map((m) => `${m.name} - ${m.dosage} (${m.timing})`),
        topQuestionsForDoctor: [
          "Are my current blood pressure and fasting sugar trends well-controlled?",
          "Are there any specific exercises or physiotherapy recommended for knee stiffness?",
          "Do any of my current daily medications have interactions or need adjustment?",
        ],
        checklist: [
          "Bring current physical medicine strips/boxes",
          "Carry previous 6 months lab reports and prescription diary",
          "Have Ayushman / Insurance health card handy",
          "Bring reading glasses and a companion to note instructions",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#D8E2DA] my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF3EA]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                Doctor Visit Preparation Planner
              </h3>
              <p className="text-xs text-[#5B6B60]">Get a ready-to-print 1-page summary for your doctor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EEF3EA] hover:bg-[#DCEAE4] flex items-center justify-center text-[#153A34] font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-[#F4F7F4] rounded-2xl mt-4 mb-2">
          <button
            onClick={() => setActiveTab("prep")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "prep" 
                ? "bg-white text-[#1F4E46] shadow-sm border border-[#D8E2DA]" 
                : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Visit Prep
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "history" 
                ? "bg-white text-[#1F4E46] shadow-sm border border-[#D8E2DA]" 
                : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
            }`}
          >
            <History className="w-4 h-4" />
            Appointment History
          </button>
        </div>

        {activeTab === "history" ? (
          <div className="pt-2 space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-600">No appointments found</p>
                <p className="text-xs text-stone-500 mt-1">Book an appointment from the Nearby Directory</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-4 bg-white border border-[#D8E2DA] rounded-2xl shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#153A34] text-sm">{appt.doctorName}</h4>
                        <p className="text-xs text-[#5B6B60]">{appt.hospital}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        appt.status === "Requested" ? "bg-amber-100 text-amber-800" :
                        appt.status === "Upcoming" ? "bg-indigo-100 text-indigo-800" :
                        appt.status === "Cancelled" ? "bg-rose-100 text-rose-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 pt-3 border-t border-[#F4F7F4]">
                      <div className="flex items-center gap-1.5 text-xs text-[#3A4E45] font-medium bg-[#F8FAF8] px-2.5 py-1.5 rounded-lg border border-[#EEF3EA]">
                        <Calendar className="w-3.5 h-3.5 text-[#1F4E46]" />
                        {appt.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#3A4E45] font-medium bg-[#F8FAF8] px-2.5 py-1.5 rounded-lg border border-[#EEF3EA]">
                        <Clock className="w-3.5 h-3.5 text-[#1F4E46]" />
                        {appt.time}
                      </div>
                    </div>
                    {appt.reason && (
                      <p className="text-xs text-stone-600 mt-1 italic">
                        " {appt.reason} "
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          !prepData ? (
            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1F4E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35483F] uppercase mb-1">
                  Age
                </label>
                <input
                  type="text"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1F4E46]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-1">
                Chief Symptoms &amp; Reasons for Visit
              </label>
              <textarea
                rows={2}
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full p-3 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-1">
                What Questions or Concerns are Top of Mind?
              </label>
              <textarea
                rows={2}
                value={coreConcerns}
                onChange={(e) => setCoreConcerns(e.target.value)}
                className="w-full p-3 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <div className="p-3 bg-[#EEF3EA] rounded-xl text-xs text-[#1F4E46] flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              <span>
                Includes your logged vitals and {medications.length} active medications automatically.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1F4E46] hover:bg-[#153A34] text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating Doctor Prep Sheet with Gemini...</span>
                </>
              ) : (
                <>
                  <span>Generate Printable Doctor Prep Summary</span>
                  <FileText className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Ready Summary Sheet View */
          <div className="pt-4 space-y-4">
            <div className="p-5 bg-[#F4F7F4] rounded-2xl border border-[#D8E2DA] text-[#22312B] space-y-4 print:border-none print:p-0">
              <div className="border-b border-[#D8E2DA] pb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#153A34]">
                    {prepData.summaryTitle}
                  </h4>
                  <p className="text-xs text-[#5B6B60]">
                    Generated via Apna Mitra AI Health Companion • Date: {new Date().toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#DCEAE4] text-[#1F4E46] rounded-full">
                  Doctor Brief
                </span>
              </div>

              {/* Vitals Snapshot */}
              <div>
                <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-1">
                  🩺 Vitals Snapshot
                </span>
                <p className="text-xs font-mono font-medium text-[#153A34] bg-white p-2.5 rounded-xl border border-[#D8E2DA]">
                  {prepData.keyVitalsSnapshot}
                </p>
              </div>

              {/* Chief complaints */}
              <div>
                <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-1">
                  📝 Symptoms &amp; Reason for Visit
                </span>
                <ul className="text-xs text-[#3A4E45] space-y-1 pl-4 list-disc bg-white p-3 rounded-xl border border-[#D8E2DA]">
                  {prepData.chiefComplaints?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Medications */}
              <div>
                <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-1">
                  💊 Current Active Medications
                </span>
                <div className="bg-white p-3 rounded-xl border border-[#D8E2DA] flex flex-wrap gap-2 text-xs">
                  {prepData.medicationsList?.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#EEF3EA] text-[#1F4E46] rounded-lg font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Questions */}
              <div>
                <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-1">
                  ❓ High-Priority Questions for Doctor
                </span>
                <ul className="text-xs text-[#153A34] font-medium space-y-1.5 pl-4 list-decimal bg-[#DCEAE4]/50 p-3 rounded-xl border border-[#B4C6BB]">
                  {prepData.topQuestionsForDoctor?.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* Checklist */}
              <div>
                <span className="text-xs font-bold text-[#35483F] uppercase tracking-wider block mb-1">
                  🎒 What to Bring to Clinic
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#4A5D54]">
                  {prepData.checklist?.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#D8E2DA]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F4E46] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setPrepData(null)}
                className="px-4 py-3 bg-[#EEF3EA] text-[#1F4E46] font-semibold text-sm rounded-xl hover:bg-[#DCEAE4] flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};
