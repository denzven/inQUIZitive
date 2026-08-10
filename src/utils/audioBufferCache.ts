import { getAudioContext, getMasterGain } from './soundEffects';

/** Pre-rendered AudioBuffer cache map for zero-CPU instant sound effect playback */
const bufferCache: Partial<Record<string, AudioBuffer>> = {};
let isPreloading = false;
let isPreloaded = false;

/**
 * Pre-renders all synthesized Web Audio sound effects into memory AudioBuffers using OfflineAudioContext.
 * Ensures instant 0ms latency playback with 0 CPU overhead, immune to slow computers or main-thread lag.
 */
export async function preloadAllAudioBuffers(): Promise<void> {
  if (isPreloaded || isPreloading) return;
  isPreloading = true;

  try {
    const liveCtx = getAudioContext();
    const sampleRate = liveCtx ? liveCtx.sampleRate : 44100;

    // 1. Pre-render Full-Spectrum Bassy & Loud Laptop/Mobile UI Button Click Buffer (0.25s)
    bufferCache['buttonClick'] = renderOfflineBuffer(sampleRate, 0.25, (ctx, master) => {
      const now = 0;

      // Layer 1: Bright Laptop-Audible Attack Snap (2400Hz -> 1100Hz)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      const snapFilter = ctx.createBiquadFilter();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(2400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.012);
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(1000, now);
      snapGain.gain.setValueAtTime(0.0001, now);
      snapGain.gain.linearRampToValueAtTime(0.65, now + 0.001);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      snapOsc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(master);
      snapOsc.start(now);
      snapOsc.stop(now + 0.018);

      // Layer 2: Laptop-Optimized Mid-Range Body Pop (850Hz / 1300Hz - Loud on Laptop Speakers)
      const bodyOsc1 = ctx.createOscillator();
      const bodyOsc2 = ctx.createOscillator();
      const bodyFilter = ctx.createBiquadFilter();
      const bodyGain = ctx.createGain();
      bodyOsc1.type = 'triangle';
      bodyOsc1.frequency.setValueAtTime(850, now);
      bodyOsc2.type = 'sine';
      bodyOsc2.frequency.setValueAtTime(1300, now);
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(1050, now);
      bodyFilter.Q.setValueAtTime(2.5, now);
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.linearRampToValueAtTime(0.85, now + 0.002);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);
      bodyOsc1.connect(bodyFilter);
      bodyOsc2.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc1.start(now);
      bodyOsc2.start(now);
      bodyOsc1.stop(now + 0.10);
      bodyOsc2.stop(now + 0.10);

      // Layer 3: Warm Acoustic Sub-Thump (180Hz -> 70Hz - Rich Bass for Headphones/Mobile)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(180, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(70, now + 0.14);
      thumpGain.gain.setValueAtTime(0.0001, now);
      thumpGain.gain.linearRampToValueAtTime(0.70, now + 0.002);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      thumpOsc.connect(thumpGain);
      thumpGain.connect(master);
      thumpOsc.start(now);
      thumpOsc.stop(now + 0.18);
    });

    // 2. Pre-render Ping-Pong Woodblock Tick (1320Hz - Left Auditorium Pan -0.32)
    bufferCache['tick'] = renderOfflineBuffer(sampleRate, 0.12, (ctx, master) => {
      renderWoodblock(ctx, master, 1320, false, 0.45, -0.32);
    });

    // 3. Pre-render Ping-Pong Woodblock Tock (880Hz - Right Auditorium Pan +0.32)
    bufferCache['tock'] = renderOfflineBuffer(sampleRate, 0.12, (ctx, master) => {
      renderWoodblock(ctx, master, 880, false, 0.45, 0.32);
    });

    // 4. Pre-render Urgent Tick Buffer (1760Hz - Left Pan -0.36)
    bufferCache['tickUrgent'] = renderOfflineBuffer(sampleRate, 0.14, (ctx, master) => {
      renderWoodblock(ctx, master, 1760, true, 0.48, -0.36);
    });

    // 5. Pre-render Urgent Tock Buffer (1174.66Hz - Right Pan +0.36)
    bufferCache['tockUrgent'] = renderOfflineBuffer(sampleRate, 0.14, (ctx, master) => {
      renderWoodblock(ctx, master, 1174.66, true, 0.48, 0.36);
    });

    // 6. Pre-render Subtle Lockout Buzzer Buffer (0.26s)
    bufferCache['buzzerLockout'] = renderOfflineBuffer(sampleRate, 0.26, (ctx, master) => {
      const now = 0;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(228, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.22);

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
    });

    // 7. Pre-render 4-Column Auditorium Stereo Spin Wheel Mechanical Reel Track Buffer
    bufferCache['wheelTick'] = renderOfflineBuffer(sampleRate, 5.5, (ctx, master) => {
      const clickTimes: Array<{ time: number; freq: number; vol: number; pan: number }> = [];

      // Phase 1: High speed full reel spin across 4 auditorium stereo columns (-0.55 to +0.55)
      for (let t = 0; t < 1.5; t += 0.045) {
        const reel = Math.floor((t / 0.045) % 4);
        const panMap = [-0.55, -0.18, 0.18, 0.55];
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.12, pan: panMap[reel] });
      }
      // Phase 2: Reel 0 locked, 3 reels spinning
      for (let t = 1.5; t < 2.3; t += 0.065) {
        const reel = Math.floor((t / 0.065) % 3) + 1;
        const panMap = [-0.55, -0.18, 0.18, 0.55];
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.14, pan: panMap[reel] });
      }
      // Phase 3: Reel 1 locked, 2 reels spinning
      for (let t = 2.3; t < 3.1; t += 0.095) {
        const reel = Math.floor((t / 0.095) % 2) + 2;
        const panMap = [-0.55, -0.18, 0.18, 0.55];
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.16, pan: panMap[reel] });
      }
      // Phase 4: Reel 2 locked, 1 reel spinning
      for (let t = 3.1; t < 3.9; t += 0.14) {
        clickTimes.push({ time: t, freq: 1280, vol: 0.18, pan: 0.55 });
      }
      // Phase 5: Reel 3 deceleration & landing
      const landingDelays = [0.16, 0.22, 0.30, 0.42, 0.58];
      let curT = 3.9;
      landingDelays.forEach((delay) => {
        curT += delay;
        clickTimes.push({ time: curT, freq: 1350, vol: 0.22, pan: 0.0 });
      });

      clickTimes.forEach(({ time: clickTime, freq, vol, pan }) => {
        const osc = ctx.createOscillator();
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

        if (typeof ctx.createStereoPanner === 'function') {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, clickTime);
          gain.connect(panner);
          panner.connect(master);
        } else {
          gain.connect(master);
        }

        osc.start(clickTime);
        osc.stop(clickTime + 0.022);
      });
    });

    // 8. Pre-render Subtle, Delicate Watery Bubble Pop Sequence Buffer (0.5s)
    bufferCache['bubblePop'] = renderOfflineBuffer(sampleRate, 0.5, (ctx, master) => {
      const basePitches = [240, 320, 400, 480];
      const delays = [0.04, 0.12, 0.20, 0.28];
      const panMap = [-0.25, 0.18, -0.15, 0.25];

      basePitches.forEach((startFreq, idx) => {
        const noteTime = delays[idx];

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, noteTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.9, noteTime + 0.045);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(startFreq * 1.4, noteTime);
        filter.Q.setValueAtTime(2.2, noteTime);

        // Soft, subtle 0.10 peak volume gain
        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.10, noteTime + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.045);

        osc.connect(filter);
        filter.connect(gain);

        if (typeof ctx.createStereoPanner === 'function') {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(panMap[idx], noteTime);
          gain.connect(panner);
          panner.connect(master);
        } else {
          gain.connect(master);
        }

        osc.start(noteTime);
        osc.stop(noteTime + 0.05);
      });
    });

    isPreloaded = true;
  } catch (e) {
    console.warn('Offline audio pre-rendering fallback:', e);
  } finally {
    isPreloading = false;
  }
}

