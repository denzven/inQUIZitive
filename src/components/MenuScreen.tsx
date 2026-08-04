import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import QLogo from '../assets/Q.png';
import { Maximize, Minimize, Download } from 'lucide-react';

import { ScreenLayout } from './ScreenLayout';

export const MenuScreen: React.FC = () => {
  const { setGameState, hasLoaded, setHasLoaded } = useQuizStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, setHasLoaded]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

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
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 10 }}>
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            style={{ 
              width: '50px', height: '50px', borderRadius: '15px', 
              padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          onClick={toggleFullScreen}
          style={{ 
            width: '50px', height: '50px', borderRadius: '15px', 
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
