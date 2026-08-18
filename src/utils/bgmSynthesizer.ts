import { getAudioContext, getMasterGain, isSfxDisabled, onAudioUnlocked, getActiveThemeId } from './soundEffects';
import { playCustomSoundbite, playMp3Url, stopAllCustomBgms } from './customAudioPlayer';
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

const THEME_MP3_MAP: Record<string, string[]> = {
  wizardingScroll: ['/audio/Hedwig_theme_harry_potter.mp3'],
  blockBuilder: ['/audio/C418_Minecraft.mp3'],
  wildWestWanted: ['/audio/GBU_Wild_West.mp3'],
  arachnidHero: ['/audio/spider_man.mp3', '/audio/SpiderMan_Theme.mp3'],
  cyberTerminal: ['/audio/matrix.mp3', '/audio/Matrix_Cyberpunk_Theme.mp3'],
  retroArcade: ['/audio/8_bit.mp3', '/audio/8Bit_Arcade_Theme.mp3'],
  tacticalLazer: ['/audio/Tron_Laser_Theme.mp3', '/audio/tactical_lazer.mp3'],
  neonCatalyst: ['/audio/Neon_Catalyst_Theme.mp3', '/audio/neon_catalyst.mp3'],
  cosmicOdyssey: ['/audio/Interstellar_Space_Theme.mp3', '/audio/cosmic_odyssey.mp3']
};

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

  const currentThemeId = getActiveThemeId();
  const themeMp3Candidates = THEME_MP3_MAP[currentThemeId] || [];

  // 1. If an MP3 audio file exists for the active theme, play it!
  for (const mp3Path of themeMp3Candidates) {
    if (playMp3Url(targetKey, mp3Path, ignore, preview)) {
      return;
    }
  }

  // 2. Try playing custom uploaded MP3 for this specific screen
  if (playCustomSoundbite(targetKey, ignore, preview)) {
    return;
  }

  // 3. Fallback: try playing general 'bgm' custom MP3 if set
  if (playCustomSoundbite('bgm', ignore, preview)) {
    return;
  }

  // 4. Fallback: run unique synthesized background music loop for this screen
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
  // 1. Main Menu Screen: Relaxed C-Major Game Show Lobby Theme (92 BPM)
  bgm_menu: {
    bpm: 92,
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
  // 1b. Rounds Selection Screen: Flowing E-Major Round Selector Theme (88 BPM)
  bgm_rounds: {
    bpm: 88,
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
  // 2. Rapid Fire Speed Round: Driving D-Minor Tension Theme (105 BPM)
  bgm_rapid_fire: {
    bpm: 105,
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
  // 3. Spin Wheel / Jeopardy: Suspenseful G-Major Slot Machine Theme (86 BPM)
  bgm_spin_wheel: {
    bpm: 86,
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
  // 4. Tic Tac Toe: Strategic F-Major Ambient Grid Theme (82 BPM)
  bgm_tictactoe: {
    bpm: 82,
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
  // 5. Buzzer / Fastest Finger: E-Minor Lock-In Pulse (98 BPM)
  bgm_buzzer: {
    bpm: 98,
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
  // 6. Leaderboard / Winner Podium: Triumphant A-Major Winner Theme (95 BPM)
  bgm_leaderboard: {
    bpm: 95,
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
  // 7. Rules Screen: Relaxed Bb-Major Informative Lounge Theme (78 BPM)
  bgm_rules: {
    bpm: 78,
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
  const themeId = getActiveThemeId();
  const themeMp3Candidates = THEME_MP3_MAP[themeId] || [];
  for (const mp3Path of themeMp3Candidates) {
    if (playMp3Url(sfxKey, mp3Path, ignoreDisabled, isPreview)) {
      isBgmRunning = true;
      return;
    }
  }

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
  const currentBpm = themeId === 'wizardingScroll' ? Math.round(config.bpm * 0.68) : config.bpm;
  const stepTimeMs = Math.round((60000 / currentBpm) / 2);

  const playStep = () => {
    if (!activeGain || activeGain.gain.value <= 0.0005) return;
    const themeId = getActiveThemeId();

    // Slower Effective Tempo & Jazzy Swing Timing Offset
    const currentBpm = themeId === 'wizardingScroll' ? Math.round(config.bpm * 0.68) : config.bpm;
    const isOffbeat = (stepCount % 2) === 1;
    const swingFactor = themeId === 'wildWestWanted' || themeId === 'wizardingScroll' ? 0.26 : 0.14;
    const swingOffsetSec = isOffbeat ? ((60 / currentBpm) * swingFactor) : 0;
    const now = ctx.currentTime + swingOffsetSec;

    const barIdx = Math.floor((stepCount % 32) / 4);
    const stepInBar = stepCount % 4;

    let bassOscType: OscillatorType = 'triangle';
    let padOscType: OscillatorType = 'triangle';

    if (themeId === 'blockBuilder') {
      bassOscType = 'square';
      padOscType = 'sine';
    } else if (themeId === 'cyberTerminal') {
      bassOscType = 'sawtooth';
      padOscType = 'sawtooth';
    } else if (themeId === 'wildWestWanted') {
      bassOscType = 'triangle';
      padOscType = 'triangle';
    } else if (themeId === 'wizardingScroll') {
      bassOscType = 'sine';
      padOscType = 'sine';
    }

    // 1. Layer 1: Lush Atmospheric Background Pad Chords (Swells on bar starts)
    if (stepInBar === 0) {
      let chordPitches = config.chords[barIdx % config.chords.length];

      // Theme-Specific Jazzy & Lush Chord Voicings (7th & 9th Extended Chords)
      if (themeId === 'wizardingScroll') {
        // Hedwig's Magical Castle Subtle Pads: Em9 -> Cmaj7#11 -> Am9 -> B7b9
        const hedwigPads = [
          [164.81, 246.94, 293.66, 392.00, 493.88],
          [130.81, 246.94, 329.63, 369.99, 493.88],
          [110.00, 220.00, 261.63, 329.63, 493.88],
          [123.47, 246.94, 293.66, 369.99, 440.00]
        ];
        chordPitches = hedwigPads[barIdx % hedwigPads.length];
      } else if (themeId === 'wildWestWanted') {
        // Western Saloon Jazzy Swing Pads: Am7 -> Dm7 -> Fmaj7 -> E7b9
        const westPads = [
          [110.00, 220.00, 261.63, 329.63, 392.00],
          [146.83, 220.00, 261.63, 349.23, 440.00],
          [174.61, 220.00, 261.63, 329.63, 440.00],
          [164.81, 246.94, 293.66, 369.99, 440.00]
        ];
        chordPitches = westPads[barIdx % westPads.length];
      } else if (themeId === 'blockBuilder') {
        // Minecraft C418 Ambient Floating Piano Pads: Fmaj7 -> Cmaj7 -> Am9 -> G6
        const c418Pads = [
          [174.61, 261.63, 329.63, 440.00, 523.25],
          [130.81, 246.94, 329.63, 392.00, 523.25],
          [110.00, 220.00, 261.63, 329.63, 493.88],
          [98.00, 196.00, 246.94, 293.66, 440.00]
        ];
        chordPitches = c418Pads[barIdx % c418Pads.length];
      } else if (themeId === 'cyberTerminal') {
        // Matrix Cyberpunk Industrial Pads: Em9 -> Cmaj9 -> D9 -> B7#9
        const matrixPads = [
          [82.41, 164.81, 246.94, 392.00, 493.88],
          [130.81, 246.94, 329.63, 392.00, 587.33],
          [146.83, 220.00, 293.66, 369.99, 440.00],
          [123.47, 246.94, 293.66, 369.99, 466.16]
        ];
        chordPitches = matrixPads[barIdx % matrixPads.length];
      }

      const isHP = themeId === 'wizardingScroll';
      const padStart = now + (isHP ? 0.25 : 0); // Drag pad chords 250ms behind
      const attackTime = isHP ? 0.8 : 0.08;     // 800ms ultra-soft swell
      const decayTime = isHP ? 5.2 : 2.2;      // 5.2s lingering decay
      const padGainVal = isHP ? 0.045 : 0.09;  // Subtle 0.045 gain

      chordPitches.forEach((freq, idx) => {
        const padOsc = ctx.createOscillator();
        const padGain = ctx.createGain();
        const padFilter = ctx.createBiquadFilter();

        padOsc.type = padOscType;
        padOsc.frequency.setValueAtTime(freq * (idx % 2 === 0 ? 0.997 : 1.003), padStart);

        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(isHP ? 420 : (themeId === 'cyberTerminal' ? 1200 : 650), padStart);

        padGain.gain.setValueAtTime(0.0001, padStart);
        padGain.gain.linearRampToValueAtTime(padGainVal, padStart + attackTime);
        padGain.gain.exponentialRampToValueAtTime(0.0001, padStart + decayTime);

        padOsc.connect(padFilter);
        padFilter.connect(padGain);

        if (typeof ctx.createStereoPanner === 'function') {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime((idx % 3 - 1) * 0.35, padStart);
          padGain.connect(panner);
          panner.connect(activeGain);
        } else {
          padGain.connect(activeGain);
        }

        padOsc.start(padStart);
        padOsc.stop(padStart + decayTime + 0.1);
      });
    }

    // 2. Layer 2: Deep Sub-Bass & Pitch Bend (Skipped for Harry Potter wizardingScroll to preserve pure orchestral acoustic flow with 0 drum beats)
    if (themeId !== 'wizardingScroll' && (stepInBar === 0 || stepInBar === 2)) {
      const bassFreq = config.bass[barIdx % config.bass.length];

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();

      subOsc.type = themeId === 'blockBuilder' ? 'square' : 'sine';
      subOsc.frequency.setValueAtTime(bassFreq * 0.5, now);
      subOsc.frequency.exponentialRampToValueAtTime(bassFreq * 0.42, now + 0.28);

      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(themeId === 'blockBuilder' ? 400 : 160, now);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(themeId === 'blockBuilder' ? 0.16 : 0.32, now + 0.008);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(activeGain);

      subOsc.start(now);
      subOsc.stop(now + 0.34);

      // Mid Bass Punch
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = bassOscType;
      osc.frequency.setValueAtTime(bassFreq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.14, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g);
      g.connect(activeGain);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    // 3. Layer 3: Dynamic 128-Step Arrangement Cycle
    const cycleStep = stepCount % 128;
    const isMotifActivePhrase = (cycleStep >= 0 && cycleStep < 32) || (cycleStep >= 80 && cycleStep < 112);

    let themeMotifFreq = 0;
    const motifStep16 = stepCount % 16;
    const motifStep32 = stepCount % 32;

    if (themeId === 'wizardingScroll') {
      // FULL AUTHENTIC HEDWIG'S THEME MELODY (Parts A, B, C with 3/4 Waltz Rubato Spacing & Dragging Flow)
      const hedwigRubatoMap: Record<number, number> = {
        // Part A: Main Hedwig Theme Intro (3/4 Waltz Rubato Spacing)
        0: 493.88,   // B4 (Pickup note - 2 steps)
        2: 659.25,   // E5 (Dotted quarter - holds 4 steps!)
        6: 783.99,   // G5 (Eighth flick - 1 step)
        7: 739.99,   // F#5 (Quarter - 3 steps)
        10: 659.25,  // E5 (Half - holds 6 steps!)
        16: 987.77,  // B5 (Quarter - 4 steps)
        20: 880.00,  // A5 (Dotted half - holds 8 steps!)
        28: 739.99,  // F#5 (Dotted half - holds 8 steps!)

        // Part B: Darker Variation (Drop to D5 & F5)
        36: 493.88,  // B4 (Pickup - 2 steps)
        38: 659.25,  // E5 (Holds 4 steps)
        42: 783.99,  // G5 (Eighth flick)
        43: 739.99,  // F#5 (3 steps)
        46: 587.33,  // D5 (Half - holds 6 steps)
        52: 698.46,  // F5 (Quarter - 4 steps)
        56: 493.88,  // B4 (Dotted half - holds 8 steps)

        // Part C: Triumphant High Ascending Flourish (D6 -> C#6 -> C6 -> G#5 -> C6 -> B5 -> A#5)
        64: 493.88,  // B4 (Pickup)
        66: 659.25,  // E5 (Holds 4 steps)
        70: 783.99,  // G5 (Eighth flick)
        71: 739.99,  // F#5 (3 steps)
        74: 659.25,  // E5 (Holds 6 steps)
        80: 987.77,  // B5 (Quarter - 4 steps)
        84: 1174.66, // D6 (Holds 4 steps)
        88: 1108.73, // C#6 (Quarter - 3 steps)
        91: 1046.50, // C6 (Holds 5 steps)
        96: 830.61,  // G#5 (Quarter - 4 steps)
        100: 1046.50,// C6 (Quarter - 3 steps)
        103: 987.77, // B5 (Quarter - 3 steps)
        106: 932.33, // A#5 (Quarter - 4 steps)
        110: 739.99, // F#5 (Quarter - 4 steps)
        114: 783.99, // G5 (Quarter - 4 steps)
        118: 659.25  // E5 (Long Lingering Resolving Note - holds 10 steps!)
      };

      themeMotifFreq = hedwigRubatoMap[cycleStep] || 0;
    } else if (isMotifActivePhrase) {
      if (themeId === 'wildWestWanted') {
        // THE GOOD, THE BAD AND THE UGLY WHISTLING MOTIF (Western Jazzy Swung Whistle)
        const whistleMap: Record<number, number> = {
          0: 440.00,  // A4
          1: 587.33,  // D5
          2: 440.00,  // A4
          3: 587.33,  // D5
          4: 523.25,  // C5
          6: 440.00,  // A4
          8: 349.23,  // F4
          10: 392.00, // G4
          12: 440.00  // A4
        };
        themeMotifFreq = whistleMap[motifStep16] || 0;
      } else if (themeId === 'blockBuilder') {
        // MINECRAFT C418 SWEDEN / WET HANDS AMBIENT PIANO MOTIF
        const c418Map: Record<number, number> = {
          0: 659.25,  // E5
          2: 783.99,  // G5
          4: 1046.50, // C6
          6: 987.77,  // B5
          8: 783.99,  // G5
          12: 659.25, // E5
          16: 587.33, // D5
          20: 523.25  // C5
        };
        themeMotifFreq = c418Map[motifStep32] || 0;
      } else if (themeId === 'cyberTerminal') {
        // THE MATRIX CYBER CODE ARPEGGIATOR STREAM
        const matrixArp = [329.63, 392.00, 493.88, 587.33, 739.99, 587.33, 493.88, 392.00];
        themeMotifFreq = matrixArp[stepCount % matrixArp.length];
      } else {
        themeMotifFreq = config.melody[stepCount % config.melody.length] || 0;
      }
    }

    if (themeMotifFreq > 0) {
      if (themeId === 'wizardingScroll') {
        // Hedwig's Celesta (Magical Subtle Rubato Celesta with Delicate 0.08 Gain & 1.8s Soft Flowing Decay)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const celestaFilter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(themeMotifFreq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(themeMotifFreq * 2.0015, now);

        celestaFilter.type = 'lowpass';
        celestaFilter.frequency.setValueAtTime(1400, now);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.045);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc1.connect(celestaFilter);
        osc2.connect(celestaFilter);
        celestaFilter.connect(g);
        g.connect(activeGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.85);
        osc2.stop(now + 1.85);
      } else if (themeId === 'wildWestWanted') {
        // Ennio Morricone Western Whistle (Jazzy Swung Whistle with 5.2Hz Breath Vibrato & Flowing Tail)
        const whistleOsc = ctx.createOscillator();
        const lfoOsc = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const g = ctx.createGain();

        whistleOsc.type = 'sine';
        whistleOsc.frequency.setValueAtTime(themeMotifFreq, now);

        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(5.2, now);
        lfoGain.gain.setValueAtTime(7.5, now);

        lfoOsc.connect(whistleOsc.frequency);
        whistleOsc.connect(g);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.24, now + 0.022);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 0.65);

        g.connect(activeGain);

        lfoOsc.start(now);
        whistleOsc.start(now);
        lfoOsc.stop(now + 0.68);
        whistleOsc.stop(now + 0.68);
      } else if (themeId === 'blockBuilder') {
        // Minecraft C418 Ambient Piano (Felt Piano with 1.4s Legato Decay Flow)
        const pianoOsc = ctx.createOscillator();
        const pianoFilter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        pianoOsc.type = 'sine';
        pianoOsc.frequency.setValueAtTime(themeMotifFreq, now);

        pianoFilter.type = 'lowpass';
        pianoFilter.frequency.setValueAtTime(750, now);
        pianoFilter.frequency.exponentialRampToValueAtTime(220, now + 1.2);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.26, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 1.35);

        pianoOsc.connect(pianoFilter);
        pianoFilter.connect(g);
        g.connect(activeGain);

        pianoOsc.start(now);
        pianoOsc.stop(now + 1.4);
      } else if (themeId === 'cyberTerminal') {
        // The Matrix Cyber Synth Stream (Resonant Filter Sweep Sawtooth)
        const matrixOsc = ctx.createOscillator();
        const matrixFilter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        matrixOsc.type = 'sawtooth';
        matrixOsc.frequency.setValueAtTime(themeMotifFreq, now);

        matrixFilter.type = 'lowpass';
        matrixFilter.frequency.setValueAtTime(2200, now);
        matrixFilter.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        matrixFilter.Q.setValueAtTime(5.0, now);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.14, now + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        matrixOsc.connect(matrixFilter);
        matrixFilter.connect(g);
        g.connect(activeGain);

        matrixOsc.start(now);
        matrixOsc.stop(now + 0.15);
      } else {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(themeMotifFreq, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.1, now + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(g);
        g.connect(activeGain);
        osc.start(now);
        osc.stop(now + 0.22);
      }
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
