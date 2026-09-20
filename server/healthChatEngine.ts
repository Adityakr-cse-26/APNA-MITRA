/**
 * Apna Mitra Healthcare Chatbot Response Engine
 * 
 * Strict Clinical & Communicative Standards:
 * 1. Zero repetitive intros: Never start replies with "Namaste! I am Apna Mitra..." or long disclaimers.
 * 2. 2-5 simple practical self-care steps for mild/common symptoms first.
 * 3. Relevant 1-2 follow-up questions.
 * 4. When to see a doctor (worsening, returning, severe, interfering with daily activities).
 * 5. Urgent/Emergency warning signs (108 / 112).
 * 6. Non-diagnostic phrasing: "There can be several causes. I can help you understand what to do next."
 * 7. Non-prescriptive: No prescription drugs or dosages.
 * 8. Multilingual & Script-mirroring: English, Hindi, Hinglish, Bengali script, and Banglish (e.g. "amar payer joint e betha" -> replies in Banglish!).
 * 9. Concise, warm, key points in **bold**, clean bullet points.
 */

export const HEALTH_CHAT_SYSTEM_INSTRUCTION = `You are "Apna Mitra", a compassionate, knowledgeable, and elder-friendly health and wellness assistant.

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

export interface IntelligentHealthInput {
  message: string;
  history?: Array<{ role: string; content: string }>;
  language?: string;
}

export interface IntelligentHealthOutput {
  text: string;
  isEmergency: boolean;
  isCrisis: boolean;
}

/**
 * Detects language variety:
 * 'bn_script' | 'banglish' | 'hi_script' | 'hinglish' | 'en'
 */
export function detectLanguageType(text: string, requestedLang?: string): 'bn_script' | 'banglish' | 'hi_script' | 'hinglish' | 'en' {
  // Bengali Unicode range: 0980-09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bn_script';
  }
  // Hindi/Devanagari Unicode range: 0900-097F
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi_script';
  }

  const lower = text.toLowerCase();

  // Banglish tokens
  const banglishTokens = [
    'amar', 'amader', 'tumi', 'apni', 'kemon', 'achen', 'betha', 'byatha', 'bedona',
    'payer', 'hatur', 'matha', 'pet', 'khub', 'kash', 'jor', 'shoril', 'sarir',
    'ki korbo', 'bolun', 'bolte', 'parchen', 'koto', 'khabar', 'thanda', 'ghor',
    'ghum', 'hoche', 'hochhe', 'jachhe', 'lagche', 'khub', 'hobe', 'oshudh', 'osudh'
  ];
  const banglishCount = banglishTokens.filter((t) => lower.includes(t)).length;
  if (banglishCount >= 1 || requestedLang === 'bn-en') {
    return 'banglish';
  }

  // Hinglish tokens
  const hinglishTokens = [
    'mera', 'meri', 'mujhe', 'hum', 'aap', 'kaise', 'dard', 'seene', 'pet',
    'sar dard', 'bukhar', 'thakan', 'chakkar', 'kya karu', 'kya karein', 'bataiye',
    'ho raha', 'ho rahi', 'dawa', 'dawakhana', 'neend', 'pani', 'ilaaj', 'upay'
  ];
  const hinglishCount = hinglishTokens.filter((t) => lower.includes(t)).length;
  if (hinglishCount >= 1 || requestedLang === 'hi-en') {
    return 'hinglish';
  }

  if (requestedLang === 'bn') return 'bn_script';
  if (requestedLang === 'hi') return 'hi_script';
  return 'en';
}

/**
 * Rule-based clinical self-care response generator for common queries.
 * Acts as high-reliability fallback when Gemini API encounters quota limits, rate limits, or network errors.
 * Strictly avoids boilerplate intros and executes the required self-care strategy directly.
 */
export function generateIntelligentHealthResponse(input: IntelligentHealthInput): IntelligentHealthOutput {
  const { message } = input;
  const lower = message.toLowerCase();

  // 1. Emergency Detection
  const emergencyWords = [
    'chest pain', 'heart attack', 'crushing chest', 'difficulty breathing', "can't breathe",
    'cannot breathe', 'shortness of breath', 'passed out', 'unconscious', 'fainted',
    'stroke', 'slurred speech', 'face drooping', 'arm weakness', 'severe bleeding',
    'coughing blood', 'vomiting blood',
    'সিনে মে দর্দ', 'বুকে ব্যথা', 'শ্বাস নিতে পারছি না', 'অজ্ঞান', 'রক্ত বমি',
    'buker betha', 'buke betha', 'shash nite parchi na', 'seene me dard', 'dil ka daura'
  ];
  const isEmergency = emergencyWords.some((w) => lower.includes(w));

  // 2. Crisis / Self-Harm Detection
  const crisisWords = [
    'kill myself', 'suicide', 'end my life', 'want to die', 'wanna die', 'hurt myself',
    'self harm', 'better off dead', 'cutting myself',
    'आत्महत्या', 'মরতে চাই', 'morte chai', 'khudkhushi', 'jaan de dunga'
  ];
  const isCrisis = crisisWords.some((w) => lower.includes(w));

  const lang = detectLanguageType(message, input.language);

  // Immediate Crisis Response
  if (isCrisis) {
    if (lang === 'bn_script') {
      return {
        text: `💙 **আপনি একা নন, এখনই সাহায্য পাওয়ার ব্যবস্থা রয়েছে।**\n\nদয়া করে অবিলম্বে এই বিনামূল্যে ২৪/৭ মানসিক সহায়তা হেল্পলাইনে যোগাযোগ করুন:\n\n• **টেলি-মানস (Tele-MANAS, ভারত সরকার):** ডায়াল করুন **১৪৪১৬** অথবা **১৮০০-৮৯১-৪৪১৬** (টোল-ফ্রি, ২৪ ঘণ্টা)\n• **ভানদ্রেভালা ফাউন্ডেশন:** কল বা হোয়াটসঅ্যাপ **+৯১ ৯৯৯৯ ৬৬৬ ৫৫৫**\n• **কিরণ (KIRAN) হেল্পলাইন:** ডায়াল করুন **১৮০০-৫৯৯-০০১৯**\n\nঅনুগ্রহ করে আপনার পরিবার, কোনো বিশ্বস্ত মানুষ বা চিকিৎসকের সঙ্গে অবিলম্বে কথা বলুন।`,
        isEmergency: false,
        isCrisis: true,
      };
    }
    if (lang === 'banglish') {
      return {
        text: `💙 **Apni eka non, sahajjo pabar byabostha ache.**\n\nDoya kore ekhoni ei helpline gulo te jogajog korun:\n\n• **Tele-MANAS (Govt of India):** Dial korun **14416** ba **1800-891-4416** (24 Ghonta, Toll-Free)\n• **Vandrevala Foundation:** Call ba WhatsApp **+91 9999 666 555**\n• **KIRAN Helpline:** Dial korun **1800-599-0019**\n\nApnar poribarer manush ba kono doctor er shonge ekhoni kotha bolun.`,
        isEmergency: false,
        isCrisis: true,
      };
    }
    if (lang === 'hi_script') {
      return {
        text: `💙 **आप अकेले नहीं हैं, सहायता तुरंत उपलब्ध है।**\n\nकृपया तुरंत इन निःशुल्क 24/7 हेल्पलाइन पर संपर्क करें:\n\n• **टेली-मानस (Tele-MANAS, भारत सरकार):** डायल करें **14416** या **1800-891-4416** (टोल-फ्री)\n• **वांद्रेवाला फाउंडेशन:** कॉल या व्हाट्सएप **+91 9999 666 555**\n• **किरण (KIRAN) हेल्पलाइन:** डायल करें **1800-599-0019**\n\nकृपया अपने किसी करीबी, परिजन या डॉक्टर से तुरंत बात करें।`,
        isEmergency: false,
        isCrisis: true,
      };
    }
    if (lang === 'hinglish') {
      return {
        text: `💙 **Aap akele nahi hain, madad turant uplabdh hai.**\n\nKripya turant in helpline par baat karein:\n\n• **Tele-MANAS (Govt of India):** Dial karein **14416** ya **1800-891-4416** (24/7, Toll-Free)\n• **Vandrevala Foundation:** Call ya WhatsApp **+91 9999 666 555**\n• **KIRAN Helpline:** Dial karein **1800-599-0019**\n\nApne kisi parivaar ke sadasya ya doctor se turant sampark karein.`,
        isEmergency: false,
        isCrisis: true,
      };
    }
    return {
      text: `💙 **You are not alone, and supportive help is available right now.**\n\nPlease reach out immediately to a free, confidential 24/7 helpline:\n\n• **Tele-MANAS (Govt of India):** Dial **14416** or **1800-891-4416** (Toll-free, 24/7)\n• **Vandrevala Foundation:** Call or WhatsApp **+91 9999 666 555**\n• **KIRAN Mental Health Helpline:** Dial **1800-599-0019**\n• **Crisis Line (USA/International):** Dial **988** or local emergency services.\n\nPlease speak with a trusted family member, loved one, or healthcare professional right away.`,
      isEmergency: false,
      isCrisis: true,
    };
  }

  // Immediate Emergency Response
  if (isEmergency) {
    if (lang === 'bn_script' || lang === 'banglish') {
      const isBn = lang === 'bn_script';
      return {
        text: isBn
          ? `🚨 **জরুরি মেডিকেল সতর্কতা**\n\nআপনার বর্ণিত লক্ষণগুলি একটি জরুরি চিকিৎসার ইঙ্গিত হতে পারে। **দয়া করে দেরি করবেন না।**\n\n• **অবিলম্বে জরুরি নম্বরে কল করুন:** ডায়াল করুন **১০৮** (অ্যাম্বুলেন্স) বা **১১২**।\n• অবিলম্বে নিকটস্থ হাসপাতালের এমার্জেন্সিতে যান।\n• পরিবারের কাউকে সঙ্গে রাখুন এবং নিজে গাড়ি চালাবেন না।`
          : `🚨 **URGENT MEDICAL WARNING**\n\nEi lokkhon gulo kono serious emergency hote pare. **Doya kore deri korben na.**\n\n• **Emergency number e call korun:** Dial **108** (Ambulance) ba **112**.\n• Ekhoni kacher hospital er emergency te jan.\n• Poribarer kaoke sathe rakhun ar nije drive korben na.`,
        isEmergency: true,
        isCrisis: false,
      };
    }
    if (lang === 'hi_script' || lang === 'hinglish') {
      const isHi = lang === 'hi_script';
      return {
        text: isHi
          ? `🚨 **तत्काल आपातकालीन चिकित्सा चेतावनी**\n\nआपके लक्षण किसी गंभीर चिकित्सीय आपात स्थिति का संकेत दे सकते हैं। **कृपया बिल्कुल भी प्रतीक्षा न करें।**\n\n• **तुरंत आपातकालीन नंबर पर कॉल करें:** **108** (एम्बुलेंस) या **112** डायल करें।\n• तुरंत नजदीकी अस्पताल के आपातकालीन कक्ष (ER) में जाएँ।\n• परिवार के किसी सदस्य को साथ रखें और स्वयं वाहन न चलाएँ।`
          : `🚨 **URGENT MEDICAL EMERGENCY WARNING**\n\nYe lakshan kisi gambhir emergency ka sanket ho sakte hain. **Kripya bilkul der na karein.**\n\n• **Turant Emergency number par call karein:** Dial **108** ya **112**.\n• Turant najdeeki hospital ke emergency ward mein jayein.\n• Kisi parivar wale ko sath rakhein aur khud gaadi na chalayein.`,
        isEmergency: true,
        isCrisis: false,
      };
    }
    return {
      text: `🚨 **URGENT MEDICAL EMERGENCY WARNING**\n\nYour symptoms may indicate a serious medical emergency. **Please do not wait or rely on an app.**\n\n• **Call Emergency Services immediately:** Dial **108** (Ambulance) or **112** in India, or **911**.\n• Proceed directly to the nearest hospital emergency room.\n• Alert a family member or neighbor so someone stays with you. Do not drive yourself.`,
      isEmergency: true,
      isCrisis: false,
    };
  }

  // 3. Topic Category Matching:
  const isJointPain = /joint|knee|leg pain|ankle|hip|arthritis|payer|hatur|ghutne|pair dard|arthr/i.test(message);
  const isFever = /fever|temperature|jor|bukhar|taap/i.test(message);
  const isHeadache = /headache|head pain|migraine|matha betha|sar dard|sir dard/i.test(message);
  const isColdCough = /cough|cold|sore throat|runny nose|kash|thanda|gala dard|sardi|jukham/i.test(message);
  const isMusclePain = /muscle|back pain|sprain|body ache|peeth dard|komor|shoril betha|badan dard/i.test(message);
  const isFatigue = /tired|fatigue|weakness|energy|durbol|thakan|kamzori/i.test(message);
  const isSleepHydration = /sleep|insomnia|water|dehydration|hydration|ghum|neend|pani|jol/i.test(message);

  // A. JOINT PAIN
  if (isJointPain) {
    if (lang === 'banglish') {
      return {
        text: `Payer joint er bethar **onak rokom karon hote pare**, jemon halka strain, tendon ba joint er swelling. Prathomic bhabe ekhon ei sohoj niyom gulo mene cholun:

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
Jodi **paaye bhor diye bilkul darate na paren**, joint ti onak gorom o laal hoye fule jae, ba shonge **jor/kapuni** thake.

