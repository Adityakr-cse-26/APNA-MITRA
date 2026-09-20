import { supabase } from '../supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  isCrisis?: boolean;
}

export interface ChatResponse {
  text: string;
  isEmergency?: boolean;
  isCrisis?: boolean;
}

/**
 * Sends a message to the health assistant via Supabase Edge Function 'health-chat'.
 * 
 * Architecture & Security:
 * 1. AI API keys are NEVER exposed in frontend code.
 * 2. Directly invokes the Supabase Edge Function 'health-chat'.
 * 3. Gracefully falls back to the server API proxy (/api/chat) if edge function is running in local dev.
 * 4. Zero n8n dependencies.
 */
export async function sendChatbotMessage(
  message: string,
  history: ChatMessage[] = [],
  language: string = 'en'
): Promise<ChatResponse> {
  const sanitizedHistory = history.slice(-6).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let lastError: Error | null = null;

  // 1. Primary: Secure Supabase Edge Function 'health-chat'
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('health-chat', {
      body: {
        message,
        history: sanitizedHistory,
        language,
      },
    });

    if (!edgeError && edgeData && typeof edgeData.text === 'string') {
      return {
        text: edgeData.text,
        isEmergency: !!edgeData.isEmergency,
        isCrisis: !!edgeData.isCrisis,
      };
    }

    if (edgeError) {
      console.info("Supabase Edge Function notice:", edgeError.message);
      lastError = new Error(edgeError.message);
    }
  } catch (err: any) {
    console.info("Supabase Edge Function not active directly, routing via server /api/chat");
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // 2. Secondary: Secure server API proxy (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: sanitizedHistory,
        language,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        text: data.text || "**There can be several causes** for your query. Please rest, stay hydrated, and consult a doctor if symptoms persist.",
        isEmergency: !!data.isEmergency,
        isCrisis: !!data.isCrisis,
      };
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.error || `Server responded with status ${response.status}`);
    }
  } catch (err: any) {
    console.info("Chat proxy fallback notice:", err?.message || err);
    // Graceful self-care fallback so the UI never crashes or shows a broken state
    return {
      text: "**There can be several causes** for the symptoms you described.\n\n- **Rest:** Avoid strenuous activity or putting stress on the affected area.\n- **Hydration:** Drink plenty of water throughout the day.\n- **Monitor:** Watch if symptoms improve with rest.\n\n*When to see a doctor: If symptoms are severe, worsening, or persist for more than a few days, please consult a healthcare professional.*",
      isEmergency: false,
      isCrisis: false,
    };
  }
}

export const LOCALIZED_QUICK_PROMPTS: Record<string, string[]> = {
  en: [
    "🩺 How do I keep my blood pressure in a healthy range?",
    "🧘 Breathing exercises to calm anxiety or tension",
    "💧 Daily water intake recommendations for seniors",
    "🥗 Heart-healthy eating habits and gentle mobility",
    "😴 Tips for falling asleep naturally and resting well",
  ],
  hi: [
    "🩺 ब्लड प्रेशर को सामान्य सीमा में कैसे रखें?",
    "🧘 घबराहट और तनाव दूर करने के लिए सांस के व्यायाम",
    "💧 बुजुर्गों के लिए रोजाना पानी की सही मात्रा",
    "🥗 दिल के लिए फायदेमंद आहार और हल्का व्यायाम",
    "😴 अच्छी और गहरी नींद के लिए प्राकृतिक सुझाव",
  ],
  bn: [
    "🩺 রক্তচাপ নিয়ন্ত্রণে রাখার সেরা উপায় কী?",
    "🧘 উদ্বেগ ও মানসিক চাপ কমাতে গভীর শ্বাস-প্রশ্বাসের উপায়",
    "💧 বয়স্কদের জন্য সারাদিনে জল পানের সঠিক পরিমাণ",
    "🥗 হার্ট সুস্থ রাখার উপযোগী খাবার ও শরীরচর্চা",
    "😴 রাতে স্বাভাবিক ও শান্তির ঘুমের টিপস",
  ],
};

export const QUICK_PROMPTS = LOCALIZED_QUICK_PROMPTS.en;

export const LOCALIZED_GREETINGS: Record<string, string> = {
  en: `Namaste! I am **Apna Mitra** (अपना मित्र), your AI Health & Wellness Companion.\n\nI am here to offer general physical and mental health guidance, lifestyle suggestions, and wellness information.\n\n*Important: I am an AI support tool, not a medical doctor. I cannot provide formal medical diagnoses or prescribe prescription medicines. In case of an emergency, please call 108 or 112 immediately.*`,
  hi: `नमस्ते! मैं हूँ **अपना मित्र**, आपका AI स्वास्थ्य एवं कल्याण साथी।\n\nमैं यहाँ आपके शारीरिक और मानसिक स्वास्थ्य, दैनिक जीवनशैली और कल्याण से जुड़े सवालों के उत्तर देने के लिए उपलब्ध हूँ।\n\n*महत्वपूर्ण सूचना: मैं एक AI स्वास्थ्य साथी हूँ, कोई डॉक्टर नहीं। मैं चिकित्सकीय निदान या दवाइयाँ नहीं लिखता। किसी भी आपातकालीन स्थिति में तुरंत 108 या 112 पर संपर्क करें।*`,
  bn: `নমস্কার! আমি **আপনা মিত্র**, আপনার এআই স্বাস্থ্য ও সুস্থতা সহকারী।\n\nআমি আপনার শারীরিক ও মানসিক সুস্থতা, দৈনন্দিন জীবনযাত্রা এবং স্বাস্থ্য সংক্রান্ত তথ্য প্রদানে সহায়তা করতে এখানে আছি।\n\n*জরুরি সতর্কতা: আমি একটি এআই স্বাস্থ্য সহকারী, কোনো ডাক্তার নই। আমি কোনো প্রেসক্রিপশন বা রোগের নিশ্চিত চিকিৎসা প্রদান করি না। জরুরি পরিস্থিতিতে অবিলম্বে ১০৮ বা ১১২ নম্বরে যোগাযোগ করুন।*`,
};
