import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import QLogo from '../assets/Q.png';
import { Maximize, Minimize, Download } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';

/**
 * MenuScreen Component.
 * The primary navigation dashboard for InQUIZitive. Provides access to Start, Leaderboard,
 * Rules, Settings, and About views, as well as PWA installation and fullscreen toggle controls.
 */
export const MenuScreen: React.FC = () => {
  const { setGameState, hasLoaded, setHasLoaded } = useQuizStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  /** Handles initial load timer fallback if questions take time */
  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, setHasLoaded]);

  /** Listens to browser document fullscreen change events */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /** Listens to beforeinstallprompt event to offer PWA installation button */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  /**
   * Prompts the browser's native PWA installation dialog.
   */
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  /**
   * Toggles browser document full screen view on/off.
   */
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  if (!hasLoaded) {
    return (
      <div className="projector-container" style={{ backgroundColor: 'var(--dark-green)' }}>
        <img 
          src={QLogo} 
          alt="InQuizitive Logo" 
          className="animate-pop-in" 
          style={{ position: 'absolute', top: '50%', left: '50%', width: '150px', height: '150px' }} 
        />
      </div>
    );
  }

  /** Decorative background circles */
  const decorCircles = (
    <>
      <div className="animate-pop-in" style={{ position: 'absolute', top: '21%', left: '8%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--light-orange)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.1s' }} />
      <div className="animate-pop-in" style={{ position: 'absolute', top: '42%', left: '97%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--yellow)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.2s' }} />
      <div className="animate-pop-in" style={{ position: 'absolute', top: '92%', left: '7%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--yellow)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.3s' }} />
      <div className="animate-pop-in" style={{ position: 'absolute', top: '115%', left: '87%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--orange)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.4s' }} />
    </>
  );

  return (
    <ScreenLayout 
      backgroundDecor={decorCircles}
      footerText="Made with Love by Denzven and AI using React and Vite"
      hideTitle={true}
    >
      <div style={{ position: 'absolute', top: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-top, 0px))', right: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-right, 0px))', display: 'flex', gap: '10px', zIndex: 20 }}>
        {deferredPrompt && (
          <button 
            className="btn-icon"
            onClick={handleInstallClick}
            style={{ 
              backgroundColor: 'var(--yellow)',
              border: '2px solid var(--orange)'
            }}
            aria-label="Install App"
            title="Install App"
          >
            <Download size={24} color="var(--dark-green)" />
          </button>
        )}
        <button 
          className="btn-icon"
          onClick={toggleFullScreen}
          style={{ 
            backgroundColor: 'var(--dark-teal)',
            border: '2px solid var(--teal)'
          }}
          aria-label="Toggle Fullscreen"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={24} color="var(--white)" /> : <Maximize size={24} color="var(--white)" />}
        </button>
      </div>

      <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="animate-slide-up" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--white)', margin: 0, zIndex: 1 }}>{useQuizStore.getState().subtitle}</h2>
          <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(20px, 4vh, 40px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
        </div>
        
        <div className="menu-grid animate-slide-up" style={{ zIndex: 1, animationDelay: '0.2s', boxSizing: 'border-box', margin: 0 }}>
          <button className="menu-btn" onClick={() => setGameState('START')}>
            Start
          </button>
          <button className="menu-btn" onClick={() => setGameState('LEADERBOARD')}>
            Leaderboard
          </button>
          <button className="menu-btn" onClick={() => setGameState('RULES')}>
            Rules
          </button>
          <button className="menu-btn" onClick={() => setGameState('SETTINGS')}>
            Settings
          </button>
          <button className="menu-btn" onClick={() => setGameState('ABOUT')}>
            About
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
};

