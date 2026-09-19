import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import webPush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC_KEY = 'BKbl38v0s7bo7hKSSyXHmmVbo0RWdGAC7AxlHVCLv4dgyn_g5rVxPNicAcTthXxMnL64pD4eFx9HzDN_6L48iqk';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? 'k_Kv-KQeJitREkwOrHhiCWqypAyWBTJU0TI2PY5V1hQ';

webPush.setVapidDetails(
  'mailto:support@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Normalize any time string into standard 24-hour "HH:mm"
function normalizeTimeTo24Hour(timeStr?: string, timingCategory?: string): string {
  if (timeStr && timeStr.trim()) {
    const clean = timeStr.trim().toUpperCase();

    // 12-hour format with AM/PM
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const modifier = match12[3];

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    // 24-hour format
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

// Get patient's local date (YYYY-MM-DD) and current time (HH:mm) in their timezone
function getPatientLocalTimeAndDate(timezone?: string): { doseDate: string; doseTime: string; currentMinutes: number } {
  const tz = timezone || 'Asia/Kolkata';
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
  } catch (err) {
    const now = new Date();
    const iso = now.toISOString();
    const doseDate = iso.split("T")[0];
    const doseTime = iso.split("T")[1].slice(0, 5);
    const [h, m] = doseTime.split(":").map(Number);
    return { doseDate, doseTime, currentMinutes: h * 60 + m };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = body.action || 'check_all';
    console.log(`[Medication Reminders] Action: ${action}, PatientId: ${body.patient_id || 'all'}`);

    // ACTION: TEST NOTIFICATION
    if (action === 'test') {
      const patientId = body.patient_id;
      if (!patientId) {
        return new Response(JSON.stringify({ error: 'patient_id is required for test' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch patient's active push subscriptions
      const { data: subs, error: subError } = await supabaseService
        .from('push_subscriptions')
        .select('*')
        .eq('patient_uid', patientId);

      if (subError || !subs || subs.length === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'No push notification subscription found for this user. Please enable notifications in the Medication Tracker first.' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const payload = JSON.stringify({
        title: '💊 Medicine Reminder (Test Alarm)',
        body: "Medicine Reminder: It's time to take your scheduled medicine. Your reminder alarm is working properly!",
        icon: '/chatbot-logo.png',
        badge: '/chatbot-logo.png',
        url: '/#medicine-tracker',
        data: {
          url: '/#medicine-tracker',
          type: 'MEDICATION_REMINDER_TEST',
        },
      });

      let sentCount = 0;
      for (const sub of subs) {
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
          console.error('[Medication Reminders] Test Push Error:', err?.message || err);
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabaseService.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      }

      return new Response(JSON.stringify({
        success: sentCount > 0,
        sent: sentCount,
        message: sentCount > 0 ? 'Test alarm notification sent successfully!' : 'Failed to deliver notification to browser.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: CHECK DUE MEDICATIONS (CRON OR CLIENT CHECK)
    let query = supabaseService.from('medications').select('*');
    if (body.patient_id) {
      query = query.eq('patient_id', body.patient_id);
    }

    const { data: medications, error: medError } = await query;
    if (medError) {
      throw medError;
    }

    if (!medications || medications.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No medications found in database.',
        processed: 0,
        sent: 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group medications by patient
    const patientMap = new Map<string, any[]>();
    for (const med of medications) {
      const pId = med.patient_id;
      if (!pId) continue;
      if (!patientMap.has(pId)) patientMap.set(pId, []);
      patientMap.get(pId)!.push(med);
    }

    let totalProcessed = 0;
    let totalSent = 0;
    let totalSkippedAlreadySent = 0;
    const deliveryLogs: any[] = [];

    for (const [patientId, meds] of patientMap.entries()) {
      // 1. Fetch patient's push subscriptions
      const { data: subs } = await supabaseService
        .from('push_subscriptions')
        .select('*')
        .eq('patient_uid', patientId);

      if (!subs || subs.length === 0) continue;

      // Check if reminders are enabled for this patient (if column exists)
      const activeSubs = subs.filter((s) => s.reminders_enabled !== false);
      if (activeSubs.length === 0) continue;

      // 2. Resolve patient's timezone
      const patientTimezone = activeSubs[0].timezone || 'Asia/Kolkata';
      const { doseDate, doseTime, currentMinutes } = getPatientLocalTimeAndDate(patientTimezone);

      for (const med of meds) {
        totalProcessed++;

        // If dose already taken today, skip
        if (med.taken_today === true) {
          continue;
        }

        const scheduled24 = normalizeTimeTo24Hour(med.scheduled_time, med.timing);
        const [schedH, schedM] = scheduled24.split(':').map(Number);
        const scheduledMinutes = schedH * 60 + schedM;

        // Check if dose is due within a 15-minute window
        // (Allows cron that runs every 1-5 minutes to catch it without missing due to cron jitter)
        const minuteDiff = currentMinutes - scheduledMinutes;
        const isDue = minuteDiff >= 0 && minuteDiff <= 15;

        if (!isDue) {
          continue;
        }

        // 3. Deduplication check: Has a reminder already been logged for this medication on this doseDate at this scheduled time?
        const { data: existingLog } = await supabaseService
          .from('medication_reminder_logs')
          .select('id')
          .eq('medication_id', String(med.id))
          .eq('dose_date', doseDate)
          .eq('dose_time', scheduled24)
          .maybeSingle();

        if (existingLog) {
          totalSkippedAlreadySent++;
          continue;
        }

        // 4. Construct standard reminder notification payload
        // Rule: "Medicine Reminder: It's time to take [medicine name]."
        // No medical advice, keep prescribed instructions only.
        const dosageInfo = med.dosage ? ` (${med.dosage})` : '';
        const instructionsInfo = med.instructions ? ` - ${med.instructions}` : '';
        const bodyText = `Medicine Reminder: It's time to take ${med.name}.${dosageInfo}${instructionsInfo}`;

        const payload = JSON.stringify({
          title: '💊 Medicine Reminder',
          body: bodyText,
          icon: '/chatbot-logo.png',
          badge: '/chatbot-logo.png',
          url: '/#medicine-tracker',
          data: {
            url: '/#medicine-tracker',
            medication_id: med.id,
            type: 'MEDICATION_REMINDER',
          },
          actions: [
            { action: 'open_tracker', title: 'Open Tracker' },
          ],
        });

        let medSent = false;
        for (const sub of activeSubs) {
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
            console.error('[Medication Reminders] Send push failed:', err?.message || err);
            if (err?.statusCode === 410 || err?.statusCode === 404) {
              await supabaseService.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }

        if (medSent) {
          totalSent++;
          // 5. Strictly record the sent reminder log in medication_reminder_logs to prevent duplicates
          try {
            await supabaseService
              .from('medication_reminder_logs')
              .insert({
                medication_id: String(med.id),
                patient_uid: patientId,
                dose_date: doseDate,
                dose_time: scheduled24,
                sent_at: new Date().toISOString(),
              });
          } catch (logErr: any) {
            console.warn('[Medication Reminders] Insert log error:', logErr?.message || logErr);
          }

          deliveryLogs.push({
            medication_id: med.id,
            medication_name: med.name,
            scheduled_time: scheduled24,
            dose_date: doseDate,
            patient_id: patientId,
            status: 'SENT',
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: totalProcessed,
      sent: totalSent,
      skipped_already_sent: totalSkippedAlreadySent,
      logs: deliveryLogs,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Medication Reminders] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
