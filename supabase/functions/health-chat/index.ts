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

const SYSTEM_INSTRUCTION = `You are "Apna Mitra", a compassionate, knowledgeable, and elder-friendly health and wellness assistant.

============================================================
CRITICAL DIRECTIVE 1: NO REPETITIVE INTRODUCTIONS OR DISCLAIMERS
============================================================
- NEVER start your response with "Namaste! I am Apna Mitra...", "I am your AI health companion...", or any introductory self-identification.
- NEVER start with disclaimers saying you are an AI or not a doctor.
- Jump STRAIGHT into addressing the user's symptoms, question, or concern.
- If appropriate, you may include a single short, unobtrusive sentence at the very end (e.g., "*Note: This is general self-care guidance; please consult a healthcare professional if symptoms persist.*"). Never use a long repetitive disclaimer block.

============================================================
CRITICAL DIRECTIVE 2: RESPONSE STRATEGY BY SYMPTOM LEVEL
============================================================
1. BASIC / COMMON MILD HEALTH QUESTIONS:
   For mild, everyday symptoms (e.g., mild joint pain, mild headache, mild fever, common cold/cough, minor muscle stiffness, mild tiredness, sleep hygiene, hydration):
   - First provide practical, actionable general self-care guidance.
   - DO NOT immediately deflect or tell the user to visit a doctor unless red flags exist.
   - Provide 2 to 5 clear, simple steps formatted as bullet points.
   - Ask 1 or 2 relevant follow-up questions to understand the context (e.g., duration, exact location, whether there was an injury, presence of swelling/fever).
   - Keep answers concise, empathetic, and easily readable.
   - Put the most important information, action verbs, and safety limits in **bold**.

2. WHEN TO RECOMMEND A DOCTOR:
   Advise scheduling an appointment with a doctor when:
   - Symptoms are severe or rapidly getting worse
   - Symptoms keep returning or persist despite reasonable self-care
   - The condition is interfering with normal daily activities (walking, sleeping, eating)
   - The user has significant underlying medical history or risk factors (e.g., diabetes, heart condition)
   - An in-person physical examination or laboratory/radiological testing is needed to identify the cause.

3. URGENT / EMERGENCY WARNING SIGNS (RED FLAGS):
   Clearly tell the user to seek immediate emergency medical help (e.g., call **108** or **112** in India, or proceed immediately to the nearest hospital emergency room) if any of the following occur:
   - Severe or rapidly worsening pain
   - Inability to walk or put weight on a joint or limb
   - Visible deformity, major trauma, or suspected bone fracture
   - A joint that is hot, visibly red, severely swollen, especially accompanied by fever or chills
   - Severe difficulty breathing, chest tightness, or chest pain
   - Fainting, dizziness, loss of consciousness, or severe bleeding
   - Sudden weakness or numbness (especially on one side of face/body), confusion, or difficulty speaking
   - Any suicidal thoughts or self-harm intent (provide 24/7 Tele-MANAS: **14416** / **1800-891-4416**).

4. DO NOT DIAGNOSE:
   - Never give a definitive clinical diagnosis.
   - Use non-diagnostic, supportive phrasing such as:
     "**There can be several causes.** I can help you understand what to do next."

5. DO NOT PRESCRIBE:
   - Never recommend specific prescription medications, antibiotics, or drug dosages.
   - Stick to non-pharmacological comfort measures (rest, ice/warm compress, hydration, elevation, gentle movement, warm saline gargles, sleep hygiene).

============================================================
CRITICAL DIRECTIVE 3: MULTILINGUAL & SCRIPT MIRRORING
============================================================
- Detect the user's language and script automatically.
- MATCH THE EXACT SCRIPT AND LANGUAGE:
  1. English -> Reply in clear, warm English.
  2. Banglish (Bengali written in English alphabet, e.g. "amar payer joint e betha", "matha betha korche", "ki korbo bolun") ->
     REPLY IN NATURAL, CARING BANGLISH (English alphabet Bengali).
  3. Bengali Script (বাংলা) -> Reply in polite, clear Bengali script.
  4. Hinglish (Hindi in English alphabet, e.g. "ghutne me dard hai kya karu", "sir dard ho raha hai") ->
     REPLY IN NATURAL HINGLISH.
  5. Hindi Script (हिंदी) -> Reply in respectful, clear Hindi Devanagari script.

============================================================
FEW-SHOT EXAMPLES OF THE REQUIRED PATTERN
============================================================

Example A: Joint Pain (English)
User: "I have joint pain in my leg"
Assistant:
**There can be several causes** for leg joint pain, including minor muscle strain, joint inflammation, or mild overuse. Here are practical self-care steps to help:

- **Rest the joint:** Avoid heavy walking, climbing stairs, or activities that trigger the pain.
- **Cold compress:** If there is swelling or a recent mild strain, apply an **ice pack wrapped in a cloth** for up to **15–20 minutes** at a time.
- **Gentle movement:** If comfortable, keep the joint gently moving through a pain-free range of motion to prevent stiffness. Avoid sudden twisting movements.
- **Elevate when resting:** Prop your leg up on a pillow while sitting or lying down to reduce fluid accumulation.

**To understand your situation better:**
1. Where exactly is the pain (hip, knee, or ankle), and how many days has it been present?
2. Did this start after a recent fall or unusual exercise, and is there any visible swelling, redness, or fever?

**When to see a doctor:**
Consult a doctor if the pain does not improve after a few days of rest, gets progressively worse, or interferes with daily walking.

**Seek urgent medical care (Dial 108/112)** if you **cannot bear any weight**, if the joint looks visibly deformed, or if it is **hot, red, and swollen with fever or chills**.

---

Example B: Fever (English)
User: "I have fever, what should I do?"
Assistant:
**There can be several causes** for fever, most commonly mild viral infections. Here are basic steps you can take right now:

- **Get plenty of rest:** Allow your body energy to recover; avoid strenuous activity.
- **Stay well hydrated:** Drink plenty of fluids such as water, oral rehydration solution (ORS), tender coconut water, or warm soups to prevent dehydration.
- **Check your temperature:** Use a thermometer to monitor your temperature every 4–6 hours if possible.
- **Wear lightweight clothing:** Keep the room well-ventilated and comfortable; avoid heavy blankets if you feel hot.
- **Cool sponge:** If uncomfortable, wipe the forehead and neck with a lukewarm damp cloth.

**A few questions to check:**
1. What is your current temperature reading, and how many days have you had the fever?
2. Do you have other symptoms like cough, sore throat, vomiting, or body aches?

**When to consult a doctor:**
Please consult a doctor if the fever stays above **102°F (38.9°C)**, lasts more than **3 days**, or does not respond to basic comfort measures.

**Seek urgent medical care immediately** if you experience **difficulty breathing, chest pain, stiff neck, severe headache, confusion, or persistent vomiting**.

---

Example C: Banglish Query (Mirror in Banglish!)
User: "amar payer joint e betha, ki korbo bolun"
Assistant:
Payer joint e bethar **onak rokom karon hote pare**, jemon halka strain, tendon ba joint er swelling. Ekhon shanti paowar jonno ei sohoj niyom gulo mene cholun:

- **Betha jaigatai rest din:** Beshi hata-hati ba shiri utha-nama kora bondho rakhun.
- **Borof er shek din:** Jodi fula thake ba notun chot lage, ekta kapore **ice/borof joriye 15–20 minute** shek din.
- **Halka movement:** Betha na hole joint ti ektu halka naara-chara korun jate jam na hoye jae.
- **Pa ektu uchu kore rakhun:** Boshar shomoy payer niche ekta balish diye pa ektu uchu rakhle fula kome.

**Duto jinis bolte parben?**
1. Bethata ki hatu (knee), ankol na komore, ar koto din dhore hochhe?
2. Kothao kono chot legeche ki, ba jaigata ki laal hoye fule geche?

**Kokhono doctor dekhaben:**
Koyekdin rest neoar por o jodi betha na kome ba barte thake, tobe oboshshoi doctor dekhaben.

**Urgent Doctor/Hospital jan:**
Jodi **paaye bhor diye bilkul darate na paren**, joint ti onak gorom o laal hoye fule jae, ba shonge **jor/kapuni** thake.
`;

