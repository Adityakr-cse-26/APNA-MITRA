export const playSiren = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Set initial frequency
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  
  let now = ctx.currentTime;
  // Create a 5-second alternating high/low siren loop
  for (let i = 0; i < 5; i++) {
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.2);
    osc.frequency.setValueAtTime(800, now + 0.5);
    osc.frequency.linearRampToValueAtTime(400, now + 0.7);
    now += 1.0;
  }
  
  // Set volume (not too loud)
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  
  osc.start(ctx.currentTime);
  osc.stop(now);
};
