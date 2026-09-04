import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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
  });
}

startServer();
