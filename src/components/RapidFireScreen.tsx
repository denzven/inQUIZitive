import React, { useEffect, useMemo, useCallback } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Play, Pause, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { QuestionImage } from './QuestionImage';
import { useRapidFireStore } from '../store/useRapidFireStore';
import { seededShuffle } from '../utils/random';
import { playTickTock, playCorrectFanfare, playWrongBuzz, playBuzzerLockout, playTileChime } from '../utils/soundEffects';
import { preloadQuestionImages } from '../utils/imagePreloader';

/**
 * RapidFireScreen Component.
 * Manages the high-intensity Rapid Fire round where a contestant must answer up to 10 questions in 60 seconds.
 * Handles countdown timer tick, pause/resume, pass & revisit queue, feedback state, bonus point calculation, and answer verification.
 */
export const RapidFireScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, seed } = useQuizStore();

  // Use the persisted Rapid Fire store
  const {
    rfQuestions, setRfQuestions,
    rfState, setRfState,
    timer, setTimer,
    isPaused, setIsPaused,
    currentIdx, setCurrentIdx,
    score, setScore,
    correctCount, setCorrectCount,
    setSelectedOptIdx,
    setIsCorrect,
    userAnswers, setUserAnswer,
    revealedQuestions, setQuestionRevealed,
    passedQuestions, passQuestion, removePassQuestion,
    resetRf
  } = useRapidFireStore();

  /** Initializes Rapid Fire questions array from available unused RF round questions */
  useEffect(() => {
    if (rfQuestions.length === 0) {
      const available = questions.filter(q => q.roundCode === 'RF' && !q.used);
      const shuffled = seededShuffle(available, `${seed}_rf`);
      const selected = shuffled.slice(0, 10);
      setRfQuestions(selected);
      preloadQuestionImages(selected);
    } else {
      preloadQuestionImages(rfQuestions);
    }
  }, [rfQuestions.length, questions, setRfQuestions, seed]);


  /** 60-second countdown timer effect with synthesized tick-tock audio running continuously in background */
  useEffect(() => {
    let interval: number | undefined;
    if ((rfState === 'PLAYING' || rfState === 'FEEDBACK') && !isPaused && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            playBuzzerLockout();
            setRfState('END');
            return 0;
          }
          const nextTimer = prev - 1;
          playTickTock(nextTimer % 2 === 1, nextTimer <= 10);
          return nextTimer;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rfState, isPaused, timer, setTimer, setRfState]);

  /** Feedback delay effect before automatically advancing to next question */
  /** Feedback delay effect before automatically advancing to next question */
  useEffect(() => {
    if (rfState === 'FEEDBACK' && !isPaused) {
      const timeout = setTimeout(() => {
        const answeredCount = Object.keys(userAnswers).length;
        if (answeredCount >= rfQuestions.length) {
          setRfState('END');
          return;
        }

        // Find next unanswered question
        let nextIdx = -1;
        for (let i = currentIdx + 1; i < rfQuestions.length; i++) {
          if (userAnswers[i] === undefined && !passedQuestions[i]) {
            nextIdx = i;
            break;
          }
        }
        if (nextIdx === -1) {
          for (let i = 0; i < rfQuestions.length; i++) {
            if (userAnswers[i] === undefined && !passedQuestions[i]) {
              nextIdx = i;
              break;
            }
          }
        }
        // Revisit passed questions if no fresh questions remain
        if (nextIdx === -1) {
          for (let i = 0; i < rfQuestions.length; i++) {
            if (userAnswers[i] === undefined) {
              nextIdx = i;
              break;
            }
          }
        }

        if (nextIdx !== -1 && timer > 0) {
          setRfState('PLAYING');
          setCurrentIdx(nextIdx);
        } else {
          setRfState('END');
        }
      }, 750);
      return () => clearTimeout(timeout);
    }
  }, [rfState, isPaused, currentIdx, rfQuestions.length, timer, userAnswers, passedQuestions, setRfState, setCurrentIdx]);

  /** Marks current question as used in global store upon display */
  useEffect(() => {
    if ((rfState === 'PLAYING' || rfState === 'FEEDBACK') && rfQuestions[currentIdx]) {
      const q = rfQuestions[currentIdx];
      if (q.index >= 0 && !q.used) {
        markQuestionUsed(q.index);
      }
    }
  }, [rfState, currentIdx, rfQuestions, markQuestionUsed]);

  /**
   * Handles contestant answer selection for option index, updating score and triggering feedback phase.
   * 
   * @param optIndex - Selected option index (0 to 3)
   */
  const handleAnswer = useCallback((optIndex: number) => {
    (document.activeElement as HTMLElement)?.blur();
    if ((rfState !== 'PLAYING' && rfState !== 'FEEDBACK') || isPaused) return;
    
    const currentQ = rfQuestions[currentIdx];
    if (!currentQ) return;
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    if (correct) {
      playCorrectFanfare();
    } else {
      playWrongBuzz();
    }

    if (userAnswers[currentIdx] === undefined) {
      if (correct) {
        setScore(prev => prev + currentQ.scoreVal);
        setCorrectCount(prev => prev + 1);
      }
    }

    // Remove from passed queue if answered
    if (passedQuestions[currentIdx]) {
      removePassQuestion(currentIdx);
    }

    setUserAnswer(currentIdx, optIndex);
    setQuestionRevealed(currentIdx);
    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);

    setRfState('FEEDBACK');
  }, [rfState, isPaused, rfQuestions, currentIdx, userAnswers, passedQuestions, removePassQuestion, setUserAnswer, setQuestionRevealed, setSelectedOptIdx, setIsCorrect, setScore, setCorrectCount, setRfState]);

  /** Passes current question and advances to next unanswered/unpassed question */
  const handlePass = useCallback(() => {
    if ((rfState !== 'PLAYING' && rfState !== 'FEEDBACK') || isPaused) return;

    passQuestion(currentIdx);
    playTileChime(0);

    // 1. Look for un-answered AND un-passed question after currentIdx
    let nextIdx = -1;
    for (let i = currentIdx + 1; i < rfQuestions.length; i++) {
      if (userAnswers[i] === undefined && !passedQuestions[i]) {
        nextIdx = i;
        break;
      }
    }
    // 2. Wrap around from start for un-answered AND un-passed question
    if (nextIdx === -1) {
      for (let i = 0; i < currentIdx; i++) {
        if (userAnswers[i] === undefined && !passedQuestions[i]) {
          nextIdx = i;
          break;
        }
      }
    }
    // 3. Revisit next passed question if all fresh questions attempted
    if (nextIdx === -1) {
      for (let i = currentIdx + 1; i < rfQuestions.length; i++) {
        if (userAnswers[i] === undefined) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx === -1) {
        for (let i = 0; i <= currentIdx; i++) {
          if (userAnswers[i] === undefined) {
            nextIdx = i;
            break;
          }
        }
      }
    }

    if (nextIdx !== -1) {
      setRfState('PLAYING');
      setCurrentIdx(nextIdx);
    }
  }, [rfState, isPaused, currentIdx, rfQuestions.length, userAnswers, passedQuestions, passQuestion, setRfState, setCurrentIdx]);

  const currentQ = rfQuestions[currentIdx];

  /** Navigates to previous question index */
  const handlePrev = useCallback(() => {
    (document.activeElement as HTMLElement)?.blur();
    setRfState('PLAYING');
    setSelectedOptIdx(-1);
    setIsCorrect(false);
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  }, [currentIdx, setCurrentIdx, setRfState, setSelectedOptIdx, setIsCorrect]);

  /** Navigates to next question index, automatically passing if unanswered */
  const handleNext = useCallback(() => {
    (document.activeElement as HTMLElement)?.blur();
    setRfState('PLAYING');
    setSelectedOptIdx(-1);
    setIsCorrect(false);
    if (userAnswers[currentIdx] === undefined) {
      handlePass();
    } else {
      if (currentIdx < rfQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }
  }, [currentIdx, rfQuestions.length, userAnswers, handlePass, setCurrentIdx, setRfState, setSelectedOptIdx, setIsCorrect]);

  /** Reveals answer for current question */
  const handleReveal = useCallback(() => {
    (document.activeElement as HTMLElement)?.blur();
    if (currentQ) {
      setQuestionRevealed(currentIdx);
    }
  }, [currentQ, currentIdx, setQuestionRevealed]);

  /** Clears store state and returns to main menu screen */
  const handleReturnToMenu = useCallback(() => {
    resetRf();
    setGameState('MENU');
  }, [resetRf, setGameState]);

  /** Binds keyboard shortcuts (1-4 for options, X to pass, K to pause/resume, Space to reveal, Arrows to navigate, Enter to start, Esc to return) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const lowerKey = e.key.toLowerCase();

      if (lowerKey === 'x') {
        if (rfState === 'PLAYING' || rfState === 'FEEDBACK') {
          e.preventDefault();
          handlePass();
        }
      } else if (lowerKey === 'k') {
        if (rfState === 'PLAYING' || rfState === 'FEEDBACK') {
          e.preventDefault();
          setIsPaused(!isPaused);
        }
      } else if (rfState === 'READY') {
        if (e.key === 'Enter') {
          e.preventDefault();
          setRfState('PLAYING');
        }
      } else if ((rfState === 'PLAYING' || rfState === 'FEEDBACK') && !isPaused) {
        if (e.key === '1') handleAnswer(0);
        if (e.key === '2') handleAnswer(1);
        if (e.key === '3') handleAnswer(2);
        if (e.key === '4') handleAnswer(3);
      }
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
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReturnToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfState, isPaused, handleAnswer, handlePass, handleReveal, handlePrev, handleNext, handleReturnToMenu, setRfState, setIsPaused]);

  /** Computes accuracy bonus score */
  const bonus = useMemo(() => {
    if (correctCount === rfQuestions.length && rfQuestions.length >= 5) return 20;
    if (correctCount > 5) return 10;
    return 0;
  }, [correctCount, rfQuestions.length]);

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
          Rapid Fire Round
        </h1>

        {/* READY STATE */}
        {rfState === 'READY' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, margin: 'auto' }}>
            {rfQuestions.length > 0 ? (
              <>
                <button 
                  onClick={() => setRfState('PLAYING')} 
                  title="Start Timer (Shortcut: Enter)"
                  style={{ padding: 'clamp(12px, 2vh, 20px) clamp(30px, 5vw, 60px)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', backgroundColor: 'var(--teal)' }}
                >
                  Start Timer
                </button>
                <p style={{ color: 'var(--light-orange)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginTop: '15px' }}>Press Start or Enter to begin 60s timer.</p>
                <p style={{ color: 'var(--yellow)', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginTop: '10px' }}>Questions Loaded: {rfQuestions.length} / 10</p>

                {rfQuestions.length < 10 && (
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
                      Only {rfQuestions.length} unused question(s) available (10 required). Used questions were excluded to prevent duplicates.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                border: '2px solid var(--wrong-red)',
                borderRadius: '20px',
                padding: '24px 30px',
                maxWidth: '650px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(231, 76, 60, 0.3)'
              }}>
                <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--yellow)', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  ⚠️ No Unused Questions Available
                </p>
                <p style={{ color: 'var(--white)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: 0 }}>
                  All Rapid Fire round (Code 'RF') questions have already been used. Used questions are excluded to prevent repeats.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PLAYING / FEEDBACK STATE */}
        {(rfState === 'PLAYING' || rfState === 'FEEDBACK') && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px', boxSizing: 'border-box', borderRadius: '24px', padding: '10px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 clamp(10px, 3vw, 50px)', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="card" style={{ padding: '6px 20px', margin: 0, fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 'bold', borderRadius: '14px' }}>
                  Score: {score}
                </div>
                {Object.keys(passedQuestions).length > 0 && (
                  <div className="card" style={{ padding: '6px 16px', margin: 0, fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)', fontWeight: 'bold', borderRadius: '14px', backgroundColor: 'var(--dark-teal)', color: 'var(--yellow)' }}>
                    Passed: {Object.keys(passedQuestions).length}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 25px)' }}>
                <div 
                  role="timer"
                  aria-live={timer <= 10 ? "assertive" : "off"}
                  aria-valuenow={timer}
                  aria-valuemin={0}
                  aria-valuemax={60}
                  style={{ 
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', 
                    fontWeight: 900, 
                    color: isPaused ? 'var(--wrong-red)' : timer <= 10 ? 'var(--orange)' : 'var(--white)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {timer}s
                </div>
                <button 
                  onClick={() => setIsPaused(!isPaused)} 
                  title={isPaused ? "Resume Timer (Shortcut: K)" : "Pause Timer (Shortcut: K)"}
                  style={{ padding: '8px 12px', borderRadius: '14px', backgroundColor: isPaused ? 'var(--yellow)' : 'var(--orange)' }}
                >
                  {isPaused ? <Play style={{ width: 'clamp(20px, 2.5vw, 28px)', height: 'clamp(20px, 2.5vw, 28px)' }} color="var(--dark-green)" /> : <Pause style={{ width: 'clamp(20px, 2.5vw, 28px)', height: 'clamp(20px, 2.5vw, 28px)' }} color="var(--white)" />}
                </button>
              </div>
            </div>

            <div className="card" style={{ flex: '1 1 0px', margin: 'clamp(8px, 1.5vh, 18px) clamp(10px, 3vw, 50px)', minHeight: 'clamp(100px, 16vh, 220px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', padding: 'clamp(16px, 2.5vh, 30px)' }}>
              <div style={{ position: 'absolute', top: '12px', left: '20px', color: 'var(--color-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Question {currentIdx + 1} / {rfQuestions.length}</span>
                {passedQuestions[currentIdx] && (
                  <span style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-surface)', padding: '2px 10px', borderRadius: '10px', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                    PASSED - REVISIT
                  </span>
                )}
              </div>
              {currentQ.image && <QuestionImage src={currentQ.image} maxHeight="160px" style={{ marginTop: '24px' }} />}
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.6rem)', color: 'var(--color-surface)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.25 }}>{currentQ.question}</h2>
            </div>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                let bgColor = 'var(--color-primary-container)';
                const isCurrentRevealed = !!revealedQuestions[currentIdx];
                const currentSelectedOptIdx = userAnswers[currentIdx] ?? -1;
                const isSelected = i === currentSelectedOptIdx;
                const isRightAnswer = opt === currentQ.answer;

                if (isCurrentRevealed || (rfState === 'FEEDBACK' && currentSelectedOptIdx !== -1)) {
                  if (isSelected) {
                    bgColor = isRightAnswer ? 'var(--color-success)' : 'var(--color-danger)';
                  } else if (isRightAnswer) {
                    bgColor = 'var(--color-success)';
                  }
                }

                const optLetter = String.fromCharCode(65 + i);

                return (
                  <div 
                    key={i} 
                    role="button"
                    tabIndex={0}
                    className="option-card"
                    onClick={() => handleAnswer(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAnswer(i);
                      }
                    }}
                    title={`Option ${optLetter} (Shortcut: ${i + 1})`}
                    style={{ backgroundColor: bgColor, color: 'var(--color-surface)', cursor: 'pointer' }}
                  >
                    <span style={{ color: 'var(--color-accent)', marginRight: '20px', flexShrink: 0 }}>{optLetter}</span>
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
                  backgroundColor: 'var(--color-primary-container)',
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
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary-dark)',
                  borderRadius: '14px'
                }}
              >
                <Eye style={{ width: 'clamp(20px, 2.4vw, 26px)', height: 'clamp(20px, 2.4vw, 26px)', verticalAlign: 'middle', marginRight: '8px' }} color="var(--color-primary-dark)" />
                {revealedQuestions[currentIdx] || rfState === 'FEEDBACK' ? 'Answer Revealed' : 'Reveal Answer'}
              </button>

              <button 
                onClick={handleNext} 
                disabled={currentIdx === rfQuestions.length - 1 && userAnswers[currentIdx] !== undefined}
                title={userAnswers[currentIdx] === undefined ? "Pass Question & Advance (Shortcut: →)" : "Next Question (Shortcut: →)"}
                style={{ 
                  padding: 'clamp(8px, 1.4vh, 12px) clamp(14px, 2.5vw, 28px)', 
                  fontSize: 'clamp(0.95rem, 2vw, 1.4rem)', 
                  backgroundColor: 'var(--orange)',
                  color: 'var(--white)',
                  fontWeight: 'bold',
                  opacity: (currentIdx === rfQuestions.length - 1 && userAnswers[currentIdx] !== undefined) ? 0.5 : 1,
                  cursor: (currentIdx === rfQuestions.length - 1 && userAnswers[currentIdx] !== undefined) ? 'not-allowed' : 'pointer',
                  borderRadius: '14px'
                }}
              >
                {userAnswers[currentIdx] === undefined ? 'Pass' : 'Next'}
                <ChevronRight style={{ width: 'clamp(18px, 2.2vw, 24px)', height: 'clamp(18px, 2.2vw, 24px)', verticalAlign: 'middle', marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        )}

        {/* END STATE POPUP */}
        {rfState === 'END' && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 
          }}>
            <div className="card" style={{ 
              backgroundColor: 'var(--teal)', border: '5px solid var(--yellow)', borderRadius: '30px', 
              width: '90%', maxWidth: '800px', padding: '40px', textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', color: 'var(--white)', margin: '0 0 20px 0' }}>TIME UP!</h2>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--white)', margin: '10px 0' }}>Correct Answers: {correctCount}/{rfQuestions.length}</p>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--yellow)', margin: '10px 0 20px 0' }}>Bonus: +{bonus}</p>
              <p style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--white)', fontWeight: 'bold', margin: '10px 0' }}>Total: {score + bonus}</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                <button 
                  className="menu-btn" 
                  onClick={() => { setRfState('PLAYING'); setIsPaused(true); }} 
                  style={{ maxWidth: '240px', backgroundColor: 'var(--teal)', border: '2px solid var(--yellow)' }}
                >
                  Review Questions
                </button>
                <button 
                  className="menu-btn" 
                  onClick={handleReturnToMenu} 
                  style={{ maxWidth: '240px', backgroundColor: 'var(--orange)' }}
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

