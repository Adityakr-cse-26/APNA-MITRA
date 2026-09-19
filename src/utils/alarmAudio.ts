// Audio Synthesizer & Speech Engine for Medication Alarms

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let isAlarmSoundPlaying = false;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("AudioContext could not be initialized:", e);
    return null;
  }
}

/**
 * Plays a pleasant but attention-grabbing two-tone medical chime chord
 */
export function playChimeNote(freq: number, duration: number = 0.35, delay: number = 0, volume: number = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    // Smooth envelope (attack, decay)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (err) {
    console.warn("playChimeNote error:", err);
  }
}

/**
 * Plays a single alarm burst (4-tone sequence: C5 -> E5 -> G5 -> C6)
 */
export function playAlarmSequence() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
  playChimeNote(523.25, 0.22, 0.0, 0.35);
  playChimeNote(659.25, 0.22, 0.18, 0.35);
  playChimeNote(783.99, 0.22, 0.36, 0.35);
  playChimeNote(1046.50, 0.45, 0.54, 0.4);

  // Gentle second harmonic for rich chime sound
  playChimeNote(1046.50 * 1.5, 0.35, 0.56, 0.15);

  // Vibration if supported
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Starts continuous looping alarm sound until stopped.
 * Loops the chime every 2.4 seconds.
 */
export function startAlarmSound() {
  if (isAlarmSoundPlaying) return;
  isAlarmSoundPlaying = true;

  playAlarmSequence();

  if (alarmIntervalId) clearInterval(alarmIntervalId);
  alarmIntervalId = setInterval(() => {
    if (isAlarmSoundPlaying) {
      playAlarmSequence();
    }
  }, 2400);
}

/**
 * Stops the looping alarm sound.
 */
export function stopAlarmSound() {
  isAlarmSoundPlaying = false;
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore TTS cancel error
    }
  }
}

/**
 * Speaks an alert message using the browser's native Text-to-Speech (TTS)
 */
export function speakAlarmMessage(medicineName: string, dosage?: string, lang: "en" | "hi" | "bn" = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    let text = `Medicine Reminder. It is time to take ${medicineName}.`;
    if (dosage) {
      text += ` Dosage: ${dosage}.`;
    }

    if (lang === "hi") {
      text = `दवा का समय हो गया है। कृपया अपनी दवा ${medicineName} लें। खुराक: ${dosage || "निर्देशानुसार"}`;
    } else if (lang === "bn") {
      text = `ওষুধের সময় হয়েছে। দয়া করে ${medicineName} ওষুধটি খান।`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Clear and slightly slower for elderly
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    if (lang === "hi") utterance.lang = "hi-IN";
    else if (lang === "bn") utterance.lang = "bn-IN";
    else utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}
