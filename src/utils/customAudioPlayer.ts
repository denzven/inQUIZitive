import { useAudioStore, type SfxKey } from '../store/useAudioStore';
import { getAudioContext, getMasterGain, isSfxDisabled } from './soundEffects';

const activeAudioElements: Partial<Record<SfxKey, HTMLAudioElement>> = {};

/**
 * Checks if a custom soundbite data URL exists in store for the given SFX key.
 */
export function getCustomSoundbiteUrl(sfxKey: SfxKey): string | null {
  const customMap = useAudioStore.getState().customSoundbites;
  return customMap?.[sfxKey] || null;
}

/**
 * Plays custom MP3 soundbite if present, routing audio through Web Audio Master GainNode.
 * Returns true if a custom soundbite was found and played; false if fallback synthesizer should run.
 */
export function playCustomSoundbite(sfxKey: SfxKey, ignoreDisabled = false): boolean {
  if (!ignoreDisabled && isSfxDisabled(sfxKey)) return true;

  const url = getCustomSoundbiteUrl(sfxKey);
  if (!url) return false;

  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return false;

  try {
    // Stop any existing playing custom audio for this key
    if (activeAudioElements[sfxKey]) {
      activeAudioElements[sfxKey]?.pause();
      activeAudioElements[sfxKey] = undefined;
    }

    const audio = new Audio(url);
    activeAudioElements[sfxKey] = audio;

    const source = ctx.createMediaElementSource(audio);
    source.connect(master);

    audio.play().catch(console.error);
    audio.onended = () => {
      activeAudioElements[sfxKey] = undefined;
    };
    return true;
  } catch (e) {
    console.warn(`Fallback to synth for ${sfxKey}:`, e);
    return false;
  }
}

/**
 * Stops playback of custom audio element if playing.
 */
export function stopCustomSoundbite(sfxKey: SfxKey): void {
  if (activeAudioElements[sfxKey]) {
    activeAudioElements[sfxKey]?.pause();
    activeAudioElements[sfxKey] = undefined;
  }
}
