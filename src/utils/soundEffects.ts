/**
 * Web Audio API Sound Synthesizer Utility.
 * Provides broadcast-grade synthesized sound effects using pure browser AudioContext
 * oscillators, gain envelopes, frequency sweeps, and acoustic filters without external audio files.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentVolume = 0.8;
let currentIsMuted = false;
let disabledSfxMap: Record<string, boolean> = {};

import { preloadAllAudioBuffers, playPreloadedBuffer } from './audioBufferCache';

/**
 * Initializes or returns the global AudioContext instance safely.
 * Resumes audio context if suspended due to browser autoplay policies.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
      preloadAllAudioBuffers();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => preloadAllAudioBuffers()).catch(() => {});
  }
  return audioCtx;
}

let masterCompressor: DynamicsCompressorNode | null = null;
let masterBassFilter: BiquadFilterNode | null = null;
let masterReverbConvolver: ConvolverNode | null = null;
let masterReverbGain: GainNode | null = null;

/** Creates a synthetic stereo impulse response buffer for studio hall spatial reverberation */
function createLiveStudioReverbBuffer(ctx: BaseAudioContext, duration = 1.0, decay = 2.8): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const env = Math.pow(1 - t, decay);
    left[i] = (Math.random() * 2 - 1) * env;
    right[i] = (Math.random() * 2 - 1) * env;
  }
  return buffer;
}

/**
 * Returns the currently active theme preset ID safely from document data-theme-id.
 */
export function getActiveThemeId(): string {
  if (typeof document !== 'undefined') {
    const themeId = document.documentElement.getAttribute('data-theme-id');
    if (themeId) return themeId;
  }
  return 'classicTheme';
}

/**
 * Returns the Master GainNode connected through a studio bass boost (+4.5dB Low-Shelf EQ),
 * spatial Convolver Reverb bus, and broadcast limiter to audio destination.
 */
export function getMasterGain(): GainNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(currentIsMuted ? 0 : currentVolume, ctx.currentTime);

    // 1. Master Low-Shelf Bass Boost Filter (+4.5dB at 140Hz for rich, warm low-end punch)
    masterBassFilter = ctx.createBiquadFilter();
    masterBassFilter.type = 'lowshelf';
    masterBassFilter.frequency.setValueAtTime(140, ctx.currentTime);
    masterBassFilter.gain.setValueAtTime(4.5, ctx.currentTime);

    // 2. Spatial Convolver Studio Reverb Bus
    masterReverbConvolver = ctx.createConvolver();
    masterReverbConvolver.buffer = createLiveStudioReverbBuffer(ctx, 1.0, 2.8);

    masterReverbGain = ctx.createGain();
    masterReverbGain.gain.setValueAtTime(0.22, ctx.currentTime); // 22% wet spatial reverb

    // 3. Transparent Master Limiter optimized for zero ducking and distortion-free output
    masterCompressor = ctx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-1.5, ctx.currentTime); // High threshold prevents volume ducking
    masterCompressor.knee.setValueAtTime(6, ctx.currentTime);         // Transparent soft-knee
    masterCompressor.ratio.setValueAtTime(3.5, ctx.currentTime);       // Gentle peak safety ratio
    masterCompressor.attack.setValueAtTime(0.002, ctx.currentTime);   // Ultra-fast 2ms peak catch
    masterCompressor.release.setValueAtTime(0.08, ctx.currentTime);   // Quick 80ms recovery

    // Routing:
    masterGain.connect(masterBassFilter);
    masterBassFilter.connect(masterCompressor);

    masterBassFilter.connect(masterReverbConvolver);
    masterReverbConvolver.connect(masterReverbGain);
    masterReverbGain.connect(masterCompressor);

    masterCompressor.connect(ctx.destination);
  }
  return masterGain;
}

/**
 * Globally updates master volume (0.0 to 1.0) and mute status.
 *
 * @param volume - Master output gain from 0.0 (silent) to 1.0 (max)
 * @param isMuted - Boolean flag indicating muted state
 */
export function updateAudioVolume(volume: number, isMuted: boolean): void {
  currentVolume = Math.max(0, Math.min(1, volume));
  currentIsMuted = isMuted;

  const gainNode = getMasterGain();
  const ctx = getAudioContext();
  if (!gainNode || !ctx) return;

  const targetGain = isMuted ? 0 : currentVolume;
  gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.05);
}