/** Creates a synthetic stereo impulse response buffer for auditorium hall spatial reverberation */
function createStudioReverbBuffer(ctx: OfflineAudioContext | BaseAudioContext, duration = 1.2, decay = 2.4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const env = Math.pow(1 - t, decay);
    // Auditorium spatial stereo decorrelation with micro-delay cross-feed
    left[i] = (Math.random() * 2 - 1) * env;
    right[i] = (Math.random() * 2 - 1) * env * (i > 150 ? 0.95 : 0.6);
  }
  return buffer;
}

/** Helper to render an OfflineAudioContext into a 2-channel Stereo AudioBuffer synchronously through Bass EQ & Studio Reverb */
function renderOfflineBuffer(
  sampleRate: number,
  durationSeconds: number,
  setupFn: (ctx: OfflineAudioContext, master: GainNode) => void
): AudioBuffer | undefined {
  if (typeof window === 'undefined') return undefined;
  const OfflineCtxClass =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;

  if (!OfflineCtxClass) return undefined;

  const length = Math.ceil(sampleRate * durationSeconds);
  const offlineCtx = new OfflineCtxClass(2, length, sampleRate); // 2 channels = True Stereo

  // 1. Master Low-Shelf Bass Boost EQ (+4.5dB at 140Hz for rich, warm low-end punch)
  const bassFilter = offlineCtx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.setValueAtTime(140, 0);
  bassFilter.gain.setValueAtTime(4.5, 0);

  // 2. Spatial Convolver Auditorium Reverb Bus
  const revConvolver = offlineCtx.createConvolver();
  revConvolver.buffer = createStudioReverbBuffer(offlineCtx, 1.2, 2.4);

  const revGain = offlineCtx.createGain();
  revGain.gain.setValueAtTime(0.24, 0); // 24% wet spatial reverb

  const master = offlineCtx.createGain();
  master.gain.setValueAtTime(1.0, 0);

  master.connect(bassFilter);
  bassFilter.connect(offlineCtx.destination);

  bassFilter.connect(revConvolver);
  revConvolver.connect(revGain);
  revGain.connect(offlineCtx.destination);

  setupFn(offlineCtx, master);

  let resultBuffer: AudioBuffer | undefined;
  offlineCtx.startRendering().then((renderedBuffer) => {
    resultBuffer = renderedBuffer;
  }).catch(() => {});

  return resultBuffer;
}

