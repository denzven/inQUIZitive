# InQUIZitive Custom Audio Soundbites & MP3 Overrides

This directory is reserved for custom MP3 soundbites and audio overrides.

## Custom Soundbite Audio Slots

| SFX Key | Sound Effect Description | Recommended File Name |
| :--- | :--- | :--- |
| `tickTock` | Rapid Fire 60s countdown timer tick-tock | `tickTock.mp3` |
| `tileChime` | Jeopardy / Tic-Tac-Toe tile chime | `tileChime.mp3` |
| `buzzerLockout` | Game show lockout buzzer | `buzzerLockout.mp3` |
| `correctFanfare` | Correct answer celebratory fanfare | `correctFanfare.mp3` |
| `wrongBuzz` | Wrong answer error buzz | `wrongBuzz.mp3` |
| `bubblePop` | Menu background circle bubble pops | `bubblePop.mp3` |
| `buttonClick` | Navigation button click sound | `buttonClick.mp3` |
| `wheelTick` | Spin Wheel mechanical reel ticks | `wheelTick.mp3` |
| `bgm` | Menu & Start screen lobby background music | `bgm.mp3` |

## How to Customize Audio

### Option A: Upload Custom MP3 Files in Settings UI (Recommended)
1. Open the **Settings** view in the application.
2. Scroll to **Custom MP3 Soundbites & Audio Overrides**.
3. Click **Upload MP3** next to any sound effect slot.
4. The uploaded custom audio file is instantly saved in application storage and will play across all game rounds!
5. Click **Reset to Default** anytime to restore built-in Web Audio synthesis.

### Option B: Project Audio Assets Override
Place `.mp3` or `.wav` files into `public/audio/` using the recommended filenames above and reference them in `customSoundbites`.