*Note: Eta shadharon self-care poramorsho; betha thakle doctor er poramorsho nin.*`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'bn_script') {
      return {
        text: `পায়ের জয়েন্টে ব্যথার **বিভিন্ন কারণ হতে পারে**, যেমন হালকা পেশির টান, লিগামেন্টের চাপ বা জয়েন্টের প্রদাহ। প্রাথমিক আরাম পেতে নিচের সহজ পদক্ষেপগুলি অনুসরণ করতে পারেন:

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
যদি **পায়ে একেবারেই ভর দিতে না পারেন**, জয়েন্ট বিকৃত দেখায়, অথবা জয়েন্টটি **অতিরিক্ত লাল ও গরম হয়ে কাঁপুনির সাথে জ্বর আসে**।

*মনে রাখবেন: এটি সাধারণ স্বাস্থ্য পরামর্শ; লক্ষণ স্থায়ী হলে চিকিৎসকের পরামর্শ নিন।*`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'hi_script') {
      return {
        text: `पैर के जोड़ों में दर्द के **कई सामान्य कारण हो सकते हैं**, जैसे हल्की मोच, मांसपेशियों में खिंचाव या जोड़ों में सूजन। आराम के लिए तुरंत ये उपाय अपनाएँ:

- **जोड़ को आराम दें:** ज्यादा चलने-फिरने या सीढ़ियाँ चढ़ने से बचें जिससे दर्द न बढ़े।
- **बर्फ की सिकाई:** यदि सूजन है या हाल ही में कोई खिंचाव आया है, तो कपड़े में लपेटकर **15–20 मिनट के लिए आइस पैक** लगाएँ।
- **हल्की गतिशीलता:** यदि दर्द न हो, तो जोड़ को धीरे-धीरे थोड़ा हिलाएँ ताकि वह अकड़े नहीं।
- **पैर को ऊपर रखें:** बैठते या लेटते समय पैर के नीचे तकिया लगाकर थोड़ा ऊँचा रखें, इससे सूजन घटती है।

