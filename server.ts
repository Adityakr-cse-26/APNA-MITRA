import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  processMedicationReminders, 
  sendTestReminderPush, 
  startMedicationReminderCron,
  registerSyncedMedications,
  registerSyncedSubscription
} from "./server/medicationReminderJob";
import { sendMedicationSms, getSmsLogs } from "./server/smsService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy AI Client Helper
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
});

// Medication Reminder Scheduled Dispatch / Check Endpoint
app.all("/api/medication-reminders/check", async (req: Request, res: Response) => {
  try {
    const patient_id = req.body?.patient_id || req.query?.patient_id as string;
    const result = await processMedicationReminders(patient_id);
    res.json(result);
  } catch (error: any) {
    console.error("Medication reminder check error:", error);
    res.status(500).json({ success: false, error: error?.message || "Internal error" });
  }
});

// Medication Reminder Test Alarm Push & SMS Endpoint
app.post("/api/medication-reminders/test", async (req: Request, res: Response) => {
  try {
    const { patient_id, phone } = req.body;
    const targetUid = patient_id || "anonymous";
    const result = await sendTestReminderPush(targetUid, phone);
    res.json(result);
  } catch (error: any) {
    console.error("Medication reminder test error:", error);
    res.status(500).json({ success: false, error: error?.message || "Internal error" });
  }
});

// Direct Test SMS to Registered Phone Endpoint
app.post("/api/medication-reminders/test-sms", async (req: Request, res: Response) => {
  try {
    const { patient_id, phone, patient_name, medicine_name, dosage, timing } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Registered phone number is required" });
    }
    const result = await sendMedicationSms({
      patient_id: patient_id || "anonymous",
      to: phone,
      patient_name: patient_name || "Patient",
      medicine_name: medicine_name || "Metformin",
      dosage: dosage || "500mg",
      timing: timing || "Scheduled Dose",
      instructions: "Scheduled reminder alarm for your prescribed medicine",
    });
    res.json(result);
  } catch (error: any) {
    console.error("Medication test SMS error:", error);
    res.status(500).json({ success: false, error: error?.message || "Internal error" });
  }
});

// Get SMS Notification Logs Endpoint
app.get("/api/medication-reminders/sms-logs", (req: Request, res: Response) => {
  try {
    const patientId = req.query.patient_id as string;
    const logs = getSmsLogs(patientId);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Internal error" });
  }
});

// Medication Reminder Schedule Sync Endpoint (keeps server-side cron scheduler aware of client meds and registered phone)
app.post("/api/medication-reminders/sync", (req: Request, res: Response) => {
  try {
    const { patient_id, medications, timezone, patient_name, patient_phone, caretaker_phone, sms_enabled } = req.body;
    if (patient_id && Array.isArray(medications)) {
      registerSyncedMedications(patient_id, medications, timezone, {
        patient_name,
        patient_phone,
        caretaker_phone,
        sms_enabled,
      });
    }
    res.json({ success: true, count: medications?.length || 0 });
  } catch (err: any) {
    console.error("Medication reminder sync error:", err);
    res.status(500).json({ success: false, error: err?.message || "Internal error" });
  }
});

