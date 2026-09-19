import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emergency and crisis safety trigger phrases (multilingual: English, Hindi, Bengali, Hinglish, Banglish)
const EMERGENCY_TRIGGERS = [
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

const CRISIS_TRIGGERS = [
  // English
  "kill myself", "suicide", "end my life", "want to die", "wanna die",
  "hurt myself", "self harm", "don't want to live", "take my life",
  "ending it all", "better off dead", "cutting myself",
  // Hindi & Hinglish
  "आत्महत्या", "मरना चाहता", "जान दे दूंगा", "खुदकुशी",
  "marna chahta hoon", "jaan de dunga", "zindagi khatam karni", "khudkhushi",
  // Bengali & Banglish
  "आत्महत्या", "মরতে চাই", "বেঁচে থাকতে চাই না",
  "morte chai", "benche thakte chai na", "nijeke sesh kore debo"
];

const SYSTEM_INSTRUCTION = `You are "Apna Mitra" (अपना मित्र), an empathetic, highly responsible, and knowledgeable AI Health and Wellness Support Companion for patients, seniors, and families.

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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history = [], language = 'en' } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'A valid message string is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lower = message.toLowerCase();
    const isEmergency = EMERGENCY_TRIGGERS.some((t) => lower.includes(t));
    const isCrisis = CRISIS_TRIGGERS.some((t) => lower.includes(t));

    // 1. Immediate Safety Check: Physical Medical Emergency
    if (isEmergency) {
      return new Response(
        JSON.stringify({
          text: "🚨 **URGENT MEDICAL EMERGENCY WARNING**\n\nYour message describes symptoms that may indicate a serious, time-critical medical emergency. **Please do not wait or rely on an AI.**\n\n• **Call Emergency Services immediately:** Dial **108** (Ambulance) or **112** (National Emergency) in India, or **911**.\n• Proceed immediately to the nearest hospital emergency room.\n• Alert a family member, caretaker, or neighbor right away so someone is with you.",
          isEmergency: true,
          isCrisis: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Immediate Safety Check: Crisis / Self-Harm
    if (isCrisis) {
      return new Response(
        JSON.stringify({
          text: "💙 **You are not alone, and help is available right now.**\n\nPlease reach out immediately to speak with someone who cares and is trained to support you:\n\n• **Tele-MANAS (Govt of India):** Dial **14416** or **1800-891-4416** (24/7, Toll-Free)\n• **Vandrevala Foundation Helpline:** Call or WhatsApp **+91 9999 666 555**\n• **KIRAN Helpline:** Dial **1800-599-0019**\n• **Crisis Line / International:** Dial **988** or your local emergency services.\n\nPlease connect with a trusted friend, family member, or doctor right now.",
          isEmergency: false,
          isCrisis: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Secure AI Generation via Supabase Secret GEMINI_API_KEY
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      console.warn("GEMINI_API_KEY secret not found in Supabase Edge Function environment");
      return new Response(
        JSON.stringify({
          text: "Namaste! I am **Apna Mitra** (अपना मित्र), your AI Health & Wellness Support Companion.\n\nI am configured to provide evidence-based guidance on nutrition, geriatric mobility, sleep, and emotional wellness. The Supabase Edge Function is active.\n\n*Reminder: I am an AI educational companion, not a doctor. I do not diagnose illnesses or prescribe medicines.*",
          isEmergency: false,
          isCrisis: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build sanitized conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item && item.content && typeof item.content === 'string') {
          const role = item.role === 'user' ? 'user' : 'model';
          // Gemini requires alternating roles or initial user message
          if (contents.length === 0 && role === 'model') {
            continue; // Skip leading model message
          }
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n${item.content}`;
          } else {
            contents.push({
              role,
              parts: [{ text: item.content }],
            });
          }
        }
      }
    }

    // Append current user message
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${message}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"];
    let aiText = "";

    const effectiveSystemInstruction = SYSTEM_INSTRUCTION;

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: effectiveSystemInstruction }],
            },
            generationConfig: {
              temperature: 0.3,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidate = geminiData.candidates?.[0];
          const textPart = candidate?.content?.parts?.[0]?.text;
          if (textPart) {
            aiText = textPart;
            break;
          }
        } else {
          console.warn(`Gemini model ${model} HTTP ${geminiRes.status}`);
        }
      } catch (geminiErr) {
        console.warn(`Error invoking model ${model}:`, geminiErr);
      }
    }

    if (!aiText) {
      aiText = "Namaste! I am Apna Mitra (अपना मित्र), your AI Health & Wellness Support Companion. I am here to assist with general health education, daily habits, and emotional reassurance. Please remember to consult a licensed medical doctor for clinical diagnosis and prescription medicines.";
    }

    return new Response(
      JSON.stringify({
        text: aiText,
        isEmergency,
        isCrisis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Health-chat Edge Function error:", error);
    return new Response(
      JSON.stringify({
        text: "I am experiencing a temporary difficulty answering your query. If you have an urgent medical concern, please reach out to a healthcare provider or call 108 / 112 immediately.",
        error: error?.message || 'Internal error in edge function',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