**स्थिति को बेहतर समझने के लिए:**
1. दर्द पैर में ठीक कहाँ है (घुटने, टखने या कूल्हे में), और यह कितने दिनों से है?
2. क्या हाल ही में कोई चोट लगी थी, और क्या वहाँ सूजन, लाली या गर्माहट है?

**डॉक्टर से कब परामर्श लें:**
यदि 2-3 दिन आराम के बाद भी दर्द कम न हो, दर्द लगातार बढ़ रहा हो, या सामान्य दैनिक गतिविधियाँ बाधित हो रही हों।

**तत्काल आपातकालीन सहायता लें (108/112):**
यदि आप **पैर पर बिल्कुल वजन न डाल पा रहे हों**, जोड़ विकृत दिख रहा हो, या जोड़ **बहुत लाल, गर्म और साथ में तेज बुखार** हो।

*सूचना: यह सामान्य देखभाल सलाह है; समस्या बनी रहने पर डॉक्टर से अवश्य मिलें।*`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'hinglish') {
      return {
        text: `Pair ke joint ke dard ke **kai aam kaaran ho sakte hain**, jaise halki moch, strain ya joint inflammation. Aaram ke liye turant ye simple steps follow karein:

- **Joint ko rest dein:** Jyada chalne-phirne ya seedhiyan chadhne se bachein jisse dard na badhe.
- **Ice pack lagayein:** Agar soojan hai ya halki chot lagi hai, to kapde mein lapet kar **15–20 minute tak barf ki sikai** karein.
- **Gentle movement:** Agar dard na ho, to joint ko halka-phulka hilate rahein taaki stiffness na aaye.
- **Pair uncha rakhein:** Baithe ya lete waqt pair ke niche takiya rakh kar uncha rakhein taaki swelling kam ho.

