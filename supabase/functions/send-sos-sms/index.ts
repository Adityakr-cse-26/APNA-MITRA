import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import webPush from "npm:web-push@3.6.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VAPID_PUBLIC_KEY = 'BKbl38v0s7bo7hKSSyXHmmVbo0RWdGAC7AxlHVCLv4dgyn_g5rVxPNicAcTthXxMnL64pD4eFx9HzDN_6L48iqk';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? 'k_Kv-KQeJitREkwOrHhiCWqypAyWBTJU0TI2PY5V1hQ';

webPush.setVapidDetails(
  'mailto:support@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { alert_id } = await req.json()
    console.log("[Log] Received alert_id:", alert_id);

    if (!alert_id) {
      return new Response(JSON.stringify({ error: 'alert_id is required' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: alert, error: fetchError } = await supabaseClient
      .from('emergency_alerts')
      .select('*')
      .eq('id', alert_id)
      .single()

    if (fetchError || !alert) {
      console.log("[Log] Finding emergency_alerts record failed:", fetchError);
      return new Response(JSON.stringify({ error: 'Alert not found or access denied' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log("[Log] Finding emergency_alerts record succeeded for patient:", alert.patient_id);

    if (alert.notification_status === 'sent') {
      console.log("[Log] Alert already sent");
      return new Response(JSON.stringify({ success: true, message: 'Notification already sent previously' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: profile } = await supabaseService.from('profiles').select('full_name').eq('id', alert.patient_id).single()
    const patientName = profile?.full_name || 'A patient'
    console.log("[Log] Finding caretaker/patient profile succeeded:", patientName);

    // Fetch push subscriptions for this patient
    let subscriptions = [];
    let subError = null;
    
    // 1. Find the primary caretaker
    const { data: primaryCaretaker } = await supabaseService
      .from('caretakers')
      .select('id')
      .eq('patient_id', alert.patient_id)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle();

    if (primaryCaretaker?.id) {
      console.log("[Log] Finding push subscription for primary caretaker_id:", primaryCaretaker.id);
      const { data, error } = await supabaseService
        .from('push_subscriptions')
        .select('*')
        .eq('caretaker_id', primaryCaretaker.id);
      subscriptions = data;
      subError = error;
    } else {
      // Fallback
      console.log("[Log] Finding push subscription for patient_uid:", alert.patient_id);
      const { data, error } = await supabaseService
        .from('push_subscriptions')
        .select('*')
        .eq('patient_uid', alert.patient_id);
      subscriptions = data;
      subError = error;
    }

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log("[Log] No subscriptions found, updating status to failed");
      await supabaseService.from('emergency_alerts').update({ notification_status: 'failed' }).eq('id', alert_id);
      return new Response(JSON.stringify({ error: 'Caretaker has not enabled emergency notifications.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log(`[Log] Found ${subscriptions.length} push subscriptions`);

    let bodyText = "The patient has triggered an emergency SOS.";
    let actionUrl = '/';

    if (alert.location_lat && alert.location_lng) {
      bodyText += '\n\n📍 Patient location is available.';
      actionUrl = `/guardian/map/${alert_id}`;
    } else {
      bodyText += '\n\nPlease contact the patient immediately.';
    }

    const payload = JSON.stringify({
      title: '🚨 EMERGENCY SOS ALERT',
      body: bodyText,
      url: actionUrl,
      data: {
         url: actionUrl
      },
      actions: alert.location_lat ? [{ action: "view_location", title: "View Patient Location" }] : undefined
    });

    let successCount = 0;
    let lastError = null;

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        console.log("[Log] Web Push request to endpoint:", sub.endpoint);
        await webPush.sendNotification(pushSubscription, payload);
        console.log("[Log] Web Push response/error: SUCCESS for", sub.endpoint);
        successCount++;
      } catch (err) {
        console.error('[Log] Web Push response/error: FAILED for', sub.endpoint, err);
        lastError = err;
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log("[Log] Removing expired subscription:", sub.id);
          await supabaseService.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    if (successCount === 0) {
      console.log("[Log] Final notification status: ALL FAILED");
      await supabaseService.from('emergency_alerts').update({ notification_status: 'failed' }).eq('id', alert_id);
      return new Response(JSON.stringify({ error: 'Failed to send push notifications: ' + (lastError?.message || 'Unknown Error') }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log("[Log] Final notification status: SUCCESS, updating db to sent");
    await supabaseService.from('emergency_alerts').update({ notification_status: 'sent' }).eq('id', alert_id);
    return new Response(JSON.stringify({ success: true, message: `Sent ${successCount} notifications` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})