import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { Home, Settings, Play, Pause } from 'lucide-react';

type RFState = 'READY' | 'PLAYING' | 'FEEDBACK' | 'END';

export const RapidFireScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed } = useQuizStore();

  // 1. Data Setup (Max 10 unused RF questions)
  const rfQuestions = useMemo(() => {
    const available = questions.filter(q => q.roundCode === 'RF' && !q.used);
    // Shuffle logic (deterministic by random is fine for now, or just slice since excelParser shuffled)
    return available.slice(0, 10);
  }, [questions]);

  // 2. Local State
  const [rfState, setRfState] = useState<RFState>('READY');
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number>(-1);
  const [isCorrect, setIsCorrect] = useState(false);

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

  // 5. Answer Handler
  const handleAnswer = useCallback((optIndex: number) => {
    if (rfState !== 'PLAYING' || isPaused) return;
    
    const currentQ = rfQuestions[currentIdx];
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);
    markQuestionUsed(currentQ.index);

    if (correct) {
      setScore(prev => prev + currentQ.scoreVal);
      setCorrectCount(prev => prev + 1);
    }

    setRfState('FEEDBACK');
  }, [rfState, isPaused, rfQuestions, currentIdx, markQuestionUsed]);

  // 6. Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rfState === 'PLAYING' && !isPaused) {
        if (e.key === '1') handleAnswer(0);
        if (e.key === '2') handleAnswer(1);
        if (e.key === '3') handleAnswer(2);
        if (e.key === '4') handleAnswer(3);
      }
      if (e.key === 'Escape') setGameState('MENU');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfState, isPaused, handleAnswer, setGameState]);

  const bonus = useMemo(() => {
    if (correctCount === rfQuestions.length && rfQuestions.length >= 5) return 20;
    if (correctCount > 5) return 10;
    return 0;
  }, [correctCount, rfQuestions.length]);

  const currentQ = rfQuestions[currentIdx];

  return (
    <div className="projector-container">
      {/* Header & Nav */}
      <div style={{ position: 'absolute', top: '50px', left: '50px', display: 'flex', gap: '20px', zIndex: 10 }}>
        <button 
          onClick={() => setGameState('MENU')} 
          style={{ width: '80px', height: '80px', borderRadius: '15px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          aria-label="Home"
        >
          <Home size={40} color="var(--dark-green)" strokeWidth={3} />
        </button>
        <button 
          onClick={() => setGameState('SETTINGS')} 
          style={{ width: '80px', height: '80px', borderRadius: '15px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          aria-label="Settings"
        >
          <Settings size={40} color="var(--dark-green)" strokeWidth={3} />
        </button>
      </div>

      <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>Rapid Fire Round</h1>

      {/* READY STATE */}
      {rfState === 'READY' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <button onClick={() => setRfState('PLAYING')} style={{ padding: '20px 60px', fontSize: '3rem', backgroundColor: 'var(--teal)' }}>
            Start Timer
          </button>
          <p style={{ color: 'var(--light-orange)', fontSize: '1.5rem', marginTop: '20px' }}>Press Start to begin 60s timer.</p>
          <p style={{ color: 'var(--yellow)', fontSize: '1.5rem', marginTop: '40px' }}>Questions Loaded: {rfQuestions.length}</p>
        </div>
      )}

      {/* PLAYING / FEEDBACK STATE */}
      {(rfState === 'PLAYING' || rfState === 'FEEDBACK') && currentQ && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 clamp(20px, 5vw, 100px)', alignItems: 'center' }}>
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

          <div className="card" style={{ margin: '20px clamp(20px, 5vw, 100px)', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '25px', color: 'var(--light-orange)', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {currentIdx + 1}/{rfQuestions.length}
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0 }}>{currentQ.question}</h2>
          </div>

          <div className="options-grid">
            {currentQ.options.map((opt, i) => {
              let bgColor = 'rgba(42, 157, 143, 0.5)';
              if (rfState === 'FEEDBACK' && i === selectedOptIdx) {
                bgColor = isCorrect ? 'var(--correct-green)' : 'var(--wrong-red)';
              }

              return (
                <div 
                  key={i} 
                  className="option-card"
                  onClick={() => handleAnswer(i)}
                  style={{ backgroundColor: bgColor }}
                >
                  <span style={{ color: 'var(--yellow)', marginRight: '20px' }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* END STATE POPUP */}
      {rfState === 'END' && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 
        }}>
          <div className="card" style={{ 
            backgroundColor: 'var(--teal)', border: '5px solid var(--yellow)', borderRadius: '30px', 
            width: '90%', maxWidth: '800px', padding: '60px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4rem)', color: 'var(--white)', margin: '0 0 40px 0' }}>TIME UP!</h2>
            <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--white)' }}>Correct Answers: {correctCount}/{rfQuestions.length}</p>
            <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--yellow)', margin: '20px 0 40px 0' }}>Bonus: +{bonus}</p>
            <p style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--white)', fontWeight: 'bold' }}>Total: {score + bonus}</p>
            <p style={{ color: 'var(--light-orange)', marginTop: '40px', fontSize: '1.2rem' }}>Press ESC to return to Menu</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
