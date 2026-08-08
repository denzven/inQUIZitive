import React, { useEffect } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { useBuzzerStore } from '../store/useBuzzerStore';
import { ScreenLayout } from './ScreenLayout';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { seededShuffle } from '../utils/random';

/**
 * BuzzerScreen Component.
 * Controls the Buzzer Round presentation view where questions are answered by the fastest team.
 * Manages question navigation, option verification, answer reveal, and keyboard shortcuts.
 */
export const BuzzerScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, seed } = useQuizStore();
  const {
    buzzerQuestions, setBuzzerQuestions,
    currentIdx, setCurrentIdx,
    buzzerState, setBuzzerState,
    userAnswers, setUserAnswer,
    revealedQuestions, setQuestionRevealed,
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

  /** Navigates to next question index */
  const handleNext = () => {
    if (currentIdx < buzzerQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  /** Navigates to previous question index */
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  /**
   * Records user option selection for current question.
   * 
   * @param optIdx - Selected option index
   */
  const handleOptionClick = (optIdx: number) => {
    if (!currentQ) return;
    setUserAnswer(currentIdx, optIdx);
    setQuestionRevealed(currentIdx);
  };

  /** Reveals answer for current question */
  const handleReveal = () => {
    setQuestionRevealed(currentIdx);
  };

  /** Keyboard shortcuts listener (1-4 for options, Space for reveal, Arrows for navigation, Esc to exit) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (buzzerState === 'PLAYING' && currentQ) {
        if (e.key === '1') handleOptionClick(0);
        if (e.key === '2') handleOptionClick(1);
        if (e.key === '3') handleOptionClick(2);
        if (e.key === '4') handleOptionClick(3);
        if (e.key === ' ') handleReveal();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
      if (e.key === 'Escape') setGameState('MENU');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzerState, currentQ, currentIdx, buzzerQuestions.length]);

  const isCurrentRevealed = !!revealedQuestions[currentIdx];
  const selectedOptIdx = userAnswers[currentIdx] ?? -1;

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1, boxSizing: 'border-box' }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, min(5vw, 4.5vh), 3.5rem)', marginBottom: 'clamp(6px, 1.2vh, 16px)' }}>
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
                const isRightAnswer = opt === currentQ.answer;
                const isSelected = i === selectedOptIdx;
                let bgColor = 'var(--dark-teal)';
                
                if (isCurrentRevealed) {
                  if (isSelected) {
                    bgColor = isRightAnswer ? 'var(--correct-green)' : 'var(--wrong-red)';
                  } else if (isRightAnswer) {
                    bgColor = 'var(--correct-green)';
                  }
                }

                return (
                  <div 
                    key={i} 
                    className="option-card"
                    onClick={() => handleOptionClick(i)}
                    style={{ backgroundColor: bgColor, cursor: 'pointer' }}
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
                {isCurrentRevealed ? 'Answer Revealed' : 'Reveal Answer'}
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