**Kuch zaroori sawal:**
1. Dard pair mein kahan hai (knee, ankle ya hip), aur kitne dino se hai?
2. Kya koi chot lagi thi, aur kya wahan red color ya soojan hai?

**Doctor ko kab dikhayein:**
Agar rest karne ke baad bhi dard kam na ho, dard lagatar badh raha ho, ya rozana chalne-phirne mein dikkat ho.

**Emergency help lein (Dial 108/112):**
Agar aap **pair par bilkul wazan na daal pa rahe ho**, joint tedha dikh raha ho, ya **bohot garam, laal aur tez bukhar** ke sath ho.

*Note: Ye aam self-care tips hain; dard jari rahe to doctor se zaroor milein.*`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    // English default
    return {
      text: `**There can be several causes** for joint pain in your leg, including mild muscle strain, ligament stress, or temporary inflammation. Here is practical self-care guidance to help:

- **Rest the painful area:** Avoid heavy walking, climbing stairs, or activities that aggravate the joint.
- **Apply a cold compress:** If there is swelling or a recent minor strain, apply an **ice pack wrapped in a cloth for 15–20 minutes** at a time.
- **Maintain gentle movement:** If comfortable and pain-free, move the joint gently to prevent morning stiffness. Avoid sudden twisting motions.
- **Elevate when resting:** Prop your leg up on a pillow while sitting or lying down to help decrease swelling.

**To help understand this better:**
1. Where exactly is the pain (hip, knee, or ankle), and how long has it been present?
2. Did it begin after a fall or unusual physical activity, and is there visible swelling, redness, or warmth?

**When to consult a doctor:**
Schedule a medical consultation if the pain persists after several days of rest, gets progressively worse, or interferes with daily walking and sleep.

