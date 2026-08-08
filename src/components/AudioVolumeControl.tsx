import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { playButtonClick } from '../utils/soundEffects';

interface AudioVolumeControlProps {
  /** Optional custom CSS className override */
  className?: string;
}

/**
 * Presenter Master Audio Volume & Mute Control Component.
 * Placed in top navigation bar to allow presenters to dynamically adjust SFX volume or toggle mute.
 */
export const AudioVolumeControl: React.FC<AudioVolumeControlProps> = ({ className = '' }) => {
  const { volume, isMuted, setVolume, toggleMute } = useAudioStore();
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const percent = Math.round((isMuted ? 0 : volume) * 100);

  /** Renders corresponding Lucide volume icon based on current volume and mute state */
  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)' }} color="var(--orange)" strokeWidth={2} />;
    }
    if (volume < 0.5) {
      return <Volume1 style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)' }} color="var(--yellow)" strokeWidth={2} />;
    }
    return <Volume2 style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)' }} color="var(--white)" strokeWidth={2} />;
  };

  /** Handles slider volume changes */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  /** Plays audio preview click tone on slider change completion */
  const handleSliderChangeEnd = () => {
    playButtonClick();
  };

  /** Auto collapse expanded slider popover when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsHoveredOrFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`audio-volume-control ${className}`}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(9, 44, 42, 0.85)',
        border: '1.5px solid var(--teal)',
        borderRadius: '30px',
        padding: '4px 10px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 30,
        userSelect: 'none',
      }}
    >
      {/* Mute/Unmute Toggle Button */}
      <button
        onClick={() => {
          toggleMute();
          playButtonClick();
        }}
        aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          borderRadius: '50%',
          outline: 'none',
        }}
      >
        {renderVolumeIcon()}
      </button>

      {/* Expandable Presenter Volume Slider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: isHoveredOrFocused ? '180px' : '0px',
          opacity: isHoveredOrFocused ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          whiteSpace: 'nowrap',
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleSliderChange}
          onMouseUp={handleSliderChangeEnd}
          onTouchEnd={handleSliderChangeEnd}
          aria-label="Presenter Master Volume"
          title={`Volume: ${percent}%`}
          style={{
            width: '100px',
            accentColor: 'var(--yellow)',
            cursor: 'pointer',
            height: '6px',
            borderRadius: '3px',
          }}
        />

        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: isMuted ? 'var(--orange)' : 'var(--white)',
            minWidth: '36px',
            textAlign: 'right',
            fontFamily: 'monospace',
          }}
        >
          {isMuted ? 'OFF' : `${percent}%`}
        </span>
      </div>
    </div>
  );
};