/**
 * Updates the disabled status map for individual sound effects.
 *
 * @param map - Record mapping SFX key to disabled boolean flag
 */
export function updateDisabledSfx(map: Record<string, boolean>): void {
  disabledSfxMap = { ...map };
}

/**
 * Checks whether an individual sound effect key is currently disabled.
 *
 * @param sfxKey - SFX key string identifier
 */
export function isSfxDisabled(sfxKey: string): boolean {
  return !!disabledSfxMap[sfxKey];
}

type AudioUnlockCallback = () => void;
const unlockCallbacks: AudioUnlockCallback[] = [];

/**
 * Registers a callback to execute immediately if AudioContext is running,
 * or as soon as the browser AudioContext is unlocked by user interaction.
 */
export function onAudioUnlocked(cb: AudioUnlockCallback): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'running') {
    cb();
  } else {
    unlockCallbacks.push(cb);
  }
}

/**
 * Auto-unlocks AudioContext on first user interaction event (click/tap/keydown).
 */
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        while (unlockCallbacks.length > 0) {
          const cb = unlockCallbacks.shift();
          try { cb?.(); } catch (e) { console.error(e); }
        }
      }).catch(() => {});
    } else if (ctx && ctx.state === 'running') {
      while (unlockCallbacks.length > 0) {
        const cb = unlockCallbacks.shift();
        try { cb?.(); } catch (e) { console.error(e); }
      }
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
}

import { playCustomSoundbite, stopCustomSoundbite } from './customAudioPlayer';

let activeWheelOscillators: OscillatorNode[] = [];
let activeWheelBufferSource: AudioBufferSourceNode | null = null;

/**
 * Immediately stops any playing mechanical wheel tick audio sequence.
 */
export function stopWheelTick(): void {
  stopCustomSoundbite('wheelTick');
  if (activeWheelBufferSource) {
    try { activeWheelBufferSource.stop(); activeWheelBufferSource.disconnect(); } catch (e) {}
    activeWheelBufferSource = null;
  }
  activeWheelOscillators.forEach(osc => {
    try { osc.stop(); osc.disconnect(); } catch (e) {}
  });
  activeWheelOscillators = [];
}

/**
 * Synthesizes studio-grade acoustic woodblock countdown tick-tock sound effect (Jeopardy / 60s timer style)
 * with fixed high-Q acoustic resonance and progressive urgency pitch escalation.
 *
 * @param isTock - If true, plays lower pitch 'tock'; otherwise plays higher pitch 'tick'.
 * @param urgency - If true (final 10 seconds), elevates pitch and adds subtle high warning ping.
 * @param ignoreDisabled - If true, plays sound even if disabled (useful for preview buttons).
 */