// Push Subscription Server Direct Sync
app.post("/api/push-subscriptions/save", (req: Request, res: Response) => {
  try {
    const { patient_id, subscription, timezone } = req.body;
    if (subscription?.endpoint && subscription?.keys) {
      registerSyncedSubscription({
        patient_id: patient_id || "anonymous",
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        timezone: timezone || "Asia/Kolkata",
        reminders_enabled: true,
        updatedAt: Date.now(),
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Push subscription save error:", err);
    res.status(500).json({ success: false, error: err?.message || "Internal error" });
  }
});

// 2. Symptom Checker Endpoint
app.post("/api/symptom-check", async (req: Request, res: Response) => {
  try {
    const { symptoms, duration, severity, ageGroup, language = "en" } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        summary: "Error: The Gemini API key is missing. Please configure it in the application settings.",
        triage_level: "Mild / Routine",
        care_recommendations: [],
        doctor_questions: [],
        red_flags: [],
      });
    }

    const prompt = `Perform a cautious, evidence-informed symptom assessment for:
- Symptoms: ${symptoms}
- Duration: ${duration || "Not specified"}
- Severity (1-10): ${severity || "Moderate"}
- Age Group: ${ageGroup || "Adult"}
- Language: ${language}

Act as a safe clinical triage assistant for seniors. You must strictly return a structured JSON response matching the schema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any, // @google/genai Type enum requires Type.OBJECT but since we didn't import Type we can use string "OBJECT" or import it
          properties: {
            triage_level: {
              type: "STRING" as any,
              description: "Must be exactly one of: 'Mild / Routine', 'Moderate / Schedule Doctor', or 'Emergency / Urgent'"
            },
            summary: {
              type: "STRING" as any,
              description: "Short, plain-language explanation of what might be happening."
            },
            care_recommendations: {
              type: "ARRAY" as any,
              items: { type: "STRING" as any },
              description: "3-4 gentle home care / relief tips."
            },
            doctor_questions: {
              type: "ARRAY" as any,
              items: { type: "STRING" as any },
              description: "3 specific questions the patient or elder should ask their doctor."
            },
            red_flags: {
              type: "ARRAY" as any,
              items: { type: "STRING" as any },
              description: "Warning signs indicating immediate emergency care is required."
            }
          },
          required: ["triage_level", "summary", "care_recommendations", "doctor_questions", "red_flags"]
        },
        systemInstruction: "You are a clinical decision support and patient communication AI. Be empathetic, objective, safe, and prioritize patient well-being.",
      },
    });

    const jsonText = response.text || "{}";
    try {
      const data = JSON.parse(jsonText);
      res.json(data);
    } catch {
      res.json({
        summary: "Error: Failed to parse Gemini response.",
        triage_level: "Mild / Routine",
        care_recommendations: [],
        doctor_questions: [],
        red_flags: [],
      });
    }
  } catch (error: any) {
    console.warn("Symptom check warning (API issue):", error?.message || "Unknown error");
    
    // Determine the type of error from the API
    const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota");
    const isOverloaded = error?.status === 503 || error?.message?.includes("503") || error?.message?.toLowerCase().includes("high demand") || error?.message?.toLowerCase().includes("overloaded");
    
    let userFriendlyMessage = "An unexpected error occurred while analyzing the symptoms. Please try again or consult a doctor directly.";
    if (isQuota) {
      userFriendlyMessage = "The AI service has reached its usage limit. Please wait a minute and try again.";
    } else if (isOverloaded) {
      userFriendlyMessage = "The AI symptom checker is currently experiencing high demand. This is temporary—please try again in a moment.";
    }
    
    res.json({
      summary: userFriendlyMessage,
      triage_level: "Mild / Routine",
      care_recommendations: ["Rest and monitor your symptoms safely.", "Try your request again in a few minutes."],
      doctor_questions: ["What could be causing these symptoms?", "Should I schedule a follow-up appointment?"],
      red_flags: ["Seek immediate emergency care if symptoms suddenly worsen, such as difficulty breathing or severe pain."],
    });
  }
});

// 3. Medical Report Analyzer Endpoint (supports text or uploaded base64 report images/PDFs)
app.post("/api/analyze-report", async (req: Request, res: Response) => {
  try {
    const { reportText, imageBase64, mimeType = "image/jpeg", language = "en" } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        title: "Error: Missing API Key",
        overview: "The Gemini API key is missing. Please configure it in the application settings.",
        parameters: [],
        doctorQuestions: [],
        lifestyleAdvice: []
      });
    }

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
        },
      });
    }

    const promptText = `Analyze this medical lab report / diagnostic document for a patient in ${language} language.
${reportText ? `Report Text / OCR Content:\n${reportText}\n` : ""}

Translate complex medical terminology into clear, accessible language.
Return ONLY valid JSON matching this schema:
{
  "title": "Short title of report type (e.g. Complete Blood Count & Lipid Profile)",
  "overview": "Clear 2-3 sentence patient-friendly summary of key findings",
  "parameters": [
    {
      "name": "Parameter Name (e.g. HbA1c)",
      "value": "Measured Value (e.g. 6.8%)",
      "standardRange": "Normal Reference Range (e.g. 4.0 - 5.6%)",
      "status": "Normal" | "Borderline" | "Elevated" | "Low" | "Requires Attention",
      "explanation": "What this test measures and what this value means in plain English / Hindi / Bengali"
    }
  ],
  "doctorQuestions": [
    "Thoughtful question 1 to ask the doctor during next visit",
    "Question 2",
    "Question 3"
  ],
  "lifestyleAdvice": [
    "Practical nutrition or routine tip 1",
    "Tip 2"
  ]
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a clinical laboratory educator who translates medical tests for patients. Never make definitive diagnostic proclamations or tell patients to stop prescribed medicine. Always direct final interpretation to their treating doctor.",
      },
    });

    const jsonText = response.text || "{}";
    try {
      const data = JSON.parse(jsonText);
      res.json(data);
    } catch {
      res.json({
        title: "Error: Parse Failed",
        overview: "Failed to parse Gemini response.",
        parameters: [],
        doctorQuestions: [],
        lifestyleAdvice: []
      });
    }
  } catch (error: any) {
    console.warn("Report analysis warning (API issue):", error?.message || "Unknown error");
    
    const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota");
    const isOverloaded = error?.status === 503 || error?.message?.includes("503") || error?.message?.toLowerCase().includes("high demand") || error?.message?.toLowerCase().includes("overloaded");
    
    let userFriendlyMessage = "An unexpected error occurred while analyzing the report. Please try again.";
    if (isQuota) {
      userFriendlyMessage = "The AI service has reached its usage limit. Please wait a minute and try again.";
    } else if (isOverloaded) {
      userFriendlyMessage = "The AI medical report analyzer is currently experiencing high demand. This is temporary—please try again in a moment.";
    }
    
    res.json({
      title: "Service Temporarily Unavailable",
      overview: userFriendlyMessage,
      parameters: [],
      doctorQuestions: ["What do these test results mean?", "Do I need to make any immediate lifestyle changes?"],
      lifestyleAdvice: []
    });
  }
});

