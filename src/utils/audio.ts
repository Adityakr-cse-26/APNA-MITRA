export const playSiren = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  
  // Modern Emergency Alert style dual-tone (853 Hz & 960 Hz)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  
  // Set dual-tone frequencies
  osc1.frequency.value = 853;
  osc2.frequency.value = 960;
  
  // Create a pulsing pattern
  let now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  
  for (let i = 0; i < 6; i++) {
    // Sharp pulse on
    gain.gain.setValueAtTime(0.15, now);
    // Hold pulse
    gain.gain.setValueAtTime(0.15, now + 0.4);
    // Sharp pulse off
    gain.gain.setValueAtTime(0, now + 0.45);
    now += 0.7; // Wait before next pulse
  }
  
  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(now);
  osc2.stop(now);
};

