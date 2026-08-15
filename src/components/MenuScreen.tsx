import React, { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import QLogo from '../assets/Q.png';
import { Maximize, Minimize, Download } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { playButtonClick, playBubblePopSequence } from '../utils/soundEffects';

/**
 * MenuScreen Component.
 * The primary navigation dashboard for InQUIZitive.
 * Supports direct key shortcuts (1-5, S, L, R, G, A) and clean arrow key navigation.
 */
export const MenuScreen: React.FC = () => {
  const { setGameState, hasLoaded, setHasLoaded } = useQuizStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const menuItems = [
    { label: 'Start', state: 'START', key: '1', letter: 'T' },
    { label: 'Leaderboard', state: 'LEADERBOARD', key: '2', letter: 'L' },
    { label: 'Rules', state: 'RULES', key: '3', letter: 'R' },
    { label: 'Settings', state: 'SETTINGS', key: '4', letter: 'S' },
    { label: 'About', state: 'ABOUT', key: '5', letter: 'A' }
  ];

  /** Handles initial load timer fallback if questions take time */
  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, setHasLoaded]);

  /** Auto-focus first button on load */
  useEffect(() => {
    if (hasLoaded) {
      const timer = setTimeout(() => {
        buttonRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded]);

  /** Triggers bubbly popping sound effect sequence when menu screen background circles pop up */
  useEffect(() => {
    if (hasLoaded) {
      playBubblePopSequence();
    }
  }, [hasLoaded]);

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

  /** Handles direct key shortcuts (1-5, T, L, R, S, A) and arrow key navigation */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const lowerKey = e.key.toLowerCase();

      if (e.key === '1' || lowerKey === 't') {
        e.preventDefault();
        playButtonClick();
        setGameState('START');
      } else if (e.key === '2' || lowerKey === 'l') {
        e.preventDefault();
        playButtonClick();
        setGameState('LEADERBOARD');
      } else if (e.key === '3' || lowerKey === 'r') {
        e.preventDefault();
        playButtonClick();
        setGameState('RULES');
      } else if (e.key === '4' || lowerKey === 's') {
        e.preventDefault();
        playButtonClick();
        setGameState('SETTINGS');
      } else if (e.key === '5' || lowerKey === 'a') {
        e.preventDefault();
        playButtonClick();
        setGameState('ABOUT');
      } else if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        const currIndex = buttonRefs.current.findIndex(el => el === document.activeElement);
        const baseIndex = currIndex !== -1 ? currIndex : focusedIndex;

        let nextIndex = baseIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (baseIndex + 1) % menuItems.length;
        } else {
          nextIndex = (baseIndex - 1 + menuItems.length) % menuItems.length;
        }

        setFocusedIndex(nextIndex);
        buttonRefs.current[nextIndex]?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, menuItems.length, setGameState]);

  /** Prompts the browser's native PWA installation dialog */
  const handleInstallClick = async () => {
    playButtonClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  /** Toggles browser document full screen view on/off */
  const toggleFullScreen = () => {
    playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  /** Helper for menu button clicks with SFX */
  const handleNavClick = (nextState: any) => {
    playButtonClick();
    setGameState(nextState);
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
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '21%', left: '8%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--light-orange)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.1s' }} />
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '42%', left: '97%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--yellow)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.2s' }} />
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '92%', left: '7%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--yellow)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.3s' }} />
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '115%', left: '87%', width: 'clamp(350px, 80vw, 450px)', height: 'clamp(350px, 80vw, 450px)', borderRadius: '50%', backgroundColor: 'var(--orange)', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.4s' }} />
    </>
  );

  const renderTopRightActions = (
    <>
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
        aria-label="Toggle Fullscreen (Shortcut: F)"
        title="Toggle Fullscreen (Shortcut: F)"
      >
        {isFullscreen ? <Minimize size={24} color="var(--white)" /> : <Maximize size={24} color="var(--white)" />}
      </button>
    </>
  );

  return (
    <ScreenLayout 
      backgroundDecor={decorCircles}
      topRightActions={renderTopRightActions}
      footerText="Made with Love by Denzven and AI using React and Vite"
      hideTitle={true}
    >
      <div 
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            buttonRefs.current[focusedIndex]?.focus();
          }
        }}
        style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      >
        <div className="animate-slide-up" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--white)', margin: 0, zIndex: 1 }}>{useQuizStore.getState().subtitle}</h2>
          <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(20px, 4vh, 40px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
        </div>
        
        <div className="menu-grid animate-slide-up" style={{ zIndex: 1, animationDelay: '0.2s', boxSizing: 'border-box', margin: 0 }}>
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              ref={(el) => { buttonRefs.current[idx] = el; }}
              tabIndex={0}
              className="menu-btn" 
              onClick={() => handleNavClick(item.state)}
              onFocus={() => setFocusedIndex(idx)}
              title={`${item.label} (Shortcut: ${item.key} or ${item.letter})`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </ScreenLayout>
  );
};