export function playTickTock(isTock = false, urgency = false, ignoreDisabled = false): void {
  if (playCustomSoundbite('tickTock', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('tickTock')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || (!ignoreDisabled && (currentIsMuted || currentVolume === 0))) return;

  const bufferKey = urgency ? (isTock ? 'tockUrgent' : 'tickUrgent') : (isTock ? 'tock' : 'tick');
  if (playPreloadedBuffer(bufferKey)) return;

  const now = ctx.currentTime;

  // Fixed studio acoustic woodblock fundamental frequencies (no unnatural frequency sliding)
  let freq = isTock ? 880 : 1320; // A5 / E6 acoustic woodblock interval
  if (urgency) freq = isTock ? 1174.66 : 1760; // D6 / A6 warning pitch

  // Primary woodblock acoustic body oscillator
  const oscBody = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  oscBody.type = 'sine';
  oscBody.frequency.setValueAtTime(freq, now);

  // Metallic mallet strike overtone (3.01x harmonic)
  oscHarmonic.type = 'triangle';
  oscHarmonic.frequency.setValueAtTime(freq * 3.01, now);

  // High-Q bandpass filter simulates physical hardwood block acoustic cavity resonance
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq, now);
  filter.Q.setValueAtTime(7.5, now);

  const peakVol = urgency ? 0.45 : 0.38;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peakVol, now + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (isTock ? 0.075 : 0.065));

  oscBody.connect(filter);
  oscHarmonic.connect(filter);
  filter.connect(gain);

  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    const panVal = isTock ? 0.32 : -0.32;
    panner.pan.setValueAtTime(panVal, now);
    gain.connect(panner);
    panner.connect(master);
  } else {
    gain.connect(master);
  }

  oscBody.start(now);
  oscHarmonic.start(now);

  oscBody.stop(now + 0.08);
  oscHarmonic.stop(now + 0.08);

  // High-frequency mallet strike impact snap (tactile transient)
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  const snapFilter = ctx.createBiquadFilter();

  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(4800, now);
  snapOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.008);

  snapFilter.type = 'highpass';
  snapFilter.frequency.setValueAtTime(3200, now);

  snapGain.gain.setValueAtTime(0.0001, now);
  snapGain.gain.linearRampToValueAtTime(0.18, now + 0.001);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

  snapOsc.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(master);

  snapOsc.start(now);
  snapOsc.stop(now + 0.01);

  // Subtle high warning chime ping accent during final timer seconds (urgency)
  if (urgency) {
    const warnOsc = ctx.createOscillator();
    const warnGain = ctx.createGain();
    warnOsc.type = 'sine';
    warnOsc.frequency.setValueAtTime(2637.02, now + 0.01); // E7 warning ping
    warnOsc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);

    warnGain.gain.setValueAtTime(0.0001, now + 0.01);
    warnGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
    warnGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    warnOsc.connect(warnGain);
    warnGain.connect(master);

    warnOsc.start(now + 0.01);
    warnOsc.stop(now + 0.10);
  }
}

/**
 * Synthesizes a continuous, perfectly-synced 5.5-second mechanical slot machine spin wheel audio track.
 * Schedules fast whirring clicks initially, decelerating as reels lock in at 1.5s, 2.3s, 3.1s, and 3.9s.
 * Eliminates per-frame CPU spikes completely.
 *
 * @param ignoreDisabled - If true, plays sound even if disabled in settings.
 */
export function playWheelTick(ignoreDisabled = false): void {
  stopWheelTick();
  if (playCustomSoundbite('wheelTick', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('wheelTick')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || (!ignoreDisabled && (currentIsMuted || currentVolume === 0))) return;

  const preloadedSource = playPreloadedBuffer('wheelTick');
  if (preloadedSource) {
    activeWheelBufferSource = preloadedSource;
    return;
  }

  const now = ctx.currentTime;
  const clickTimes: Array<{ time: number; freq: number; vol: number }> = [];

  // Phase 1: High speed full reel spin (0.0s to 1.5s - 4 reels active)
  for (let t = 0; t < 1.5; t += 0.045) {
    const reel = Math.floor((t / 0.045) % 4);
    clickTimes.push({ time: now + t, freq: 850 + reel * 140, vol: 0.12 });
  }

  // Phase 2: Reel 0 locked, 3 reels spinning (1.5s to 2.3s)
  for (let t = 1.5; t < 2.3; t += 0.065) {
    const reel = Math.floor((t / 0.065) % 3) + 1;
    clickTimes.push({ time: now + t, freq: 850 + reel * 140, vol: 0.14 });
  }

  // Phase 3: Reel 1 locked, 2 reels spinning (2.3s to 3.1s)
  for (let t = 2.3; t < 3.1; t += 0.095) {
    const reel = Math.floor((t / 0.095) % 2) + 2;
    clickTimes.push({ time: now + t, freq: 850 + reel * 140, vol: 0.16 });
  }

  // Phase 4: Reel 2 locked, 1 reel spinning (3.1s to 3.9s)
  for (let t = 3.1; t < 3.9; t += 0.14) {
    clickTimes.push({ time: now + t, freq: 1280, vol: 0.18 });
  }

  // Phase 5: Reel 3 deceleration & landing (3.9s to 5.2s)
  const landingDelays = [0.16, 0.22, 0.30, 0.42, 0.58];
  let curT = 3.9;
  landingDelays.forEach((delay) => {
    curT += delay;
    clickTimes.push({ time: now + curT, freq: 1350, vol: 0.22 });
  });

  // Schedule click pulses efficiently in Web Audio API ahead of time (0 JS thread CPU overhead)
  clickTimes.forEach(({ time: clickTime, freq, vol }) => {
    const osc = ctx.createOscillator();
    activeWheelOscillators.push(osc);

    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, clickTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.28, clickTime + 0.016);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, clickTime);

    gain.gain.setValueAtTime(0.0001, clickTime);
    gain.gain.linearRampToValueAtTime(vol, clickTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.018);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(clickTime);
    osc.stop(clickTime + 0.022);
  });
}

