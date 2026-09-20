import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";
import { sendMedicationSms, formatPhoneNumber } from "./smsService";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BKbl38v0s7bo7hKSSyXHmmVbo0RWdGAC7AxlHVCLv4dgyn_g5rVxPNicAcTthXxMnL64pD4eFx9HzDN_6L48iqk";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "k_Kv-KQeJitREkwOrHhiCWqypAyWBTJU0TI2PY5V1hQ";

try {
  webPush.setVapidDetails(
    "mailto:support@apnamitra.org",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (e) {
  console.warn("webPush VAPID setup notice:", e);
}

function cleanSupabaseUrl(raw?: string): string {
  const fallback = "https://glytruwxtyhfkrstnygr.supabase.co";
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw.replace(/['"]/g, "").trim());
    return parsed.origin;
  } catch {
    return fallback;
  }
}

const supabaseUrl = cleanSupabaseUrl(process.env.VITE_SUPABASE_URL);
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl").replace(/['"]/g, "").trim();

export const supabaseServer = createClient(supabaseUrl, supabaseKey);

// In-memory sync store so client-side medications & subscriptions are always available to the server
export interface SyncedMedicationSchedule {
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  caretaker_phone?: string;
  sms_enabled?: boolean;
  medications: Array<{
    id: string;
    patientId?: string;
    name: string;
    dosage: string;
    timing?: string;
    scheduledTime?: string;
    scheduled_time?: string;
    instructions?: string;
    date?: string;
    frequency?: string;
    reminderStatus?: string;
    smsEnabled?: boolean;
    takenToday?: boolean;
    taken_today?: boolean;
    snoozedUntil?: number;
  }>;
  timezone?: string;
  updatedAt: number;
}

export const syncedMedicationsStore = new Map<string, SyncedMedicationSchedule>();

export interface SyncedPushSubscription {
  patient_id: string;
  endpoint: string;
  keys: { p256dh?: string; auth?: string };
  timezone: string;
  reminders_enabled: boolean;
  updatedAt: number;
}

export const syncedSubscriptionsStore = new Map<string, SyncedPushSubscription>();

// Fast in-memory deduplication set to prevent burst duplicate dispatches
// Key format: `${patient_id}:${medication_id}:${dose_date}:${dose_time}`
const memoryDeduplicationCache = new Set<string>();

// Keep memory deduplication cache manageable
setInterval(() => {
  if (memoryDeduplicationCache.size > 2000) {
    memoryDeduplicationCache.clear();
  }
}, 24 * 60 * 60 * 1000);

export function registerSyncedSubscription(sub: SyncedPushSubscription) {
  syncedSubscriptionsStore.set(sub.endpoint, sub);
}

export function registerSyncedMedications(
  patientId: string,
  medications: any[],
  timezone?: string,
  options?: {
    patient_name?: string;
    patient_phone?: string;
    caretaker_phone?: string;
    sms_enabled?: boolean;
  }
) {
  syncedMedicationsStore.set(patientId, {
    patient_id: patientId,
    patient_name: options?.patient_name,
    patient_phone: options?.patient_phone,
    caretaker_phone: options?.caretaker_phone,
    sms_enabled: options?.sms_enabled !== false,
    medications: medications || [],
    timezone: timezone || "Asia/Kolkata",
    updatedAt: Date.now(),
  });
}

export function normalizeTimeTo24Hour(timeStr?: string, timingCategory?: string): string {
  if (timeStr && timeStr.trim()) {
    const clean = timeStr.trim().toUpperCase();

    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const modifier = match12[3];

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

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
 * Calculates current time and date in India Standard Time (Asia/Kolkata).
 * Requirements mandate all medication reminder times must be interpreted in Asia/Kolkata.
 */
export function getPatientLocalTime(timezone: string = "Asia/Kolkata"): {
  doseDate: string;
  doseTime: string;
  currentMinutes: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
} {
  const tz = timezone || "Asia/Kolkata";
  try {
    const now = new Date();
    const formatterDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const doseDate = formatterDate.format(now); // "YYYY-MM-DD"

    const formatterTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const doseTime = formatterTime.format(now); // "HH:mm"
    const [h, m] = doseTime.split(":").map(Number);

    // Derive day of week in Indian Time
    const dObj = new Date(`${doseDate}T${doseTime}:00+05:30`);
    const dayOfWeek = isNaN(dObj.getDay()) ? now.getDay() : dObj.getDay();

    return { doseDate, doseTime, currentMinutes: h * 60 + m, dayOfWeek };
  } catch {
    const now = new Date();
    const iso = now.toISOString();
    const doseDate = iso.split("T")[0];
    const doseTime = iso.split("T")[1].slice(0, 5);
    const [h, m] = doseTime.split(":").map(Number);
    return { doseDate, doseTime, currentMinutes: h * 60 + m, dayOfWeek: now.getDay() };
  }
}

/**
 * Validates whether a medication is scheduled for today based on frequency.
 */
function isMedicationScheduledToday(med: any, doseDate: string, dayOfWeek: number): boolean {
  const freq = (med.frequency || "daily").toLowerCase();

  if (freq === "once") {
    // Only on specific date
    if (med.date) {
      return med.date === doseDate;
    }
    return true;
  }

  if (freq === "weekly") {
    // If specific date given, check if same day of week
    if (med.date) {
      const scheduledDay = new Date(med.date).getDay();
      return scheduledDay === dayOfWeek;
    }
    return dayOfWeek === 1; // Default Monday
  }

  // "daily", "twice_daily", or default
  return true;
}

/**
 * Checks all active medications and sends automatic SMS reminders to Indian mobile numbers.
 * Enforces:
 * - Patient phone isolation (only sends to registered number for that Patient ID).
 * - Deduplication via medication_reminder_logs + memory cache.
 * - Retry logic for failures.
 * - IST (Asia/Kolkata) timezone.
 */
export async function processMedicationReminders(filterPatientId?: string) {
  try {
    const patientMap = new Map<string, any[]>();

    // 1. Check Supabase database medications table
    try {
      let query = supabaseServer.from("medications").select("*");
      if (filterPatientId) {
        query = query.eq("patient_id", filterPatientId);
      }
      const { data: medications, error: medError } = await query;
      if (!medError && medications && medications.length > 0) {
        for (const med of medications) {
          const pId = med.patient_id;
          if (!pId) continue;
          if (!patientMap.has(pId)) patientMap.set(pId, []);
          patientMap.get(pId)!.push(med);
        }
      }
    } catch (dbErr) {
      console.warn("[Server Reminder] Supabase medications query notice:", dbErr);
    }

    // 2. Check in-memory synced store from active clients
    for (const [pId, schedule] of syncedMedicationsStore.entries()) {
      if (filterPatientId && pId !== filterPatientId) continue;
      if (!patientMap.has(pId)) patientMap.set(pId, []);
      for (const m of schedule.medications) {
        // Prevent duplicate objects if already fetched from DB
        const existingList = patientMap.get(pId)!;
        if (!existingList.some((ex) => String(ex.id) === String(m.id))) {
          patientMap.get(pId)!.push({
            id: m.id,
            patient_id: pId,
            name: m.name,
            dosage: m.dosage,
            timing: m.timing,
            scheduled_time: m.scheduledTime || m.scheduled_time,
            instructions: m.instructions,
            date: m.date,
            frequency: m.frequency,
            sms_enabled: m.smsEnabled !== false,
            taken_today: m.takenToday ?? m.taken_today ?? false,
            snoozed_until: m.snoozedUntil,
          });
        }
      }
    }

    if (patientMap.size === 0) {
      return { success: true, processed: 0, sent: 0, reason: "No active medications found" };
    }

    let totalProcessed = 0;
    let totalSent = 0;
    let totalSkippedAlreadySent = 0;
    let totalFailed = 0;

    for (const [patientId, meds] of patientMap.entries()) {
      // 1. Retrieve patient's registered mobile number and profile details
      const syncedMeta = syncedMedicationsStore.get(patientId);
      let patientPhone = syncedMeta?.patient_phone;
      let patientName = syncedMeta?.patient_name || "Patient";
      let caretakerPhone = syncedMeta?.caretaker_phone;
      const patientSmsEnabled = syncedMeta?.sms_enabled !== false;

      // Query database profile if phone not in synced cache
      if (!patientPhone && patientId && patientId !== "anonymous") {
        try {
          const { data: prof } = await supabaseServer
            .from("profiles")
            .select("full_name, phone, guardian_phone, sms_reminders_enabled")
            .eq("id", patientId)
            .maybeSingle();

          if (prof) {
            if (prof.phone) patientPhone = prof.phone;
            if (prof.full_name) patientName = prof.full_name;
            if (prof.guardian_phone) caretakerPhone = prof.guardian_phone;
          }
        } catch (profErr) {
          console.warn("[Server Reminder] Profile lookup notice:", profErr);
        }
      }

      // Check push subscriptions
      const allSubs: Array<{ id?: string; endpoint: string; p256dh: string; auth: string; timezone?: string }> = [];
      try {
        const { data: subs } = await supabaseServer
          .from("push_subscriptions")
          .select("*")
          .eq("patient_uid", patientId);

        if (subs && subs.length > 0) {
          for (const s of subs) {
            if (s.reminders_enabled !== false && s.endpoint && s.p256dh && s.auth) {
              allSubs.push({ id: s.id, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth, timezone: s.timezone });
            }
          }
        }
      } catch {
        // ignore
      }

      for (const synSub of syncedSubscriptionsStore.values()) {
        if (synSub.patient_id === patientId || patientId === "anonymous") {
          if (synSub.reminders_enabled !== false && synSub.endpoint && synSub.keys.p256dh && synSub.keys.auth) {
            if (!allSubs.some((s) => s.endpoint === synSub.endpoint)) {
              allSubs.push({
                endpoint: synSub.endpoint,
                p256dh: synSub.keys.p256dh,
                auth: synSub.keys.auth,
                timezone: synSub.timezone,
              });
            }
          }
        }
      }

      // If neither phone nor push subscriptions exist, skip this patient
      if (!patientPhone && allSubs.length === 0) {
        continue;
      }

      // Interpret reminder schedule in Asia/Kolkata (IST)
      const patientTimezone = "Asia/Kolkata";
      const { doseDate, currentMinutes, dayOfWeek } = getPatientLocalTime(patientTimezone);

      for (const med of meds) {
        totalProcessed++;

        // If marked as taken today, do not remind
        if (med.taken_today === true) {
          continue;
        }

        // If snoozed, check snooze timestamp
        if (med.snoozed_until && Date.now() < med.snoozed_until) {
          continue;
        }

        // Verify frequency (Daily / Once / Weekly)
        if (!isMedicationScheduledToday(med, doseDate, dayOfWeek)) {
          continue;
        }

        const scheduled24 = normalizeTimeTo24Hour(med.scheduled_time, med.timing);
        const [schedH, schedM] = scheduled24.split(":").map(Number);
        const scheduledMinutes = schedH * 60 + schedM;

        // Check if dose is due (current minute or within 15-minute reminder window)
        const minuteDiff = currentMinutes - scheduledMinutes;
        const isDue = minuteDiff >= 0 && minuteDiff <= 15;

        if (!isDue) {
          continue;
        }

        // Fast in-memory deduplication check
        const dedupKey = `${patientId}:${med.id}:${doseDate}:${scheduled24}`;
        if (memoryDeduplicationCache.has(dedupKey)) {
          totalSkippedAlreadySent++;
          continue;
        }

        // Database deduplication check in medication_reminder_logs
        try {
          const { data: existingLog } = await supabaseServer
            .from("medication_reminder_logs")
            .select("id, status")
            .eq("medication_id", String(med.id))
            .eq("patient_uid", patientId)
            .eq("dose_date", doseDate)
            .eq("dose_time", scheduled24)
            .maybeSingle();

          if (existingLog && existingLog.status === "sent") {
            memoryDeduplicationCache.add(dedupKey);
            totalSkippedAlreadySent++;
            continue;
          }
        } catch {
          // If table doesn't exist, proceed safely
        }

        let deliverySuccess = false;
        let smsStatus: "sent" | "simulated" | "failed" = "failed";
        let providerId = "";
        let errorMsg = "";

        // 1. Send SMS to Patient's registered Indian mobile number
        const canSendSms = patientPhone && patientSmsEnabled && med.sms_enabled !== false;

        if (canSendSms) {
          try {
            const smsResult = await sendMedicationSms({
              patient_id: patientId,
              to: patientPhone,
              patient_name: patientName,
              medicine_name: med.name,
              dosage: med.dosage,
              timing: med.timing || "Scheduled Dose",
              instructions: med.instructions,
              scheduled_time: scheduled24,
            });

            if (smsResult.success) {
              deliverySuccess = true;
              smsStatus = smsResult.status;
              providerId = smsResult.record.provider_message_id || smsResult.record.id;
              console.log(`[Automatic SMS] Reminder dispatched to patient mobile ${patientPhone} for ${med.name} (${smsStatus})`);
            } else {
              errorMsg = smsResult.error || "SMS delivery failed";
            }
          } catch (smsErr: any) {
            console.error(`[Automatic SMS] Error sending to ${patientPhone}:`, smsErr);
            errorMsg = smsErr?.message || "SMS network exception";
          }
        }

        // 2. Also send browser Web Push notification if available
        if (allSubs.length > 0) {
          const bodyText = `Medication Reminder:\nPatient: ${patientName}\nMedicine: ${med.name} (${med.dosage})\nIt is time to take your medication.\nTime: ${scheduled24}`;

          const payload = JSON.stringify({
            title: "💊 Medication Reminder",
            body: bodyText,
            icon: "/chatbot-logo.png",
            badge: "/chatbot-logo.png",
            url: "/#medicine-tracker",
            data: {
              url: "/#medicine-tracker",
              medication_id: med.id,
              type: "MEDICATION_REMINDER",
            },
          });

          for (const sub of allSubs) {
            try {
              await webPush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
              deliverySuccess = true;
            } catch (pErr: any) {
              if (pErr?.statusCode === 410 || pErr?.statusCode === 404) {
                if (sub.id) {
                  await supabaseServer.from("push_subscriptions").delete().eq("id", sub.id);
                }
                syncedSubscriptionsStore.delete(sub.endpoint);
              }
            }
          }
        }

        // 3. Record in deduplication cache and database logs
        if (deliverySuccess) {
          totalSent++;
          memoryDeduplicationCache.add(dedupKey);

          try {
            await supabaseServer
              .from("medication_reminder_logs")
              .insert({
                medication_id: String(med.id),
                patient_uid: patientId,
                dose_date: doseDate,
                dose_time: scheduled24,
                sent_at: new Date().toISOString(),
                status: smsStatus,
                provider_id: providerId,
                error_message: null,
                retry_count: 0,
              });
          } catch (logErr: any) {
            console.warn("[Server Reminder] Failed to log reminder to DB:", logErr?.message || logErr);
          }
        } else {
          totalFailed++;
          try {
            await supabaseServer
              .from("medication_reminder_logs")
              .insert({
                medication_id: String(med.id),
                patient_uid: patientId,
                dose_date: doseDate,
                dose_time: scheduled24,
                sent_at: new Date().toISOString(),
                status: "failed",
                provider_id: null,
                error_message: errorMsg || "Failed to dispatch SMS",
                retry_count: 1,
              });
          } catch {
            // ignore
          }
        }
      }
    }

    return {
      success: true,
      processed: totalProcessed,
      sent: totalSent,
      failed: totalFailed,
      skipped_already_sent: totalSkippedAlreadySent,
    };
  } catch (error: any) {
    console.error("[Server Reminder] Process error:", error);
    return { success: false, error: error?.message || "Process error" };
  }
}

/**
 * Sends an immediate test alarm push & SMS to verify patient's registered mobile number.
 */
export async function sendTestReminderPush(patientId: string, phone?: string) {
  try {
    const syncedMeta = syncedMedicationsStore.get(patientId);
    let targetPhone = phone || syncedMeta?.patient_phone;
    let patientName = syncedMeta?.patient_name || "Patient";

    if (!targetPhone && patientId && patientId !== "anonymous") {
      try {
        const { data: prof } = await supabaseServer
          .from("profiles")
          .select("full_name, phone")
          .eq("id", patientId)
          .maybeSingle();
        if (prof?.phone) targetPhone = prof.phone;
        if (prof?.full_name) patientName = prof.full_name;
      } catch {
        // ignore
      }
    }

    let smsSent = false;
    let smsDetails: any = null;

    if (targetPhone) {
      try {
        const medSample = syncedMeta?.medications?.[0] || { name: "Metformin", dosage: "500mg" };
        const result = await sendMedicationSms({
          patient_id: patientId,
          to: targetPhone,
          patient_name: patientName,
          medicine_name: medSample.name,
          dosage: medSample.dosage,
          timing: "Morning Dose",
          scheduled_time: "08:00 AM",
          instructions: "Test alarm sent to verify your registered mobile number",
        });
        smsSent = result.success;
        smsDetails = result;
      } catch (smsErr) {
        console.warn("[Server Reminder] Test SMS error:", smsErr);
      }
    }

    const allSubs: Array<{ id?: string; endpoint: string; p256dh: string; auth: string }> = [];

    try {
      let query = supabaseServer.from("push_subscriptions").select("*");
      if (patientId && patientId !== "anonymous") {
        query = query.eq("patient_uid", patientId);
      }
      const { data: subs } = await query;
      if (subs && subs.length > 0) {
        for (const s of subs) {
          if (s.endpoint && s.p256dh && s.auth) {
            allSubs.push({ id: s.id, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth });
          }
        }
      }
    } catch {
      // ignore
    }

    for (const synSub of syncedSubscriptionsStore.values()) {
      if (!allSubs.some((s) => s.endpoint === synSub.endpoint)) {
        if (synSub.keys.p256dh && synSub.keys.auth) {
          allSubs.push({
            endpoint: synSub.endpoint,
            p256dh: synSub.keys.p256dh,
            auth: synSub.keys.auth,
          });
        }
      }
    }

    let sentCount = 0;
    if (allSubs.length > 0) {
      const payload = JSON.stringify({
        title: "💊 Medication Reminder (Test Alarm)",
        body: `Medication Reminder:\nPatient: ${patientName}\nMedicine: Metformin (500mg)\nIt is time to take your medication.\nTime: 08:00 AM`,
        icon: "/chatbot-logo.png",
        badge: "/chatbot-logo.png",
        url: "/#medicine-tracker",
        data: {
          url: "/#medicine-tracker",
          type: "MEDICATION_REMINDER_TEST",
        },
      });

      for (const sub of allSubs) {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sentCount++;
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            if (sub.id) {
              await supabaseServer.from("push_subscriptions").delete().eq("id", sub.id);
            }
            syncedSubscriptionsStore.delete(sub.endpoint);
          }
        }
      }
    }

    const success = sentCount > 0 || smsSent;
    let message = "";
    if (sentCount > 0 && smsSent) {
      message = `Test alarm sent to browser notifications AND registered mobile (${targetPhone})!`;
    } else if (smsSent) {
      message = `Test SMS reminder dispatched to registered mobile (${targetPhone})!`;
    } else if (sentCount > 0) {
      message = "Test alarm notification sent successfully to browser!";
    } else {
      message = "No browser subscription or registered phone number found to receive test.";
    }

    return {
      success,
      sent: sentCount,
      smsSent,
      smsDetails,
      message,
    };
  } catch (error: any) {
    return { success: false, error: error?.message || "Internal error sending test push" };
  }
}

let reminderCronTimer: NodeJS.Timeout | null = null;

export function startMedicationReminderCron(intervalMs: number = 60000) {
  if (reminderCronTimer) {
    clearInterval(reminderCronTimer);
  }

  console.log(`[Medication Reminders] Automated backend cron active (Interval: ${intervalMs / 1000}s, Timezone: Asia/Kolkata)`);

  // Run initial check after 10 seconds, then tick every 60 seconds
  setTimeout(() => {
    processMedicationReminders().catch((e) => console.warn("[Medication Reminders] Cron initial check notice:", e));
  }, 10000);

  reminderCronTimer = setInterval(() => {
    processMedicationReminders().catch((e) => console.warn("[Medication Reminders] Cron tick error:", e));
  }, intervalMs);
}