**Seek urgent medical care (Dial 108/112)** if you **cannot bear any weight**, the joint appears deformed, or it is **hot, red, and swollen accompanied by fever or chills**.

*Note: This is general self-care information. If symptoms persist or worsen, please consult a healthcare professional.*`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // B. FEVER
  if (isFever) {
    if (lang === 'banglish') {
      return {
        text: `Jor hoar **onak rokom shadharon karon hote pare**, beshirbhag khetre eta kono viral ba bacterial infection er lokkhon. Prathomic bhabe ei steps gulo follow korun:

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
Jodi **shash nite koshto hoy**, buke betha kore, golar betha shoho ghaad shokto hoye jae, ba oshavabik ghum/oshusto lage.`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'bn_script') {
      return {
        text: `জ্বরের **বেশ কিছু সাধারণ কারণ হতে পারে**, যার মধ্যে অন্যতম হলো ঋতু পরিবর্তন বা ভাইরাল সংক্রমণ। তাৎক্ষণিক আরাম ও যত্নের জন্য এই নিয়মগুলি মেনে চলুন:

- **সম্পূর্ণ বিশ্রাম নিন:** শরীরকে শক্তি পুনরুদ্ধারের সুযোগ দিন; কোনো ভারী কাজ করবেন না।
- **প্রচুর তরল খাবার গ্রহণ করুন:** নিয়মিত জল, ওআরএস (ORS), ডাবের জল বা গরম স্যুপ পান করুন যাতে পানিশূন্যতা না ঘটে।
- **তাপমাত্রা পরিমাপ করুন:** থার্মোমিটার দিয়ে দিনে কয়েকবার তাপমাত্রা মেপে লিখে রাখুন।
- **হালকা ও আরামদায়ক পোশাক পরুন:** ঘরের পরিবেশ আরামদায়ক ও বাতাস চলাচলযুক্ত রাখুন।
- **জলপট্টি দিন:** অস্বস্তি লাগলে সাধারণ তাপমাত্রার জলে নরম কাপড় ভিজিয়ে কপাল ও ঘাড় মুছে দিন।

**পরিস্থিতি বুঝতে কিছু প্রশ্ন:**
১. আপনার বর্তমান তাপমাত্রা কত এবং জ্বরটি কতদিন ধরে চলছে?
২. এর সাথে কি কাশি, গলাব্যথা, বমি বা শরীরে তীব্র ব্যথা রয়েছে?

**কখন ডাক্তার দেখাবেন:**
জ্বর যদি **৩ দিনের বেশি স্থায়ী হয়**, তাপমাত্রা **১০২°F এর বেশি থাকে**, অথবা ওষুধ ছাড়াই বারবার ফিরে আসে।

**জরুরি লক্ষণ (ডায়াল ১০৮/১১২):**
যদি **শ্বাসকষ্ট হয়, বুকে ব্যথা অনুভূত হয়, ঘাড় শক্ত হয়ে যায়, প্রচণ্ড মাথাঘোরা বা বিভ্রান্তি দেখা দেয়**।`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'hi_script') {
      return {
        text: `बुखार के **कई सामान्य कारण हो सकते हैं**, जिनमें मौसमी बदलाव या वायरल संक्रमण प्रमुख हैं। तुरंत राहत और देखभाल के लिए ये बुनियादी कदम उठाएँ:

- **भरपूर आराम करें:** शरीर को ठीक होने के लिए विश्राम दें; कोई भी भारी काम न करें।
- **तरल पदार्थों का सेवन बढ़ाएँ:** पर्याप्त मात्रा में पानी, ओआरएस (ORS), नारियल पानी या गुनगुना सूप पिएं ताकि डिहाइड्रेशन न हो।
- **तापमान की निगरानी करें:** थर्मामीटर से हर 4-6 घंटे में बुखार नापें और नोट करें।
- **हल्के सूती कपड़े पहनें:** कमरे में हवा का संचार ठीक रखें; बहुत भारी कंबल न ओढ़ें।
- **गुनगुने पानी की पट्टी:** यदि बेचैनी हो, तो माथे और गर्दन पर सामान्य पानी में भीगे कपड़े से स्पंज करें।

**स्थिति को समझने के लिए सवाल:**
1. अभी बुखार का तापमान कितना है, और यह कितने दिनों से आ रहा है?
2. क्या इसके साथ खांसी, गले में खराश, उल्टी या शरीर में तेज दर्द भी है?

**डॉक्टर को कब दिखाएं:**
यदि बुखार **3 दिन से अधिक रहे**, **102°F से ऊपर बना रहे**, या घरेलू उपायों से कम न हो।

