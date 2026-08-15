import React, { useEffect, useCallback } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { useBuzzerStore } from '../store/useBuzzerStore';
import { ScreenLayout } from './ScreenLayout';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { seededShuffle } from '../utils/random';
import { playCorrectFanfare, playWrongBuzz } from '../utils/soundEffects';

/**
 * BuzzerScreen Component.
 * Controls the Buzzer Round presentation view where questions are answered by the fastest team.
 * Manages question navigation, option verification, answer reveal, end-of-round overlay, and keyboard shortcuts.
 */
export const BuzzerScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, seed } = useQuizStore();
  const {
    buzzerQuestions, setBuzzerQuestions,
    currentIdx, setCurrentIdx,
    buzzerState, setBuzzerState,
    userAnswers, setUserAnswer,
    revealedQuestions, setQuestionRevealed,
    resetBuzzer
  } = useBuzzerStore();

  /** Data Setup: allocates up to 20 unused Buzzer round questions */
  useEffect(() => {
    if (buzzerQuestions.length === 0) {
      const available = questions.filter(q => q.roundCode === 'B' && !q.used);
      const shuffled = seededShuffle(available, `${seed}_buzzer`);
      setBuzzerQuestions(shuffled.slice(0, 20));
    }
  }, [buzzerQuestions.length, questions, setBuzzerQuestions, seed]);

  const currentQ = buzzerQuestions[currentIdx];

  /** Marks current question as used in global store immediately upon display */
  useEffect(() => {
    if (buzzerState === 'PLAYING' && currentQ && currentQ.index >= 0 && !currentQ.used) {
      markQuestionUsed(currentQ.index);
    }
  }, [buzzerState, currentIdx, currentQ, markQuestionUsed]);

  /** Navigates to next question index or finishes round on final question */
  const handleNext = useCallback(() => {
    if (currentIdx < buzzerQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setBuzzerState('END');
      playCorrectFanfare();
    }
  }, [currentIdx, buzzerQuestions.length, setCurrentIdx, setBuzzerState]);

  /** Navigates to previous question index */
  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  }, [currentIdx, setCurrentIdx]);

  /**
   * Records user option selection for current question.
   * 
   * @param optIdx - Selected option index
   */
  const handleOptionClick = useCallback((optIdx: number) => {
    if (!currentQ) return;
    const selectedOpt = currentQ.options[optIdx];
    if (selectedOpt === currentQ.answer) {
      playCorrectFanfare();
    } else {
      playWrongBuzz();
    }
    setUserAnswer(currentIdx, optIdx);
    setQuestionRevealed(currentIdx);
  }, [currentQ, currentIdx, setUserAnswer, setQuestionRevealed]);

  /** Reveals answer for current question */
  const handleReveal = useCallback(() => {
    if (currentQ) {
      setQuestionRevealed(currentIdx);
    }
  }, [currentQ, currentIdx, setQuestionRevealed]);

  /** Clears store state and returns to main menu screen */
  const handleReturnToMenu = useCallback(() => {
    resetBuzzer();
    setGameState('MENU');
  }, [resetBuzzer, setGameState]);

  /** Keyboard shortcuts listener (1-4 for options, Space for reveal, Arrows for navigation, Enter to start, Esc to home) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (buzzerState === 'READY') {
        if (e.key === 'Enter') {
          e.preventDefault();
          setBuzzerState('PLAYING');
        }
      } else if (buzzerState === 'PLAYING' && currentQ) {
        if (e.key === '1') handleOptionClick(0);
        if (e.key === '2') handleOptionClick(1);
        if (e.key === '3') handleOptionClick(2);
        if (e.key === '4') handleOptionClick(3);
        if (e.key === ' ') {
          e.preventDefault();
          handleReveal();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReturnToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzerState, currentQ, handleOptionClick, handleReveal, handlePrev, handleNext, handleReturnToMenu, setBuzzerState]);

  const isCurrentRevealed = !!revealedQuestions[currentIdx];

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={handleReturnToMenu}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, min(5vw, 4.5vh), 3.5rem)', marginBottom: 'clamp(6px, 1.2vh, 16px)' }}>
          Buzzer Round
        </h1>

        {/* EMPTY STATE */}
        {buzzerQuestions.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '650px', padding: '20px' }}>
            <div style={{
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              border: '2px solid var(--wrong-red)',
              borderRadius: '20px',
              padding: '24px 30px',
              boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)'
            }}>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--yellow)', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                ⚠️ No Unused Questions Available
              </p>
              <p style={{ color: 'var(--white)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: 0 }}>
                All Buzzer round (Code 'B') questions have already been used. Used questions are excluded to prevent repeats.
              </p>
            </div>
          </div>
        ) : buzzerState === 'READY' ? (
          /* READY STATE */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, margin: 'auto' }}>
            <button 
              onClick={() => setBuzzerState('PLAYING')} 
              title="Start Quiz (Shortcut: Enter)"
              style={{ 
                padding: 'clamp(12px, 2vh, 20px) clamp(30px, 5vw, 60px)', 
                fontSize: 'clamp(1.5rem, 4vw, 3rem)', 
                backgroundColor: 'var(--teal)' 
              }}
            >
              Start Quiz
            </button>
            <p style={{ color: 'var(--light-orange)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginTop: '15px' }}>Press Start or Enter to begin.</p>
            <p style={{ color: 'var(--yellow)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginTop: '10px' }}>Questions Loaded: {buzzerQuestions.length} / 20</p>
            
            {buzzerQuestions.length < 20 && (
              <div style={{
                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                border: '2px solid var(--wrong-red)',
                borderRadius: '16px',
                padding: '12px 24px',
                marginTop: '15px',
                maxWidth: '650px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(231, 76, 60, 0.25)'
              }}>
                <div style={{ color: 'var(--yellow)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>⚠️</span>
                  <span>Question Quantity Warning</span>
                </div>
                <p style={{ color: 'var(--white)', fontSize: 'clamp(0.85rem, 1.8vw, 1rem)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                  Only {buzzerQuestions.length} unused question(s) available (20 required). Used questions were excluded to prevent duplicates.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* PLAYING / QUESTION DISPLAY STATE */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px', boxSizing: 'border-box', borderRadius: '24px', padding: '10px' }}>
            
            {/* QUESTION CARD */}
            <div 
              className="card" 
              style={{ 
                flex: '1 1 0px', 
                margin: 'clamp(8px, 1.5vh, 18px) clamp(10px, 3vw, 50px)', 
                minHeight: 'clamp(100px, 16vh, 220px)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                textAlign: 'center', 
                position: 'relative', 
                padding: 'clamp(16px, 2.5vh, 30px)' 
              }}
            >
              <div style={{ position: 'absolute', top: '12px', left: '20px', color: 'var(--light-orange)', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', fontWeight: 'bold' }}>
                Question {currentIdx + 1} / {buzzerQuestions.length}
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.6rem)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.25 }}>
                {currentQ?.question}
              </h2>
            </div>

            {/* OPTIONS GRID */}
            <div className="options-grid">
              {currentQ?.options.map((opt, i) => {
                let bgColor = 'var(--dark-teal)';
                const currentSelectedOptIdx = userAnswers[currentIdx] ?? -1;
                const isSelected = i === currentSelectedOptIdx;
                const isRightAnswer = opt === currentQ.answer;

                if (isCurrentRevealed) {
                  if (isSelected) {
                    bgColor = isRightAnswer ? 'var(--correct-green)' : 'var(--wrong-red)';
                  } else if (isRightAnswer) {
                    bgColor = 'var(--correct-green)';
                  }
                }

                const optLetter = String.fromCharCode(65 + i);

                return (
                  <div 
                    key={i} 
                    role="button"
                    tabIndex={0}
                    className="option-card"
                    onClick={() => handleOptionClick(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOptionClick(i);
                      }
                    }}
                    title={`Option ${optLetter} (Shortcut: ${i + 1})`}
                    style={{ backgroundColor: bgColor, cursor: 'pointer' }}
                  >
                    <span style={{ color: 'var(--yellow)', marginRight: '20px', flexShrink: 0 }}>{optLetter}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* CONTROLS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'clamp(8px, 1.8vw, 20px)', marginTop: 'clamp(6px, 1.2vh, 14px)', flexShrink: 0 }}>
              <button 
                onClick={handlePrev} 
                disabled={currentIdx === 0}
                title="Previous Question (Shortcut: ←)"
                style={{ 
                  padding: 'clamp(8px, 1.4vh, 12px) clamp(14px, 2.5vw, 28px)', 
                  fontSize: 'clamp(0.95rem, 2vw, 1.4rem)', 
                  backgroundColor: 'var(--dark-teal)',
                  opacity: currentIdx === 0 ? 0.5 : 1,
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  borderRadius: '14px'
                }}
              >
                <ChevronLeft style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)', verticalAlign: 'middle', marginRight: '4px' }} />
                Prev
              </button>

              <button 
                onClick={handleReveal} 
                title="Reveal Answer (Shortcut: Space)"
                style={{ 
                  padding: 'clamp(10px, 1.6vh, 14px) clamp(18px, 3vw, 36px)', 
                  fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', 
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  borderRadius: '14px'
                }}
              >
                <Eye style={{ width: 'clamp(20px, 2.4vw, 26px)', height: 'clamp(20px, 2.4vw, 26px)', verticalAlign: 'middle', marginRight: '8px' }} />
                {isCurrentRevealed ? 'Answer Revealed' : 'Reveal Answer'}
              </button>

              <button 
                onClick={handleNext} 
                title={currentIdx === buzzerQuestions.length - 1 ? 'Finish Round (Shortcut: →)' : 'Next Question (Shortcut: →)'}
                style={{ 
                  padding: 'clamp(8px, 1.4vh, 12px) clamp(14px, 2.5vw, 28px)', 
                  fontSize: 'clamp(0.95rem, 2vw, 1.4rem)', 
                  backgroundColor: 'var(--orange)',
                  cursor: 'pointer',
                  borderRadius: '14px'
                }}
              >
                {currentIdx === buzzerQuestions.length - 1 ? 'Finish Round' : 'Next'}
                <ChevronRight style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)', verticalAlign: 'middle', marginLeft: '4px' }} />
              </button>
            </div>

          </div>
        )}

        {/* END STATE POPUP */}
        {buzzerState === 'END' && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 
          }}>
            <div className="card" style={{ 
              backgroundColor: 'var(--teal)', border: '5px solid var(--yellow)', borderRadius: '30px', 
              width: '90%', maxWidth: '800px', padding: '45px 30px', textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              animation: 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {/* INQUIZITIVE BRANDING LOGO */}
              <div className="title" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', margin: '0 0 10px 0', letterSpacing: '3px' }}>
                <span>IN</span><span>QUIZ</span><span>ITIVE</span>
              </div>

              {/* GIANT GAME OVER TITLE */}
              <h1 style={{ 
                fontSize: 'clamp(3.2rem, 8vw, 6rem)', 
                fontWeight: 900, 
                color: 'var(--yellow)', 
                textShadow: '0 0 25px rgba(244, 162, 97, 0.6), 0 4px 12px rgba(0,0,0,0.9)', 
                margin: '10px 0 20px 0', 
                letterSpacing: '4px',
                textTransform: 'uppercase'
              }}>
                GAME OVER
              </h1>

              <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', color: 'var(--white)', margin: '0 0 35px 0', opacity: 0.9 }}>
                Buzzer Round Completed!
              </p>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="menu-btn" 
                  onClick={() => setBuzzerState('PLAYING')} 
                  style={{ maxWidth: '240px', backgroundColor: 'var(--teal)', border: '2px solid var(--yellow)', padding: '14px 28px', fontSize: '1.2rem' }}
                >
                  Review Questions
                </button>
                <button 
                  className="menu-btn" 
                  onClick={handleReturnToMenu} 
                  style={{ maxWidth: '240px', backgroundColor: 'var(--orange)', padding: '14px 28px', fontSize: '1.2rem' }}
                >
                  Return to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM-LEFT INQUIZITIVE BRANDING */}
      <div style={{ 
        position: 'fixed', 
        bottom: 'clamp(15px, 3vh, 30px)', 
        left: 'clamp(20px, 4vw, 40px)', 
        zIndex: -1, 
        fontSize: 'clamp(1.6rem, 3.8vw, 2.8rem)', 
        fontWeight: 900, 
        letterSpacing: '3px', 
        userSelect: 'none',
        pointerEvents: 'none',
        opacity: 0.3
      }}>
        <span style={{ color: 'var(--white)' }}>IN</span>
        <span style={{ color: 'var(--yellow)' }}>QUIZ</span>
        <span style={{ color: 'var(--white)' }}>ITIVE</span>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </ScreenLayout>
  );
};
