import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';

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

  // 3. Python Slot Machine Reel Engine (Ported from round_spin_wheel.py)
  const slotH = 270;
  const itemH = 90;
  const totalH = (allTopics.length || 1) * itemH;

  const [slotOffsets, setSlotOffsets] = useState<number[]>([0, 0, 0, 0]);
  const [, setSlotStates] = useState<number[]>([0, 0, 0, 0]); // 0=Stopped, 1=Spinning, 2=Easing
  
  const offsetsRef = useRef<number[]>([0, 0, 0, 0]);
  const statesRef = useRef<number[]>([0, 0, 0, 0]);
  const targetsRef = useRef<number[]>([0, 0, 0, 0]);
  const speedsRef = useRef<number[]>([0, 0, 0, 0]);
  const finalIndicesRef = useRef<number[]>([0, 0, 0, 0]);
  const spinStartTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Board Questions State (stores the active 4 unused questions for each selected topic)
  const [boardQuestionsMap, setBoardQuestionsMap] = useState<Map<string, Question[]>>(new Map());

  const startSpin = () => {
    setSwState('SPINNING');
    spinStartTimeRef.current = Date.now();

    // Pick 4 strictly UNIQUE, non-repeating topics (prioritizing topics with unused questions)
    const topicsWithUnused = allTopics.filter(t => (topicMap.get(t) || []).some(q => !q.used));
    const pool = topicsWithUnused.length >= 4 ? topicsWithUnused : allTopics;
    
    // Random sample without replacement
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosenTopics = shuffled.slice(0, 4);
    const chosenIndices = chosenTopics.map(t => Math.max(0, allTopics.indexOf(t)));
    
    finalIndicesRef.current = chosenIndices;

    statesRef.current = [1, 1, 1, 1];
    speedsRef.current = [35, 35, 35, 35]; // Continuous 60fps scroll speed
    setSlotStates([1, 1, 1, 1]);

    const animate = () => {
      const elapsed = Date.now() - spinStartTimeRef.current;
      let completed = 0;

      const newOffsets = [...offsetsRef.current];
      const newStates = [...statesRef.current];
      const newTargets = [...targetsRef.current];
      const newSpeeds = [...speedsRef.current];

      for (let i = 0; i < 4; i++) {
        if (newStates[i] === 1) {
          const stopThreshold = 1500 + i * 800; // Staggered reel stop times
          if (elapsed > stopThreshold) {
            newStates[i] = 2; // Switch to deceleration easing
            const targetIdx = finalIndicesRef.current[i];
            const centerOffset = (slotH - itemH) / 2;
            const targetOffsetBase = targetIdx * itemH - centerOffset;
            const currentWrapped = ((newOffsets[i] % totalH) + totalH) % totalH;
            const distToTarget = ((targetOffsetBase - currentWrapped) % totalH + totalH) % totalH;
            const finalDist = distToTarget + totalH * 2; // 2 extra full loops before landing
            newTargets[i] = newOffsets[i] + finalDist;
          }
        } else if (newStates[i] === 2) {
          const dist = newTargets[i] - newOffsets[i];
          if (dist < 1.0) {
            newOffsets[i] = newTargets[i];
            newSpeeds[i] = 0;
            newStates[i] = 0;
          } else {
            newSpeeds[i] = Math.max(2.0, dist * 0.06); // Easing deceleration curve
          }
        }

        newOffsets[i] += newSpeeds[i];
        if (newStates[i] === 0) {
          completed++;
        }
      }

      offsetsRef.current = newOffsets;
      statesRef.current = newStates;
      targetsRef.current = newTargets;
      speedsRef.current = newSpeeds;

      setSlotOffsets([...newOffsets]);
      setSlotStates([...newStates]);

      if (completed === 4) {
        const chosenTopics = finalIndicesRef.current.map((idx: number) => allTopics[idx] || 'Topic');
        setSelectedTopics(chosenTopics);

        // Populate Jeopardy Board with ONLY UNUSED questions for each selected topic
        const newBoardMap = new Map<string, Question[]>();
        chosenTopics.forEach(topic => {
          const allForTopic = topicMap.get(topic) || [];
          const unused = allForTopic.filter(q => !q.used);
          // Load only unused questions (or fallback to all if all are used)
          const chosenQs = unused.length > 0 ? unused.slice(0, 4) : allForTopic.slice(0, 4);
          newBoardMap.set(topic, chosenQs);
        });
        setBoardQuestionsMap(newBoardMap);

        setSwState('SPIN_DONE');
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      } else {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 4. Answer Handler
  const handleAnswer = useCallback((optIndex: number) => {
    if (swState !== 'QUESTION_VIEW' || !currentQ) return;
    
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);

    setSwState('FEEDBACK');
  }, [swState, currentQ]);

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
    
    // Mark question as used immediately when shown
    if (q.index !== -1) {
      markQuestionUsed(q.index);
    }
    q.used = true;

    setSelectedOptIdx(-1);
    setIsCorrect(false);
  };

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '20px' }}>
          Spin & Jeopardy
        </h1>

        {/* PYTHON-MATCHED SLOT REEL SPIN VIEW */}
        {(swState === 'SPIN_READY' || swState === 'SPINNING' || swState === 'SPIN_DONE') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', margin: 'auto' }}>
            
            {/* 4 Slot Reel Columns Container */}
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(12px, 2.5vw, 25px)', 
              padding: '10px', 
              position: 'relative'
            }}>
              {[0, 1, 2, 3].map(colIdx => {
                const offset = slotOffsets[colIdx] || 0;
                const centerY = (slotH - itemH) / 2;

                return (
                  <div key={colIdx} style={{ 
                    width: 'clamp(140px, 19vw, 240px)', 
                    height: `${slotH}px`, 
                    backgroundColor: 'rgba(42, 157, 143, 0.2)', 
                    borderRadius: '16px',
                    border: '1px solid rgba(42, 157, 143, 0.35)',
                    position: 'relative', 
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    boxSizing: 'border-box'
                  }}>
                    
                    {/* Continuous Scrolling Topics Layer */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                      {allTopics.map((topic, j) => {
                        const baseY = j * itemH;
                        const relY = ((baseY - offset) % totalH + totalH) % totalH;
                        const drawPositions = [relY, relY - totalH];

                        return drawPositions.map((dy, posIdx) => {
                          const screenY = dy;
                          if (screenY + itemH < 0 || screenY > slotH) return null;

                          const distToCenter = Math.abs(screenY - centerY);
                          const isCenter = distToCenter < 20;

                          return (
                            <div 
                              key={`${j}-${posIdx}`} 
                              style={{
                                position: 'absolute',
                                top: `${screenY}px`,
                                left: 0,
                                right: 0,
                                height: `${itemH}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: isCenter ? 'clamp(1.2rem, 2.3vw, 1.8rem)' : 'clamp(0.95rem, 1.6vw, 1.3rem)',
                                fontWeight: isCenter ? 900 : 700,
                                color: isCenter ? 'var(--white)' : 'rgba(232, 237, 223, 0.65)',
                                textAlign: 'center',
                                padding: '0 10px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                boxSizing: 'border-box',
                                borderBottom: '1px solid rgba(42, 157, 143, 0.25)',
                                zIndex: isCenter ? 3 : 2
                              }}
                            >
                              {topic}
                            </div>
                          );
                        });
                      })}
                    </div>

                    {/* Top Cylinder Gradient Fade (dark_green fade) */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
                      background: 'linear-gradient(to bottom, rgba(38, 70, 83, 0.85), transparent)',
                      pointerEvents: 'none', zIndex: 6
                    }} />

                    {/* Bottom Cylinder Gradient Fade (dark_green fade) */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                      background: 'linear-gradient(to top, rgba(38, 70, 83, 0.85), transparent)',
                      pointerEvents: 'none', zIndex: 6
                    }} />

                    {/* Center Glass Highlight Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: `${centerY}px`, left: 0, right: 0,
                      height: `${itemH}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      pointerEvents: 'none',
                      zIndex: 4
                    }} />

                    {/* TOP YELLOW ACCENT LINE (3px) */}
                    <div style={{
                      position: 'absolute', top: `${centerY}px`, left: 0, right: 0,
                      height: '3px', backgroundColor: 'var(--yellow)', zIndex: 10
                    }} />

                    {/* BOTTOM YELLOW ACCENT LINE (3px) */}
                    <div style={{
                      position: 'absolute', top: `${centerY + itemH}px`, left: 0, right: 0,
                      height: '3px', backgroundColor: 'var(--yellow)', zIndex: 10
                    }} />
                  </div>
                );
              })}
            </div>

            {/* Action Control Buttons */}
            <div style={{ marginTop: '35px', display: 'flex', gap: '20px' }}>
              {swState === 'SPIN_READY' && (
                <button 
                  onClick={startSpin} 
                  style={{ 
                    padding: '16px 50px', 
                    fontSize: '2rem', 
                    backgroundColor: 'var(--orange)',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
                  }}
                >
                  Spin Categories
                </button>
              )}
              {swState === 'SPIN_DONE' && (
                <>
                  <button 
                    onClick={startSpin} 
                    style={{ 
                      padding: '12px 35px', 
                      fontSize: '1.5rem', 
                      backgroundColor: 'var(--orange)',
                      borderRadius: '14px'
                    }}
                  >
                    Respin
                  </button>
                  <button 
                    onClick={() => setSwState('BOARD')} 
                    style={{ 
                      padding: '12px 40px', 
                      fontSize: '1.5rem', 
                      backgroundColor: 'var(--yellow)', 
                      color: 'var(--dark-green)',
                      borderRadius: '14px'
                    }}
                  >
                    To Jeopardy Board &gt;
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* BOARD VIEW */}
        {swState === 'BOARD' && (
          <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 30px)', marginTop: '20px', width: '100%', maxWidth: '1400px', justifyContent: 'center' }}>
            {selectedTopics.map((topic, colIdx) => {
              const questionsForTopic = boardQuestionsMap.get(topic) || (topicMap.get(topic) || []).filter(q => !q.used).slice(0, 4);

              return (
                <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 20px)', flex: 1, maxWidth: '280px' }}>
                  <div style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', padding: '15px 10px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 2vw, 1.5rem)' }}>
                    {topic}
                  </div>
                  
                  {questionsForTopic.map((q, rowIdx) => (
                    <button 
                      key={rowIdx} 
                      onClick={() => handleTileClick(q)}
                      style={{ 
                        padding: '20px 10px', 
                        fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', 
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
              );
            })}
          </div>
        )}

        {/* QUESTION VIEW & FEEDBACK */}
        {(swState === 'QUESTION_VIEW' || swState === 'FEEDBACK') && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px' }}>
            
            <div style={{ margin: '0 clamp(10px, 3vw, 50px)' }}>
              <p style={{ color: 'var(--light-orange)', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                Topic: {currentQ.topic} | Points: {currentQ.scoreVal}
              </p>
              <div className="card" style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: 0 }}>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.2 }}>{currentQ.question}</h2>
              </div>
            </div>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                let bgColor = 'var(--dark-teal)';
                const isSelected = i === selectedOptIdx;
                const isRightAnswer = opt === currentQ.answer;

                if (swState === 'FEEDBACK' || (currentQ.used && selectedOptIdx !== -1)) {
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

            <button 
              onClick={() => setSwState('BOARD')} 
              style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: 'var(--orange)', zIndex: 20 }}
            >
              Back to Board
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes reelSpinVertical {
          0% { transform: translateY(-20px); filter: blur(0.5px); }
          50% { transform: translateY(20px); filter: blur(1px); }
          100% { transform: translateY(-20px); filter: blur(0.5px); }
        }
        @keyframes reelSpinUp {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes spin-slot {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
      `}</style>
    </ScreenLayout>
  );
};
