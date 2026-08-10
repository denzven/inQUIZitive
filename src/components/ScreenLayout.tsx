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
  const { subtitle, gameState } = useQuizStore();
  const { isMuted, toggleMute } = useAudioStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  /** Automatically scroll main content view back to top on gameState screen transitions */
  React.useEffect(() => {
    stopWheelTick();
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [gameState]);

  return (
    <div className="projector-container animate-fade-in" style={{ justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
      
      {backgroundDecor}

      {/* Top Left Action Buttons (Home / Settings) */}
      <div 
        className="animate-fade-in"
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
          >
            <Home style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--dark-green)" strokeWidth={1.5} />
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
            aria-label="Settings"
          >
            <Settings style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--dark-green)" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Top Right Action Buttons (Mute Icon Button + Custom Actions) */}
      <div 
        className="animate-fade-in"
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
            backgroundColor: isMuted ? 'var(--orange)' : 'var(--dark-teal)',
            border: `2px solid ${isMuted ? 'var(--wrong-red)' : 'var(--teal)'}`
          }}
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={24} color="var(--white)" /> : <Volume2 size={24} color="var(--white)" />}
        </button>
        {topRightActions}
      </div>

      {/* Main Content Area: Centered Title + Children with safe top padding & zero scroll clipping */}
      <div 
        ref={scrollRef} 
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
              <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--white)', margin: 0, zIndex: 1 }}>{subtitle}</h2>
              <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(5px, 2vh, 20px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
            </div>
          )}
          
          {children}
        </div>
      </div>

      {footerText && (
        <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center', zIndex: 1, color: 'var(--white)', fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', opacity: 0.7, padding: '10px', boxSizing: 'border-box', animationDelay: '0.5s', flexShrink: 0 }}>
          {footerText}
        </div>
      )}
    </div>
  );
};

