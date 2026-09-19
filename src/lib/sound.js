let audioCtx = null;

export function beep(freq = 800, duration = 80, enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
    }, duration);
  } catch (e) {
    // audio not available (e.g. autoplay restrictions) — ignore
  }
}

export const SOUNDS = {
  send: () => beep(700, 50),
  receive: () => beep(1000, 50),
  react: () => beep(900, 50),
  lock: () => beep(600, 100),
  unlock: () => beep(1000, 80),
  error: () => beep(300, 200)
};