// 4. Doctor Visit Preparation Generator Endpoint
app.post("/api/doctor-prep", async (req: Request, res: Response) => {
  try {
    const { patientName, age, vitals, symptoms, currentMedications, mainConcerns, language = "en" } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        summaryTitle: `Error: Missing API Key`,
        keyVitalsSnapshot: `N/A`,
        chiefComplaints: ["The Gemini API key is missing. Please configure it in the application settings."],
        medicationsList: [],
        topQuestionsForDoctor: [],
        checklist: []
      });
    }

    const prompt = `Generate a high-yield, structured 1-page "Doctor Visit Preparation Summary" for:
- Patient Name: ${patientName || "Patient"}
- Age: ${age || "Senior / Adult"}
- Recent Vitals: ${JSON.stringify(vitals || {})}
- Chief Symptoms/Complaints: ${symptoms || "Routine review"}
- Current Medications: ${JSON.stringify(currentMedications || [])}
- Patient's Core Concerns: ${mainConcerns || "General well-being"}
- Language: ${language}

Return JSON with:
{
  "summaryTitle": "Document Title",
  "keyVitalsSnapshot": "Formatted summary of vitals",
  "chiefComplaints": ["Complaint 1 with onset and severity", "Complaint 2"],
  "medicationsList": ["Medication 1 with schedule", "Medication 2"],
  "topQuestionsForDoctor": ["High priority question 1", "Question 2", "Question 3", "Question 4"],
  "checklist": ["Preparation item 1", "Preparation item 2", "Preparation item 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.warn("Doctor prep warning (API issue):", error?.message || "Unknown error");
    
    const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota");
    const isOverloaded = error?.status === 503 || error?.message?.includes("503") || error?.message?.toLowerCase().includes("high demand") || error?.message?.toLowerCase().includes("overloaded");
    
    let errorDesc = "An unexpected error occurred.";
    if (isQuota) {
      errorDesc = "AI service usage limit reached. Please wait a minute and try again.";
    } else if (isOverloaded) {
      errorDesc = "The AI service is experiencing high demand. Please try again later.";
    }
    
    res.json({
        summaryTitle: `Service Temporarily Unavailable`,
        keyVitalsSnapshot: `N/A`,
        chiefComplaints: [errorDesc],
        medicationsList: [],
        topQuestionsForDoctor: [],
        checklist: []
    });
  }
});

// 5. Senior Welfare & Government Scheme Lookup Endpoint
app.get("/api/schemes", (_req: Request, res: Response) => {
  res.json({
    schemes: [
      {
        id: "pmjay",
        name: "Ayushman Bharat PM-JAY (Senior 70+ Universal Coverage)",
        category: "Healthcare Insurance",
        coverage: "Up to ₹5 Lakh/year free hospitalization",
        eligibility: "All senior citizens aged 70 years and above irrespective of income",
        benefits: "Cashless secondary and tertiary hospitalization across empanelled private and public hospitals.",
        howToApply: "Register at beneficiary.nha.gov.in or visit nearest Ayushman Arogya Mandir / CSC center with Aadhaar card.",
        contact: "National Toll-Free: 14555",
        officialUrl: "https://pmjay.gov.in"
      },
      {
        id: "rvy",
        name: "Rashtriya Vayoshri Yojana (RVY)",
        category: "Assistive Devices & Aids",
        coverage: "Free physical aids & assisted-living devices",
        eligibility: "Senior citizens (aged 60+) belonging to BPL category or suffering from age-related disabilities",
        benefits: "Free supply of walking sticks, elbow crutches, walkers, hearing aids, wheelchairs, artificial teeth, and spectacles.",
        howToApply: "Apply through District Social Welfare Officer / ALIMCO assessment camps.",
        contact: "ALIMCO Helpline: 1800-180-5129",
        officialUrl: "https://socialjustice.gov.in"
      },
      {
        id: "ignyops",
        name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        category: "Financial Support",
        coverage: "Monthly pension support",
        eligibility: "Persons aged 60+ living below the poverty line",
        benefits: "Direct monthly pension credited to bank account (supplemented with state government top-ups).",
        howToApply: "Apply at local Gram Panchayat / Municipal Corporation office or online state portals.",
        contact: "Ministry of Rural Development portal",
        officialUrl: "https://nsap.nic.in"
      },
      {
        id: "cghs_echs",
        name: "CGHS & ECHS Healthcare Schemes",
        category: "Comprehensive Care",
        coverage: "Full OPD & IPD medical coverage for retired central govt / defense personnel",
        eligibility: "Retired central government employees, pensioners, and ex-servicemen",
        benefits: "Lifetime health cards, dispensaries, empanelled multispeciality hospital access.",
        howToApply: "Apply on CGHS/ECHS portal with PPO and pension records.",
        contact: "CGHS Helpline: 1800-208-8900",
        officialUrl: "https://cghs.nic.in"
      },
      {
        id: "rail_tax",
        name: "Senior Citizen Tax & Banking Concessions",
        category: "Financial Benefits",
        coverage: "Higher exemption limits and interest rates",
        eligibility: "Resident individuals aged 60+ (Senior) and 80+ (Super Senior)",
        benefits: "Higher basic exemption limit under Income Tax, Section 80TTB deduction up to ₹50,000 on interest, higher Fixed Deposit interest rates (0.50% - 0.75% extra).",
        howToApply: "Automatically availed at banks / ITR filing by submitting age proof.",
        contact: "Bank branch / Income Tax Dept",
        officialUrl: "https://incometax.gov.in"
      }
    ]
  });
});

// 6. Weekly AI Health Checkup & Prevention Tier Assessment Endpoint
app.post("/api/weekly-checkup-analysis", async (req: Request, res: Response) => {
  try {
    const { 
      symptoms = [], 
      energyLevel = "normal", 
      sleepHours = 7, 
      waterGlasses = 6, 
      vitals = [], 
      patientProfile = {}, 
      language = "en" 
    } = req.body;

    const ai = getAIClient();

    const hasSevereSymptom = symptoms.some((s: string) => 
      s.toLowerCase().includes("breath") || 
      s.toLowerCase().includes("dizz") || 
      s.toLowerCase().includes("chest")
    );
    const isProblem = hasSevereSymptom || symptoms.length >= 2 || energyLevel === "low" || sleepHours < 5;

    if (!ai) {
      return res.json({
        assessmentResult: "possible_problem",
        statusTitle: "Error: Missing API Key",
        summary: "The Gemini API key is missing. Please configure it in the application settings.",
        recommendedTier: "primary",
        recommendedDoctor: "N/A",
        actionPlan: [],
        doctorQuestions: [],
        redFlags: []
      });
    }

    const prompt = `Perform an evidence-informed, culturally warm geriatric weekly health checkup assessment for:
