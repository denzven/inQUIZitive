import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Home, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { playButtonClick, stopWheelTick } from '../utils/soundEffects';

/**
 * Props for the ScreenLayout wrapper component.
 */
interface ScreenLayoutProps {
  /** Inner content nodes rendered inside the responsive projector viewport */
  children: React.ReactNode;
  /** Optional background decorative SVG or elements */
  backgroundDecor?: React.ReactNode;
  /** Whether to show top-left Home navigation button */
  showHomeButton?: boolean;
  /** Click handler for top-left Home navigation button */
  onHomeClick?: () => void;
  /** Whether to show top-left Settings navigation button */
  showSettingsButton?: boolean;
  /** Click handler for top-left Settings navigation button */
  onSettingsClick?: () => void;
  /** Optional additional elements rendered in top-right navigation bar */
  topRightActions?: React.ReactNode;
  /** Optional footer text content */
  footerText?: React.ReactNode;
  /** Whether to hide main header title banner */
  hideTitle?: boolean;
}

/**
 * Responsive ScreenLayout wrapper component.
 * Provides uniform letterboxing, header title, navigation action buttons,
 * auto-scroll resetting, and responsive safe area padding across screens.
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ 
  children, 
  backgroundDecor, 
  showHomeButton,
  onHomeClick,
  showSettingsButton,
  onSettingsClick,
  topRightActions,
  footerText,
  hideTitle
}) => {
  const { subtitle, gameState, isStealthMode } = useQuizStore();
  const { isMuted, toggleMute } = useAudioStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  /** Automatically scroll main content view back to top on gameState screen transitions */
  React.useEffect(() => {
    stopWheelTick();
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameState]);

  const actionContainerClass = `animate-fade-in ${isStealthMode ? 'ghost-zone' : ''}`;

  return (
    <div className="projector-container animate-fade-in" style={{ justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
      
      {/* ARIA Live Status Region for host earpiece announcements */}
      <div role="status" aria-live="assertive" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {`Current Screen: ${gameState}`}
      </div>

      {backgroundDecor}

      {/* Top Left Action Buttons (Home / Settings) */}
      <div 
        className={actionContainerClass}
        style={{ 
          position: 'absolute', 
          top: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-top, 0px))', 
          left: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-left, 0px))', 
          display: 'flex', 
          gap: '10px', 
          zIndex: 20, 
          animationDelay: '0.5s' 
        }}
      >
        {showHomeButton && onHomeClick && (
          <button 
            className="btn-icon"
            onClick={() => {
              playButtonClick();
              stopWheelTick();
              onHomeClick();
            }}
            aria-label="Home"
            title="Home (Shortcut: Esc)"
          >
            <Home style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--color-surface)" strokeWidth={1.5} />
          </button>
        )}

        {showSettingsButton && onSettingsClick && (
          <button 
            className="btn-icon"
            onClick={() => {
              playButtonClick();
              stopWheelTick();
              onSettingsClick();
            }}
            aria-label="Settings (Shortcut: S)"
            title="Settings (Shortcut: S)"
          >
            <Settings style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--color-surface)" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Top Right Action Buttons (Mute Icon Button + Custom Actions) */}
      <div 
        className={actionContainerClass}
        style={{ 
          position: 'absolute', 
          top: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-top, 0px))', 
          right: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-right, 0px))', 
          display: 'flex', 
          alignItems: 'center',
          gap: '10px', 
          zIndex: 20, 
          animationDelay: '0.5s' 
        }}
      >
        <button 
          className="btn-icon"
          onClick={() => {
            toggleMute();
            playButtonClick();
          }}
          style={{ 
            backgroundColor: isMuted ? 'var(--color-action)' : 'var(--color-primary-container)',
            border: `2px solid ${isMuted ? 'var(--color-danger)' : 'var(--color-primary)'}`
          }}
          aria-label={isMuted ? "Unmute Audio (Shortcut: M)" : "Mute Audio (Shortcut: M)"}
          title={isMuted ? "Unmute Audio (Shortcut: M)" : "Mute Audio (Shortcut: M)"}
        >
          {isMuted ? <VolumeX size={24} color="var(--color-surface)" /> : <Volume2 size={24} color="var(--color-surface)" />}
        </button>
        {topRightActions}
      </div>

      {/* Main Content Area: Centered Title + Children with safe top padding & zero scroll clipping */}
      <div 
        ref={scrollRef} 
        className="screen-layout-content"
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%', 
          minHeight: 0, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          boxSizing: 'border-box',
          paddingTop: 'max(clamp(50px, 7vh, 80px), calc(env(safe-area-inset-top, 0px) + 45px))',
          paddingBottom: 'max(clamp(15px, 2vh, 25px), env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(clamp(10px, 2.5vw, 25px), env(safe-area-inset-left, 0px))',
          paddingRight: 'max(clamp(10px, 2.5vw, 25px), env(safe-area-inset-right, 0px))'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            width: '100%', 
            height: '100%',
            minHeight: '100%',
            flex: 1,
            boxSizing: 'border-box' 
          }}
        >
          {!hideTitle && (
            <div className="animate-slide-up" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--color-secondary)', margin: 0, zIndex: 1, fontWeight: 700 }}>{subtitle}</h2>
              <a href="https://denzven.github.io/inQUIZitive/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(5px, 2vh, 20px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
              </a>
            </div>
          )}
          
          {children}
        </div>
      </div>

      {footerText && (
        <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center', zIndex: 1, color: 'var(--color-secondary)', fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', opacity: 0.85, padding: '10px', boxSizing: 'border-box', animationDelay: '0.5s', flexShrink: 0 }}>
          {footerText}
        </div>
      )}
    </div>
  );
};

