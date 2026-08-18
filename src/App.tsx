import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuizStore } from './store/useQuizStore';
import { findMatchingPreset } from './config/themes';
import { fetchExcelData } from './utils/excelParser';
import { useGameControls } from './hooks/useGameControls';
import { Scoreboard } from './components/Scoreboard';
import { MenuScreen } from './components/MenuScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StartScreen } from './components/StartScreen';
import { AboutScreen } from './components/AboutScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { RulesScreen } from './components/RulesScreen';
import { RapidFireScreen } from './components/RapidFireScreen';
import { SpinWheelScreen } from './components/SpinWheelScreen';
import { TicTacToeScreen } from './components/TicTacToeScreen';
import { BuzzerScreen } from './components/BuzzerScreen';
import trialSheetUrl from './assets/trial_iQz_sheet.xlsx?url';
import { playBubblePopSequence } from './utils/soundEffects';
import { playScreenBgm, startBgm } from './utils/bgmSynthesizer';
import { loadGoogleFont } from './utils/fontLoader';
import { ThemeOverlay } from './components/ThemeOverlay';

import { useRapidFireStore } from './store/useRapidFireStore';
import { useTicTacToeStore } from './store/useTicTacToeStore';
import { useSpinWheelStore } from './store/useSpinWheelStore';

/**
 * Main Root Application Component for InQUIZitive.
 * Manages global screen navigation, CSS custom property theme injections,
 * browser back-button trapping, refresh interception, and crash recovery modals.
 */
