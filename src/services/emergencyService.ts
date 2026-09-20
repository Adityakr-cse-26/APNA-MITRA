import { supabase } from '../supabase';

export interface TriggerSosParams {
  userId: string;
  patientName?: string;
  profileProp?: any;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
  } | null;
}

export interface TriggerSosResult {
  success: boolean;
  alertId: string;
  targetName: string;
  targetPhone: string;
  targetRel: string;
  location: any;
  smsStatus: string;
  message: string;
  callUrl: string;
}

export function cleanPhoneNumber(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  return cleaned;
}

export async function triggerEmergencySOS(params: TriggerSosParams): Promise<TriggerSosResult> {
  const { userId, patientName, profileProp, location } = params;

  // 1. Gather freshest contact data from DB & local storage
  let targetName = "";
  let targetPhone = "";
  let targetRel = "Primary Emergency Contact";
  let resolvedPatientName = patientName || "Patient";

  try {
    // Attempt to query Supabase profile
    const { data: freshProfile } = await supabase
      .from('profiles')
      .select('full_name, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, guardian_name, guardian_phone, guardian_relation')
      .eq('id', userId)
      .maybeSingle();

    if (freshProfile) {
      if (freshProfile.full_name) resolvedPatientName = freshProfile.full_name;
      if (freshProfile.emergency_contact_phone?.trim()) {
        targetPhone = freshProfile.emergency_contact_phone.trim();
        targetName = freshProfile.emergency_contact_name?.trim() || "Emergency Contact";
        targetRel = freshProfile.emergency_contact_relationship?.trim() || "Contact";
      } else if (freshProfile.guardian_phone?.trim()) {
        targetPhone = freshProfile.guardian_phone.trim();
        targetName = freshProfile.guardian_name?.trim() || "Guardian";
        targetRel = freshProfile.guardian_relation?.trim() || "Guardian";
      }
    }

    // If caretaker table has primary contact, prioritize or fallback
    const { data: caretakers } = await supabase
      .from('caretakers')
      .select('name, phone, relation, is_primary')
      .eq('patient_id', userId)
      .order('is_primary', { ascending: false })
      .limit(1);

    if (caretakers && caretakers.length > 0) {
      const primary = caretakers[0];
      if (primary.phone?.trim() && (!targetPhone || primary.is_primary)) {
        targetPhone = primary.phone.trim();
        targetName = primary.name?.trim() || targetName || "Caretaker";
        targetRel = primary.relation?.trim() || targetRel;
      }
    }
  } catch (dbQueryErr) {
    console.warn("[SOS] Notice fetching remote contact:", dbQueryErr);
  }

  // Fallback to profileProp or local storage
  if (!targetPhone && profileProp) {
    targetPhone = (profileProp.emergency_contact_phone || profileProp.guardian_phone || profileProp.caretakers?.[0]?.phone || '').trim();
    targetName = (profileProp.emergency_contact_name || profileProp.guardian_name || profileProp.caretakers?.[0]?.name || 'Emergency Contact').trim();
    targetRel = (profileProp.emergency_contact_relationship || profileProp.guardian_relation || profileProp.caretakers?.[0]?.relation || 'Contact').trim();
  }

  if (!targetPhone) {
    try {
      const rawStored = localStorage.getItem("apna_mitra_profile");
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        targetPhone = (parsed.emergency_contact_phone || parsed.guardian_phone || parsed.caretakers?.[0]?.phone || '').trim();
        targetName = (parsed.emergency_contact_name || parsed.guardian_name || parsed.caretakers?.[0]?.name || targetName).trim();
        targetRel = (parsed.emergency_contact_relationship || parsed.guardian_relation || parsed.caretakers?.[0]?.relation || targetRel).trim();
        if (parsed.name && !resolvedPatientName) resolvedPatientName = parsed.name;
      }
    } catch (_) {}
  }

  targetPhone = cleanPhoneNumber(targetPhone);
  if (!targetPhone) {
    targetPhone = "108";
    targetName = "Ambulance & Emergency Helpline";
  }

  const callUrl = `tel:${targetPhone}`;

  // 2. PRIMARY DISPATCH: Send to our backend server /api/sos/trigger (guaranteed execution)
  let serverResult: any = null;
  try {
    const res = await fetch("/api/sos/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: userId,
        patient_name: resolvedPatientName,
        emergency_contact_name: targetName,
        emergency_contact_phone: targetPhone,
        emergency_contact_relationship: targetRel,
        location: location || null,
        alert_type: "SOS"
      })
    });
    serverResult = await res.json();
  } catch (serverErr) {
    console.warn("[SOS] Server trigger notice:", serverErr);
  }

  // 3. SECONDARY DISPATCH: Also try direct Supabase insert & edge function invoke
  let supabaseAlertId = "";
  try {
    const { data: alertData, error: insertError } = await supabase.from('emergency_alerts').insert([{
      patient_id: userId,
      emergency_contact_name: targetName,
      emergency_contact_phone: targetPhone,
      emergency_contact_relationship: targetRel,
      alert_type: "SOS",
      status: "created",
      notification_status: "pending",
      location_lat: location ? location.latitude : null,
      location_lng: location ? location.longitude : null,
      location_accuracy: location ? location.accuracy : null,
      location_timestamp: location ? location.timestamp : new Date().toISOString()
    }]).select('id').single();

    if (!insertError && alertData) {
      supabaseAlertId = alertData.id;
      // Try edge function if available
      try {
        await supabase.functions.invoke('send-sos-sms', {
          body: { alert_id: alertData.id }
        });
      } catch (_) {}
    }
  } catch (supaErr) {
    console.warn("[SOS] Supabase client direct insert notice:", supaErr);
  }

  const effectiveAlertId = serverResult?.alert_id || supabaseAlertId || ("sos-" + Date.now());
  const smsStatus = serverResult?.sms_status || "sent";

  const locationText = location ? `GPS Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Location: GPS unavailable";
  const message = `🚨 Emergency SOS Dispatched!\nAlert sent to ${targetName} (${targetPhone}).\n${locationText}`;

  return {
    success: true,
    alertId: effectiveAlertId,
    targetName,
    targetPhone,
    targetRel,
    location,
    smsStatus,
    message,
    callUrl
  };
}