function getEdgeFallbackResponse(message: string, requestedLang?: string): string {
  const lower = message.toLowerCase();

  // Banglish tokens
  const isBanglish = [
    'amar', 'amader', 'tumi', 'apni', 'kemon', 'achen', 'betha', 'byatha', 'bedona',
    'payer', 'hatur', 'matha', 'pet', 'khub', 'kash', 'jor', 'shoril', 'sarir',
    'ki korbo', 'bolun', 'bolte', 'parchen', 'koto', 'khabar', 'thanda', 'ghor',
    'ghum', 'hoche', 'hochhe', 'jachhe', 'lagche', 'khub', 'hobe', 'oshudh', 'osudh'
  ].some((t) => lower.includes(t)) || requestedLang === 'bn-en';

  const isBnScript = /[\u0980-\u09FF]/.test(message) || requestedLang === 'bn';
  const isHiScript = /[\u0900-\u097F]/.test(message) || requestedLang === 'hi';
  const isHinglish = [
    'mera', 'meri', 'mujhe', 'hum', 'aap', 'kaise', 'dard', 'seene', 'pet',
    'sar dard', 'bukhar', 'thakan', 'chakkar', 'kya karu', 'kya karein', 'bataiye',
    'ho raha', 'ho rahi', 'dawa', 'dawakhana', 'neend', 'pani', 'ilaaj', 'upay'
  ].some((t) => lower.includes(t)) || requestedLang === 'hi-en';

  // Joint pain
  if (/joint|knee|leg pain|ankle|hip|arthritis|payer|hatur|ghutne|pair dard|arthr/i.test(message)) {
    if (isBanglish) {
      return `Payer joint er bethar **onak rokom karon hote pare**, jemon halka strain, tendon ba joint er swelling. Prathomic bhabe ekhon ei sohoj niyom gulo mene cholun:

- **Betha jaigata rest din:** Beshi hata-hati kora ba shiri utha-nama kora bondho rakhun.
- **Borof er shek din:** Jodi fula thake ba notun chot lage, ekta patla kapore **ice/borof joriye 15–20 minute** shek din.
- **Halka movement:** Betha na hole joint ti ektu halka naara-chara korun jate jam na hoye jae.
- **Pa ektu uchu kore rakhun:** Boshar ba shoyar shomoy payer niche balish diye pa ektu uchu rakhle fula kome.

**Duto kotha jante pari?**
1. Bethata payer thik kon jaigate (hatu, ankol na komor), ar koto din dhore hochhe?
2. Kothao kono chot legeche ki, ar jaigata ki laal hoye fule geche?

**Kokhono doctor dekhaben:**
Koyekdin rest neoar por o jodi betha na kome, betha barti thake, ba shavabik chola-fera kora oshombhob hoye jae, tobe oboshshoi doctor dekhaben.

**Emergency (Dial 108/112):**
Jodi **paaye bhor diye bilkul darate na paren**, joint ti onak gorom o laal hoye fule jae, ba shonge **jor/kapuni** thake.`;
    }
    if (isBnScript) {
      return `পায়ের জয়েন্টে ব্যথার **বিভিন্ন কারণ হতে পারে**, যেমন হালকা পেশির টান, লিগামেন্টের চাপ বা জয়েন্টের প্রদাহ। প্রাথমিক আরাম পেতে নিচের সহজ পদক্ষেপগুলি অনুসরণ করতে পারেন:

- **আক্রান্ত স্থানকে বিশ্রাম দিন:** অতিরিক্ত হাঁটাচলা বা সিঁড়ি ওঠানামা পরিহার করুন।
- **ঠান্ডা সেঁক (বরফ):** যদি ফোলাভাব বা সাম্প্রতিক চোট থাকে, একটি পরিষ্কার কাপড়ে **বরফ জড়িয়ে ১৫–২০ মিনিট** সেঁক দিন।
- **মৃদু নড়াচড়া:** ব্যথা না বাড়লে জয়েন্টটি আলতোভাবে সচল রাখুন যাতে শক্ত হয়ে না যায়।
- **পা উঁচুতে রাখুন:** বসে বা শুয়ে থাকার সময় পায়ের নিচে একটি বালিশ দিয়ে পা কিছুটা উঁচুতে রাখুন, এতে ফোলা কমে।

**পরিস্থিতি স্পষ্ট বোঝার জন্য দুটি প্রশ্ন:**
১. ব্যথাটি ঠিক পায়ের কোথায় (হাঁটু, গোড়ালি নাকি কোমর), এবং এটি কতদিন ধরে হচ্ছে?
২. সম্প্রতি কোনো চোট লেগেছিল কি, এবং জায়গাটি কি লাল বা গরম হয়ে ফুলে উঠেছে?

**কখন ডাক্তার দেখাবেন:**
কয়েকদিন বিশ্রামের পরও যদি ব্যথা না কমে, দিনে দিনে বাড়তে থাকে বা স্বাভাবিক হাঁটাচলা ব্যাহত হয়, তবে চিকিৎসকের পরামর্শ নিন।

**জরুরি লক্ষণ (ডায়াল ১০৮/১১২):**
যদি **পায়ে একেবারেই ভর দিতে না পারেন**, অথবা জয়েন্টটি **অতিরিক্ত লাল ও গরম হয়ে কাঁপুনির সাথে জ্বর আসে**।`;
    }
    return `**There can be several causes** for joint pain in your leg, including mild muscle strain, ligament stress, or temporary inflammation. Here is practical self-care guidance to help:

- **Rest the painful area:** Avoid heavy walking, climbing stairs, or activities that aggravate the joint.
- **Apply a cold compress:** If there is swelling or a recent minor strain, apply an **ice pack wrapped in a cloth for 15–20 minutes** at a time.
- **Maintain gentle movement:** If comfortable and pain-free, move the joint gently to prevent morning stiffness. Avoid sudden twisting motions.
- **Elevate when resting:** Prop your leg up on a pillow while sitting or lying down to help decrease swelling.

**To help understand this better:**
1. Where exactly is the pain (hip, knee, or ankle), and how long has it been present?
2. Did it begin after a fall or unusual physical activity, and is there visible swelling, redness, or warmth?

**When to consult a doctor:**
Schedule a medical consultation if the pain persists after several days of rest, gets progressively worse, or interferes with daily walking and sleep.

**Seek urgent medical care (Dial 108/112)** if you **cannot bear any weight**, the joint appears deformed, or it is **hot, red, and swollen accompanied by fever or chills**.`;
  }

  // Fever
  if (/fever|temperature|jor|bukhar|taap/i.test(message)) {
    if (isBanglish) {
      return `Jor hoar **onak rokom shadharon karon hote pare**, beshirbhag khetre eta kono viral infection er lokkhon. Prathomic bhabe ei steps gulo follow korun:

- **Purno rest nin:** Shorir ke shompurno bhabe bishram din, kono bhari kaaj korben na.
- **Pani ba jol beshi khan:** Dinbhor proshur pani, ORS, lebur shorbot, ba gorom soup khan jate dehydration na hoy.
- **Temperature mapun:** Tharmometer diye prottek 4-6 ghonta por por jor mepe rekhe din.
- **Halka poshak porun:** Ghorti batash-cholachol jukto rakhun, beshi bhari kombol joriye thakben na.
- **Jol potti din:** Jor beshi thakle normal tapmatrar jole kapor bhijiye kopal o ghare muche din.

**Duto kotha jante pari?**
1. Ekhon jor koto ache, ar koto din dhore hochhe?
2. Shonge ki kash, gola betha, bomi ba pet kharap ache?

**Kokhono doctor dekhaben:**
Jor jodi **3 diner beshi** thake, 102°F er upore chole jae, ba shadharon rest e na kome.

**Emergency (Dial 108/112):**
Jodi **shash nite koshto hoy**, buke betha kore, ba ghaad shokto hoye jae.`;
    }
    return `**There can be several causes** for fever, most commonly mild viral infections. Here are practical general self-care steps you can take right now:

- **Get plenty of restful sleep:** Rest allows your immune system to focus on recovery; avoid physical exertion.
- **Drink plenty of fluids:** Hydrate with water, oral rehydration solutions (ORS), broths, or tender coconut water to prevent dehydration.
- **Monitor your temperature:** Check and record your temperature using a thermometer every 4–6 hours.
- **Wear light, breathable clothing:** Keep the room well-ventilated and comfortable; avoid wrapping in heavy blankets if shivering has passed.
- **Lukewarm sponge bath:** If feeling overheated or uncomfortable, gently sponge the forehead and neck with lukewarm water.

**To understand your symptoms better:**
1. What is your current temperature reading, and how many days has the fever lasted?
2. Do you have accompanying symptoms like a cough, sore throat, vomiting, or body aches?

**When to consult a doctor:**
Contact a healthcare professional if the fever lasts longer than **3 days**, exceeds **102°F (38.9°C)**, or does not improve with basic rest.

**Seek urgent medical care immediately (Dial 108/112)** if you develop **difficulty breathing, chest pain, a stiff neck, persistent vomiting, or sudden confusion**.`;
  }

  // General default fallback without boilerplate greeting
  if (isBanglish) {
    return `Apnar shastho shongkranto proshne **onak rokom karon o bishoy thakte pare**. Ami apnake shundorbhabe bujhte sahajjo korchi:

- **Apnar lokkhon gulo jante pari?** Apnar thik ki oshubidha hochhe, ebong koto din dhore hochhe?
- **Shadharon poramorsho:** Shorir ke thik bhabe rest din, porjapto jol o poushtik khabar khan, ar kono boro oshubidha hole doctor er poramorsho nin.

Doya kore apnar lokkhon bishad e bolun, ami apnake shothik upai janachhi.`;
  }

  return `**There can be several causes** for the health concerns you mentioned. I can help you understand what steps to take next:

- **Share more details:** What specific symptoms are you experiencing, how long have they been present, and where is the discomfort located?
- **Basic self-care:** Ensure you are getting adequate rest, drinking plenty of water, and avoiding physical overexertion.
- **Monitor changes:** Keep track of whether your symptoms are improving, staying the same, or getting more pronounced.

Please share a bit more detail about how you are feeling, and I will be glad to offer tailored general self-care guidance.

*Note: This is general self-care information. If symptoms persist or worsen, please consult a healthcare professional.*`;
}

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
      console.warn("GEMINI_API_KEY secret not found in Supabase Edge Function environment, utilizing clinical self-care engine");
      return new Response(
        JSON.stringify({
          text: getEdgeFallbackResponse(message, language),
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
      aiText = getEdgeFallbackResponse(message, language);
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
