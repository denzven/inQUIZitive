import { getAudioContext, getMasterGain, isSfxDisabled, onAudioUnlocked } from './soundEffects';
import { playCustomSoundbite, stopCustomSoundbite } from './customAudioPlayer';

let isBgmRunning = false;
let bgmTimer: number | null = null;
let bgmGainNode: GainNode | null = null;
let stepCount = 0;

/**
 * 8-bar (64 eighth-note steps) synthesized game show lobby BGM.
 * Features 4-bar section A and 4-bar section B melody variations with bass and chord stabs.
 */

const CHORDS = [
  [261.63, 329.63, 392.00], // C maj (C4, E4, G4)
  [261.63, 329.63, 392.00],
  [220.00, 261.63, 329.63], // A min (A3, C4, E4)
  [220.00, 261.63, 329.63],
  [174.61, 220.00, 261.63], // F maj (F3, A3, C4)
  [174.61, 220.00, 261.63],
  [196.00, 246.94, 293.66], // G maj (G3, B3, D4)
  [196.00, 246.94, 293.66],
];

const BASS_NOTES = [130.81, 130.81, 110.00, 110.00, 87.31, 87.31, 98.00, 98.00];

// Section A (bars 1-4) lead melody
const MELODY_A = [
  523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0,
  440.00, 0, 523.25, 0, 659.25, 523.25, 440.00, 0,
  349.23, 0, 440.00, 0, 523.25, 0, 659.25, 0,
  392.00, 0, 493.88, 0, 587.33, 0, 783.99, 0,
];

// Section B variation (bars 5-8) lead melody
const MELODY_B = [
  659.25, 783.99, 880.00, 0, 1046.50, 0, 880.00, 783.99,
  659.25, 0, 523.25, 659.25, 783.99, 0, 659.25, 0,
  523.25, 659.25, 783.99, 880.00, 1046.50, 0, 880.00, 0,
  783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0,
];

/**
 * Starts synthesized lobby background music loop for Menu and Start screens.
 *
 * @param ignoreDisabled - If true, starts BGM even if disabled in preferences (for preview).
 */
export function startBgm(ignoreDisabled = false): void {
  if (playCustomSoundbite('bgm', ignoreDisabled)) {
    isBgmRunning = true;
    return;
  }
  if (isBgmRunning && !ignoreDisabled) return;
  if (!ignoreDisabled && isSfxDisabled('bgm')) return;

  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;

  if (ctx.state === 'suspended') {
    onAudioUnlocked(() => {
      startBgm(ignoreDisabled);
    });
    return;
  }

  if (bgmTimer !== null) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  isBgmRunning = true;
  stepCount = 0;

  bgmGainNode = ctx.createGain();
  bgmGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  bgmGainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
  bgmGainNode.connect(master);

  const stepTimeMs = 260; // 115 BPM eighth note

  const playStep = () => {
    if (!isBgmRunning || !bgmGainNode) return;
    const now = ctx.currentTime;
    const barIdx = Math.floor((stepCount % 64) / 8);
    const stepInBar = stepCount % 8;

    // 1. Bass Note on beat 1 and beat 5
    if (stepInBar === 0 || stepInBar === 4) {
      const bassFreq = BASS_NOTES[barIdx % BASS_NOTES.length];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bassFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.22, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(bgmGainNode);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    // 2. Upbeat Chord Stabs on beats 2, 4, 6, 8
    if (stepInBar % 2 === 1) {
      const chord = CHORDS[barIdx % CHORDS.length];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.07, now + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(bgmGainNode!);
        osc.start(now);
        osc.stop(now + 0.16);
      });
    }

    // 3. Lead Melody Note (Section A vs Section B variation)
    const totalMelody = [...MELODY_A, ...MELODY_B];
    const melFreq = totalMelody[stepCount % 64];
    if (melFreq > 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.1, now + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(bgmGainNode);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    stepCount++;
  };

  playStep();
  bgmTimer = window.setInterval(playStep, stepTimeMs);
}

/**
 * Smoothly stops background music playback with fade-out.
 */
export function stopBgm(): void {
  stopCustomSoundbite('bgm');
  if (!isBgmRunning) return;
  isBgmRunning = false;

  if (bgmTimer !== null) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  if (bgmGainNode) {
    const ctx = getAudioContext();
    if (ctx) {
      bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, ctx.currentTime);
      bgmGainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      setTimeout(() => {
        bgmGainNode?.disconnect();
        bgmGainNode = null;
      }, 400);
    } else {
      bgmGainNode.disconnect();
      bgmGainNode = null;
    }
  }
}

/**
 * Returns true if background music loop is currently playing.
 */
export function isBgmPlaying(): boolean {
  return isBgmRunning;
}
