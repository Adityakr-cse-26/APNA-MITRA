import { useEffect, useRef } from "react";
import { Medication, Language } from "../types";
import { normalizeTimeTo24Hour } from "./medicationScheduler";
import { playAlarmSequence } from "./alarmAudio";

interface UseMedicationAlarmSchedulerProps {
  medications: Medication[];
  currentLang: Language;
  onTriggerAlarm: (medication: Medication) => void;
}

export function useMedicationAlarmScheduler({
  medications,
  currentLang,
  onTriggerAlarm,
}: UseMedicationAlarmSchedulerProps) {
  const triggeredTodayRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Restore already-triggered alarms from sessionStorage to prevent re-triggering on page refresh
    try {
      const stored = sessionStorage.getItem("apna_mitra_triggered_alarms");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          triggeredTodayRef.current = new Set(parsed);
        }
      }
    } catch {
      // Ignore parse error
    }

    const checkAlarms = () => {
      if (!medications || medications.length === 0) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      const currentTimeStr = `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;
      const todayDateStr = now.toISOString().split("T")[0];

      for (const med of medications) {
        // If already taken today, skip
        if (med.takenToday) continue;

        // Check Snooze: if snoozed, trigger when snooze expires
        if (med.snoozedUntil && med.snoozedUntil > 0) {
          if (Date.now() >= med.snoozedUntil) {
            const snoozeKey = `${med.id}_snooze_${med.snoozedUntil}`;
            if (!triggeredTodayRef.current.has(snoozeKey)) {
              triggeredTodayRef.current.add(snoozeKey);
              triggerAlert(med, "Snoozed dose is now due!");
              return;
            }
          }
          continue;
        }

        // Standard Scheduled Time Check
        const scheduled24 = normalizeTimeTo24Hour(med.scheduledTime, med.timing);
        const [schedH, schedM] = scheduled24.split(":").map(Number);
        const scheduledTotalMinutes = schedH * 60 + schedM;

        // Within 0 to 4 minutes of scheduled time
        const minuteDiff = currentTotalMinutes - scheduledTotalMinutes;
        const isTimeMatch = minuteDiff >= 0 && minuteDiff <= 4;

        if (isTimeMatch) {
          const alarmKey = `${med.id}_${todayDateStr}_${scheduled24}`;
          if (!triggeredTodayRef.current.has(alarmKey)) {
            triggeredTodayRef.current.add(alarmKey);
            try {
              sessionStorage.setItem(
                "apna_mitra_triggered_alarms",
                JSON.stringify(Array.from(triggeredTodayRef.current))
              );
            } catch {
              // Ignore storage error
            }

            triggerAlert(med);
            break; // Trigger one alarm at a time
          }
        }
      }
    };

    const triggerAlert = (med: Medication, extraContext?: string) => {
      // 1. In-App Audio & Modal
      onTriggerAlarm(med);

      // 2. Native Web Notification if supported & granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const title = `💊 Medicine Reminder: ${med.name}`;
          const body = extraContext || `It's time to take ${med.name} (${med.dosage}). ${med.instructions || ""}`;
          
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "MEDICATION_ALARM",
              title,
              body,
              medicationId: med.id,
            });
          } else {
            new Notification(title, {
              body,
              icon: "/chatbot-logo.png",
              badge: "/chatbot-logo.png",
              tag: `med-alarm-${med.id}`,
            });
          }
        } catch (e) {
          console.warn("Notification error:", e);
        }
      }
    };

    // Check immediately on mount and then every 10 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);

    return () => clearInterval(interval);
  }, [medications, currentLang, onTriggerAlarm]);
}
