import { VitalReading, Medication, SmartHealthAlert, SmartMedicationAlert } from "../types";

/**
 * Generates dynamic Smart Health Alerts from recorded vitals
 */
export function evaluateHealthAlerts(
  vitals: VitalReading[],
  dismissedIds: string[] = []
): SmartHealthAlert[] {
  const alerts: SmartHealthAlert[] = [];

  // 1. Blood Pressure Check
  const bpVital = vitals.find((v) => v.type === "bp");
  if (bpVital && bpVital.value) {
    const parts = bpVital.value.split("/");
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1] || "80", 10);

    if (!isNaN(sys)) {
      if (sys >= 160 || dia >= 100) {
        alerts.push({
          id: `bp-critical-${bpVital.id}`,
          type: "BP_HIGH",
          severity: "CRITICAL",
          vitalType: "bp",
          title: "Critical Blood Pressure Spike (Hypertensive Alert)",
          currentValue: `${bpVital.value} ${bpVital.unit}`,
          safeThreshold: "< 130/85 mmHg",
          timestamp: bpVital.timestamp,
          message: "Systolic or diastolic reading is markedly elevated. Immediate relaxation, posture stabilization, and physician notification recommended.",
          immediateAction: [
            "Sit in a comfortable chair with feet flat on the floor for 10 minutes.",
            "Take slow diaphragmatic deep breaths (4 seconds in, 6 seconds out).",
            "Avoid sudden exertion, coffee, or high-sodium snacks.",
            "Re-check blood pressure in 15 minutes. If persistent above 160/100 or accompanied by chest tightness/headache, seek medical care."
          ],
          suggestedDoctorSpeciality: "Senior Cardiologist / Internal Medicine Physician",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`bp-critical-${bpVital.id}`),
        });
      } else if (sys >= 140 || dia >= 90) {
        alerts.push({
          id: `bp-warn-${bpVital.id}`,
          type: "BP_HIGH",
          severity: "WARNING",
          vitalType: "bp",
          title: "Elevated Blood Pressure Detected",
          currentValue: `${bpVital.value} ${bpVital.unit}`,
          safeThreshold: "< 130/80 mmHg",
          timestamp: bpVital.timestamp,
          message: "Blood pressure is higher than target senior baseline. Monitor trend before and after evening meal.",
          immediateAction: [
            "Drink a glass of warm water.",
            "Confirm if daily morning BP medication was taken on time.",
            "Log your evening reading to review with your doctor."
          ],
          suggestedDoctorSpeciality: "Primary Healthcare Physician",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`bp-warn-${bpVital.id}`),
        });
      } else if (sys < 90 || dia < 60) {
        alerts.push({
          id: `bp-low-${bpVital.id}`,
          type: "BP_LOW",
          severity: "WARNING",
          vitalType: "bp",
          title: "Low Blood Pressure (Hypotension Alert)",
          currentValue: `${bpVital.value} ${bpVital.unit}`,
          safeThreshold: "> 95/60 mmHg",
          timestamp: bpVital.timestamp,
          message: "Low blood pressure increases risk of postural dizziness and falls for seniors.",
          immediateAction: [
            "Sit down immediately. Do not stand up abruptly from bed or chair.",
            "Sip an electrolyte/lemon-salt water drink or broth.",
            "Elevate legs on a footstool if feeling lightheaded."
          ],
          suggestedDoctorSpeciality: "Geriatric Medicine Specialist",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`bp-low-${bpVital.id}`),
        });
      }
    }
  }

  // 2. Blood Sugar Check
  const sugarVital = vitals.find((v) => v.type === "sugar");
  if (sugarVital && sugarVital.value) {
    const val = parseFloat(sugarVital.value);
    if (!isNaN(val)) {
      if (val <= 70) {
        alerts.push({
          id: `sugar-hypo-${sugarVital.id}`,
          type: "SUGAR_LOW",
          severity: "CRITICAL",
          vitalType: "sugar",
          title: "Hypoglycemia Alert (Critical Low Sugar)",
          currentValue: `${sugarVital.value} ${sugarVital.unit}`,
          safeThreshold: "75 - 130 mg/dL",
          timestamp: sugarVital.timestamp,
          message: "Blood glucose has fallen below safe threshold. Risk of weakness, tremors, or fainting.",
          immediateAction: [
            "Follow Rule of 15: Immediately consume 15g fast-acting sugar (e.g. 1/2 glass fruit juice, 3 teaspoons glucose/sugar in water, or 3 hard candies).",
            "Sit in a safe resting position for 15 minutes.",
            "Re-check blood glucose after 15 minutes. If still below 70 mg/dL, repeat fast sugar intake and notify caregiver."
          ],
          suggestedDoctorSpeciality: "Endocrinologist / Diabetologist",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`sugar-hypo-${sugarVital.id}`),
        });
      } else if (val >= 200) {
        alerts.push({
          id: `sugar-hyper-${sugarVital.id}`,
          type: "SUGAR_HIGH",
          severity: "WARNING",
          vitalType: "sugar",
          title: "High Blood Glucose Level",
          currentValue: `${sugarVital.value} ${sugarVital.unit}`,
          safeThreshold: "< 140 mg/dL (Fasting) / < 180 mg/dL (Post-Meal)",
          timestamp: sugarVital.timestamp,
          message: "Blood sugar is elevated above standard glycemic targets.",
          immediateAction: [
            "Drink 2 glasses of plain water to help kidneys filter excess glucose.",
            "Verify adherence to prescribed anti-diabetic medication / insulin.",
            "Avoid carbohydrates or sweetened beverages for the next 3 hours."
          ],
          suggestedDoctorSpeciality: "Diabetologist / Physician",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`sugar-hyper-${sugarVital.id}`),
        });
      }
    }
  }

  // 3. SpO2 Oxygen Saturation Check
  const spo2Vital = vitals.find((v) => v.type === "spo2");
  if (spo2Vital && spo2Vital.value) {
    const val = parseFloat(spo2Vital.value);
    if (!isNaN(val)) {
      if (val < 90) {
        alerts.push({
          id: `spo2-critical-${spo2Vital.id}`,
          type: "SPO2_LOW",
          severity: "CRITICAL",
          vitalType: "spo2",
          title: "Critical Low Blood Oxygen (SpO2 Alert)",
          currentValue: `${spo2Vital.value} ${spo2Vital.unit}`,
          safeThreshold: "≥ 95%",
          timestamp: spo2Vital.timestamp,
          message: "Blood oxygen saturation is below 90%. Requires urgent respiratory evaluation.",
          immediateAction: [
            "Sit upright; do not lie flat on your back.",
            "Loosen tight collar/clothing and open room windows for fresh ventilation.",
            "Practice pursed-lip breathing.",
            "If breathless or cyanotic (blue lips/fingers), call 112 / 108 ambulance immediately."
          ],
          suggestedDoctorSpeciality: "Pulmonologist / Emergency Care",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`spo2-critical-${spo2Vital.id}`),
        });
      } else if (val < 95) {
        alerts.push({
          id: `spo2-warn-${spo2Vital.id}`,
          type: "SPO2_LOW",
          severity: "WARNING",
          vitalType: "spo2",
          title: "Sub-optimal Oxygen Saturation",
          currentValue: `${spo2Vital.value} ${spo2Vital.unit}`,
          safeThreshold: "≥ 95%",
          timestamp: spo2Vital.timestamp,
          message: "Oxygen level is slightly low. Ensure warm hands when measuring with pulse oximeter.",
          immediateAction: [
            "Warm your fingertips and ensure oximeter is placed securely on clean finger.",
            "Take 5 deep breaths and re-test.",
            "Avoid smoke, dust, or cold draft."
          ],
          suggestedDoctorSpeciality: "Chest Physician / General Medicine",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`spo2-warn-${spo2Vital.id}`),
        });
      }
    }
  }

  // 4. Heart Rate Pulse Check
  const hrVital = vitals.find((v) => v.type === "hr");
  if (hrVital && hrVital.value) {
    const val = parseFloat(hrVital.value);
    if (!isNaN(val)) {
      if (val > 105) {
        alerts.push({
          id: `hr-high-${hrVital.id}`,
          type: "HR_HIGH",
          severity: "WARNING",
          vitalType: "hr",
          title: "Elevated Heart Rate (Tachycardia Alert)",
          currentValue: `${hrVital.value} ${hrVital.unit}`,
          safeThreshold: "60 - 100 BPM",
          timestamp: hrVital.timestamp,
          message: "Resting pulse is above 105 BPM. Can be triggered by dehydration, mild fever, stress, or caffeine.",
          immediateAction: [
            "Rest quietly in a cool, quiet room for 15 minutes.",
            "Drink a glass of cold water.",
            "Check temperature to rule out fever."
          ],
          suggestedDoctorSpeciality: "Cardiologist",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`hr-high-${hrVital.id}`),
        });
      } else if (val < 52) {
        alerts.push({
          id: `hr-low-${hrVital.id}`,
          type: "HR_LOW",
          severity: "WARNING",
          vitalType: "hr",
          title: "Low Heart Rate (Bradycardia Alert)",
          currentValue: `${hrVital.value} ${hrVital.unit}`,
          safeThreshold: "55 - 95 BPM",
          timestamp: hrVital.timestamp,
          message: "Resting pulse is below 52 BPM. Verify if you feel any lightheadedness or fatigue.",
          immediateAction: [
            "Check for dizziness when standing.",
            "Review beta-blocker or rate-limiting medicines with treating doctor."
          ],
          suggestedDoctorSpeciality: "Cardiologist",
          caregiverNotified: false,
          isDismissed: dismissedIds.includes(`hr-low-${hrVital.id}`),
        });
      }
    }
  }

  return alerts;
}

