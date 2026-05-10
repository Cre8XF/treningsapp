let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, durationMs, vol = 0.3, delayMs = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + delayMs / 1000;
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000 + 0.01);
  } catch {}
}

export function initAudio() {
  try { getCtx(); } catch {}
}

// Triple 880 hz — exercise start or countdown warning
export function playExerciseStart() {
  playTone(880, 80, 0.3, 0);
  playTone(880, 80, 0.3, 180);
  playTone(880, 80, 0.3, 360);
}

// Single low tone — rest start
export function playRestStart() {
  playTone(440, 200, 0.4, 0);
}

// Triple 880 hz — 3-second countdown warning
export function playWarning() {
  playTone(880, 80, 0.3, 0);
  playTone(880, 80, 0.3, 180);
  playTone(880, 80, 0.3, 360);
}

// Two rising tones — new round starting
export function playNewRound() {
  playTone(440, 300, 0.4, 0);
  playTone(880, 300, 0.35, 350);
}

// Ascending three-tone fanfare — workout done
export function playDone() {
  playTone(440, 200, 0.4, 0);
  playTone(660, 200, 0.4, 250);
  playTone(880, 300, 0.5, 500);
}

export function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch {}
}
