import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";
import { sendMedicationSms } from "./smsService";

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
    name: string;
    dosage: string;
    timing?: string;
    scheduledTime?: string;
    scheduled_time?: string;
    instructions?: string;
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

export function getPatientLocalTime(timezone?: string): { doseDate: string; doseTime: string; currentMinutes: number } {
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

    return { doseDate, doseTime, currentMinutes: h * 60 + m };
  } catch {
    const now = new Date();
    const iso = now.toISOString();
    const doseDate = iso.split("T")[0];
    const doseTime = iso.split("T")[1].slice(0, 5);
    const [h, m] = doseTime.split(":").map(Number);
    return { doseDate, doseTime, currentMinutes: h * 60 + m };
  }
}

/**
 * Checks all active medications and sends push reminders for due doses.
 * Deduplication is strictly enforced by checking medication_reminder_logs.
 */
export async function processMedicationReminders(filterPatientId?: string) {
  try {
    const patientMap = new Map<string, any[]>();

    // 1. Try querying remote Supabase database
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
      console.warn("[Server Reminder] Supabase medications table check notice:", dbErr);
    }

    // 2. Also check in-memory synced store from web clients
    for (const [pId, schedule] of syncedMedicationsStore.entries()) {
      if (filterPatientId && pId !== filterPatientId) continue;
      if (!patientMap.has(pId)) patientMap.set(pId, []);
      for (const m of schedule.medications) {
        patientMap.get(pId)!.push({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          timing: m.timing,
          scheduled_time: m.scheduledTime || m.scheduled_time,
          instructions: m.instructions,
          taken_today: m.takenToday ?? m.taken_today ?? false,
          snoozed_until: m.snoozedUntil,
        });
      }
    }

    if (patientMap.size === 0) {
      return { success: true, processed: 0, sent: 0, reason: "No medications found" };
    }

    let totalProcessed = 0;
    let totalSent = 0;
    let totalSkippedAlreadySent = 0;

    for (const [patientId, meds] of patientMap.entries()) {
      // Gather subscriptions from both DB and in-memory store
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
      } catch (subErr) {
        console.warn("[Server Reminder] Subscriptions DB query notice:", subErr);
      }

      // In-memory synced subs
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

      // Get synced patient info or database profile
      const syncedMeta = syncedMedicationsStore.get(patientId);
      let patientPhone = syncedMeta?.patient_phone;
      let patientName = syncedMeta?.patient_name || "Patient";
      let caretakerPhone = syncedMeta?.caretaker_phone;
      const smsEnabled = syncedMeta?.sms_enabled !== false;

      // If phone wasn't provided in memory, look up from profiles table in database
      if (!patientPhone && patientId && patientId !== "anonymous") {
        try {
          const { data: prof } = await supabaseServer
            .from("profiles")
            .select("full_name, phone, guardian_phone")
            .eq("id", patientId)
            .maybeSingle();
          if (prof) {
            if (prof.phone) patientPhone = prof.phone;
            if (prof.full_name) patientName = prof.full_name;
            if (prof.guardian_phone) caretakerPhone = prof.guardian_phone;
          }
        } catch {
          // ignore
        }
      }

      // If neither push subscriptions nor registered mobile phone exist, skip
      if (allSubs.length === 0 && !patientPhone) {
        continue;
      }

      const patientTimezone = allSubs[0]?.timezone || syncedMeta?.timezone || "Asia/Kolkata";
      const { doseDate, currentMinutes } = getPatientLocalTime(patientTimezone);

      for (const med of meds) {
        totalProcessed++;

        if (med.taken_today === true) {
          continue;
        }

        // Check if snoozed
        if (med.snoozed_until && Date.now() < med.snoozed_until) {
          continue;
        }

        const scheduled24 = normalizeTimeTo24Hour(med.scheduled_time, med.timing);
        const [schedH, schedM] = scheduled24.split(":").map(Number);
        const scheduledMinutes = schedH * 60 + schedM;

        // Check if dose is due within 15-minute window
        const minuteDiff = currentMinutes - scheduledMinutes;
        const isDue = minuteDiff >= 0 && minuteDiff <= 15;

        if (!isDue) {
          continue;
        }

        // Deduplication check via medication_reminder_logs
        try {
          const { data: existingLog } = await supabaseServer
            .from("medication_reminder_logs")
            .select("id")
            .eq("medication_id", String(med.id))
            .eq("dose_date", doseDate)
            .eq("dose_time", scheduled24)
            .maybeSingle();

          if (existingLog) {
            totalSkippedAlreadySent++;
            continue;
          }
        } catch {
          // If table doesn't exist, continue
        }

        let medSent = false;

        // 1. Dispatch Web Push if active browser subscriptions exist
        if (allSubs.length > 0) {
          const dosageInfo = med.dosage ? ` (${med.dosage})` : "";
          const instructionsInfo = med.instructions ? ` - ${med.instructions}` : "";
          const bodyText = `Medicine Reminder: It's time to take ${med.name}.${dosageInfo}${instructionsInfo}`;

          const payload = JSON.stringify({
            title: "💊 Medicine Reminder",
            body: bodyText,
            icon: "/chatbot-logo.png",
            badge: "/chatbot-logo.png",
            url: "/#medicine-tracker",
            data: {
              url: "/#medicine-tracker",
              medication_id: med.id,
              type: "MEDICATION_REMINDER",
            },
            actions: [
              { action: "open_tracker", title: "Open Tracker" },
            ],
          });

          for (const sub of allSubs) {
            try {
              await webPush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
              );
              medSent = true;
            } catch (err: any) {
              console.error(`[Server Reminder] Push error for ${sub.endpoint}:`, err?.message || err);
              if (err?.statusCode === 410 || err?.statusCode === 404) {
                if (sub.id) {
                  await supabaseServer.from("push_subscriptions").delete().eq("id", sub.id);
                }
                syncedSubscriptionsStore.delete(sub.endpoint);
              }
            }
          }
        }

        // 2. Dispatch SMS / Mobile Alert to patient's registered mobile number
        if (patientPhone && smsEnabled) {
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
              medSent = true;
              console.log(`[Server Reminder] SMS alarm sent to patient mobile ${patientPhone} for ${med.name} (${smsResult.status})`);
            }

            // Optionally notify primary caregiver/guardian if registered and different
            if (caretakerPhone && caretakerPhone.trim() !== patientPhone.trim()) {
              await sendMedicationSms({
                patient_id: patientId,
                to: caretakerPhone,
                patient_name: `${patientName}'s Caretaker`,
                medicine_name: med.name,
                dosage: med.dosage,
                timing: med.timing || "Scheduled Dose",
                instructions: `Caregiver Alert: ${patientName} is scheduled to take ${med.name} (${med.dosage}). ${med.instructions || ""}`,
                scheduled_time: scheduled24,
              });
            }
          } catch (smsErr) {
            console.error(`[Server Reminder] SMS dispatch error for ${patientPhone}:`, smsErr);
          }
        }

        if (medSent) {
          totalSent++;
          try {
            await supabaseServer
              .from("medication_reminder_logs")
              .insert({
                medication_id: String(med.id),
                patient_uid: patientId,
                dose_date: doseDate,
                dose_time: scheduled24,
                sent_at: new Date().toISOString(),
              });
          } catch (logErr: any) {
            // ignore if log table not created
          }
        }
      }
    }

    return {
      success: true,
      processed: totalProcessed,
      sent: totalSent,
      skipped_already_sent: totalSkippedAlreadySent,
    };
  } catch (error: any) {
    console.error("[Server Reminder] Process error:", error);
    return { success: false, error: error?.message || "Process error" };
  }
}