- Symptoms Checked: ${JSON.stringify(symptoms)}
- Energy Level: ${energyLevel}
- Sleep Duration: ${sleepHours} hours/night
- Daily Water Intake: ${waterGlasses} glasses
- Recorded Vitals: ${JSON.stringify(vitals)}
- Patient Profile: ${JSON.stringify(patientProfile)}
- Output Language: ${language} (en = English, hi = Hindi, bn = Bengali)

Evaluate if the senior is "normal" (stable routine health) or has a "possible_problem" (symptoms requiring doctor attention or lifestyle remediation).
Categorize the most appropriate Prevention Tier: "primary" (Awareness/Lifestyle), "secondary" (Early Detection/Screening), "tertiary" (Disease Treatment/Medication), or "quaternary" (Rehabilitation/Support).

Respond in pure JSON matching this exact schema:
{
  "assessmentResult": "normal" | "possible_problem",
  "statusTitle": "Short uppercase status banner",
  "summary": "Clear, compassionate 2-3 sentence explanation of findings in the chosen language",
  "recommendedTier": "primary" | "secondary" | "tertiary" | "quaternary",
  "recommendedDoctor": "Specialist name (e.g. Geriatric Orthopedic, Internal Medicine, Cardiologist)",
  "actionPlan": ["Specific actionable tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "doctorQuestions": ["Thoughtful question 1 for doctor", "Question 2", "Question 3"],
  "redFlags": ["Emergency warning sign if any"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a geriatric health assessment expert. Provide reassuring, medically sound, and safe advice. Never prescribe drugs or replace a real physician.",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.warn("Weekly checkup analysis warning (API issue):", error?.message || "Unknown error");
    
    const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota");
    const isOverloaded = error?.status === 503 || error?.message?.includes("503") || error?.message?.toLowerCase().includes("high demand") || error?.message?.toLowerCase().includes("overloaded");
    
    let errorDesc = "An unexpected error occurred during analysis.";
    if (isQuota) {
      errorDesc = "AI service usage limit reached. Please wait a minute and try again.";
    } else if (isOverloaded) {
      errorDesc = "The AI service is experiencing high demand. Please try again later.";
    }
    
    res.json({
        assessmentResult: "possible_problem",
        statusTitle: "Service Temporarily Unavailable",
        summary: errorDesc,
        recommendedTier: "primary",
        recommendedDoctor: "N/A",
        actionPlan: [],
        doctorQuestions: [],
        redFlags: []
    });
  }
});

