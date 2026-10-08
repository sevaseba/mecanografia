// Short feedback sounds made with the Web Audio API (no audio files to download).
// The AudioContext is created on first use, which always follows a keystroke (a user gesture).

let context = null;

function audio() {
  const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!AudioContext) return null;
  context ??= new AudioContext();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone({ frequency, endFrequency = frequency, duration, type, volume }) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  // Quick fade in/out avoids clicks.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/** A soft, high "plip" for a right key. */
export function playHit() {
  tone({ frequency: 880, endFrequency: 1320, duration: 0.07, type: 'sine', volume: 0.08 });
}

/** A gentle low "bop" for a wrong key: noticeable, never harsh. */
export function playMiss() {
  tone({ frequency: 260, endFrequency: 180, duration: 0.14, type: 'triangle', volume: 0.1 });
}
