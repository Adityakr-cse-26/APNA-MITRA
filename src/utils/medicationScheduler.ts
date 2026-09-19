import { Medication } from "../types";

/**
 * Normalizes any time string into a 24-hour "HH:mm" format.
 * Handles formats like "08:00 AM", "8:00 AM", "1:30 pm", "13:30", "08:00",
 * or timing category fallbacks.
 */
export function normalizeTimeTo24Hour(timeStr?: string, timingCategory?: Medication["timing"]): string {
  if (timeStr && timeStr.trim()) {
    const clean = timeStr.trim().toUpperCase();

    // Match 12-hour format with AM/PM (e.g. "8:30 AM", "08:30PM", "1:00 PM")
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const modifier = match12[3];

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    // Match 24-hour format (e.g. "08:30", "8:30", "13:00")
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

  // Fallback defaults based on timing category
  switch (timingCategory) {
    case "Morning":
    case "Before Food":
      return "08:00";
    case "Afternoon":
      return "13:00";
    case "Evening":
    case "After Food":
      return "18:00";
    case "Night":
      return "21:00";
    default:
      return "09:00";
  }
}

/**
 * Formats a 24-hour "HH:mm" string into friendly 12-hour display format ("8:00 AM", "1:30 PM")
 */
export function formatTimeForDisplay(timeStr?: string, timingCategory?: Medication["timing"]): string {
  const norm = normalizeTimeTo24Hour(timeStr, timingCategory);
  const [hStr, mStr] = norm.split(":");
  const hours = parseInt(hStr, 10);
  const minutes = mStr || "00";

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${minutes} ${period}`;
}

export interface UpcomingMedicationResult {
  medication: Medication;
  scheduledTime24: string;
  timeDisplay: string;
  minutesRemaining: number;
  isTomorrow: boolean;
  statusText: string;
}

/**
 * Calculates the next upcoming medication dose based on current local time.
 */
export function getNextUpcomingMedication(medications: Medication[]): UpcomingMedicationResult | null {
  if (!medications || medications.length === 0) {
    return null;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates: Array<{
    medication: Medication;
    scheduledTime24: string;
    targetMinutes: number;
    diffMinutes: number;
    isTomorrow: boolean;
  }> = [];

  for (const med of medications) {
    const time24 = normalizeTimeTo24Hour(med.scheduledTime, med.timing);
    const [h, m] = time24.split(":").map(Number);
    const medMinutes = h * 60 + m;

    if (!med.takenToday) {
      if (medMinutes >= currentMinutes) {
        // Due later today
        candidates.push({
          medication: med,
          scheduledTime24: time24,
          targetMinutes: medMinutes,
          diffMinutes: medMinutes - currentMinutes,
          isTomorrow: false,
        });
      } else {
        // Missed earlier today or overdue
        candidates.push({
          medication: med,
          scheduledTime24: time24,
          targetMinutes: medMinutes,
          diffMinutes: currentMinutes - medMinutes, // overdue minutes
          isTomorrow: false,
        });
      }
    } else {
      // Already taken today, next occurrence is tomorrow
      candidates.push({
        medication: med,
        scheduledTime24: time24,
        targetMinutes: medMinutes,
        diffMinutes: (24 * 60 - currentMinutes) + medMinutes,
        isTomorrow: true,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Prioritize:
  // 1. Untaken doses due today in the future (sorted by diffMinutes ascending)
  // 2. Untaken doses overdue today
  // 3. Doses scheduled tomorrow
  const upcomingToday = candidates
    .filter((c) => !c.medication.takenToday && c.targetMinutes >= currentMinutes)
    .sort((a, b) => a.diffMinutes - b.diffMinutes);

  if (upcomingToday.length > 0) {
    const best = upcomingToday[0];
    const diff = best.diffMinutes;
    let statusText = `in ${diff} minutes`;
    if (diff === 0) statusText = "Due right now";
    else if (diff >= 60) {
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      statusText = `in ${hrs}h ${mins > 0 ? `${mins}m` : ""}`;
    }

    return {
      medication: best.medication,
      scheduledTime24: best.scheduledTime24,
      timeDisplay: formatTimeForDisplay(best.scheduledTime24),
      minutesRemaining: diff,
      isTomorrow: false,
      statusText,
    };
  }

  const overdueToday = candidates
    .filter((c) => !c.medication.takenToday && c.targetMinutes < currentMinutes)
    .sort((a, b) => a.diffMinutes - b.diffMinutes);

  if (overdueToday.length > 0) {
    const best = overdueToday[0];
    return {
      medication: best.medication,
      scheduledTime24: best.scheduledTime24,
      timeDisplay: formatTimeForDisplay(best.scheduledTime24),
      minutesRemaining: -best.diffMinutes,
      isTomorrow: false,
      statusText: `Overdue by ${best.diffMinutes}m (not taken today)`,
    };
  }

  // All doses taken today! Next dose is tomorrow
  const tomorrowCandidates = candidates
    .filter((c) => c.isTomorrow)
    .sort((a, b) => a.targetMinutes - b.targetMinutes);

  if (tomorrowCandidates.length > 0) {
    const best = tomorrowCandidates[0];
    return {
      medication: best.medication,
      scheduledTime24: best.scheduledTime24,
      timeDisplay: formatTimeForDisplay(best.scheduledTime24),
      minutesRemaining: best.diffMinutes,
      isTomorrow: true,
      statusText: "Tomorrow",
    };
  }

  return null;
}
