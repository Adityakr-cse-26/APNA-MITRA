import React, { useState } from "react";
import { 
  Heart, 
  Smile, 
  Check, 
  Calendar, 
  Flame, 
  Sparkles, 
  Clock,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { DailyCheckin, Language } from "../types";
import { translations } from "../data/translations";

interface DailyCheckinModalProps {
  currentLang: Language;
  checkins: DailyCheckin[];
  onSaveCheckin: (checkin: Omit<DailyCheckin, "id">) => void;
  onClose: () => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  currentLang,
  checkins,
  onSaveCheckin,
  onClose,
}) => {
  const t = translations[currentLang];
  const [selectedMood, setSelectedMood] = useState<DailyCheckin["mood"]>("good");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const moodOptions: { mood: DailyCheckin["mood"]; emoji: string; label: string }[] = [
    { mood: "great", emoji: "😄", label: "Great" },
    { mood: "good", emoji: "🙂", label: "Good" },
    { mood: "okay", emoji: "😐", label: "Okay" },
    { mood: "low", emoji: "😕", label: "Low" },
    { mood: "sad", emoji: "😔", label: "Difficult" },
  ];

  const symptomChecklist = currentLang === "hi" ? [
    "शरीर या जोड़ों में दर्द (Body ache / joint pain)",
    "रात को नींद में परेशानी (Trouble sleeping)",
    "अकेलापन या उदासी (Felt lonely or low)",
    "कुछ ज़रूरी बात भूल गए (Forgot something important)",
    "आज परिवार या मित्र से बात हुई (Spoke with family today)",
  ] : currentLang === "bn" ? [
    "শরীর বা জয়েন্টে ব্যথা (Body ache / joint pain)",
    "ঘুমে সমস্যা (Trouble sleeping)",
    "একাকীত্ব বা মন খারাপ (Felt lonely or low)",
    "গুরুত্বপূর্ণ কিছু ভুলে গেছেন (Forgot something important)",
    "আজ পরিবারের সাথে কথা হয়েছে (Spoke with family today)",
  ] : [
    "Body ache or joint pain",
    "Trouble sleeping",
    "Felt lonely or low",
    "Forgot something important",
    "Spoke with family today",
  ];

  const toggleSymptom = (item: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCheckin({
      date: new Date().toISOString(),
      mood: selectedMood,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const streakDays = Math.min(checkins.length + 1, 7);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#D8E2DA] my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF3EA]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center text-xl">
              📝
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#153A34]">
                {t.dailyCheckinTitle}
              </h3>
              <p className="text-xs text-[#5B6B60]">A 2-minute daily reflection for your well-being</p>
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

        {/* Streak banner */}
        <div className="my-5 p-4 bg-gradient-to-r from-[#1F4E46] to-[#2D6A5D] text-white rounded-2xl flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-300" />
              Weekly Wellbeing Streak
            </span>
            <div className="text-xl font-bold font-serif">
              {streakDays} of 7 Days Active
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  day <= streakDays ? "bg-amber-400 text-stone-900" : "bg-white/20 text-white"
                }`}
              >
                {day <= streakDays ? "✓" : day}
              </div>
            ))}
          </div>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl animate-bounce">
              ✓
            </div>
            <h4 className="font-serif text-xl font-bold text-[#153A34]">
              Check-in Logged Successfully!
            </h4>
            <p className="text-xs text-[#5B6B60]">
              Your health diary is updated. Keep up the consistent care!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Mood selector */}
            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-2.5">
                {t.howAreYouFeeling}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((item) => (
                  <button
                    key={item.mood}
                    type="button"
                    onClick={() => setSelectedMood(item.mood)}
                    className={`py-3 rounded-2xl flex flex-col items-center gap-1 border transition ${
                      selectedMood === item.mood
                        ? "bg-[#FBE8C8] border-[#E8A33D] scale-105 shadow-xs"
                        : "bg-[#F4F7F4] border-[#D8E2DA] hover:bg-white text-[#5B6B60]"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[11px] font-semibold text-[#153A34]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-2">
                Any of these today?
              </label>
              <div className="space-y-2">
                {symptomChecklist.map((item, idx) => {
                  const isChecked = selectedSymptoms.includes(item);
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleSymptom(item)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? "bg-[#DCEAE4] border-[#1F4E46] text-[#153A34]"
                          : "bg-[#F4F7F4] border-[#D8E2DA] text-[#4A5D54] hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded-md accent-[#1F4E46]"
                      />
                      <span className="text-xs sm:text-sm font-medium">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-xs font-bold text-[#35483F] uppercase mb-1">
                Personal Reflection / Daily Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Went for a 20 min morning park walk, felt energetic"
                className="w-full px-3.5 py-2.5 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1F4E46]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#1F4E46] hover:bg-[#153A34] text-white font-semibold text-sm rounded-2xl shadow-md transition"
            >
              {t.saveCheckin}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
