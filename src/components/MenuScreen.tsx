import React, { useEffect } from 'react';
import { useQuizStore } from '../store/useQuizStore';


import { ScreenLayout } from './ScreenLayout';

export const MenuScreen: React.FC = () => {
  const { setGameState, hasLoaded, setHasLoaded } = useQuizStore();

  useEffect(() => {
    if (!hasLoaded) {
      const timer = setTimeout(() => {
        setHasLoaded();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded, setHasLoaded]);

  if (!hasLoaded) {
    return (
      <div className="projector-container" style={{ backgroundColor: 'var(--dark-green)' }}>
        <img 
          src="/Q.png" 
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
    >
      <div className="menu-grid animate-slide-up" style={{ zIndex: 1, animationDelay: '0.2s', boxSizing: 'border-box' }}>
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
    </ScreenLayout>
  );
};