function App() {
  const { gameState, setGameState, loadQuestions, activeRound, theme, hasLoaded, setHasLoaded, seed } = useQuizStore();
  const [init, setInit] = useState(false);

  /** Manages Background Music (BGM) lifecycle across all screens and rounds after preloader finishes */
  useEffect(() => {
    if (!init) return; // Suppress BGM while preloader is active
    playScreenBgm(gameState, activeRound);
  }, [gameState, activeRound, init]);

  /** Syncs Zustand theme colors & structural Design System Tokens to document root CSS variables */
  useEffect(() => {
    const root = document.documentElement;
    const primaryDark = theme.primaryDark || theme.darkGreen;
    const primary = theme.primary || theme.teal;
    const primaryContainer = theme.primaryContainer || theme.darkTeal;
    const accent = theme.accent || theme.yellow;
    const secondary = theme.secondary || theme.lightOrange;
    const action = theme.action || theme.orange;
    const surface = theme.surface || theme.white;
    const success = theme.success || theme.correctGreen;
    const danger = theme.danger || theme.wrongRed;

    // Semantic Color Tokens
    root.style.setProperty('--color-primary-dark', primaryDark);
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-container', primaryContainer);
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-action', action);
    root.style.setProperty('--color-surface', surface);
    root.style.setProperty('--color-success', success);
    root.style.setProperty('--color-danger', danger);

    // Structural Design System Tokens (Typography, Geometry & Effects)
    const activePreset = findMatchingPreset(theme);

    const typography = activePreset?.typography || { headingFont: '"League Spartan", "Montserrat", sans-serif', bodyFont: '"League Spartan", "Inter", sans-serif' };
    const geometry = activePreset?.geometry || { radiusSm: '6px', radiusMd: '12px', radiusLg: '20px', borderWidth: '2px' };
    const effects = activePreset?.effects || { cardShadow: '0 8px 30px rgba(0,0,0,0.12)', buttonShadow: '0 4px 15px rgba(0,0,0,0.15)', bgTexture: 'none', textShadow: 'none', backdropBlur: 'none' };
    const animation = activePreset?.animation || {
      transitionSpeed: '0.2s ease-in-out',
      hoverTransform: 'translateY(-2px)',
      activeTransform: 'translateY(0) scale(0.98)'
    };

    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);

    root.style.setProperty('--radius-sm', geometry.radiusSm);
    root.style.setProperty('--radius-md', geometry.radiusMd);
    root.style.setProperty('--radius-lg', geometry.radiusLg);
    root.style.setProperty('--border-width', geometry.borderWidth);

    root.style.setProperty('--shadow-card', effects.cardShadow);
    root.style.setProperty('--shadow-button', effects.buttonShadow);
    root.style.setProperty('--bg-texture', effects.bgTexture);
    root.style.setProperty('--text-shadow', effects.textShadow || 'none');
    root.style.setProperty('--backdrop-blur', effects.backdropBlur || 'none');

    root.style.setProperty('--transition-speed', animation.transitionSpeed);
    root.style.setProperty('--hover-transform', animation.hoverTransform);
    root.style.setProperty('--active-transform', animation.activeTransform);

    root.setAttribute('data-theme-id', activePreset?.id || 'ariseClassic');

    // Dynamic Google Font Loader
    loadGoogleFont(typography.headingFont);
    loadGoogleFont(typography.bodyFont);

    // Legacy Aliases (retained for fallback)
    root.style.setProperty('--dark-green', primaryDark);
    root.style.setProperty('--teal', primary);
    root.style.setProperty('--dark-teal', primaryContainer);
    root.style.setProperty('--yellow', accent);
    root.style.setProperty('--light-orange', secondary);
    root.style.setProperty('--orange', action);
    root.style.setProperty('--white', surface);
    root.style.setProperty('--correct-green', success);
    root.style.setProperty('--wrong-red', danger);

    // Dynamic Theme-Following Cursor SVGs
    const primaryEsc = encodeURIComponent(primary);
    const accentEsc = encodeURIComponent(accent);
    const actionEsc = encodeURIComponent(action);
    const darkEsc = encodeURIComponent(primaryDark);

    const defaultCursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="${primaryEsc}" stroke-width="3" opacity="0.85"/><circle cx="20" cy="20" r="5" fill="${accentEsc}"/><line x1="20" y1="0" x2="20" y2="8" stroke="${primaryEsc}" stroke-width="3"/><line x1="20" y1="32" x2="20" y2="40" stroke="${primaryEsc}" stroke-width="3"/><line x1="0" y1="20" x2="8" y2="20" stroke="${primaryEsc}" stroke-width="3"/><line x1="32" y1="20" x2="40" y2="20" stroke="${primaryEsc}" stroke-width="3"/></svg>`;

    const pointerCursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="${actionEsc}" opacity="0.4" /><circle cx="24" cy="24" r="14" fill="${accentEsc}" stroke="${darkEsc}" stroke-width="4"/><circle cx="24" cy="24" r="5" fill="${darkEsc}"/></svg>`;

    root.style.setProperty('--cursor-default', `url('${defaultCursorSvg}') 20 20, auto`);
    root.style.setProperty('--cursor-pointer', `url('${pointerCursorSvg}') 24 24, pointer`);
  }, [theme]);

  /** Resets scroll position when navigating between screens */
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const elements = document.querySelectorAll('.projector-container, #root, body, div');
    elements.forEach(el => {
      if (el.scrollTop > 0) el.scrollTop = 0;
    });
  }, [gameState]);

  // Initialize keyboard controls
  useGameControls();

  const [showExitModal, setShowExitModal] = useState(false);
  const [showCrashModal, setShowCrashModal] = useState(false);
  const previousState = useRef(gameState);

  /** 1. Prevents accidental browser refresh / tab close during active gameplay */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === 'PLAYING') {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome to show the native prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState]);

  /** 2. Pushes dummy state into browser history when transitioning away from MENU */
  useEffect(() => {
    if (previousState.current === 'MENU' && gameState !== 'MENU') {
      window.history.pushState('trap', '', window.location.href);
    }
    previousState.current = gameState;
  }, [gameState]);

  /** Traps popstate event to confirm exit modal during active play */
  useEffect(() => {
    const handlePopState = () => {
      if (gameState === 'PLAYING') {
        // Restore the trap so they can't escape without the modal
        window.history.pushState('trap', '', window.location.href);
        setShowExitModal(true);
      } else if (gameState !== 'MENU') {
        // Go back to MENU. Trap is already popped.
        setGameState('MENU');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gameState, setGameState]);

  /** 3. Intercepts F5 / Ctrl+R keys during active play */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      const isProtectedKey = 
        e.key === 'F5' || 
        (e.ctrlKey && e.key.toLowerCase() === 'r') || 
        (e.metaKey && e.key.toLowerCase() === 'r');
      
      if (isProtectedKey) {
        e.preventDefault();
        setShowExitModal(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  /** Auto-loads default trial question spreadsheet and waits for custom fonts */
  useEffect(() => {
    if (init) return;
    const loadDefaultData = async () => {
      try {
        if (!hasLoaded) {
          const [parsed] = await Promise.all([
            fetchExcelData(trialSheetUrl, seed),
            document.fonts ? document.fonts.ready : Promise.resolve()
          ]);
          loadQuestions(parsed);
          setHasLoaded();
        } else {
          // If we already loaded data from local storage, just wait for fonts
          await (document.fonts ? document.fonts.ready : Promise.resolve());
        }
      } catch (err) {
        console.error("Failed to load default trial excel:", err);
      } finally {
        setInit(true);
        
        // Remove preloader with fade out, then trigger bubble pop SFX and start lobby BGM
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.style.opacity = '0';
          setTimeout(() => {
            preloader.remove();
            playBubblePopSequence();
            startBgm();
          }, 500); // matches the transition duration in index.html
        } else {
          playBubblePopSequence();
          startBgm();
        }

        // Ensure we bypass SETUP since we auto-load, or if it fails they can go to Settings.
        if (gameState === 'SETUP') {
          setGameState('MENU');
        } else if (gameState === 'PLAYING') {
          // If we reloaded straight into a playing state, we show crash modal
          setShowCrashModal(true);
          // Automatically pause the Rapid Fire timer in the background
          useRapidFireStore.getState().setIsPaused(true);
          // If Spin Wheel was interrupted mid-spin, reset it so they can spin again
          const swStore = useSpinWheelStore.getState();
          if (swStore.swState === 'SPINNING') {
            swStore.setSwState('SPIN_DONE');
          }
        }
      }
    };
    loadDefaultData();
  }, [init, loadQuestions, setGameState, gameState, hasLoaded, setHasLoaded]);

  if (!init) {
    return null; // The true preloader in index.html is visible
  }

  /**
   * Renders modal dialog alerting presenter of a recovered game crash after page reload.
   */
  const renderCrashModal = () => {
    if (!showCrashModal) return null;
    return createPortal(
      <div className="modal-overlay">
        <div className="modal-box animate-pop-in" style={{ border: '1px solid var(--orange)' }}>
          <h2 className="modal-title">Crash Recovered</h2>
          <p className="modal-body">
            It looks like the app was closed unexpectedly during an active round. Do you want to resume?
          </p>
          <div className="modal-actions">
            <button 
              className="menu-btn" 
              onClick={() => {
                useRapidFireStore.getState().resetRf();
                useTicTacToeStore.getState().resetTtt();
                useSpinWheelStore.getState().resetSw();
                setGameState('MENU');
                setShowCrashModal(false);
              }}
              style={{ flex: 1, backgroundColor: 'var(--dark-teal)', color: 'var(--white)' }}
            >
              Main Menu
            </button>
            <button 
              className="menu-btn" 
              onClick={() => setShowCrashModal(false)}
              style={{ flex: 1, backgroundColor: 'var(--correct-green)', color: 'var(--dark-green)' }}
            >
              Resume
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  /**
   * Renders modal dialog confirming exit from an active round to prevent loss of score progress.
   */
  const renderExitModal = () => {
    if (!showExitModal) return null;
    return createPortal(
      <div className="modal-overlay">
        <div className="modal-box animate-pop-in">
          <h2 className="modal-title" style={{ color: 'var(--color-surface)' }}>Exit Round?</h2>
          <p className="modal-body" style={{ color: 'var(--color-secondary)' }}>Are you sure you want to leave? Your current round progress will be lost.</p>
          <div className="modal-actions" style={{ flexDirection: 'column' }}>
            <button className="menu-btn" style={{ padding: '15px', fontSize: '1.5rem', backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => {
              setShowExitModal(false);
              setGameState('MENU');
            }}>Yes, Quit</button>
            <button className="menu-btn" style={{ padding: '15px', fontSize: '1.5rem' }} onClick={() => setShowExitModal(false)}>Cancel</button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  /**
   * Evaluates `gameState` to return the appropriate React view component.
   */
  const renderScreen = () => {
    switch (gameState) {
      case 'MENU':
      case 'SETUP': // Fallback if stuck
        return <MenuScreen />;
      case 'START':
        return <StartScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      case 'LEADERBOARD':
        return <LeaderboardScreen />;
      case 'RULES':
        return <RulesScreen />;
      case 'ABOUT':
        return <AboutScreen />;
      case 'PLAYING':
        if (activeRound === 'RF') return <RapidFireScreen />;
        if (activeRound === 'SWJ') return <SpinWheelScreen />;
        if (activeRound === 'TTT') return <TicTacToeScreen />;
        if (activeRound === 'B') return <BuzzerScreen />;
        // Fallbacks
        return (
          <div className="projector-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="title">WORK IN PROGRESS</h1>
            <p style={{ color: 'var(--color-secondary)', fontSize: '2rem' }}>{activeRound}</p>
            <button className="menu-btn" onClick={() => setGameState('MENU')} style={{ marginTop: '40px' }}>Back to Menu</button>
          </div>
        );
      case 'END':
        return (
          <div className="projector-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="title" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>ROUND OVER</h1>
            <p style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-secondary)', marginBottom: '40px' }}>{activeRound}</p>
            
            <div style={{ transform: 'scale(1)', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 'clamp(30px, 8vh, 100px)' }}>
              <Scoreboard />
            </div>

            <button className="menu-btn" onClick={() => setGameState('MENU')} style={{ maxWidth: '300px' }}>
              Return to Menu
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-theme-wrapper">
      <ThemeOverlay />
      <div className="app-screen-layer">
        {renderScreen()}
      </div>
      {renderExitModal()}
      {renderCrashModal()}
    </div>
  );
}

export default App;

