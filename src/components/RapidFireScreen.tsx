import React, { useEffect, useMemo, useCallback } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Play, Pause } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';

import { useRapidFireStore } from '../store/useRapidFireStore';

export const RapidFireScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed } = useQuizStore();

  // Use the persisted Rapid Fire store
  const {
    rfQuestions, setRfQuestions,
    rfState, setRfState,
    timer, setTimer,
    isPaused, setIsPaused,
    currentIdx, setCurrentIdx,
    score, setScore,
    correctCount, setCorrectCount,
    selectedOptIdx, setSelectedOptIdx,
    isCorrect, setIsCorrect,
    resetRf
  } = useRapidFireStore();

  // Initialize questions ONLY if we haven't already (prevents overwriting on crash recovery)
  useEffect(() => {
    if (rfQuestions.length === 0) {
      const available = questions.filter(q => q.roundCode === 'RF' && !q.used);
      setRfQuestions(available.slice(0, 10));
    }
  }, [rfQuestions.length, questions, setRfQuestions]);

  // 3. Timer Logic
  useEffect(() => {
    let interval: number | undefined;
    if (rfState === 'PLAYING' && !isPaused && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setRfState('END');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rfState, isPaused, timer]);

  // 4. Feedback Auto-Advance Logic
  useEffect(() => {
    if (rfState === 'FEEDBACK' && !isPaused) {
      const timeout = setTimeout(() => {
        if (currentIdx + 1 < rfQuestions.length && timer > 0) {
          setRfState('PLAYING');
          setCurrentIdx(prev => prev + 1);
          setSelectedOptIdx(-1);
        } else {
          setRfState('END');
        }
      }, 750);
      return () => clearTimeout(timeout);
    }
  }, [rfState, isPaused, currentIdx, rfQuestions.length, timer]);

  // Mark question as used as soon as it is shown to the user
  useEffect(() => {
    if ((rfState === 'PLAYING' || rfState === 'FEEDBACK') && rfQuestions[currentIdx]) {
      const q = rfQuestions[currentIdx];
      if (q.index >= 0 && !q.used) {
        markQuestionUsed(q.index);
      }
    }
  }, [rfState, currentIdx, rfQuestions, markQuestionUsed]);

  // 5. Answer Handler
  const handleAnswer = useCallback((optIndex: number) => {
    if (rfState !== 'PLAYING' || isPaused) return;
    
    const currentQ = rfQuestions[currentIdx];
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + currentQ.scoreVal);
      setCorrectCount(prev => prev + 1);
    }

    setRfState('FEEDBACK');
  }, [rfState, isPaused, rfQuestions, currentIdx]);

  // 6. Keyboard Controls
  // 7. Cleanup & Return Handler
  const handleReturnToMenu = useCallback(() => {
    resetRf();
    setGameState('MENU');
  }, [resetRf, setGameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rfState === 'PLAYING' && !isPaused) {
        if (e.key === '1') handleAnswer(0);
        if (e.key === '2') handleAnswer(1);
        if (e.key === '3') handleAnswer(2);
        if (e.key === '4') handleAnswer(3);
      }
      if (e.key === 'Escape') handleReturnToMenu();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfState, isPaused, handleAnswer, handleReturnToMenu]);

  const bonus = useMemo(() => {
    if (correctCount === rfQuestions.length && rfQuestions.length >= 5) return 20;
    if (correctCount > 5) return 10;
    return 0;
  }, [correctCount, rfQuestions.length]);

  const currentQ = rfQuestions[currentIdx];

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={handleReturnToMenu}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '20px' }}>
          Rapid Fire Round
        </h1>

        {/* READY STATE */}
        {rfState === 'READY' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, margin: 'auto' }}>
            <button onClick={() => setRfState('PLAYING')} style={{ padding: '20px 60px', fontSize: '3rem', backgroundColor: 'var(--teal)' }}>
              Start Timer
            </button>
            <p style={{ color: 'var(--light-orange)', fontSize: '1.5rem', marginTop: '20px' }}>Press Start to begin 60s timer.</p>
            <p style={{ color: 'var(--yellow)', fontSize: '1.5rem', marginTop: '20px' }}>Questions Loaded: {rfQuestions.length}</p>
          </div>
        )}

        {/* PLAYING / FEEDBACK STATE */}
        {(rfState === 'PLAYING' || rfState === 'FEEDBACK') && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px', paddingBottom: '90px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 clamp(10px, 3vw, 50px)', alignItems: 'center' }}>
              <div className="card" style={{ padding: '10px 30px', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                Score: {score}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ 
                  fontSize: 'clamp(3rem, 6vw, 4rem)', 
                  fontWeight: 900, 
                  color: isPaused ? 'var(--wrong-red)' : timer <= 10 ? 'var(--orange)' : 'var(--white)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {timer}s
                </div>
                <button onClick={() => setIsPaused(!isPaused)} style={{ padding: '15px', borderRadius: '20px', backgroundColor: isPaused ? 'var(--yellow)' : 'var(--orange)' }}>
                  {isPaused ? <Play size={32} color="var(--dark-green)" /> : <Pause size={32} color="var(--white)" />}
                </button>
              </div>
            </div>

            <div className="card" style={{ margin: '20px clamp(10px, 3vw, 50px)', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '25px', color: 'var(--light-orange)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {currentIdx + 1}/{rfQuestions.length}
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.2 }}>{currentQ.question}</h2>
            </div>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                let bgColor = 'var(--dark-teal)';
                const isSelected = i === selectedOptIdx;
                const isRightAnswer = opt === currentQ.answer;

                if (rfState === 'FEEDBACK') {
                  if (isSelected) {
                    bgColor = isCorrect ? 'var(--correct-green)' : 'var(--wrong-red)';
                  } else if (!isCorrect && isRightAnswer) {
                    bgColor = 'var(--correct-green)';
                  }
                }

                return (
                  <div 
                    key={i} 
                    className="option-card"
                    onClick={() => handleAnswer(i)}
                    style={{ backgroundColor: bgColor }}
                  >
                    <span style={{ color: 'var(--yellow)', marginRight: '20px', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
                  </div>
                );
              })}
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
              <button 
                className="menu-btn" 
                onClick={handleReturnToMenu} 
                style={{ marginTop: '30px', maxWidth: '300px', backgroundColor: 'var(--orange)' }}
              >
                Return to Menu
              </button>
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