**आपातकालीन चेतावनी (108/112):**
यदि **सांस लेने में कठिनाई, सीने में दर्द, गर्दन में अकड़न, अत्यधिक भ्रम या बार-बार उल्टी** हो रही हो।`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    if (lang === 'hinglish') {
      return {
        text: `Bukhar ke **kai aam kaaran ho sakte hain**, aamtaur par viral infection ya mausam ka badlav. Turant rahat ke liye ye zaroori self-care steps apnayein:

- **Pura aaram karein:** Body ko recover hone ke liye rest bohot zaroori hai; koi mehnat ka kaam na karein.
- **Khoob fluids pijiye:** Paani, ORS ghol, nariyal paani ya warm soup pijiye taaki dehydration na ho.
- **Temperature check karein:** Thermometer se din mein 3-4 baar temperature check karke note karein.
- **Halke kapde pehnein:** Kamre mein fresh hawa aane dein, bohot bhaari kambal na odein.
- **Pani ki patti:** Agar bukhar jyada lage to normal paani mein kapda bhigo kar maathe par patti rakhein.

**Kuch sawal:**
1. Bukhar kitne degree hai aur kitne dino se aa raha hai?
2. Sath mein khansi, gale mein kharash ya ulti jaisa lag raha hai?

**Doctor ko kab dikhayein:**
Agar bukhar **3 din se jyada chale**, **102°F se upar ho**, ya general aaram se kam na ho raha ho.

**Emergency help lein (Dial 108/112):**
Agar **saans lene mein takleef ho**, seene mein dard ho, gardan akad jaye ya bohot jyada chakkar/confusion ho.`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    return {
      text: `**There can be several causes** for fever, most commonly mild viral or bacterial infections. Here are practical, general self-care steps you can take right now:

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

**Seek urgent medical care immediately (Dial 108/112)** if you develop **difficulty breathing, chest pain, a stiff neck, persistent vomiting, or sudden confusion**.

*Note: General health guidance; consult a healthcare professional for persistent symptoms.*`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // C. HEADACHE
  if (isHeadache) {
    if (lang === 'banglish') {
      return {
        text: `Matha bethar **onak shadharon karon hote pare**, jemon tension, chokher pressure, ghum kom howa, ba dehydration. Ekhon aram pabar jonno ei steps gulo korun:

- **Shanto o ondhokar ghore bishram nin:** Screen (phone/laptop) dekha bondho rakhun o 20-30 minute chokh bondho kore shuye thakun.
- **Pani khan:** Ek ba dui glass jol khan; onek shomoy jol kom khele matha betha kore.
- **Gorom ba thanda shek:** Kapale thanda kaporer potti din, ba ghaare ektu halka gorom shek din.
- **Ghar o mathar halka massage:** Angul diye ghaar o kopaler du-pashe halka bhabe massage korun.

**Duto kotha bolte parben?**
1. Bethata ki kopale, ekpashe, na mathar pichone?
2. Shonge ki bomi-bomi bhab, chokhe jhapsha dekha, ba jor ache?

**Doctor dekhaben:**
Jodi betha koyekdin dhore prottekdin thake, ghum bhenge jae, ba betha barte thake.

**Emergency (Dial 108/112):**
Jodi **hathat prochondobhabe matha betha shuru hoy (thunderclap)**, kotha bolte oshubidha hoy, mukh baka lage, ba ghaad shokto hoye jae.`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    return {
      text: `**There can be several causes** for a headache, including tension, dehydration, screen fatigue, or poor sleep. Here are simple steps to help relieve it:

- **Rest in a quiet, dim room:** Close your eyes and step away from digital screens (smartphones, TVs, computers).
- **Hydrate:** Drink 1–2 glasses of cool or room-temperature water, as mild dehydration is a frequent trigger.
- **Apply a compress:** Place a cool damp cloth across your forehead or a warm compress on the back of your neck.
- **Gentle neck stretching:** Slowly stretch your neck from side to side and gently massage your temples and shoulders.

**A couple of questions to help clarify:**
1. Is the pain throbbing on one side, a tight band around your head, or at the back of your neck?
2. Have you experienced nausea, vision changes, or sensitivity to light and sound?

**When to consult a doctor:**
Consult a doctor if your headaches are frequent, wake you from sleep, or worsen over several days.

**Seek urgent medical care (Dial 108/112)** if the headache is **sudden and explosively severe**, or accompanied by **fever, stiff neck, numbness, confusion, or difficulty speaking**.

*Note: General health guidance; consult a doctor if severe or recurring.*`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // D. COUGH / COLD / SORE THROAT
  if (isColdCough) {
    if (lang === 'banglish') {
      return {
        text: `Kash o thandar **onak shadharon karon hote pare**, beshirbhag shomoy eta seasonal viral infection ba allergy. Ekhon aram pabar jonno ei steps gulo follow korun:

