import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { playButtonClick } from '../utils/soundEffects';

/**
 * StartScreen Component.
 * Displays the list of selectable quiz rounds (Aptitude, Rapid Fire, Jeopardy, Tic-Tac-Toe, Buzzer)
 * allowing the presenter to trigger specific game round sessions.
 */
export const StartScreen: React.FC = () => {
  const { setGameState, startRound } = useQuizStore();

  /** Data array defining available round titles and round codes */
  const roundsData = [
    { name: "Round 1: Aptitude (Offline)", code: null },
    { name: "Round 2: Rapid Fire", code: "RF" },
    { name: "Round 3: Jeopardy", code: "SWJ" },
    { name: "Round 4: Tic-Tac-Toe", code: "TTT" },
    { name: "Round 5: Buzzer", code: "B" }
  ];

  /** Decorative floating question marks for screen background */
  const questionMarksDecor = (
    <>
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '21%', left: '8%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.1s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--light-orange)', transform: 'rotate(20deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '42%', left: '97%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.2s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--yellow)', transform: 'rotate(-20deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '92%', left: '7%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.3s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--yellow)', transform: 'rotate(45deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '115%', left: '87%', transform: 'translate(-50%, -50%)', zIndex: 0, animationDelay: '0.4s' }}>
        <div style={{ fontSize: 'clamp(20rem, 50vw, 25rem)', color: 'var(--orange)', transform: 'rotate(-15deg)', opacity: 0.8, fontWeight: 900 }}>?</div>
      </div>
    </>
  );

  return (
    <ScreenLayout 
      backgroundDecor={questionMarksDecor}
      showHomeButton={true}
      onHomeClick={() => { playButtonClick(); setGameState('MENU'); }}
      showSettingsButton={true}
      onSettingsClick={() => { playButtonClick(); setGameState('SETTINGS'); }}
      hideTitle={true}
    >
      <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="animate-slide-up" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--white)', margin: 0, zIndex: 1 }}>{useQuizStore.getState().subtitle}</h2>
          <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(20px, 4vh, 40px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
        </div>

        <div className="menu-grid animate-slide-up" style={{ zIndex: 1, animationDelay: '0.2s', boxSizing: 'border-box', margin: 0 }}>
          {roundsData.map((round, idx) => {
            const isDisabled = round.code === null;
            return (
              <button 
                key={idx}
                className="menu-btn"
                onClick={() => {
                  if (!isDisabled && round.code) {
                    playButtonClick();
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
      </div>
    </ScreenLayout>
  );
};