/**
 * Generates dynamic Medication Alerts (Due, Missed, Refill, Upcoming)
 */
export function evaluateMedicationAlerts(
  medications: Medication[]
): SmartMedicationAlert[] {
  const alerts: SmartMedicationAlert[] = [];
  const currentHour = new Date().getHours();

  medications.forEach((med) => {
    let defaultTime = "08:00 AM";
    let timingCategory: "Morning" | "Afternoon" | "Evening" | "Night" = "Morning";
    let scheduleHour = 8;

    if (med.timing === "Morning") {
      defaultTime = "08:00 AM";
      timingCategory = "Morning";
      scheduleHour = 8;
    } else if (med.timing === "Afternoon") {
      defaultTime = "01:30 PM";
      timingCategory = "Afternoon";
      scheduleHour = 13;
    } else if (med.timing === "Evening") {
      defaultTime = "06:00 PM";
      timingCategory = "Evening";
      scheduleHour = 18;
    } else if (med.timing === "Night") {
      defaultTime = "08:30 PM";
      timingCategory = "Night";
      scheduleHour = 20;
    }

    const scheduledTime = med.scheduledTime || defaultTime;
    let status: SmartMedicationAlert["status"] = "UPCOMING";
    let minutesOverdue: number | undefined = undefined;

    if (med.takenToday) {
      status = "TAKEN";
    } else if (med.snoozedUntil && Date.now() < med.snoozedUntil) {
      status = "SNOOZED";
    } else {
      // Determine if Due or Missed based on time
      const hoursDiff = currentHour - scheduleHour;
      if (hoursDiff >= 2) {
        status = "MISSED";
        minutesOverdue = hoursDiff * 60;
      } else if (hoursDiff >= 0 && hoursDiff < 2) {
        status = "DUE_NOW";
      } else {
        status = "UPCOMING";
      }
    }

    const isCritical = med.critical ?? (
      med.name.toLowerCase().includes("blood pressure") ||
      med.name.toLowerCase().includes("amlodipine") ||
      med.name.toLowerCase().includes("telmisartan") ||
      med.name.toLowerCase().includes("metformin") ||
      med.name.toLowerCase().includes("insulin") ||
      med.name.toLowerCase().includes("atorvastatin")
    );

    alerts.push({
      id: `med-alert-${med.id}`,
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime,
      timingCategory,
      status,
      instructions: med.instructions,
      critical: isCritical,
      remainingPills: med.remainingPills ?? 12,
      caregiverEscalated: false,
      minutesOverdue,
    });
  });

  return alerts;
}

/**
 * Web Audio sound synthesizer for alert chimes and medication reminders
 */
export function playAlertTone(type: "health_critical" | "health_warning" | "medication_chime" | "success_bell") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (type === "health_critical") {
      // Urgent double beep
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(440, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.45);
      osc2.frequency.setValueAtTime(440, now + 0.6);
      gain2.gain.setValueAtTime(0.3, now + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.45);
      osc2.stop(now + 0.85);
    } else if (type === "health_warning" || type === "medication_chime") {
      // Gentle 2-tone chime (E5 -> B5)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.2); // B5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "success_bell") {
      // Celebratory pleasant bell (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    }
  } catch (e) {
    console.warn("Audio playback not allowed without user gesture:", e);
  }
}
