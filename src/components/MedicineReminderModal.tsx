import React, { useState } from "react";
import { 
  Pill, 
  Plus, 
  Check, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Trash2, 
  Bell,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import confetti from "canvas-confetti";
import { Medication, Language } from "../types";

interface MedicineReminderModalProps {
  currentLang: Language;
  medications: Medication[];
  onToggleMedication: (id: string) => void;
  onAddMedication: (med: Omit<Medication, "id" | "takenToday">) => void;
  onDeleteMedication: (id: string) => void;
  onClose: () => void;
}

export const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({
  currentLang,
  medications,
  onToggleMedication,
  onAddMedication,
  onDeleteMedication,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState<Medication["timing"]>("Morning");
  const [scheduledTime, setScheduledTime] = useState("");
  const [instructions, setInstructions] = useState("After Food");

  const takenCount = medications.filter((m) => m.takenToday).length;
  const totalCount = medications.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleToggle = (id: string, currentState: boolean) => {
    onToggleMedication(id);
    if (!currentState) {
      // Fire celebratory confetti when medication is taken
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMedication({
      name: name.trim(),
      dosage: dosage.trim() || "1 tablet",
      timing,
      instructions: instructions.trim() || "As directed by physician",
      scheduledTime: scheduledTime || undefined,
    });

    setName("");
    setDosage("");
    setScheduledTime("");
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E4E0] my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F5F4]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                Medicine Reminder &amp; Schedule
              </h3>
              <p className="text-xs text-[#5B6B60]">Track prescribed doses and maintain daily adherence</p>
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

        {/* Adherence summary banner */}
        <div className="my-5 p-4 bg-gradient-to-r from-[#DCEAE4] to-[#F3F5F4] rounded-2xl border border-[#B4C6BB] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#1F4E46] uppercase tracking-wider block">
              Today's Adherence
            </span>
            <div className="text-xl font-bold text-[#153A34] font-serif">
              {takenCount} of {totalCount} doses taken ({progressPercent}%)
            </div>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-[#1F4E46] bg-white flex items-center justify-center text-xs font-bold text-[#1F4E46]">
            {progressPercent}%
          </div>
        </div>

        {/* Medication List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                med.takenToday
                  ? "bg-[#FAFAFA] border-emerald-300 opacity-90"
                  : "bg-white border-[#E2E4E0] shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(med.id, med.takenToday)}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition mt-0.5 ${
                    med.takenToday
                      ? "bg-emerald-600 border-emerald-700 text-white"
                      : "bg-white border-[#B4C6BB] text-transparent hover:border-[#1F4E46]"
                  }`}
                  title={med.takenToday ? "Mark as not taken" : "Mark as taken"}
                >
                  <Check className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${med.takenToday ? "line-through text-[#5B6B60]" : "text-[#153A34]"}`}>
                      {med.name}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[#F3F5F4] text-[#1F4E46] rounded-full">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B60] mt-1">
                    <span className="flex items-center gap-1 font-medium text-[#1F4E46]">
                      <Clock className="w-3 h-3" />
                      {med.timing}
                      {med.scheduledTime && ` (${med.scheduledTime})`}
                    </span>
                    <span>•</span>
                    <span>{med.instructions}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteMedication(med.id)}
                className="p-1.5 text-[#A0B0A5] hover:text-rose-600 transition"
                title="Delete medicine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {medications.length === 0 && (
            <div className="p-6 text-center text-xs text-[#5B6B60] bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E2E4E0]">
              No medications added yet. Click &quot;Add New Medicine&quot; below to setup reminders.
            </div>
          )}
        </div>

        {/* Add New Form */}
        {showAddForm ? (
          <form onSubmit={handleAddMed} className="mt-5 p-4 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-[#153A34] uppercase tracking-wider">
                Add Prescription Medicine
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#5B6B60] hover:text-[#153A34]"
              >
                Cancel
              </button>
            </div>

            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Medicine Name (e.g. Amlodipine, Metformin, Shelcal)"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1F4E46]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage (e.g. 5mg, 1 tablet)"
                  className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none"
                >
                  <option value="Morning">Morning (Breakfast)</option>
                  <option value="Afternoon">Afternoon (Lunch)</option>
                  <option value="Evening">Evening (Tea time)</option>
                  <option value="Night">Night (Bedtime)</option>
                </select>
              </div>
            </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[#5B6B60] uppercase pl-1">Scheduled Time (Optional)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none mb-1"
                />
              </div>

            <div>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions (e.g. After Food with warm water)"
                className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1F4E46] text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-[#153A34] transition"
            >
              Save Medicine
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full mt-4 py-3 bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] font-semibold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 border border-[#B4C6BB] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex justify-between items-center text-[11px] text-[#5B6B60]">
          <span>🔔 Reminders will chime at scheduled hours</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#1F4E46] hover:underline"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
