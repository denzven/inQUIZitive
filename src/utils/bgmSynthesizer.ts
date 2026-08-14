import { getAudioContext, getMasterGain, isSfxDisabled, onAudioUnlocked } from './soundEffects';
import { playCustomSoundbite, stopAllCustomBgms } from './customAudioPlayer';
import type { SfxKey } from '../store/useAudioStore';

let isBgmRunning = false;
let bgmTimer: number | null = null;
let bgmGainNode: GainNode | null = null;
let stepCount = 0;
let currentActiveScreenBgmKey: SfxKey | null = null;

/**
 * Maps game state screen names and active round codes to their respective BGM key in AudioStore.
 * Returns null for quiet screens (e.g. SETTINGS, ABOUT) where background music is disabled.
 */
export function getScreenBgmKey(gameState: string, activeRound?: string | null): SfxKey | null {
  if (gameState === 'PLAYING' && activeRound) {
    switch (activeRound) {
      case 'RF':
        return 'bgm_rapid_fire';
      case 'SWJ':
        return 'bgm_spin_wheel';
      case 'TTT':
        return 'bgm_tictactoe';
      case 'B':
        return 'bgm_buzzer';
      default:
        break;
    }
  }

  switch (gameState) {
    case 'MENU':
      return 'bgm_menu';
    case 'START':
      return 'bgm_rounds';
    case 'RAPID_FIRE':
    case 'RF':
      return 'bgm_rapid_fire';
    case 'SPIN_WHEEL':
    case 'SWJ':
      return 'bgm_spin_wheel';
    case 'TICTACTOE':
    case 'TTT':
      return 'bgm_tictactoe';
    case 'BUZZER':
    case 'B':
      return 'bgm_buzzer';
    case 'LEADERBOARD':
      return 'bgm_leaderboard';
    case 'RULES':
      return 'bgm_rules';
    case 'SETTINGS':
    case 'ABOUT':
      return null; // Quiet silent mode for Settings & About screens
    default:
      return null;
  }
}

/**
 * Automatically triggers BGM playback for the specified screen/round,
 * attempting custom MP3 playback first or falling back to unique synthesized theme.
 * Stops BGM if navigating to a quiet screen (e.g. SETTINGS).
 *
 * @param gameState - The current screen or game round name (e.g. MENU, PLAYING, START).
 * @param activeRound - Optional active round code (e.g. 'RF', 'SWJ', 'TTT', 'B') or boolean ignoreDisabled flag.
 * @param ignoreDisabled - If true, starts BGM even if disabled (for preview).
 * @param isPreview - If true, starts audio instantly without fade-in (for Settings preview).
 */
export function playScreenBgm(
  gameState: string, 
  activeRound?: string | null | boolean, 
  ignoreDisabled = false, 
  isPreview = false
): void {
  let round: string | null = null;
  let ignore = ignoreDisabled;
  let preview = isPreview;

  if (typeof activeRound === 'boolean') {
    preview = ignoreDisabled;
    ignore = activeRound;
  } else {
    round = activeRound || null;
  }

  const targetKey = getScreenBgmKey(gameState, round);

  // If navigating to a silent screen (e.g. SETTINGS), stop background music cleanly!
  if (!targetKey) {
    if (!preview) {
      stopBgm();
    }
    return;
  }

  if (currentActiveScreenBgmKey === targetKey && isBgmPlaying() && !preview) {
    return;
  }

  // Stop previous screen BGM (instantly if in Settings preview)
  stopBgm(preview);

  currentActiveScreenBgmKey = targetKey;

  // 1. Try playing custom uploaded MP3 for this specific screen
  if (playCustomSoundbite(targetKey, ignore, preview)) {
    return;
  }

  // 2. Fallback: try playing general 'bgm' custom MP3 if set
  if (playCustomSoundbite('bgm', ignore, preview)) {
    return;
  }

  // 3. Fallback: run unique synthesized background music loop for this screen
  startBgmForKey(targetKey, ignore, preview);
}

/**
 * Screen-specific unique musical chord & melody definitions
 */
interface ScreenBgmConfig {
  bpm: number;
  chords: number[][];
  bass: number[];
  melody: number[];
}