/**
 * Synthesizes Jeopardy board tile chime sound effect (sparkling glass bell chime).
 *
 * @param index - Optional index to step through pentatonic chime frequencies.
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playTileChime(index = 0, ignoreDisabled = false): void {
  if (playCustomSoundbite('tileChime', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('tileChime')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || currentIsMuted || currentVolume === 0) return;

  const now = ctx.currentTime;

  // Pentatonic scale chime frequencies: C5, E5, G5, B5, D6, F#6
  const scale = [523.25, 659.25, 783.99, 987.77, 1174.66, 1479.98];
  const freq = scale[Math.abs(index) % scale.length];

  // Fundamental glass chime (sine)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  // Octave overtone for metallic sparkle
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.005, now);

  // High bell harmonic
  const osc3 = ctx.createOscillator();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(freq * 3.01, now);

  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();

  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(0.20, now + 0.004);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(0.10, now + 0.003);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  gain3.gain.setValueAtTime(0.0001, now);
  gain3.gain.linearRampToValueAtTime(0.05, now + 0.002);
  gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);

  gain1.connect(master);
  gain2.connect(master);
  gain3.connect(master);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  osc1.stop(now + 0.42);
  osc2.stop(now + 0.3);
  osc3.stop(now + 0.2);
}

/**
 * Synthesizes a subtle, warm game show lockout buzzer sound effect.
 *
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playBuzzerLockout(ignoreDisabled = false): void {
  if (playCustomSoundbite('buzzerLockout', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('buzzerLockout')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || (!ignoreDisabled && (currentIsMuted || currentVolume === 0))) return;

  if (playPreloadedBuffer('buzzerLockout')) return;

  const now = ctx.currentTime;

  // Warm dual-triangle oscillator duo for subtle, pleasant lockout tone (220Hz / 228Hz)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(220, now);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(228, now); // Soft beating interval

  // Soft lowpass filter dampens harsh buzz overtones
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(550, now);
  filter.frequency.exponentialRampToValueAtTime(280, now + 0.22);

  // Subtle 0.12 gain level with smooth 15ms ramp and 250ms release tail
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc1.start(now);
  osc2.start(now);

  osc1.stop(now + 0.26);
  osc2.stop(now + 0.26);
}

/**
 * Synthesizes victorious C-major arpeggiated correct answer fanfare sound effect (Theme-Adaptive).
 *
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playCorrectFanfare(ignoreDisabled = false): void {
  if (playCustomSoundbite('correctFanfare', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('correctFanfare')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || currentIsMuted || currentVolume === 0) return;

  const now = ctx.currentTime;
  const themeId = getActiveThemeId();

  // Minecraft (blockBuilder): Authentic Minecraft XP Level Up Chime (Ascending 8-Bit Chiptune Square Waves)
  if (themeId === 'blockBuilder') {
    const xpNotes = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53]; // E5, G#5, B5, E6, G#6, B6
    const step = 0.045;
    xpNotes.forEach((freq, i) => {
      const startTime = now + i * step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + 0.14);
    });
    return;
  }

  // Cyber Terminal (cyberTerminal): Cyberpunk Resonant System Override Success Chime
  if (themeId === 'cyberTerminal') {
    const cyberNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    cyberNotes.forEach((freq, i) => {
      const startTime = now + i * 0.05;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, startTime);
      filter.Q.setValueAtTime(4.5, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.16, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
    return;
  }

  // Wild West Wanted (wildWestWanted): Saloon Guitar Strum C-Major Chord
  if (themeId === 'wildWestWanted') {
    const westNotes = [261.63, 329.63, 392.00, 523.25, 659.25];
    westNotes.forEach((freq, i) => {
      const startTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.52);

      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
    return;
  }

  // Wizarding Scroll (wizardingScroll): Magical Wand Sparkle Fanfare
  if (themeId === 'wizardingScroll') {
    const magicNotes = [880.0, 1108.73, 1318.51, 1760.0, 2217.46];
    magicNotes.forEach((freq, i) => {
      const startTime = now + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(master);
      osc.start(startTime);
      osc.stop(startTime + 0.48);
    });
    return;
  }

  // Default: Ascending C Major 5-tone chord arpeggio
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
  const stepDelay = 0.07;

  notes.forEach((freq, i) => {
    const startTime = now + i * stepDelay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (i === notes.length - 1 ? 0.6 : 0.28));

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + (i === notes.length - 1 ? 0.62 : 0.3));
  });
}

/**
 * Synthesizes wrong answer error buzz sound effect (Theme-Adaptive).
 *
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playWrongBuzz(ignoreDisabled = false): void {
  if (playCustomSoundbite('wrongBuzz', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('wrongBuzz')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || currentIsMuted || currentVolume === 0) return;

  const now = ctx.currentTime;
  const themeId = getActiveThemeId();

  // Minecraft (blockBuilder): Minecraft Damage / Anvil Thud Impact Sound
  if (themeId === 'blockBuilder') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.22);
    return;
  }

  // Cyber Terminal (cyberTerminal): Digital Glitch Alarm
  if (themeId === 'cyberTerminal') {
    [0, 0.08].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.06);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.26, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.08);
    });
    return;
  }

  // Default: Dissonant minor 2nd double-buzz
  const playBurst = (offset: number) => {
    const burstStart = now + offset;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(175, burstStart);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(185, burstStart);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, burstStart);

    gain.gain.setValueAtTime(0.0001, burstStart);
    gain.gain.linearRampToValueAtTime(0.20, burstStart + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, burstStart + 0.14);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc1.start(burstStart);
    osc2.start(burstStart);

    osc1.stop(burstStart + 0.15);
    osc2.stop(burstStart + 0.15);
  };

  playBurst(0.0);
  playBurst(0.16);
}

/**
 * Synthesizes a subtle, delicate watery bubble pop sequence when background circles animate in.
 *
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playBubblePopSequence(ignoreDisabled = false): void {
  if (playCustomSoundbite('bubblePop', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('bubblePop')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || (!ignoreDisabled && (currentIsMuted || currentVolume === 0))) return;

  if (playPreloadedBuffer('bubblePop')) return;

  const now = ctx.currentTime;
  const basePitches = [240, 320, 400, 480];
  const delays = [0.04, 0.12, 0.20, 0.28];

  basePitches.forEach((startFreq, idx) => {
    const noteTime = now + delays[idx];
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, noteTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.9, noteTime + 0.045);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFreq * 1.4, noteTime);
    filter.Q.setValueAtTime(2.2, noteTime);

    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.linearRampToValueAtTime(0.10, noteTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(noteTime);
    osc.stop(noteTime + 0.05);
  });
}

/**
 * Synthesizes a broadcast-grade tactile UI button click pop (combining tactile snap transient,
 * mechanical glass body resonance, and warm sub-thump).
 *
 * @param ignoreDisabled - If true, plays sound even if disabled.
 */