// Healthcare AI Chatbot Endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], language = "en" } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    const lower = message.toLowerCase();

    // 1. Immediate Safety Check: Physical Medical Emergency
    const emergencyTriggers = [
      // English
      "chest pain", "heart attack", "crushing chest", "pressure in chest",
      "shortness of breath", "can't breathe", "cannot breathe", "difficulty breathing",
      "choking", "unconscious", "passed out", "fainted", "unresponsive",
      "severe bleeding", "coughing up blood", "vomiting blood", "stroke",
      "face drooping", "arm weakness", "slurred speech", "seizure", "convulsions",
      "anaphylaxis", "allergic reaction throat", "severe burn",
      // Hindi (Devanagari)
      "सीने में दर्द", "दिल का दौरा", "सांस नहीं आ रही", "बेहोश", "खून की उल्टी",
      // Bengali (Script)
      "বুকে ব্যথা", "হার্ট অ্যাটাক", "শ্বাস নিতে পারছি না", "অজ্ঞান", "রক্ত বমি",
      // Hinglish
      "seene me dard", "chaati me dard", "dil ka daura", "saans nahi aa rahi", "saans lene me dikkat",
      // Banglish
      "buker betha", "buke betha", "shash nite parchi na", "shash koshto", "rokto bomi"
    ];
    const isEmergency = emergencyTriggers.some(trigger => lower.includes(trigger));

    // 2. Immediate Safety Check: Self-Harm or Crisis
    const crisisTriggers = [
      // English
      "kill myself", "suicide", "end my life", "want to die", "wanna die",
      "hurt myself", "self harm", "don't want to live", "take my life",
      "ending it all", "better off dead", "cutting myself",
      // Hindi & Hinglish
      "आत्महत्या", "मरना चाहता", "जान दे दूंगा", "खुदकुशी",
      "marna chahta hoon", "jaan de dunga", "zindagi khatam karni", "khudkhushi",
      // Bengali & Banglish
      "আত্মহত্যা", "মরতে চাই", "বেঁচে থাকতে চাই না",
      "morte chai", "benche thakte chai na", "nijeke sesh kore debo"
    ];
    const isCrisis = crisisTriggers.some(trigger => lower.includes(trigger));

    const ai = getAIClient();

    // If Gemini client is unavailable, provide immediate rule-based safe healthcare advice
    if (!ai) {
      if (isEmergency) {
        return res.json({
          text: "🚨 **URGENT MEDICAL EMERGENCY WARNING**\n\nYour message mentions symptoms that may indicate an immediate, life-threatening emergency. **Please do not wait or rely on an AI.**\n\n• **Call Emergency Services immediately:** Dial **108** or **112** (in India), or **911**.\n• Go directly to the nearest hospital emergency department.\n• If you are alone, alert a family member, neighbor, or caretaker to stay with you.",
          isEmergency: true,
          isCrisis: false,
        });
      }
      if (isCrisis) {
        return res.json({
          text: "💙 **You are not alone, and help is available right now.**\n\nPlease reach out immediately to speak with someone who cares and can support you:\n\n• **Tele-MANAS (Govt of India):** Dial **14416** or **1800-891-4416** (24/7, Toll-Free)\n• **Vandrevala Foundation Helpline:** Call or WhatsApp **+91 9999 666 555**\n• **KIRAN Helpline:** Dial **1800-599-0019**\n• **Crisis Text Line / International:** Dial **988** or your local emergency services.\n\nPlease connect with a trusted family member, close friend, or healthcare professional right away.",
          isEmergency: false,
          isCrisis: true,
        });
      }
      return res.json({
        text: "Namaste! I am **Apna Mitra** (अपना मित्र), your AI Health & Wellness Support Companion.\n\nI am here to offer general physical, mental, and psychological wellness guidance and healthy living tips.\n\n*Please note: I am an AI assistant and not a medical doctor. I do not diagnose illnesses or prescribe prescription medicines. For personal medical diagnoses, always consult a qualified healthcare professional.*",
        isEmergency: false,
        isCrisis: false,
      });
    }

    const systemInstruction = `You are "Apna Mitra" (अपना मित्र), an empathetic, highly responsible, and knowledgeable AI Health and Wellness Support Companion for patients, seniors, and families.

========================================
1. IMPORTANT INFORMATION IN BOLD (MANDATORY FORMATTING)
========================================
- ALWAYS use Markdown formatting.
- BOLD THE MOST IMPORTANT INFORMATION, warnings, critical instructions, emergency advice, and red-flag symptoms using **bold text**.
  Example: **If you experience sudden severe chest pressure or shortness of breath, seek emergency medical care immediately.**
  Example: **Remember to drink at least 6-8 glasses of water throughout the day, unless restricted by your doctor.**
- DO NOT make the entire response bold. Only highlight crucial advice, action steps, safety warnings, and key metrics in bold so the text is immediately scannable and easy to read.
- Use short, digestible paragraphs (maximum 2-3 sentences each).
- Use clear bullet points (-) or numbered lists (1.) for step-by-step instructions, comfort tips, and wellness measures.

========================================
2. AUTOMATIC MULTILINGUAL UNDERSTANDING & MIRRORING (MANDATORY)
========================================
- Automatically detect the language, alphabet, and conversational style used by the user in their message.
- You must fluently understand English, Bengali (বাংলা), Hindi (हिंदी), Banglish (Bengali written in English letters, e.g., "amar matha betha korche", "ki korbo bolun", "pet kharap"), Hinglish (Hindi written in English letters, e.g., "mujhe chakkar aa rahe hain", "kya karna chahiye"), and other Indian languages.
- RESPOND IN THE EXACT SAME LANGUAGE AND SCRIPT the user used:
  * If the user writes in Banglish (Bengali with English letters) -> Reply in natural, friendly, caring Banglish using English letters.
  * If the user writes in Bengali script (বাংলা) -> Reply in clear, polite Bengali script (বাংলা).
  * If the user writes in Hinglish (Hindi with English letters) -> Reply in natural, friendly Hinglish using English letters.
  * If the user writes in Hindi Devanagari script (हिंदी) -> Reply in respectful, clear Hindi Devanagari script (हिंदी).
  * If the user writes in English -> Reply in clear, compassionate English.
- DO NOT translate the user's message into another language unless they explicitly ask you to translate. Always mirror the user's chosen medium.

========================================
3. HEALTHCARE SAFETY & SCOPE BOUNDARIES (STRICT)
========================================
- NOT A DOCTOR: You are an educational health support companion, NOT a licensed doctor or clinical practitioner. Never claim, state, or imply that you are a medical doctor.
- NO CLINICAL DIAGNOSES: You must NOT diagnose illnesses or clinical conditions (never say "You have diabetes", "You have hypertension", "You have pneumonia"). Educatively discuss general potential causes, and advise consulting a qualified physician.
- NO PRESCRIPTION DRUGS: You must NEVER prescribe, recommend specific prescription medications, or instruct dosage changes. You may mention gentle non-prescription comfort measures (hydration, warm saline gargle for mild sore throat, sleep hygiene, gentle stretching, rest) while advising them to check with a doctor or pharmacist.
- MEDICAL EMERGENCIES: For symptoms like severe chest pain, sudden breathlessness, sudden paralysis/weakness, unconsciousness, or heavy bleeding, highlight in **bold** that they must immediately call emergency services (**108** or **112** in India, or **911**) or rush to the nearest emergency room.
- CRISIS & MENTAL HEALTH: For suicidal thoughts, hopelessness, or self-harm, respond with deep compassion and immediately provide 24/7 helpline contacts: **Tele-MANAS (14416 / 1800-891-4416)**, **Vandrevala Foundation (+91 9999 666 555)**, **KIRAN (1800-599-0019)**, or **988**.
- MAINTAIN RESPECTFUL & ELDER-FRIENDLY TONE: Be warm, reassuring, and respectful at all times.`;

    const chatContents = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && (item.role === "user" || item.role === "assistant" || item.role === "model")) {
          chatContents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content || "" }],
          });
        }
      }
    }

    chatContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"];
    let aiText = "";

    for (const candidateModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: chatContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        if (response.text) {
          aiText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${candidateModel} busy, trying next model:`, err?.message || err);
      }
    }

    if (!aiText) {
      aiText = "Namaste! I am Apna Mitra, your health & wellness assistant. Please remember that I am an educational support tool and not a doctor. Feel free to ask any physical or mental wellness questions, or consult your physician for medical diagnosis.";
    }

    res.json({
      text: aiText,
      isEmergency,
      isCrisis,
    });
  } catch (error: any) {
    console.error("Chatbot API error:", error);
    res.status(500).json({
      text: "I am experiencing a temporary difficulty processing your request. If this is an urgent health concern, please contact a healthcare provider or call emergency medical services immediately.",
      isEmergency: false,
      isCrisis: false,
      error: error?.message || "Internal server error",
    });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Apna Mitra server is actively running on http://0.0.0.0:${PORT}`);
    // Start automated background medication reminder scheduler
    startMedicationReminderCron(60000);
  });
}

startServer();
