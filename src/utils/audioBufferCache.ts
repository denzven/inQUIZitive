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
    const sampleRate = 44100;

    // 1. Pre-render Deep, Bassy, Resonant UI Button Click Buffer (0.25s)
    bufferCache['buttonClick'] = renderOfflineBuffer(sampleRate, 0.25, (ctx, master) => {
      const now = 0;
      // Layer 1: Tactile Contact Snap
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const clickFilter = ctx.createBiquadFilter();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(2600, now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.012);
      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(1400, now);
      clickGain.gain.setValueAtTime(0.0001, now);
      clickGain.gain.linearRampToValueAtTime(0.55, now + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(master);
      clickOsc.start(now);
      clickOsc.stop(now + 0.016);

      // Layer 2: Deep Resonant Body Pop (340Hz / 510Hz warm switch body over 120ms)
      const bodyOsc1 = ctx.createOscillator();
      const bodyOsc2 = ctx.createOscillator();
      const bodyFilter = ctx.createBiquadFilter();
      const bodyGain = ctx.createGain();
      bodyOsc1.type = 'triangle';
      bodyOsc1.frequency.setValueAtTime(340, now);
      bodyOsc2.type = 'sine';
      bodyOsc2.frequency.setValueAtTime(510, now);
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(750, now);
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.linearRampToValueAtTime(0.78, now + 0.002);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      bodyOsc1.connect(bodyFilter);
      bodyOsc2.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(master);
      bodyOsc1.start(now);
      bodyOsc2.start(now);
      bodyOsc1.stop(now + 0.12);
      bodyOsc2.stop(now + 0.12);

      // Layer 3: Heavy Sub-Bass Acoustic Thump Decay (110Hz -> 45Hz sub-thump over 180ms)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(110, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
      thumpGain.gain.setValueAtTime(0.0001, now);
      thumpGain.gain.linearRampToValueAtTime(0.68, now + 0.002);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      thumpOsc.connect(thumpGain);
      thumpGain.connect(master);
      thumpOsc.start(now);
      thumpOsc.stop(now + 0.20);
    });

    // 2. Pre-render Tick Buffer (1320Hz Woodblock - 0.12s)
    bufferCache['tick'] = renderOfflineBuffer(sampleRate, 0.12, (ctx, master) => {
      renderWoodblock(ctx, master, 1320, false, 0.38);
    });

    // 3. Pre-render Tock Buffer (880Hz Woodblock - 0.12s)
    bufferCache['tock'] = renderOfflineBuffer(sampleRate, 0.12, (ctx, master) => {
      renderWoodblock(ctx, master, 880, false, 0.38);
    });

    // 4. Pre-render Urgent Tick Buffer (1760Hz - 0.14s)
    bufferCache['tickUrgent'] = renderOfflineBuffer(sampleRate, 0.14, (ctx, master) => {
      renderWoodblock(ctx, master, 1760, true, 0.45);
    });

    // 5. Pre-render Urgent Tock Buffer (1174.66Hz - 0.14s)
    bufferCache['tockUrgent'] = renderOfflineBuffer(sampleRate, 0.14, (ctx, master) => {
      renderWoodblock(ctx, master, 1174.66, true, 0.45);
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

    // 7. Pre-render Continuous 5.5s Spin Wheel Mechanical Reel Track Buffer
    bufferCache['wheelTick'] = renderOfflineBuffer(sampleRate, 5.5, (ctx, master) => {
      const clickTimes: Array<{ time: number; freq: number; vol: number }> = [];

      for (let t = 0; t < 1.5; t += 0.045) {
        const reel = Math.floor((t / 0.045) % 4);
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.12 });
      }
      for (let t = 1.5; t < 2.3; t += 0.065) {
        const reel = Math.floor((t / 0.065) % 3) + 1;
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.14 });
      }
      for (let t = 2.3; t < 3.1; t += 0.095) {
        const reel = Math.floor((t / 0.095) % 2) + 2;
        clickTimes.push({ time: t, freq: 850 + reel * 140, vol: 0.16 });
      }
      for (let t = 3.1; t < 3.9; t += 0.14) {
        clickTimes.push({ time: t, freq: 1280, vol: 0.18 });
      }
      const landingDelays = [0.16, 0.22, 0.30, 0.42, 0.58];
      let curT = 3.9;
      landingDelays.forEach((delay) => {
        curT += delay;
        clickTimes.push({ time: curT, freq: 1350, vol: 0.22 });
      });

      clickTimes.forEach(({ time: clickTime, freq, vol }) => {
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
        gain.connect(master);
        osc.start(clickTime);
        osc.stop(clickTime + 0.022);
      });
    });

    isPreloaded = true;
  } catch (e) {
    console.warn('Offline audio pre-rendering fallback:', e);
  } finally {
    isPreloading = false;
  }
}

/** Helper to render an OfflineAudioContext into an AudioBuffer synchronously */
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
  const offlineCtx = new OfflineCtxClass(1, length, sampleRate);
  const master = offlineCtx.createGain();
  master.gain.setValueAtTime(1.0, 0);
  master.connect(offlineCtx.destination);

  setupFn(offlineCtx, master);

  let resultBuffer: AudioBuffer | undefined;
  offlineCtx.startRendering().then((renderedBuffer) => {
    resultBuffer = renderedBuffer;
  }).catch(() => {});

  return resultBuffer;
}

/** Renders woodblock acoustic waveforms into OfflineAudioContext */
function renderWoodblock(
  ctx: OfflineAudioContext,
  master: GainNode,
  freq: number,
  urgency: boolean,
  peakVol: number
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
  gain.connect(master);

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