export function playButtonClick(ignoreDisabled = false): void {
  if (playCustomSoundbite('buttonClick', ignoreDisabled)) return;
  if (!ignoreDisabled && isSfxDisabled('buttonClick')) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || (!ignoreDisabled && (currentIsMuted || currentVolume === 0))) return;

  if (playPreloadedBuffer('buttonClick')) return;

  const now = ctx.currentTime;
  const themeId = getActiveThemeId();

  // Minecraft (blockBuilder): Wood / Stone Block Placement Click
  if (themeId === 'blockBuilder') {
    const tapOsc = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tapOsc.type = 'square';
    tapOsc.frequency.setValueAtTime(320, now);
    tapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.025);

    tapGain.gain.setValueAtTime(0.0001, now);
    tapGain.gain.linearRampToValueAtTime(0.45, now + 0.002);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    tapOsc.connect(tapGain);
    tapGain.connect(master);
    tapOsc.start(now);
    tapOsc.stop(now + 0.03);
    return;
  }

  // Cyber Terminal (cyberTerminal): High-Tech Sci-Fi Key Click
  if (themeId === 'cyberTerminal') {
    const cyberOsc = ctx.createOscillator();
    const cyberGain = ctx.createGain();
    cyberOsc.type = 'sine';
    cyberOsc.frequency.setValueAtTime(2400, now);
    cyberOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);

    cyberGain.gain.setValueAtTime(0.0001, now);
    cyberGain.gain.linearRampToValueAtTime(0.35, now + 0.001);
    cyberGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    cyberOsc.connect(cyberGain);
    cyberGain.connect(master);
    cyberOsc.start(now);
    cyberOsc.stop(now + 0.02);
    return;
  }

  // Wild West Wanted (wildWestWanted): Wooden Saloon Knock / Hammer Latch
  if (themeId === 'wildWestWanted') {
    const westOsc = ctx.createOscillator();
    const westGain = ctx.createGain();
    westOsc.type = 'triangle';
    westOsc.frequency.setValueAtTime(220, now);
    westOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    westGain.gain.setValueAtTime(0.0001, now);
    westGain.gain.linearRampToValueAtTime(0.5, now + 0.003);
    westGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    westOsc.connect(westGain);
    westGain.connect(master);
    westOsc.start(now);
    westOsc.stop(now + 0.045);
    return;
  }

  // Wizarding Scroll (wizardingScroll): Magic Wand Sparkle Pop
  if (themeId === 'wizardingScroll') {
    const wandOsc = ctx.createOscillator();
    const wandGain = ctx.createGain();
    wandOsc.type = 'sine';
    wandOsc.frequency.setValueAtTime(1800, now);
    wandOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.02);

    wandGain.gain.setValueAtTime(0.0001, now);
    wandGain.gain.linearRampToValueAtTime(0.3, now + 0.002);
    wandGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    wandOsc.connect(wandGain);
    wandGain.connect(master);
    wandOsc.start(now);
    wandOsc.stop(now + 0.03);
    return;
  }

  // Layer 1: Tactile Contact Snap
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();

  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(2800, now);
  clickOsc.frequency.exponentialRampToValueAtTime(1000, now + 0.008);

  clickFilter.type = 'highpass';
  clickFilter.frequency.setValueAtTime(1600, now);

  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.linearRampToValueAtTime(0.50, now + 0.001);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);

  clickOsc.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(master);

  clickOsc.start(now);
  clickOsc.stop(now + 0.01);

  // Layer 2: Deep Bassy Body Pop (380Hz / 570Hz warm wood/plastic switch body)
  const bodyOsc1 = ctx.createOscillator();
  const bodyOsc2 = ctx.createOscillator();
  const bodyFilter = ctx.createBiquadFilter();
  const bodyGain = ctx.createGain();

  bodyOsc1.type = 'triangle';
  bodyOsc1.frequency.setValueAtTime(380, now);

  bodyOsc2.type = 'sine';
  bodyOsc2.frequency.setValueAtTime(570, now);

  bodyFilter.type = 'lowpass';
  bodyFilter.frequency.setValueAtTime(850, now);

  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.linearRampToValueAtTime(0.72, now + 0.002);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

  bodyOsc1.connect(bodyFilter);
  bodyOsc2.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(master);

  bodyOsc1.start(now);
  bodyOsc2.start(now);

  bodyOsc1.stop(now + 0.038);
  bodyOsc2.stop(now + 0.038);

  // Layer 3: Heavy Sub-Bass Thump (120Hz -> 55Hz sub-thump)
  const thumpOsc = ctx.createOscillator();
  const thumpGain = ctx.createGain();

  thumpOsc.type = 'sine';
  thumpOsc.frequency.setValueAtTime(120, now);
  thumpOsc.frequency.exponentialRampToValueAtTime(55, now + 0.022);

  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.linearRampToValueAtTime(0.60, now + 0.001);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  thumpOsc.connect(thumpGain);
  thumpGain.connect(master);

  thumpOsc.start(now);
  thumpOsc.stop(now + 0.028);
}