const SCREEN_BGM_CONFIGS: Record<string, ScreenBgmConfig> = {
  // 1. Main Menu Screen: Upbeat C-Major Game Show Lobby Theme (115 BPM)
  bgm_menu: {
    bpm: 115,
    chords: [
      [261.63, 329.63, 392.00], [261.63, 329.63, 392.00],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63], [174.61, 220.00, 261.63],
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
    ],
    bass: [130.81, 130.81, 110.00, 110.00, 87.31, 87.31, 98.00, 98.00],
    melody: [
      523.25, 0, 659.25, 0, 783.99, 659.25, 523.25, 0,
      440.00, 0, 523.25, 0, 659.25, 523.25, 440.00, 0,
      349.23, 0, 440.00, 0, 523.25, 0, 659.25, 0,
      392.00, 0, 493.88, 0, 587.33, 0, 783.99, 0,
    ],
  },
  // 1b. Rounds Selection Screen: Exciting E-Major Round Selector Theme (110 BPM)
  bgm_rounds: {
    bpm: 110,
    chords: [
      [164.81, 207.65, 246.94], [164.81, 207.65, 246.94],
      [220.00, 277.18, 329.63], [220.00, 277.18, 329.63],
      [246.94, 311.13, 369.99], [246.94, 311.13, 369.99],
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
    ],
    bass: [82.41, 123.47, 110.00, 146.83, 123.47, 164.81, 98.00, 130.81],
    melody: [
      329.63, 415.30, 493.88, 659.25, 0, 493.88, 415.30, 0,
      440.00, 554.37, 659.25, 880.00, 0, 659.25, 554.37, 0,
      493.88, 622.25, 739.99, 987.77, 0, 739.99, 622.25, 0,
      392.00, 493.88, 587.33, 783.99, 0, 587.33, 493.88, 0,
    ],
  },
  // 2. Rapid Fire Speed Round: High-Energy D-Minor Tension Theme (130 BPM)
  bgm_rapid_fire: {
    bpm: 130,
    chords: [
      [293.66, 349.23, 440.00], [293.66, 349.23, 440.00],
      [261.63, 329.63, 392.00], [261.63, 329.63, 392.00],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [246.94, 293.66, 369.99], [246.94, 293.66, 369.99],
    ],
    bass: [146.83, 146.83, 130.81, 130.81, 110.00, 110.00, 123.47, 123.47],
    melody: [
      587.33, 698.46, 880.00, 0, 587.33, 698.46, 880.00, 0,
      523.25, 659.25, 783.99, 0, 523.25, 659.25, 783.99, 0,
      440.00, 523.25, 659.25, 0, 440.00, 523.25, 659.25, 0,
      493.88, 587.33, 739.99, 0, 493.88, 587.33, 739.99, 0,
    ],
  },
  // 3. Spin Wheel / Jeopardy: Suspenseful G-Major Slot Machine Theme (105 BPM)
  bgm_spin_wheel: {
    bpm: 105,
    chords: [
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [261.63, 329.63, 392.00], [261.63, 329.63, 392.00],
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
    ],
    bass: [98.00, 123.47, 146.83, 164.81, 110.00, 130.81, 146.83, 164.81],
    melody: [
      392.00, 0, 493.88, 0, 587.33, 0, 739.99, 0,
      440.00, 0, 523.25, 0, 659.25, 0, 783.99, 0,
      523.25, 0, 659.25, 0, 783.99, 0, 987.77, 0,
      392.00, 493.88, 587.33, 0, 739.99, 0, 587.33, 0,
    ],
  },
  // 4. Tic Tac Toe: Strategic F-Major Synth-Pop Grid Theme (100 BPM)
  bgm_tictactoe: {
    bpm: 100,
    chords: [
      [174.61, 220.00, 261.63], [174.61, 220.00, 261.63],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [261.63, 329.63, 392.00], [261.63, 329.63, 392.00],
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
    ],
    bass: [87.31, 87.31, 110.00, 110.00, 130.81, 130.81, 98.00, 98.00],
    melody: [
      349.23, 440.00, 523.25, 659.25, 0, 523.25, 440.00, 0,
      440.00, 523.25, 659.25, 783.99, 0, 659.25, 523.25, 0,
      523.25, 659.25, 783.99, 1046.50, 0, 783.99, 659.25, 0,
      392.00, 493.88, 587.33, 783.99, 0, 587.33, 493.88, 0,
    ],
  },
  // 5. Buzzer / Fastest Finger: High-Tension E-Minor Lock-In Pulse (125 BPM)
  bgm_buzzer: {
    bpm: 125,
    chords: [
      [164.81, 196.00, 246.94], [164.81, 196.00, 246.94],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63], [174.61, 220.00, 261.63],
      [246.94, 293.66, 369.99], [246.94, 293.66, 369.99],
    ],
    bass: [82.41, 82.41, 110.00, 110.00, 87.31, 87.31, 123.47, 123.47],
    melody: [
      329.63, 0, 392.00, 0, 493.88, 392.00, 329.63, 0,
      440.00, 0, 523.25, 0, 659.25, 523.25, 440.00, 0,
      349.23, 0, 440.00, 0, 523.25, 440.00, 349.23, 0,
      493.88, 0, 587.33, 0, 739.99, 587.33, 493.88, 0,
    ],
  },
  // 6. Leaderboard / Winner Podium: Triumphant A-Major Winner Theme (120 BPM)
  bgm_leaderboard: {
    bpm: 120,
    chords: [
      [220.00, 277.18, 329.63], [220.00, 277.18, 329.63],
      [293.66, 369.99, 440.00], [293.66, 369.99, 440.00],
      [246.94, 311.13, 369.99], [246.94, 311.13, 369.99],
      [196.00, 246.94, 293.66], [196.00, 246.94, 293.66],
    ],
    bass: [110.00, 110.00, 146.83, 146.83, 123.47, 123.47, 98.00, 98.00],
    melody: [
      440.00, 554.37, 659.25, 880.00, 1108.73, 0, 880.00, 659.25,
      587.33, 739.99, 880.00, 1174.66, 1479.98, 0, 1174.66, 880.00,
      493.88, 622.25, 739.99, 987.77, 1244.51, 0, 987.77, 739.99,
      392.00, 493.88, 587.33, 783.99, 987.77, 0, 783.99, 587.33,
    ],
  },
  // 7. Rules Screen: Relaxed Bb-Major Informative Lounge Theme (95 BPM)
  bgm_rules: {
    bpm: 95,
    chords: [
      [233.08, 293.66, 349.23], [233.08, 293.66, 349.23],
      [261.63, 329.63, 392.00], [261.63, 329.63, 392.00],
      [220.00, 261.63, 329.63], [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63], [174.61, 220.00, 261.63],
    ],
    bass: [116.54, 116.54, 130.81, 130.81, 110.00, 110.00, 87.31, 87.31],
    melody: [
      466.16, 0, 587.33, 0, 698.46, 0, 587.33, 0,
      523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0,
      440.00, 0, 523.25, 0, 659.25, 0, 523.25, 0,
      349.23, 0, 440.00, 0, 523.25, 0, 440.00, 0,
    ],
  },
};

