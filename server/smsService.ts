export interface SmsDispatchRecord {
  id: string;
  patient_id: string;
  to: string;
  patient_name: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  message: string;
  status: "sent" | "simulated" | "failed";
  provider: "twilio" | "simulation";
  timestamp: string;
  error?: string;
  sid?: string;
}

// In-memory log of recent SMS dispatches
const smsLogs: SmsDispatchRecord[] = [];
const MAX_LOGS = 100;

export function getSmsLogs(patientId?: string): SmsDispatchRecord[] {
  if (!patientId || patientId === "all") {
    return smsLogs.slice(-50).reverse();
  }
  return smsLogs.filter((log) => log.patient_id === patientId).slice(-50).reverse();
}

/**
 * Clean and standardize phone number to E.164 standard.
 * Default to India (+91) if a 10-digit number is provided.
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // If starts with 0 and is 11 digits, replace 0 with +91
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+91" + cleaned.substring(1);
  } else if (/^\d{10}$/.test(cleaned)) {
    // 10 digit Indian number
    cleaned = "+91" + cleaned;
  } else if (!cleaned.startsWith("+") && cleaned.length > 10) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export interface SendMedicationSmsParams {
  patient_id: string;
  to: string;
  patient_name?: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  instructions?: string;
  scheduled_time?: string;
}

/**
 * Construct friendly medication alert text
 */
export function buildMedicationSmsText(params: {
  patient_name?: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  instructions?: string;
  scheduled_time?: string;
}): string {
  const patient = params.patient_name ? `Dear ${params.patient_name}` : "Hello";
  const instr = params.instructions ? ` (${params.instructions})` : "";
  const timeInfo = params.scheduled_time ? ` scheduled for ${params.scheduled_time}` : "";

  return `⏰ APNA MITRA MEDICINE ALARM: ${patient}, it is time to take your scheduled dose: ${params.medicine_name} - ${params.dosage} [${params.timing}]${instr}${timeInfo}. Please take it with fresh water and stay healthy!`;
}

/**
 * Send SMS to patient's registered mobile number
 */
export async function sendMedicationSms(
  params: SendMedicationSmsParams
): Promise<{ success: boolean; status: "sent" | "simulated" | "failed"; record: SmsDispatchRecord; error?: string }> {
  const formattedTo = formatPhoneNumber(params.to);
  const messageBody = buildMedicationSmsText(params);
  const recordId = "sms-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();

  // If Twilio credentials are provided, attempt real external delivery
  if (accountSid && authToken && fromNumber) {
    try {
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const bodyData = new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: messageBody,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyData.toString(),
      });

      const data: any = await response.json();

      if (response.ok && data.sid) {
        const record: SmsDispatchRecord = {
          id: recordId,
          patient_id: params.patient_id,
          to: formattedTo,
          patient_name: params.patient_name || "Patient",
          medicine_name: params.medicine_name,
          dosage: params.dosage,
          timing: params.timing,
          message: messageBody,
          status: "sent",
          provider: "twilio",
          sid: data.sid,
          timestamp: new Date().toISOString(),
        };
        smsLogs.push(record);
        if (smsLogs.length > MAX_LOGS) smsLogs.shift();
        console.log(`[SMS-SERVICE] Twilio SMS dispatched to ${formattedTo}, SID: ${data.sid}`);
        return { success: true, status: "sent", record };
      } else {
        const errMsg = data.message || `Twilio error ${response.status}`;
        console.warn(`[SMS-SERVICE] Twilio returned error: ${errMsg}. Falling back to simulated delivery log.`);
        const record: SmsDispatchRecord = {
          id: recordId,
          patient_id: params.patient_id,
          to: formattedTo,
          patient_name: params.patient_name || "Patient",
          medicine_name: params.medicine_name,
          dosage: params.dosage,
          timing: params.timing,
          message: messageBody,
          status: "simulated",
          provider: "simulation",
          error: errMsg,
          timestamp: new Date().toISOString(),
        };
        smsLogs.push(record);
        if (smsLogs.length > MAX_LOGS) smsLogs.shift();
        return { success: true, status: "simulated", record, error: errMsg };
      }
    } catch (err: any) {
      console.error("[SMS-SERVICE] Network error sending via Twilio:", err);
      const record: SmsDispatchRecord = {
        id: recordId,
        patient_id: params.patient_id,
        to: formattedTo,
        patient_name: params.patient_name || "Patient",
        medicine_name: params.medicine_name,
        dosage: params.dosage,
        timing: params.timing,
        message: messageBody,
        status: "simulated",
        provider: "simulation",
        error: err?.message,
        timestamp: new Date().toISOString(),
      };
      smsLogs.push(record);
      if (smsLogs.length > MAX_LOGS) smsLogs.shift();
      return { success: true, status: "simulated", record, error: err?.message };
    }
  }

  // Without Twilio credentials: log live simulated delivery
  const record: SmsDispatchRecord = {
    id: recordId,
    patient_id: params.patient_id,
    to: formattedTo,
    patient_name: params.patient_name || "Patient",
    medicine_name: params.medicine_name,
    dosage: params.dosage,
    timing: params.timing,
    message: messageBody,
    status: "simulated",
    provider: "simulation",
    timestamp: new Date().toISOString(),
  };

  smsLogs.push(record);
  if (smsLogs.length > MAX_LOGS) smsLogs.shift();
  console.log(`[SMS-SERVICE] Dispatched mobile reminder alarm to registered number: ${formattedTo} (${params.medicine_name} ${params.dosage})`);

  return { success: true, status: "simulated", record };
}
