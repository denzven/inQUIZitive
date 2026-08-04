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
import { RapidFireScreen } from './components/RapidFireScreen';
import { SpinWheelScreen } from './components/SpinWheelScreen';

function App() {
  const { gameState, setGameState, loadQuestions, activeRound, theme } = useQuizStore();
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

  // Initialize keyboard controls
  useGameControls();

  const [showExitModal, setShowExitModal] = useState(false);
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

  // Auto-load bundled Excel file
  useEffect(() => {
    if (init) return;
    const loadDefaultData = async () => {
      try {
        const parsed = await fetchExcelData('/trial_iQz_sheet.xlsx');
        loadQuestions(parsed);
      } catch (err) {
        console.error("Failed to load default trial excel:", err);
      } finally {
        setInit(true);
        // Ensure we bypass SETUP since we auto-load, or if it fails they can go to Settings.
        if (gameState === 'SETUP') {
          setGameState('MENU');
        }
      }
    };
    loadDefaultData();
  }, [init, loadQuestions, setGameState, gameState]);

  if (!init) {
    return (
      <div className="projector-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      </div>
    );
  }

  // Modal rendering logic
  const renderExitModal = () => {
    if (!showExitModal) return null;
    return createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, backdropFilter: 'blur(5px)' }}>
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
      case 'ABOUT':
        return <AboutScreen />;
      case 'PLAYING':
        if (activeRound === 'RF') return <RapidFireScreen />;
        if (activeRound === 'SWJ') return <SpinWheelScreen />;
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
    </>
  );
}

export default App;