/**
 * Starts synthesized background music loop for a specific screen key.
 *
 * @param sfxKey - The screen key (e.g. bgm_menu, bgm_rapid_fire).
 * @param ignoreDisabled - If true, starts BGM even if disabled in preferences.
 * @param isPreview - If true, starts BGM instantly without fade-in (for Settings preview).
 */
export function startBgmForKey(sfxKey: SfxKey = 'bgm_menu', ignoreDisabled = false, isPreview = false): void {
  if (playCustomSoundbite(sfxKey, ignoreDisabled, isPreview)) {
    isBgmRunning = true;
    return;
  }
  if (isBgmRunning && !ignoreDisabled && !isPreview) return;
  if (!ignoreDisabled && isSfxDisabled(sfxKey)) return;

  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;

  if (ctx.state === 'suspended') {
    onAudioUnlocked(() => {
      startBgmForKey(sfxKey, ignoreDisabled, isPreview);
    });
    return;
  }

  if (bgmTimer !== null) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  isBgmRunning = true;
  stepCount = 0;

  const activeGain = ctx.createGain();
  bgmGainNode = activeGain;

  if (isPreview) {
    // Instant play for Settings preview button (0s fade-in)
    activeGain.gain.setValueAtTime(0.12, ctx.currentTime);
  } else {
    // Smooth 1.8-second gradual BGM fade-in for screen navigation
    activeGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    activeGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.8);
  }

  activeGain.connect(master);

  const config = SCREEN_BGM_CONFIGS[sfxKey] || SCREEN_BGM_CONFIGS['bgm_menu'];
  const stepTimeMs = Math.round((60000 / config.bpm) / 2); // eighth note step duration

  const playStep = () => {
    if (!activeGain || activeGain.gain.value <= 0.0005) return;
    const now = ctx.currentTime;
    const barIdx = Math.floor((stepCount % 32) / 4);
    const stepInBar = stepCount % 4;

    // 1. Layer 1: Deep 808-Style Sub-Bass Vibration & Pitch Drop (on beat 1 and beat 3)
    if (stepInBar === 0 || stepInBar === 2) {
      const bassFreq = config.bass[barIdx % config.bass.length];

      // 808 Sub-Bass Oscillator (Sine wave 41Hz - 73Hz with pitch drop)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(bassFreq * 0.5, now);
      // Subtle 808 pitch bend drop
      subOsc.frequency.exponentialRampToValueAtTime(bassFreq * 0.42, now + 0.28);

      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(160, now);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.35, now + 0.008);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(activeGain);

      subOsc.start(now);
      subOsc.stop(now + 0.34);

      // Mid Bass Triangle Punch
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bassFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(activeGain);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    // 2. Layer 2 & 3: Ambient Atmospheric Synth Chord Pads & Upbeat Stabs
    if (stepInBar % 2 === 1) {
      const chord = config.chords[barIdx % config.chords.length];
      chord.forEach((freq, idx) => {
        // Atmospheric Warm Synth Pad
        const padOsc = ctx.createOscillator();
        const padGain = ctx.createGain();
        const padFilter = ctx.createBiquadFilter();

        padOsc.type = 'triangle';
        // Subtle detune for lush analog pad width
        padOsc.frequency.setValueAtTime(freq * (idx % 2 === 0 ? 0.998 : 1.002), now);

        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(750, now);

        padGain.gain.setValueAtTime(0.0001, now);
        padGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        padOsc.connect(padFilter);
        padFilter.connect(padGain);

        if (typeof ctx.createStereoPanner === 'function') {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(idx % 2 === 0 ? -0.22 : 0.22, now);
          padGain.connect(panner);
          panner.connect(activeGain);
        } else {
          padGain.connect(activeGain);
        }

        padOsc.start(now);
        padOsc.stop(now + 0.38);

        // Crisp Focus Chord Stab
        const stabOsc = ctx.createOscillator();
        const stabGain = ctx.createGain();
        stabOsc.type = 'sine';
        stabOsc.frequency.setValueAtTime(freq, now);
        stabGain.gain.setValueAtTime(0.0001, now);
        stabGain.gain.linearRampToValueAtTime(0.05, now + 0.003);
        stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        stabOsc.connect(stabGain);
        stabGain.connect(activeGain);
        stabOsc.start(now);
        stabOsc.stop(now + 0.15);
      });
    }

    // 3. Lead Melody Note
    const melFreq = config.melody[stepCount % config.melody.length];
    if (melFreq > 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.1, now + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(activeGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    stepCount++;
  };

  playStep();
  bgmTimer = window.setInterval(playStep, stepTimeMs);
}

/**
 * Backwards compatible startBgm function for main lobby music.
 */
export function startBgm(ignoreDisabled = false, isPreview = false): void {
  startBgmForKey('bgm_menu', ignoreDisabled, isPreview);
}

/**
 * Smoothly stops background music playback across all screens (or instant 0s stop if isPreview is true).
 */
export function stopBgm(isPreview = false): void {
  stopAllCustomBgms(isPreview);
  currentActiveScreenBgmKey = null;

  if (isPreview) {
    // Instant stop for Settings preview button (0s fade-out)
    if (bgmTimer !== null) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    if (bgmGainNode) {
      try {
        const ctx = getAudioContext();
        if (ctx) bgmGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        bgmGainNode.disconnect();
      } catch (e) {}
      bgmGainNode = null;
    }
    isBgmRunning = false;
    return;
  }

  if (!isBgmRunning && !bgmGainNode) return;
  isBgmRunning = false;

  const fadingGainNode = bgmGainNode;
  const fadingTimer = bgmTimer;

  // Decouple gain node reference so startBgm can initialize fresh node if triggered
  bgmGainNode = null;
  bgmTimer = null;

  if (fadingGainNode) {
    const ctx = getAudioContext();
    if (ctx) {
      fadingGainNode.gain.setValueAtTime(fadingGainNode.gain.value, ctx.currentTime);
      // Smooth 2.0-second gradual BGM fade-out down to silence
      fadingGainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

      setTimeout(() => {
        if (fadingTimer !== null) {
          clearInterval(fadingTimer);
        }
        try {
          fadingGainNode.disconnect();
        } catch (e) {}
      }, 2050);
    } else {
      if (fadingTimer !== null) {
        clearInterval(fadingTimer);
      }
      try { fadingGainNode.disconnect(); } catch (e) {}
    }
  } else if (fadingTimer !== null) {
    clearInterval(fadingTimer);
  }
}

/**
 * Returns true if background music loop is currently playing.
 */
export function isBgmPlaying(): boolean {
  return isBgmRunning;
}
