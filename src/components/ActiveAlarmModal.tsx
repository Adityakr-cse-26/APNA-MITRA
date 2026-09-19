import React, { useEffect, useState } from "react";
import { 
  BellRing, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Clock, 
  Pill, 
  ShieldAlert, 
  Volume1,
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { Medication, Language } from "../types";
import { 
  startAlarmSound, 
  stopAlarmSound, 
  speakAlarmMessage 
} from "../utils/alarmAudio";

interface ActiveAlarmModalProps {
  medication: Medication;
  currentLang: Language;
  onMarkTaken: (id: string) => void;
  onSnooze: (id: string, minutes?: number) => void;
  onDismiss: () => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  medication,
  currentLang,
  onMarkTaken,
  onSnooze,
  onDismiss,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Start audible alarm chime on mount
    startAlarmSound();

    // Voice announcement after a short delay
    const ttsTimeout = setTimeout(() => {
      speakAlarmMessage(medication.name, medication.dosage, currentLang);
    }, 800);

    return () => {
      clearTimeout(ttsTimeout);
      stopAlarmSound();
    };
  }, [medication, currentLang]);

  const toggleMute = () => {
    if (isMuted) {
      startAlarmSound();
      setIsMuted(false);
    } else {
      stopAlarmSound();
      setIsMuted(true);
    }
  };

  const handleTaken = () => {
    stopAlarmSound();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
    onMarkTaken(medication.id);
  };

  const handleSnooze = () => {
    stopAlarmSound();
    onSnooze(medication.id, 5);
  };

  const handleDismiss = () => {
    stopAlarmSound();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/80 my-4 text-center relative overflow-hidden">
        
        {/* Glowing Alarm Pulsing Backdrop Effect */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-teal-300/30 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* Top Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition"
          aria-label="Dismiss Alarm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Bell Icon with Pulse Rings */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg relative z-10">
            <BellRing className="w-10 h-10 animate-bounce text-amber-300" />
          </div>
        </div>

        {/* Alarm Title */}
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
          ⏰ Medicine Dose Due Now
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#153A34] mb-1">
          {medication.name}
        </h2>

        {/* Dosage Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold text-sm rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>{medication.dosage}</span>
          </span>
          <span className="text-xs text-stone-500 font-medium">
            ({medication.timing})
          </span>
        </div>

        {/* Instructions */}
        {medication.instructions && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 mb-5 leading-relaxed">
            <strong className="text-stone-900 block mb-0.5">Instructions:</strong>
            {medication.instructions}
          </div>
        )}

        {/* Sound Status & Mute Control */}
        <div className="flex items-center justify-center mb-6">
          <button
            type="button"
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition border ${
              isMuted
                ? "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-stone-500" />
                <span>Alarm Sound Muted (Click to Unmute)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Alarm Ringing (Click to Silence)</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Main Action: I Have Taken This */}
          <button
            type="button"
            onClick={handleTaken}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Have Taken This Medicine</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Snooze 5 Min */}
            <button
              type="button"
              onClick={handleSnooze}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl border border-stone-300 transition flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-stone-600" />
              <span>Snooze 5 Min</span>
            </button>

            {/* Dismiss */}
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-600 font-semibold text-xs sm:text-sm rounded-xl border border-stone-200 transition flex items-center justify-center"
            >
              <span>Dismiss</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-stone-500 mt-4">
          Always take medications as prescribed by your doctor.
        </p>

      </div>
    </div>
  );
};
