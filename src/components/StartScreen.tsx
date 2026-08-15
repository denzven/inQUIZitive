import React, { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { playButtonClick } from '../utils/soundEffects';

/**
 * StartScreen Component.
 * Displays the list of selectable quiz rounds (Aptitude, Rapid Fire, Jeopardy, Tic-Tac-Toe, Buzzer)
 * with keyboard focus and accessibility arrow key navigation.
 */
export const StartScreen: React.FC = () => {
  const { setGameState, startRound } = useQuizStore();
  const [focusedIndex, setFocusedIndex] = useState<number>(1); // Default focus to Round 2 (Rapid Fire)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Data array defining available round titles and round codes */
  const roundsData = [
    { name: "Round 1: Aptitude (Offline)", code: null },
    { name: "Round 2: Rapid Fire", code: "RF" },
    { name: "Round 3: Jeopardy", code: "SWJ" },
    { name: "Round 4: Buzzer", code: "B" },
    { name: "Tie-Breaker: Tic-Tac-Toe", code: "TTT" }
  ];

  /** Auto-focus first enabled round button on mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      buttonRefs.current[1]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /** Handles arrow key navigation, number shortcuts, and Escape key */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        
        const currIndex = buttonRefs.current.findIndex(el => el === document.activeElement);
        const baseIndex = currIndex !== -1 ? currIndex : focusedIndex;
        
        let nextIndex = baseIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (baseIndex + 1) % roundsData.length;
        } else {
          nextIndex = (baseIndex - 1 + roundsData.length) % roundsData.length;
        }
        
        setFocusedIndex(nextIndex);
        buttonRefs.current[nextIndex]?.focus();
      } else if (e.key === '2') {
        e.preventDefault();
        playButtonClick();
        startRound('RF');
      } else if (e.key === '3') {
        e.preventDefault();
        playButtonClick();
        startRound('SWJ');
      } else if (e.key === '4') {
        e.preventDefault();
        playButtonClick();
        startRound('B');
      } else if (e.key === '5') {
        e.preventDefault();
        playButtonClick();
        startRound('TTT');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick();
        setGameState('MENU');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGameState, startRound, focusedIndex, roundsData.length]);

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
          {roundsData.map((round, idx) => {
            const isDisabled = round.code === null;
            const shortcutNum = idx + 1;
            const isFocused = focusedIndex === idx;

            return (
              <button 
                key={idx}
                ref={(el) => { buttonRefs.current[idx] = el; }}
                tabIndex={0}
                className="menu-btn"
                onClick={() => {
                  if (!isDisabled && round.code) {
                    playButtonClick();
                    startRound(round.code);
                  }
                }}
                onFocus={() => setFocusedIndex(idx)}
                title={isDisabled ? "Offline Aptitude Evaluation" : `${round.name} (Shortcut: ${shortcutNum})`}
                style={{ 
                  textAlign: 'center', 
                  backgroundColor: isDisabled ? 'var(--dark-teal)' : 'var(--teal)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.7 : 1,
                  transform: isDisabled ? 'none' : undefined,
                  border: isFocused ? '3px solid var(--yellow)' : undefined
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
