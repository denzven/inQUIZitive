import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

type BuzzerState = 'READY' | 'PLAYING';

export const BuzzerScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed } = useQuizStore();

  // 1. Data Setup (Buzzer round questions - max 20)
  const [buzzerQuestions] = useState(() => {
    const available = questions.filter(q => q.roundCode === 'B' && !q.used);
    return available.slice(0, 20);
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [buzzerState, setBuzzerState] = useState<BuzzerState>('READY');

  const currentQ = buzzerQuestions[currentIdx];

  // Mark question as used immediately when displayed/shown
  useEffect(() => {
    if (buzzerState === 'PLAYING' && currentQ && currentQ.index >= 0 && !currentQ.used) {
      markQuestionUsed(currentQ.index);
    }
  }, [buzzerState, currentIdx, currentQ, markQuestionUsed]);

  const handleNext = () => {
    if (currentIdx < buzzerQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswerRevealed(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setIsAnswerRevealed(false);
    }
  };

  const handleReveal = () => {
    setIsAnswerRevealed(true);
  };

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1, paddingBottom: '90px', boxSizing: 'border-box' }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '20px' }}>
          Buzzer Round
        </h1>

        {buzzerQuestions.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', color: 'var(--yellow)' }}>No Buzzer round questions loaded!</p>
          </div>
        ) : buzzerState === 'READY' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, margin: 'auto' }}>
            <button onClick={() => setBuzzerState('PLAYING')} style={{ padding: '20px 60px', fontSize: '3rem', backgroundColor: 'var(--teal)' }}>
              Start Quiz
            </button>
            <p style={{ color: 'var(--light-orange)', fontSize: '1.5rem', marginTop: '20px' }}>Press Start to begin.</p>
            <p style={{ color: 'var(--yellow)', fontSize: '1.5rem', marginTop: '20px' }}>Questions Loaded: {buzzerQuestions.length}</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>
            
            {/* QUESTION CARD */}
            <div className="card" style={{ 
              flex: 1,
              minHeight: 'clamp(150px, 20vh, 220px)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              textAlign: 'center', 
              position: 'relative',
              margin: '0 0 30px 0',
              padding: 'clamp(20px, 4vw, 40px)'
            }}>
              <div style={{ position: 'absolute', top: '15px', left: '25px', color: 'var(--light-orange)', fontSize: '1.3rem', fontWeight: 'bold' }}>
                Question {currentIdx + 1} / {buzzerQuestions.length}
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.2, color: 'var(--white)' }}>
                {currentQ.question}
              </h2>
            </div>

            {/* OPTIONS GRID */}
            <div className="options-grid" style={{ marginBottom: '40px' }}>
              {currentQ.options.map((opt, i) => {
                const isCorrect = opt === currentQ.answer;
                let bgColor = 'var(--dark-teal)';
                
                if (isAnswerRevealed && isCorrect) {
                  bgColor = 'var(--correct-green)';
                }

                return (
                  <div 
                    key={i} 
                    className="option-card"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span style={{ color: 'var(--yellow)', marginRight: '20px', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* CONTROLS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <button 
                onClick={handlePrev} 
                disabled={currentIdx === 0}
                style={{ 
                  padding: '15px 30px', 
                  fontSize: '1.5rem', 
                  backgroundColor: 'var(--dark-teal)',
                  opacity: currentIdx === 0 ? 0.5 : 1,
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={24} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Prev
              </button>

              <button 
                onClick={handleReveal} 
                style={{ 
                  padding: '20px 40px', 
                  fontSize: '1.8rem', 
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)'
                }}
              >
                <Eye size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                {isAnswerRevealed ? 'Answer Revealed' : 'Reveal Answer'}
              </button>

              <button 
                onClick={handleNext} 
                disabled={currentIdx === buzzerQuestions.length - 1}
                style={{ 
                  padding: '15px 30px', 
                  fontSize: '1.5rem', 
                  backgroundColor: 'var(--orange)',
                  opacity: currentIdx === buzzerQuestions.length - 1 ? 0.5 : 1,
                  cursor: currentIdx === buzzerQuestions.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next
                <ChevronRight size={24} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
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
    </ScreenLayout>
  );
};