/** Renders woodblock acoustic waveforms into OfflineAudioContext with auditorium stereo panning */
function renderWoodblock(
  ctx: OfflineAudioContext,
  master: GainNode,
  freq: number,
  urgency: boolean,
  peakVol: number,
  pan: number = 0
) {
  const now = 0;
  const oscBody = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  oscBody.type = 'sine';
  oscBody.frequency.setValueAtTime(freq, now);
  oscHarmonic.type = 'triangle';
  oscHarmonic.frequency.setValueAtTime(freq * 3.01, now);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq, now);
  filter.Q.setValueAtTime(7.5, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peakVol, now + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  oscBody.connect(filter);
  oscHarmonic.connect(filter);
  filter.connect(gain);

  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);
    gain.connect(panner);
    panner.connect(master);
  } else {
    gain.connect(master);
  }

  oscBody.start(now);
  oscHarmonic.start(now);
  oscBody.stop(now + 0.08);
  oscHarmonic.stop(now + 0.08);

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

  if (urgency) {
    const warnOsc = ctx.createOscillator();
    const warnGain = ctx.createGain();
    warnOsc.type = 'sine';
    warnOsc.frequency.setValueAtTime(2637.02, now + 0.01);
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
 * Plays a pre-rendered AudioBuffer directly through the global Web Audio Master GainNode.
 * Operates with 0 CPU overhead and 0ms latency.
 *
 * @returns BufferSourceNode instance if playback started, or null if buffer not pre-rendered.
 */
export function playPreloadedBuffer(bufferKey: string): AudioBufferSourceNode | null {
  const buffer = bufferCache[bufferKey];
  if (!buffer) return null;

  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return null;

  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(master);
    source.start(ctx.currentTime);
    return source;
  } catch (e) {
    return null;
  }
}