/**
 * Sends an immediate test alarm notification to a patient's subscribed devices.
 */
export async function sendTestReminderPush(patientId: string, phone?: string) {
  try {
    const syncedMeta = syncedMedicationsStore.get(patientId);
    const targetPhone = phone || syncedMeta?.patient_phone;
    let smsSent = false;
    let smsDetails: any = null;

    if (targetPhone) {
      try {
        const result = await sendMedicationSms({
          patient_id: patientId,
          to: targetPhone,
          patient_name: syncedMeta?.patient_name || "Patient",
          medicine_name: syncedMeta?.medications[0]?.name || "Metformin",
          dosage: syncedMeta?.medications[0]?.dosage || "500mg",
          timing: "Morning Dose",
          instructions: "Test alarm sent to verify your registered mobile number",
        });
        smsSent = result.success;
        smsDetails = result;
      } catch (smsErr) {
        console.warn("[Server Reminder] Test SMS error:", smsErr);
      }
    }

    const allSubs: Array<{ id?: string; endpoint: string; p256dh: string; auth: string }> = [];

    // Query DB
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
    } catch (e) {
      console.warn("[Server Reminder] Test push DB error:", e);
    }

    // In-memory synced subs
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
        title: "💊 Medicine Reminder (Test Alarm)",
        body: "Medicine Reminder: It's time to take your scheduled medicine. Your reminder alarm is working properly!",
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
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          sentCount++;
        } catch (err: any) {
          console.error("[Server Reminder] Test push delivery error:", err?.message || err);
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

  console.log(`[Medication Reminders] Server-side scheduler active (Interval: ${intervalMs / 1000}s)`);

  // Run initial check after 10 seconds, then every 60 seconds
  setTimeout(() => {
    processMedicationReminders().catch((e) => console.warn("[Medication Reminders] Cron initial error:", e));
  }, 10000);

  reminderCronTimer = setInterval(() => {
    processMedicationReminders().catch((e) => console.warn("[Medication Reminders] Cron tick error:", e));
  }, intervalMs);
}
