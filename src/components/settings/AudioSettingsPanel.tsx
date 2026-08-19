import React, { useState, useRef } from 'react';
import { useAudioStore, type SfxKey } from '../../store/useAudioStore';
import { Volume2, VolumeX, Bell, Clock, Play, Square, Sparkles, MousePointerClick, Music, RotateCw, AlertOctagon, FileSpreadsheet } from 'lucide-react';
import { playTickTock, playTileChime, playBuzzerLockout, playCorrectFanfare, playWrongBuzz, playButtonClick } from '../../utils/soundEffects';
import { startBgmForKey, stopBgm } from '../../utils/bgmSynthesizer';
import { playCustomSoundbite, stopCustomSoundbite } from '../../utils/customAudioPlayer';

export const AudioSettingsPanel: React.FC = () => {
  const { volume, isMuted, setVolume, toggleMute, disabledSfx, toggleSfxDisabled, customSoundbites, setCustomSoundbite } = useAudioStore();
  const [playingPreviewKey, setPlayingPreviewKey] = useState<SfxKey | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  const sfxList: Array<{
    key: SfxKey;
    label: string;
    desc: string;
    icon: React.ReactNode;
    durationMs: number;
    play: (ignoreDisabled: boolean) => void;
    stop: () => void;
  }> = [
    {
      key: 'bgm_menu',
      label: 'Main Menu Screen BGM',
      desc: 'Upbeat game show lobby theme (C-Major, 115 BPM)',
      icon: <Music size={20} color="var(--color-accent)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_menu', ignore) || startBgmForKey('bgm_menu', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_menu'); stopBgm(true); },
    },
    {
      key: 'bgm_rounds',
      label: 'Rounds Selection Screen BGM',
      desc: 'Exciting round selector theme (E-Major, 110 BPM)',
      icon: <Sparkles size={20} color="var(--color-secondary)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_rounds', ignore) || startBgmForKey('bgm_rounds', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_rounds'); stopBgm(true); },
    },
    {
      key: 'bgm_rapid_fire',
      label: 'Rapid Fire Round BGM',
      desc: 'High-energy tension speed theme (D-Minor, 130 BPM)',
      icon: <Clock size={20} color="var(--color-primary)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_rapid_fire', ignore) || startBgmForKey('bgm_rapid_fire', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_rapid_fire'); stopBgm(true); },
    },
    {
      key: 'bgm_spin_wheel',
      label: 'Spin Wheel Round BGM',
      desc: 'Suspenseful slot machine wheel theme (G-Major, 105 BPM)',
      icon: <RotateCw size={20} color="var(--color-secondary)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_spin_wheel', ignore) || startBgmForKey('bgm_spin_wheel', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_spin_wheel'); stopBgm(true); },
    },
    {
      key: 'bgm_tictactoe',
      label: 'Tic Tac Toe Round BGM',
      desc: 'Strategic synth-pop grid theme (F-Major, 100 BPM)',
      icon: <FileSpreadsheet size={20} color="var(--color-accent)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_tictactoe', ignore) || startBgmForKey('bgm_tictactoe', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_tictactoe'); stopBgm(true); },
    },
    {
      key: 'bgm_buzzer',
      label: 'Buzzer Round BGM',
      desc: 'High-tension lock-in pulse theme (E-Minor, 125 BPM)',
      icon: <AlertOctagon size={20} color="var(--color-danger)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_buzzer', ignore) || startBgmForKey('bgm_buzzer', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_buzzer'); stopBgm(true); },
    },
    {
      key: 'buttonClick',
      label: 'UI Button Click',
      desc: 'Click tone when clicking buttons or controls',
      icon: <MousePointerClick size={20} color="var(--color-surface)" />,
      durationMs: 250,
      play: (ignore) => playButtonClick(ignore),
      stop: () => {},
    },
    {
      key: 'tickTock',
      label: 'Countdown Tick-Tock',
      desc: 'Rapid Fire 60s timer woodblock tick-tock audio',
      icon: <Clock size={20} color="var(--color-accent)" />,
      durationMs: 200,
      play: (ignore) => playTickTock(false, false, ignore),
      stop: () => {},
    },
    {
      key: 'tileChime',
      label: 'Jeopardy Tile Chime',
      desc: 'Sparkling glass chime played on tile click',
      icon: <Bell size={20} color="var(--color-primary)" />,
      durationMs: 500,
      play: (ignore) => playTileChime(2, ignore),
      stop: () => {},
    },
    {
      key: 'buzzerLockout',
      label: 'Buzzer Lockout Cue',
      desc: 'Punchy synth buzz when a team hits their buzzer key',
      icon: <AlertOctagon size={20} color="var(--color-danger)" />,
      durationMs: 400,
      play: (ignore) => playBuzzerLockout(ignore),
      stop: () => {},
    },
    {
      key: 'correctFanfare',
      label: 'Correct Answer Fanfare',
      desc: 'Triumphant brass chord sequence for correct points',
      icon: <Sparkles size={20} color="var(--color-success)" />,
      durationMs: 1200,
      play: (ignore) => playCorrectFanfare(ignore),
      stop: () => {},
    },
    {
      key: 'wrongBuzz',
      label: 'Wrong Answer Buzz',
      desc: 'Low sawtooth error buzz for incorrect answers',
      icon: <VolumeX size={20} color="var(--color-danger)" />,
      durationMs: 600,
      play: (ignore) => playWrongBuzz(ignore),
      stop: () => {},
    }
  ];

  const handleTogglePlay = (item: (typeof sfxList)[0]) => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    if (playingPreviewKey === item.key) {
      item.stop();
      setPlayingPreviewKey(null);
      return;
    }

    if (playingPreviewKey) {
      const active = sfxList.find((s) => s.key === playingPreviewKey);
      if (active) active.stop();
    }

    item.play(true);
    setPlayingPreviewKey(item.key);

    if (item.durationMs !== Infinity) {
      previewTimerRef.current = window.setTimeout(() => {
        setPlayingPreviewKey(null);
        previewTimerRef.current = null;
      }, item.durationMs);
    }
  };

  const handleSoundbiteUpload = (key: SfxKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setCustomSoundbite(key, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h3 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
          Audio & SFX Soundboard Configuration
        </h3>
        <p style={{ color: 'var(--color-surface)', opacity: 0.85, fontSize: '0.95rem', marginTop: '4px' }}>
          Adjust master volume levels, test audio cues, or upload custom MP3/WAV audio soundbites.
        </p>
      </div>

      {/* Master Volume Bar */}
      <div style={{ 
        background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)', 
        padding: '18px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        flexWrap: 'wrap' 
      }}>
        <button
          onClick={toggleMute}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isMuted ? 'var(--color-danger)' : 'var(--color-accent)', display: 'flex', alignItems: 'center', padding: 0 }}
        >
          {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '0.9rem' }}>Master Volume Level</span>
            <span style={{ fontWeight: 800, color: 'var(--color-accent)', fontSize: '0.9rem' }}>{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* SFX List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {sfxList.map((item) => {
          const isDisabled = Boolean(disabledSfx[item.key]);
          const isPlaying = playingPreviewKey === item.key;
          const customFile = customSoundbites[item.key];

          return (
            <div
              key={item.key}
              style={{
                background: 'color-mix(in srgb, var(--color-primary-container) 45%, transparent)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon}
                    <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '0.95rem' }}>{item.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!isDisabled}
                    onChange={() => toggleSfxDisabled(item.key)}
                    title={isDisabled ? 'Disabled' : 'Enabled'}
                    style={{ accentColor: 'var(--color-success)', cursor: 'pointer' }}
                  />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-surface)', opacity: 0.7, margin: '4px 0 8px 0' }}>{item.desc}</p>
                {customFile && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 800, display: 'block' }}>Custom Audio Attached</span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTogglePlay(item)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: isPlaying ? 'var(--color-danger)' : 'var(--color-primary)',
                    color: 'var(--color-surface)',
                    border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    textShadow: 'none'
                  }}
                >
                  {isPlaying ? <Square size={14} /> : <Play size={14} />} {isPlaying ? 'Stop' : 'Test Sound'}
                </button>
                <label
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'color-mix(in srgb, var(--color-primary-dark) 60%, transparent)',
                    color: 'var(--color-surface)',
                    border: '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    textShadow: 'none'
                  }}
                >
                  Upload Audio
                  <input type="file" accept="audio/*" onChange={(e) => handleSoundbiteUpload(item.key, e)} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
