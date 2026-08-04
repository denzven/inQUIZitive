import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Home } from 'lucide-react';

import { ScreenLayout } from './ScreenLayout';

export const StartScreen: React.FC = () => {
  const { setGameState, startRound } = useQuizStore();

  const roundsData = [
    { name: "Round 1: Aptitude (Offline)", code: null },
    { name: "Round 2: Rapid Fire", code: "RF" },
    { name: "Round 3: Jeopardy", code: "SWJ" },
    { name: "Round 4: Tic-Tac-Toe", code: "TTT" },
    { name: "Round 5: Buzzer", code: "B" }
  ];

  const questionMarksDecor = (
    <>
      <div className="animate-pop-in" style={{ position: 'absolute', top: '21%', left: '8%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.1s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--light-orange)', transform: 'rotate(20deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in" style={{ position: 'absolute', top: '42%', left: '97%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.2s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--yellow)', transform: 'rotate(-20deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in" style={{ position: 'absolute', top: '92%', left: '7%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.3s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--yellow)', transform: 'rotate(45deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in" style={{ position: 'absolute', top: '115%', left: '87%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.4s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--orange)', transform: 'rotate(-15deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
    </>
  );

  return (
    <ScreenLayout 
      backgroundDecor={questionMarksDecor}
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
    >
      <div className="menu-grid animate-slide-up" style={{ zIndex: 1, animationDelay: '0.2s', boxSizing: 'border-box' }}>
        {roundsData.map((round, idx) => {
          const isDisabled = round.code === null;
          return (
            <button 
              key={idx}
              className="menu-btn"
              onClick={() => {
                if (!isDisabled && round.code) {
                  startRound(round.code);
                }
              }}
              style={{ 
                textAlign: 'center', 
                backgroundColor: isDisabled ? 'var(--dark-teal)' : 'var(--teal)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.7 : 1,
                transform: isDisabled ? 'none' : undefined,
                boxShadow: isDisabled ? 'none' : undefined
              }}
              onMouseEnter={(e) => {
                if (isDisabled) e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {round.name}
            </button>
          );
        })}
      </div>
    </ScreenLayout>
  );
};
