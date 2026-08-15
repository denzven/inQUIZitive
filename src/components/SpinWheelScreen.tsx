import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { useSpinWheelStore } from '../store/useSpinWheelStore';
import { seededShuffle } from '../utils/random';
import { playTileChime, playCorrectFanfare, playWrongBuzz, playWheelTick, stopWheelTick } from '../utils/soundEffects';

/**
 * SpinWheelScreen Component (Spin Wheel & Jeopardy Round).
 * Features a 4-column Slot Machine Category Wheel engine ported from Python Pygame,
 * dynamic Jeopardy board grid selection, and option answer verification feedback.
 */
export const SpinWheelScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, seed } = useQuizStore();
  const spinCountRef = useRef<number>(0);

  /** Ensures spinner audio is immediately stopped when leaving or unmounting the screen */
  useEffect(() => {
    return () => {
      stopWheelTick();
    };
  }, []);

  /** Data grouping: filters unused SWJ round questions into topic mappings and ensures >= 4 fallback topics */
  const { allTopics, topicMap } = useMemo(() => {
    const swj = questions.filter(q => q.roundCode === 'SWJ' && !q.used);
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

  const totalUnusedSwjCount = useMemo(() => questions.filter(q => q.roundCode === 'SWJ' && !q.used).length, [questions]);

  // 2. Persisted State
  const {
    swState, setSwState,
    selectedTopics, setSelectedTopics,
    boardQuestions, setBoardQuestions,
    currentQ, setCurrentQ,
    selectedOptIdx, setSelectedOptIdx,
    isCorrect, setIsCorrect,
    isReviewing, setIsReviewing,
    userAnswers, setUserAnswer,
    resetSw
  } = useSpinWheelStore();

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

  /**
   * Triggers the 4-column Slot Machine Reel Spin animation loop.
   * Selects 4 unique category topics and decelerates each reel with staggered easing.
   */
  const startSpin = () => {
    setSwState('SPINNING');
    spinStartTimeRef.current = Date.now();

    // Pick 4 strictly UNIQUE, non-repeating topics with unused questions
    const topicsWithUnused = allTopics.filter(t => (topicMap.get(t) || []).some(q => !q.used));
    const pool = topicsWithUnused.length > 0 ? topicsWithUnused : allTopics;
    
    // Seeded random sample without replacement (bypassed if NOSHUFFLE seed)
    spinCountRef.current += 1;
    const shuffled = seededShuffle(pool, `${seed}_spin_${spinCountRef.current}`);
    const chosenTopics = shuffled.slice(0, 4);
    const chosenIndices = chosenTopics.map(t => Math.max(0, allTopics.indexOf(t)));
    
    finalIndicesRef.current = chosenIndices;

    // PRE-SAVE topics to store in case of crash during animation
    setSelectedTopics(chosenTopics);
    const bMap: Record<string, Question[]> = {};
    chosenTopics.forEach(t => {
      const qs = (topicMap.get(t) || []).filter(q => !q.used);
      bMap[t] = qs.slice(0, 4);
    });
    setBoardQuestions(bMap);

    statesRef.current = [1, 1, 1, 1];
    speedsRef.current = [35, 35, 35, 35]; // Continuous 60fps scroll speed
    setSlotStates([1, 1, 1, 1]);

    // Play single continuous 5.5s mechanical reel spin audio track (0 CPU spikes)
    playWheelTick();

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
        setSwState('SPIN_DONE');
        playTileChime(3);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      } else {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  /** Cleanup slot machine animation frame on unmount */
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  /**
   * Handles option answer selection during question view.
   * 
   * @param optIndex - Selected option index
   */
  const handleAnswer = useCallback((optIndex: number) => {
    if (swState !== 'QUESTION_VIEW' || !currentQ) return;
    
    const selectedText = currentQ.options[optIndex];
    const correct = selectedText === currentQ.answer;

    if (correct) {
      playCorrectFanfare();
    } else {
      playWrongBuzz();
    }

    setSelectedOptIdx(optIndex);
    setIsCorrect(correct);
    setIsReviewing(false);
    if (currentQ.index !== undefined && currentQ.index !== -1) {
      setUserAnswer(currentQ.index, optIndex);
    }

    setSwState('FEEDBACK');
  }, [swState, currentQ, setSelectedOptIdx, setIsCorrect, setIsReviewing, setUserAnswer, setSwState]);

  /** Auto-advances from feedback phase back to Jeopardy board after delay */
  useEffect(() => {
    if (swState === 'FEEDBACK' && !isReviewing) {
      const timeout = setTimeout(() => {
        setSwState('BOARD');
        setCurrentQ(null);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [swState, isReviewing, setSwState, setCurrentQ]);

  /**
   * Handles user click on a Jeopardy board tile button.
   * 
   * @param q - The selected Question item.
   */
  const handleTileClick = (q: Question) => {
    playTileChime(q.index);
    setCurrentQ(q);
    
    if (q.used) {
      // Reviewing an already answered question
      setIsReviewing(true);
      const prevOptIdx = userAnswers[q.index] ?? -1;
      setSelectedOptIdx(prevOptIdx);
      const right = prevOptIdx !== -1 ? q.options[prevOptIdx] === q.answer : true;
      setIsCorrect(right);
      setSwState('FEEDBACK');
    } else {
      // Fresh unanswered question
      setIsReviewing(false);
      setSwState('QUESTION_VIEW');
      
      if (q.index !== -1) {
        markQuestionUsed(q.index);
      }
      q.used = true;

      setSelectedOptIdx(-1);
      setIsCorrect(false);
    }
  };

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => { resetSw(); setGameState('MENU'); }}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', flex: 1 }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, min(5.5vw, 5vh), 3.8rem)', marginBottom: 'clamp(8px, 1.5vh, 18px)' }}>
          Spin & Jeopardy
        </h1>

        {/* PYTHON-MATCHED SLOT REEL SPIN VIEW */}
        {(swState === 'SPIN_READY' || swState === 'SPINNING' || swState === 'SPIN_DONE') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', margin: 'auto', width: '100%' }}>
            
            {/* 4 Slot Reel Columns Container */}
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(6px, 1.5vw, 25px)', 
              padding: '6px', 
              position: 'relative',
              width: '100%',
              maxWidth: '1000px',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              {[0, 1, 2, 3].map(colIdx => {
                const offset = slotOffsets[colIdx] || 0;
                const centerY = (slotH - itemH) / 2;

                return (
                  <div key={colIdx} style={{ 
                    flex: '1 1 0px',
                    maxWidth: '240px',
                    minWidth: 0,
                    height: `${slotH}px`, 
                    backgroundColor: 'rgba(42, 157, 143, 0.2)', 
                    borderRadius: 'clamp(10px, 2vw, 16px)',
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
                                fontSize: isCenter ? 'clamp(0.75rem, 2.2vw, 1.8rem)' : 'clamp(0.6rem, 1.5vw, 1.3rem)',
                                fontWeight: isCenter ? 900 : 700,
                                color: isCenter ? 'var(--white)' : 'rgba(232, 237, 223, 0.65)',
                                textAlign: 'center',
                                padding: '0 4px',
                                lineHeight: 1.15,
                                wordBreak: 'break-word',
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
                      position: 'absolute', top: 0, left: 0, right: 0, height: 'clamp(35px, 6vh, 60px)',
                      background: 'linear-gradient(to bottom, rgba(38, 70, 83, 0.85), transparent)',
                      pointerEvents: 'none', zIndex: 6
                    }} />

                    {/* Bottom Cylinder Gradient Fade (dark_green fade) */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(35px, 6vh, 60px)',
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

            {totalUnusedSwjCount < 16 && (
              <div style={{
                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                border: '2px solid var(--wrong-red)',
                borderRadius: '16px',
                padding: '10px 20px',
                marginTop: '15px',
                maxWidth: '650px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(231, 76, 60, 0.25)'
              }}>
                <div style={{ color: 'var(--yellow)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>⚠️</span>
                  <span>Question Quantity Warning</span>
                </div>
                <p style={{ color: 'var(--white)', fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Only {totalUnusedSwjCount} unused SWJ question(s) available (16 required for 4 full categories). Used questions were excluded to prevent duplicates.
                </p>
              </div>
            )}

            {/* Action Control Buttons */}
            <div style={{ 
              marginTop: 'clamp(15px, 3vh, 35px)', 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 'clamp(10px, 2.5vw, 20px)',
              width: '100%',
              padding: '0 10px',
              boxSizing: 'border-box'
            }}>
              {swState === 'SPIN_READY' && (
                <button 
                  onClick={startSpin} 
                  style={{ 
                    padding: 'clamp(10px, 2vh, 16px) clamp(24px, 5vw, 50px)', 
                    fontSize: 'clamp(1.1rem, 4vw, 2rem)', 
                    backgroundColor: 'var(--orange)',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    maxWidth: '100%'
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
                      padding: 'clamp(8px, 1.8vh, 12px) clamp(16px, 3.5vw, 35px)', 
                      fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', 
                      backgroundColor: 'var(--orange)',
                      borderRadius: '14px',
                      flex: '1 1 auto',
                      maxWidth: '200px'
                    }}
                  >
                    Respin
                  </button>
                  <button 
                    onClick={() => setSwState('BOARD')} 
                    style={{ 
                      padding: 'clamp(8px, 1.8vh, 12px) clamp(16px, 3.5vw, 40px)', 
                      fontSize: 'clamp(1rem, 3.5vw, 1.5rem)', 
                      backgroundColor: 'var(--yellow)', 
                      color: 'var(--dark-green)',
                      borderRadius: '14px',
                      flex: '1 1 auto',
                      maxWidth: '280px'
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
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(4px, 1.5vw, 30px)', 
            marginTop: 'clamp(10px, 2vh, 20px)', 
            width: '100%', 
            maxWidth: '1400px', 
            justifyContent: 'center',
            padding: '0 clamp(4px, 1.5vw, 15px)',
            boxSizing: 'border-box'
          }}>
            {selectedTopics.map((topic, colIdx) => {
              const list = boardQuestions[topic] || (topicMap.get(topic) || []).filter(q => !q.used).slice(0, 4);

              return (
                <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.5vh, 20px)', flex: '1 1 0px', minWidth: 0, maxWidth: '280px' }}>
                  <div style={{ 
                    backgroundColor: 'var(--yellow)', 
                    color: 'var(--dark-green)', 
                    padding: 'clamp(8px, 1.5vh, 15px) clamp(4px, 1vw, 10px)', 
                    borderRadius: 'clamp(8px, 1.5vw, 15px)', 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    fontSize: 'clamp(0.75rem, 2.2vw, 1.5rem)',
                    lineHeight: 1.15,
                    minHeight: 'clamp(44px, 7vh, 60px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    wordBreak: 'break-word',
                    boxSizing: 'border-box'
                  }}>
                    {topic}
                  </div>
                  
                  {list.map((q, rowIdx) => (
                    <button 
                      key={rowIdx} 
                      onClick={() => handleTileClick(q)}
                      style={{ 
                        padding: 'clamp(10px, 2vh, 20px) clamp(4px, 1vw, 10px)', 
                        fontSize: 'clamp(1.1rem, 3.2vw, 2.8rem)', 
                        backgroundColor: q.used ? 'var(--dark-green)' : 'var(--teal)',
                        color: q.used ? 'var(--dark-teal)' : 'var(--white)',
                        border: q.used ? '1px solid var(--dark-teal)' : 'none',
                        boxShadow: q.used ? 'none' : undefined,
                        cursor: 'pointer',
                        borderRadius: 'clamp(8px, 1.5vw, 15px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1500px', height: '100%', boxSizing: 'border-box' }}>
            
            <div style={{ margin: '0 clamp(10px, 3vw, 50px)', flexShrink: 0 }}>
              <p style={{ color: 'var(--light-orange)', fontSize: 'clamp(1rem, 2.2vw, 1.4rem)', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Topic: {currentQ.topic} | Points: {currentQ.scoreVal}
              </p>
            </div>

            <div className="card" style={{ 
              flex: '1 1 0px', 
              minHeight: 'clamp(100px, 18vh, 220px)', 
              margin: '0 clamp(10px, 3vw, 50px) clamp(8px, 1.5vh, 18px)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              padding: 'clamp(16px, 3vh, 30px)' 
            }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.8rem)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.25 }}>{currentQ.question}</h2>
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
              style={{ 
                position: 'fixed', 
                bottom: 'max(clamp(15px, 3vh, 30px), calc(env(safe-area-inset-bottom, 0px) + 12px))', 
                right: 'max(clamp(15px, 3vw, 30px), env(safe-area-inset-right, 0px))', 
                backgroundColor: 'var(--orange)',
                color: 'var(--white)',
                zIndex: 20,
                width: 'auto',
                fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                padding: 'clamp(10px, 2vh, 14px) clamp(16px, 3vw, 28px)',
                borderRadius: '14px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                maxWidth: 'calc(100vw - 30px)'
              }}
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