- **Gorom jole nun diye kulkuchi (Gargle):** Dine 2-3 baar halka gorom jole ek chimti nun diye gargle korun, golar betha kombe.
- **Ushno jol o aada-tulsi cha:** Gorom jol, aada-modhu mishano jol ba lal cha khan.
- **Baph (Steam) nin:** Ekta patre gorom joler baph 5-10 minute nin jate naak o buker joma shordhi halka hoy.
- **Beshi bishram nin:** Shorir ke recover korar shomoy din.

**Duto question:**
1. Kash ki shukno na khor khor korche (cough/phlegm), ar koto din dhore hochhe?
2. Shonge ki jor, shash nite koshto, ba buke betha ache?

**Doctor dekhaben:**
Kash jodi **1-2 shoptaho par hoye jae**, holud/shobuj kof ashe, ba jor nambe na.

**Emergency (Dial 108/112):**
Jodi **shash nite tibrho koshto hoy**, kof er sathe rokto ashe, ba thont nilche hoye jae.`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    return {
      text: `**There can be several causes** for cough and cold symptoms, such as a mild seasonal viral infection or environmental allergens. Here are practical comfort measures:

- **Warm salt water gargle:** Gargle with warm water and half a teaspoon of salt 2–3 times a day to soothe throat irritation.
- **Steam inhalation:** Inhale steam from a bowl of hot water for 5–10 minutes to loosen nasal congestion and chest phlegm.
- **Stay hydrated with warm liquids:** Drink warm water, herbal tea with honey and ginger, or warm clear soups.
- **Rest and elevate your head:** Use an extra pillow while sleeping to keep your nasal passages clearer at night.

**A couple of follow-up questions:**
1. Is your cough dry or producing colored mucus, and how long have you had it?
2. Are you also experiencing high fever, chest pain, or shortness of breath?

**When to consult a doctor:**
See a doctor if your cough lasts more than **10–14 days**, you have high fever, or your symptoms improve then suddenly get much worse.

**Seek urgent medical care (Dial 108/112)** if you develop **difficulty breathing, wheezing, coughing up blood, or severe chest tightness**.`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // E. MUSCLE PAIN / TIREDNESS / SLEEP / GENERAL
  if (isMusclePain || isFatigue || isSleepHydration) {
    if (lang === 'banglish') {
      return {
        text: `Ei dhoroner shorire klanti ba peshir bethar **onak rokom shadharon karon hote pare**, jemon ghumer ovab, jol kom khaoa, ba durbolota. Ekhon ei steps gulo follow korun:

- **Jol o hydration:** Dinbhor proshur jol khan (dine ontoto 6-8 glass, jodi doctor er kono nishedh na thake).
- **Halka stretch o rest:** Betha jaigatai halka gorom shek din ebong kono bhari jinis tulben na.
- **Niyomito ghum:** Prottekdin ekoi shomoy shute jaan ebong ghumer aage phone/screen kom dekhun.
- **Poushtik khabar:** Shoshe, daal, sobji o fol khan jate shorire energy phire ashe.

**Duto kotha bolte parben?**
1. Betha ba klanti koto din dhore lagche?
2. Shonge ki onno kono lokkhon (jemon jor ba matha ghora) ache?

**Doctor dekhaben:**
Jodi betha ba durbolota koyekdin rest er por o na kome, ba rozkar kaaj kora oshombhob hoye pore.

**Emergency (Dial 108/112):**
Jodi **hathat shorirer ek pashe durbolota ashe**, buke betha kore, ba shash nite koshto hoy.`,
        isEmergency: false,
        isCrisis: false,
      };
    }
    return {
      text: `**There can be several causes** for muscle soreness, fatigue, or low energy, including physical strain, mild dehydration, or disrupted sleep. Here are helpful steps to support your recovery:

- **Adequate hydration:** Drink 6–8 glasses of water throughout the day (unless fluid-restricted by your doctor).
- **Rest and gentle stretching:** Avoid lifting heavy loads; gently stretch stiff muscles and consider a warm bath or heating pad for muscle tightness.
- **Consistent sleep routine:** Aim for 7–8 hours of restful sleep in a quiet, dark environment. Avoid screens 1 hour before bed.
- **Balanced nutrition:** Eat regular, nourishing meals with whole grains, proteins, and fresh vegetables to replenish energy.

**Questions to help understand:**
1. How long have you felt this way, and does the fatigue or pain occur after specific activities?
2. Do you have other symptoms such as fever, dizziness, or unintentional weight changes?

**When to consult a doctor:**
Consult a physician if fatigue or pain persists for more than 1–2 weeks despite rest, or significantly disrupts your daily routine.

**Seek urgent medical care (Dial 108/112)** if accompanied by **chest pain, shortness of breath, sudden muscle weakness on one side, or fainting**.`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // F. GENERAL / OPEN-ENDED INQUIRY
  if (lang === 'banglish') {
    return {
      text: `Apnar shastho shongkranto proshne **onak rokom karon o bishoy thakte pare**. Ami apnake shundorbhabe bujhte sahajjo korchi:

