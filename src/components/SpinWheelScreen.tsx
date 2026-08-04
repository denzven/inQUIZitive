import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { Home, Settings } from 'lucide-react';

type SWState = 'SPIN_READY' | 'SPINNING' | 'SPIN_DONE' | 'BOARD' | 'QUESTION_VIEW' | 'FEEDBACK';

export const SpinWheelScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed } = useQuizStore();

  // 1. Data Grouping
  const { allTopics, topicMap } = useMemo(() => {
    const swj = questions.filter(q => q.roundCode === 'SWJ');
    const map = new Map<string, Question[]>();
    swj.forEach(q => {
      const t = q.topic || 'Bonus';
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(q);
    });
    let topics = Array.from(map.keys());
    
    // Fallback if < 4 topics exist
    let i = 1;
    while (topics.length < 4) {
      const dummyTopic = `Bonus ${i++}`;
      topics.push(dummyTopic);
      map.set(dummyTopic, Array(4).fill({
        index: -1, roundCode: 'SWJ', topic: dummyTopic, used: false,
        question: 'Bonus Question', answer: 'A', options: ['A','B','C','D'], scoreVal: 10
      }));
    }
    return { allTopics: topics, topicMap: map };
  }, [questions]);

  // 2. State
  const [swState, setSwState] = useState<SWState>('SPIN_READY');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  
  const [selectedOptIdx, setSelectedOptIdx] = useState<number>(-1);
  const [isCorrect, setIsCorrect] = useState(false);

  // 3. Spin Logic (Simulation)
  const [isSpinning, setIsSpinning] = useState(false);
  const startSpin = () => {
    setSwState('SPINNING');
    setIsSpinning(true);
    
    // Pick 4 unique topics randomly
    const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 4);
    
    // Simulate spin delay
    setTimeout(() => {
      setSelectedTopics(chosen);
      setIsSpinning(false);
      setSwState('SPIN_DONE');
    }, 2500);
  };

  // 4. Answer Handler
  const handleAnswer = useCallback((optIndex: number) => {
    if (swState !== 'QUESTION_VIEW' || !currentQ || currentQ.used) return;
    
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);
    if (currentQ.index !== -1) {
      markQuestionUsed(currentQ.index);
    }
    
    // We update the local state manually so it shows as used immediately without requiring full re-render map lookups
    currentQ.used = true;

    setSwState('FEEDBACK');
  }, [swState, currentQ, markQuestionUsed]);

  // 5. Feedback Auto-Advance
  useEffect(() => {
    if (swState === 'FEEDBACK') {
      const timeout = setTimeout(() => {
        setSwState('BOARD');
        setCurrentQ(null);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [swState]);

  const handleTileClick = (q: Question) => {
    setCurrentQ(q);
    setSwState('QUESTION_VIEW');
    if (!q.used) {
      setSelectedOptIdx(-1);
      setIsCorrect(false);
    }
  };

  return (
    <div className="projector-container" style={{ alignItems: 'center' }}>
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

      <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>Spin & Jeopardy</h1>

      {/* SPIN VIEWS */}
      {(swState === 'SPIN_READY' || swState === 'SPINNING' || swState === 'SPIN_DONE') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          
          <div style={{ 
            display: 'flex', gap: '30px', 
            backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '20px',
            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)', overflow: 'hidden', height: '200px'
          }}>
            {[0, 1, 2, 3].map(colIdx => (
              <div key={colIdx} style={{ 
                width: 'clamp(150px, 20vw, 250px)', height: '100%', 
                backgroundColor: 'var(--teal)', borderRadius: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ 
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--white)', fontWeight: 'bold', textAlign: 'center',
                  animation: isSpinning ? `spin-slot 0.5s linear infinite` : 'none',
                  animationDelay: `${colIdx * 0.1}s`
                }}>
                  {swState === 'SPIN_DONE' ? selectedTopics[colIdx] : '???'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '50px', display: 'flex', gap: '20px' }}>
            {swState === 'SPIN_READY' && (
              <button onClick={startSpin} style={{ padding: '20px 60px', fontSize: '3rem', backgroundColor: 'var(--orange)' }}>
                SPIN
              </button>
            )}
            {swState === 'SPIN_DONE' && (
              <>
                <button onClick={startSpin} style={{ padding: '20px 60px', fontSize: '2rem', backgroundColor: 'var(--orange)' }}>
                  Respin
                </button>
                <button onClick={() => setSwState('BOARD')} style={{ padding: '20px 60px', fontSize: '2rem', backgroundColor: 'var(--yellow)', color: 'var(--dark-green)' }}>
                  To Board &gt;
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOARD VIEW */}
      {swState === 'BOARD' && (
        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 30px)', marginTop: '40px', width: '100%', maxWidth: '1400px', justifyContent: 'center' }}>
          {selectedTopics.map((topic, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 20px)', flex: 1, maxWidth: '280px' }}>
              <div style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', padding: '20px 10px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}>
                {topic}
              </div>
              
              {topicMap.get(topic)?.slice(0, 4).map((q, rowIdx) => (
                <button 
                  key={rowIdx} 
                  onClick={() => handleTileClick(q)}
                  style={{ 
                    padding: '30px 10px', 
                    fontSize: 'clamp(2rem, 4vw, 3rem)', 
                    backgroundColor: q.used ? 'var(--dark-green)' : 'var(--teal)',
                    color: q.used ? 'var(--dark-teal)' : 'var(--white)',
                    border: q.used ? '1px solid var(--dark-teal)' : 'none',
                    boxShadow: q.used ? 'none' : undefined,
                    cursor: 'pointer'
                  }}
                >
                  {q.scoreVal}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* QUESTION VIEW & FEEDBACK */}
      {(swState === 'QUESTION_VIEW' || swState === 'FEEDBACK') && currentQ && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <div style={{ margin: '0 clamp(20px, 5vw, 100px)' }}>
            <p style={{ color: 'var(--light-orange)', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Topic: {currentQ.topic} | Points: {currentQ.scoreVal}
            </p>
            <div className="card" style={{ minHeight: 'clamp(150px, 20vw, 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0 }}>{currentQ.question}</h2>
            </div>
          </div>

          <div className="options-grid">
            {currentQ.options.map((opt, i) => {
              let bgColor = 'rgba(42, 157, 143, 0.5)';
              
              if ((swState === 'FEEDBACK' || currentQ.used) && i === selectedOptIdx) {
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

          <button 
            onClick={() => setSwState('BOARD')} 
            style={{ position: 'absolute', bottom: '40px', right: '40px', backgroundColor: 'var(--orange)' }}
          >
            Back
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin-slot {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
