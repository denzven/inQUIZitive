import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuizStore } from './store/useQuizStore';
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

import { useRapidFireStore } from './store/useRapidFireStore';
import { useTicTacToeStore } from './store/useTicTacToeStore';
import { useSpinWheelStore } from './store/useSpinWheelStore';

function App() {
  const { gameState, setGameState, loadQuestions, activeRound, theme, hasLoaded, setHasLoaded } = useQuizStore();
  const [init, setInit] = useState(false);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--dark-green', theme.darkGreen);
    root.style.setProperty('--teal', theme.teal);
    root.style.setProperty('--dark-teal', theme.darkTeal);
    root.style.setProperty('--yellow', theme.yellow);
    root.style.setProperty('--light-orange', theme.lightOrange);
    root.style.setProperty('--orange', theme.orange);
    root.style.setProperty('--white', theme.white);
    root.style.setProperty('--correct-green', theme.correctGreen);
    root.style.setProperty('--wrong-red', theme.wrongRed);
  }, [theme]);

  // Reset scroll position on screen transitions
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

  // 1. Prevent Refresh / Tab Close (ONLY during PLAYING)
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

  // 2. Handle Back Button elegantly
  useEffect(() => {
    // If we transition FROM MENU to something else, push a dummy state to trap the back button.
    if (previousState.current === 'MENU' && gameState !== 'MENU') {
      window.history.pushState('trap', '', window.location.href);
    }
    previousState.current = gameState;
  }, [gameState]);

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

  // 3. Intercept F5 / Ctrl+R / Escape to show custom modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      const isProtectedKey = 
        e.key === 'Escape' ||
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

  // Auto-load bundled Excel file and wait for fonts
  useEffect(() => {
    if (init) return;
    const loadDefaultData = async () => {
      try {
        if (!hasLoaded) {
          const [parsed] = await Promise.all([
            fetchExcelData(trialSheetUrl),
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
        
        // Remove preloader with fade out
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.style.opacity = '0';
          setTimeout(() => {
            preloader.remove();
          }, 500); // matches the transition duration in index.html
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

  // Crash Modal
  const renderCrashModal = () => {
    if (!showCrashModal) return null;
    return createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, backdropFilter: 'blur(5px)', padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)' }}>
        <div className="animate-pop-in" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--dark-green)', margin: 0, padding: 'clamp(20px, 4vh, 40px)', borderRadius: '24px', border: '1px solid var(--orange)', textAlign: 'center', maxWidth: '90%', width: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
          <h2 style={{ color: 'var(--yellow)', marginBottom: '15px', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Crash Recovered</h2>
          <p style={{ color: 'var(--white)', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', marginBottom: '30px' }}>
            It looks like the app was closed unexpectedly during an active round. Do you want to resume?
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
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

  // Modal rendering logic
  const renderExitModal = () => {
    if (!showExitModal) return null;
    return createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, backdropFilter: 'blur(5px)', padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)' }}>
        <div className="animate-pop-in" style={{ position: 'absolute', top: '50%', left: '50%', backgroundColor: 'var(--dark-green)', margin: 0, padding: 'clamp(20px, 4vh, 40px)', borderRadius: '24px', border: '1px solid var(--teal)', textAlign: 'center', maxWidth: '90%', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
          <h2 style={{ color: 'var(--orange)', marginBottom: '15px', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Exit Round?</h2>
          <p style={{ color: 'var(--white)', marginBottom: '30px', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', opacity: 0.9 }}>Are you sure you want to leave? Your current round progress will be lost.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexDirection: 'column' }}>
            <button className="menu-btn" style={{ padding: '15px', fontSize: '1.5rem', backgroundColor: 'var(--wrong-red)', borderColor: 'var(--wrong-red)' }} onClick={() => {
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

  // Routing
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
            <p style={{ color: 'var(--yellow)', fontSize: '2rem' }}>{activeRound}</p>
            <button className="menu-btn" onClick={() => setGameState('MENU')} style={{ marginTop: '40px' }}>Back to Menu</button>
          </div>
        );
      case 'END':
        return (
          <div className="projector-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="title" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>ROUND OVER</h1>
            <p style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--yellow)', marginBottom: '40px' }}>{activeRound}</p>
            
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
    <>
      {renderScreen()}
      {renderExitModal()}
      {renderCrashModal()}
    </>
  );
}

export default App;