- **Apnar lokkhon gulo jante pari?** Apnar thik ki oshubidha hochhe, ebong koto din dhore hochhe?
- **Shadharon poramorsho:** Shorir ke thik bhabe rest din, porjapto jol o poushtik khabar khan, ar kono boro oshubidha hole doctor er poramorsho nin.

Doya kore apnar lokkhon bishad e bolun, ami apnake shothik upai janachhi.

*Note: Eta shadharon self-care poramorsho; dorkar hole doctor er poramorsho nin.*`,
      isEmergency: false,
      isCrisis: false,
    };
  }
  if (lang === 'bn_script') {
    return {
      text: `আপনার স্বাস্থ্য সংক্রান্ত এই বিষয়ে **বিভিন্ন দিক ও কারণ থাকতে পারে**। আমি আপনাকে বিষয়টি সঠিকভাবে বুঝতে সাহায্য করতে পারি:

- **লক্ষণ স্পষ্টভাবে বলুন:** আপনার ঠিক কী সমস্যা হচ্ছে, ব্যথা বা অস্বস্তি কোথায় এবং কতদিন ধরে হচ্ছে?
- **প্রাথমিক সতর্কতা:** পর্যাপ্ত বিশ্রাম নিন, নিয়মিত জল ও স্বাস্থ্যকর খাবার গ্রহণ করুন।
- **তীব্র লক্ষণ থাকলে:** কোনো সমস্যা তীব্র হলে বা দৈনন্দিন কাজে বাধা দিলে অবহেলা করবেন না।

আপনার উপসর্গ সম্পর্কে আর একটু বিস্তারিত জানালে আমি উপযোগী পরামর্শ দিতে পারি।

*মনে রাখবেন: এটি সাধারণ স্বাস্থ্য শিক্ষা সহায়তা; রোগ নির্ণয়ের জন্য চিকিৎসকের পরামর্শ নিন।*`,
      isEmergency: false,
      isCrisis: false,
    };
  }
  if (lang === 'hi_script') {
    return {
      text: `आपके स्वास्थ्य से जुड़े इस सवाल के **कई पहलू और कारण हो सकते हैं**। मैं आपको सही दिशा और उचित उपाय समझने में मदद कर सकता हूँ:

- **लक्षणों का विवरण:** आपको ठीक क्या परेशानी महसूस हो रही है, यह कितने समय से है, और शरीर के किस हिस्से में है?
- **बुनियादी सलाह:** पर्याप्त आराम करें, भरपूर पानी पिएं और पौष्टिक आहार लें।
- **गंभीरता का ध्यान रखें:** यदि समस्या तीव्र है या घरेलू उपायों से ठीक नहीं हो रही, तो डॉक्टर से सलाह लेना आवश्यक है।

कृपया अपने लक्षणों के बारे में थोड़ा और विस्तार से बताएं ताकि मैं उपयुक्त मार्गदर्शन कर सकूं।

*सूचना: यह सामान्य स्वास्थ्य सहायता है; व्यक्तिगत निदान हेतु डॉक्टर से संपर्क करें।*`,
      isEmergency: false,
      isCrisis: false,
    };
  }
  if (lang === 'hinglish') {
    return {
      text: `Aapke health se jude is sawal ke **kai pehlu aur aam kaaran ho sakte hain**. Main aapko sahi guidance samajhne mein help kar sakta hoon:

- **Apne lakshan batayein:** Aapko theek kya problem ho rahi hai, kitne dino se hai, aur kahan dard ya takleef hai?
- **Basic advice:** Body ko proper rest dein, paryapt paani pijiye aur healthy khana khayein.
- **Doctor kab zaroori hai:** Agar problem badh rahi ho ya rozmarra ke kaamon mein dikkat aaye, to doctor ki advice zaroor lein.

Aap thoda detail mein bataiye taaki main accurate self-care steps share kar sakun.

*Note: Ye aam self-care tips hain; gambhir samasya mein doctor se milein.*`,
      isEmergency: false,
      isCrisis: false,
    };
  }

  // English general fallback
  return {
    text: `**There can be several causes** for the health concerns you mentioned. I can help you understand what steps to take next:

- **Share more details:** What specific symptoms are you experiencing, how long have they been present, and where is the discomfort located?
- **Basic self-care:** Ensure you are getting adequate rest, drinking plenty of water, and avoiding physical overexertion.
- **Monitor changes:** Keep track of whether your symptoms are improving, staying the same, or getting more pronounced.

Please share a bit more detail about how you are feeling, and I will be glad to offer tailored general self-care guidance.

*Note: This is general self-care information. If symptoms persist or worsen, please consult a healthcare professional.*`,
    isEmergency: false,
    isCrisis: false,
  };
}
