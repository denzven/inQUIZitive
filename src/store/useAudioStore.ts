import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateAudioVolume, updateDisabledSfx } from '../utils/soundEffects';

export type SfxKey =
  | 'tickTock'
  | 'tileChime'
  | 'buzzerLockout'
  | 'correctFanfare'
  | 'wrongBuzz'
  | 'bubblePop'
  | 'buttonClick'
  | 'bgm'
  | 'wheelTick';

export interface AudioState {
  /** Presenter master volume level between 0.0 (silent) and 1.0 (100%) */
  volume: number;
  /** Boolean flag indicating if presenter sound effects are currently muted */
  isMuted: boolean;
  /** Map of individual SFX keys to disabled boolean flag */
  disabledSfx: Record<SfxKey, boolean>;
  /** Map of individual SFX keys to custom uploaded MP3 data URLs or null for synthesized default */
  customSoundbites: Record<SfxKey, string | null>;

  /** Sets master volume level and updates Web Audio GainNode */
  setVolume: (volume: number) => void;
  /** Toggles presenter audio mute state */
  toggleMute: () => void;
  /** Explicitly sets presenter audio mute state */
  setMuted: (isMuted: boolean) => void;
  /** Toggles enabled/disabled status for an individual sound effect key */
  toggleSfxDisabled: (sfxKey: SfxKey) => void;
  /** Explicitly sets enabled/disabled status for an individual sound effect key */
  setSfxDisabled: (sfxKey: SfxKey, disabled: boolean) => void;
  /** Sets custom MP3 soundbite data URL for a specific SFX key */
  setCustomSoundbite: (sfxKey: SfxKey, dataUrl: string | null) => void;
  /** Resets all custom soundbites back to synthesized defaults */
  resetAllCustomSoundbites: () => void;
}

const initialDisabledState: Record<SfxKey, boolean> = {
  tickTock: false,
  tileChime: false,
  buzzerLockout: false,
  correctFanfare: false,
  wrongBuzz: false,
  bubblePop: false,
  buttonClick: false,
  bgm: false,
  wheelTick: false,
};

const initialCustomSoundbites: Record<SfxKey, string | null> = {
  tickTock: null,
  tileChime: null,
  buzzerLockout: null,
  correctFanfare: null,
  wrongBuzz: null,
  bubblePop: null,
  buttonClick: null,
  bgm: null,
  wheelTick: null,
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      volume: 0.8,
      isMuted: false,
      disabledSfx: initialDisabledState,
      customSoundbites: initialCustomSoundbites,

      setVolume: (newVolume: number) => {
        const clamped = Math.max(0, Math.min(1, newVolume));
        const state = get();
        const newMuted = clamped === 0 ? true : state.isMuted && clamped > 0 ? false : state.isMuted;
        set({ volume: clamped, isMuted: newMuted });
        updateAudioVolume(clamped, newMuted);
      },

      toggleMute: () => {
        const state = get();
        const nextMuted = !state.isMuted;
        set({ isMuted: nextMuted });
        updateAudioVolume(state.volume, nextMuted);
      },

      setMuted: (muted: boolean) => {
        const state = get();
        set({ isMuted: muted });
        updateAudioVolume(state.volume, muted);
      },

      toggleSfxDisabled: (sfxKey: SfxKey) => {
        const state = get();
        const updated = {
          ...state.disabledSfx,
          [sfxKey]: !state.disabledSfx[sfxKey],
        };
        set({ disabledSfx: updated });
        updateDisabledSfx(updated);
      },

      setSfxDisabled: (sfxKey: SfxKey, disabled: boolean) => {
        const state = get();
        const updated = {
          ...state.disabledSfx,
          [sfxKey]: disabled,
        };
        set({ disabledSfx: updated });
        updateDisabledSfx(updated);
      },

      setCustomSoundbite: (sfxKey: SfxKey, dataUrl: string | null) => {
        const state = get();
        set({
          customSoundbites: {
            ...state.customSoundbites,
            [sfxKey]: dataUrl,
          },
        });
      },

      resetAllCustomSoundbites: () => {
        set({ customSoundbites: initialCustomSoundbites });
      },
    }),
    {
      name: 'inquizitive-audio-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateAudioVolume(state.volume, state.isMuted);
          updateDisabledSfx(state.disabledSfx || initialDisabledState);
        }
      },
    }
  )
);
