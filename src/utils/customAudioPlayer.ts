import { useAudioStore, type SfxKey } from '../store/useAudioStore';
import { getAudioContext, getMasterGain, isSfxDisabled } from './soundEffects';

const activeAudioElements: Partial<Record<SfxKey, HTMLAudioElement>> = {};
const activeAudioGainNodes: Partial<Record<SfxKey, GainNode>> = {};

/**
 * Returns true if the SFX key represents a background music track.
 */
export function isBgmKey(sfxKey: SfxKey): boolean {
  return sfxKey === 'bgm' || sfxKey.startsWith('bgm_');
}

/**
 * Checks if a custom soundbite data URL exists in store for the given SFX key.
 */
export function getCustomSoundbiteUrl(sfxKey: SfxKey): string | null {
  const customMap = useAudioStore.getState().customSoundbites;
  return customMap?.[sfxKey] || null;
}

/**
 * Plays custom MP3 soundbite if present, routing audio through Web Audio Master GainNode.
 * Applies smooth 1.8-second fade-in if playing BGM track (unless isPreview is true for instant start).
 * Returns true if a custom soundbite was found and played; false if fallback synthesizer should run.
 */
export function playCustomSoundbite(sfxKey: SfxKey, ignoreDisabled = false, isPreview = false): boolean {
  if (!ignoreDisabled && isSfxDisabled(sfxKey)) return true;

  const url = getCustomSoundbiteUrl(sfxKey);
  if (!url) return false;

  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return false;

  try {
    // Stop any existing playing custom audio for this key (instant stop if previewing)
    stopCustomSoundbite(sfxKey, isPreview);

    const audio = new Audio(url);
    activeAudioElements[sfxKey] = audio;

    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    activeAudioGainNodes[sfxKey] = gainNode;

    if (isBgmKey(sfxKey)) {
      audio.loop = true;
      if (isPreview) {
        // Instant play for Settings preview button (0s fade-in)
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
      } else {
        // Smooth 1.8-second fade-in for screen navigation
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 1.8);
      }
    } else {
      gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
    }

    source.connect(gainNode);
    gainNode.connect(master);

    audio.play().catch(console.error);
    audio.onended = () => {
      activeAudioElements[sfxKey] = undefined;
      activeAudioGainNodes[sfxKey] = undefined;
    };
    return true;
  } catch (e) {
    console.warn(`Fallback to synth for ${sfxKey}:`, e);
    return false;
  }
}

/**
 * Stops playback of custom audio element with smooth 2.0-second fade-out for BGM (or instant 0s stop if isPreview is true).
 */
export function stopCustomSoundbite(sfxKey: SfxKey, isPreview = false): void {
  const audio = activeAudioElements[sfxKey];
  const gainNode = activeAudioGainNodes[sfxKey];
  const ctx = getAudioContext();

  // Decouple active references so new tracks can start cleanly
  activeAudioElements[sfxKey] = undefined;
  activeAudioGainNodes[sfxKey] = undefined;

  if (isBgmKey(sfxKey) && audio && gainNode && ctx && !isPreview) {
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.0); // 2.0s smooth fade-out

    setTimeout(() => {
      try {
        audio.pause();
        audio.currentTime = 0;
        gainNode.disconnect();
      } catch (e) {}
    }, 2050);
  } else if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      gainNode?.disconnect();
    } catch (e) {}
  }
}

/**
 * Stops all currently active custom BGM tracks across all screens (instant stop if isPreview is true).
 */
export function stopAllCustomBgms(isPreview = false): void {
  Object.keys(activeAudioElements).forEach((key) => {
    const sfxKey = key as SfxKey;
    if (isBgmKey(sfxKey)) {
      stopCustomSoundbite(sfxKey, isPreview);
    }
  });
}
