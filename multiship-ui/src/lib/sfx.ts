// Tiny synthesized sound effects (no audio assets). Browsers only allow audio
// after a user gesture; the context is created lazily on first play.

import { loadPrefs, savePrefs } from './prefs';

let ctx: AudioContext | null = null;
let muted = loadPrefs().muted;

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.08, slideTo?: number, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function noise(duration: number, gain = 0.15) {
  const ac = audio();
  if (!ac) return;
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  src.buffer = buffer;
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

export const sfx = {
  miss: () => tone(520, 0.18, 'sine', 0.05, 260),
  hit: () => {
    noise(0.35, 0.22);
    tone(140, 0.3, 'triangle', 0.1, 60);
  },
  sunk: () => {
    noise(0.6, 0.25);
    tone(220, 0.5, 'sawtooth', 0.05, 55);
  },
  turn: () => {
    tone(660, 0.12, 'sine', 0.05);
    tone(880, 0.16, 'sine', 0.05, undefined, 0.1);
  },
  click: () => tone(1200, 0.04, 'square', 0.02),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.06, undefined, i * 0.12)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.35, 'triangle', 0.06, undefined, i * 0.18)),
};

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  savePrefs({ muted: value });
}
