import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { QuestionImage } from './QuestionImage';
import { useSpinWheelStore } from '../store/useSpinWheelStore';
import { seededShuffle, isNoShuffle } from '../utils/random';
import { playTileChime, playCorrectFanfare, playWrongBuzz, playWheelTick, stopWheelTick } from '../utils/soundEffects';
import { preloadQuestionImages } from '../utils/imagePreloader';
import { AlertTriangle, Sparkles, Award, RotateCcw, CheckCircle2 } from 'lucide-react';

/**
 * SpinWheelScreen Component (Spin Wheel & Jeopardy Round).
 * Features a 4-column Slot Machine Category Wheel engine ported from Python Pygame,
 * dynamic Jeopardy board grid selection, and option answer verification feedback.
 */
export const SpinWheelScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, seed } = useQuizStore();
  const spinCountRef = useRef<number>(0);

  /** Preloads all question images into browser memory when entering Spin Wheel screen */
  useEffect(() => {
    if (questions.length > 0) {
      preloadQuestionImages(questions);
    }
  }, [questions]);

  /** Ensures spinner audio is immediately stopped when leaving or unmounting the screen */
  useEffect(() => {
    return () => {
      stopWheelTick();
    };
  }, []);

  /**
   * Selects 4 questions for a Jeopardy topic column, ensuring exactly one 10-point,
   * one 20-point, one 30-point, and one 40-point question per topic with zero point duplicates.
   */
  const getTieredQuestionsForTopic = useCallback((allTopicQs: Question[]): Question[] => {
    if (!allTopicQs || allTopicQs.length === 0) return [];

    const targetTiers = [10, 20, 30, 40];
    const selected: Question[] = [];
    const usedIndices = new Set<number>();

    targetTiers.forEach((targetVal) => {
      // 1. Try to find an unused question matching exact targetVal
      let matchIdx = allTopicQs.findIndex(
        (q, idx) => !usedIndices.has(idx) && !q.used && q.scoreVal === targetVal
      );

      // 2. Try to find any question matching exact targetVal
      if (matchIdx === -1) {
        matchIdx = allTopicQs.findIndex(
          (q, idx) => !usedIndices.has(idx) && q.scoreVal === targetVal
        );
      }

      // 3. Fallback to any unused question for this topic
      if (matchIdx === -1) {
        matchIdx = allTopicQs.findIndex(
          (q, idx) => !usedIndices.has(idx) && !q.used
        );
      }

      // 4. Fallback to any question for this topic
      if (matchIdx === -1) {
        matchIdx = allTopicQs.findIndex((_, idx) => !usedIndices.has(idx));
      }

      if (matchIdx !== -1) {
        usedIndices.add(matchIdx);
        const originalQ = allTopicQs[matchIdx];
        // Clone question with target scoreVal guaranteed (10, 20, 30, 40)
        selected.push({
          ...originalQ,
          scoreVal: targetVal
        });
      }
    });

    return selected;
  }, []);

  /** Data grouping: filters SWJ round questions into topic mappings directly from Excel sheet */
  const { allTopics, topicMap } = useMemo(() => {
    const matchSwj = questions.filter(q => q.roundCode?.toUpperCase() === 'SWJ');
    const swjPool = matchSwj.length > 0 ? matchSwj : questions;
    const rawMap = new Map<string, Question[]>();

    swjPool.forEach(q => {
      const t = (q.topic && q.topic.trim()) || 'General Quiz';
      if (!rawMap.has(t)) rawMap.set(t, []);
      rawMap.get(t)!.push(q);
    });

    const map = new Map<string, Question[]>();
    const rawTopics = Array.from(rawMap.keys());

    if (rawTopics.length >= 4) {
      rawTopics.forEach(t => map.set(t, rawMap.get(t)!));
    } else if (rawTopics.length > 0) {
      // Partition available questions into sub-categories so columns are populated with real questions
      rawTopics.forEach(baseTopic => {
        const topicQs = rawMap.get(baseTopic)!;
        if (topicQs.length >= 8) {
          const chunkSize = Math.ceil(topicQs.length / 4);
          for (let c = 0; c < 4; c++) {
            const subTopicName = rawTopics.length === 1 
              ? `${baseTopic} ${['I', 'II', 'III', 'IV'][c] || c + 1}`
              : `${baseTopic} Part ${c + 1}`;
            const chunk = topicQs.slice(c * chunkSize, (c + 1) * chunkSize);
            if (chunk.length > 0) {
              map.set(subTopicName, chunk);
            }
          }
        } else {
          map.set(baseTopic, topicQs);
        }
      });
    }

    let topics = Array.from(map.keys());

    // Ensure at least 4 topics exist using remaining questions from Excel sheet if available
    let fallbackIdx = 1;
    const remainingUnusedExcelQs = questions.filter(q => !q.used);

    while (topics.length < 4) {
      const dummyTopic = `Bonus Tier ${fallbackIdx++}`;
      topics.push(dummyTopic);
      const sliceQs = remainingUnusedExcelQs.slice((fallbackIdx - 2) * 4, (fallbackIdx - 1) * 4);
      if (sliceQs.length >= 4) {
        map.set(dummyTopic, sliceQs);
      } else {
        map.set(dummyTopic, [
          { index: -1, roundCode: 'SWJ', topic: dummyTopic, used: false, question: 'Bonus 10 Pt Question', answer: 'Option A', options: ['Option A','Option B','Option C','Option D'], scoreVal: 10 },
          { index: -1, roundCode: 'SWJ', topic: dummyTopic, used: false, question: 'Bonus 20 Pt Question', answer: 'Option A', options: ['Option A','Option B','Option C','Option D'], scoreVal: 20 },
          { index: -1, roundCode: 'SWJ', topic: dummyTopic, used: false, question: 'Bonus 30 Pt Question', answer: 'Option A', options: ['Option A','Option B','Option C','Option D'], scoreVal: 30 },
          { index: -1, roundCode: 'SWJ', topic: dummyTopic, used: false, question: 'Bonus 40 Pt Question', answer: 'Option A', options: ['Option A','Option B','Option C','Option D'], scoreVal: 40 },
        ]);
      }
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

  /** Computes answered question progress stats for Jeopardy board view */
  const boardProgress = useMemo(() => {
    let usedCount = 0;
    let totalTiles = 0;
    selectedTopics.forEach(t => {
      const list = boardQuestions[t] || getTieredQuestionsForTopic(topicMap.get(t) || []);
      totalTiles += list.length;
      usedCount += list.filter(q => q.used).length;
    });
    return { usedCount, totalTiles };
  }, [selectedTopics, boardQuestions, topicMap, getTieredQuestionsForTopic]);

  /** Checks if any chosen topic has fewer than 4 unused questions to display warning banner */
  const incompleteTopicsWarning = useMemo(() => {
    const warnings: { topic: string; unusedCount: number }[] = [];
    selectedTopics.forEach(t => {
      const unusedQs = (topicMap.get(t) || []).filter(q => !q.used);
      if (unusedQs.length < 4) {
        warnings.push({ topic: t, unusedCount: unusedQs.length });
      }
    });
    return warnings;
  }, [selectedTopics, topicMap]);

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

  /** Pre-initializes selectedTopics, boardQuestions, and reel offsets on mount */
  useEffect(() => {
    const centerOffset = (slotH - itemH) / 2;

    if (selectedTopics.length < 4) {
      const p1Topics = allTopics.filter(t => (topicMap.get(t) || []).filter(q => !q.used).length >= 4);
      const p2Topics = allTopics.filter(t => {
        const u = (topicMap.get(t) || []).filter(q => !q.used).length;
        return u > 0 && u < 4;
      });
      const p3Topics = allTopics.filter(t => !p1Topics.includes(t) && !p2Topics.includes(t));

      const combinedPool = [...p1Topics, ...p2Topics, ...p3Topics];
      const chosenTopics: string[] = [];
      combinedPool.forEach(t => {
        if (chosenTopics.length < 4 && !chosenTopics.includes(t)) {
          chosenTopics.push(t);
        }
      });
      let bonusIdx = 1;
      while (chosenTopics.length < 4) {
        const bTopic = `Bonus ${bonusIdx++}`;
        if (!chosenTopics.includes(bTopic)) {
          chosenTopics.push(bTopic);
        }
      }

      setSelectedTopics(chosenTopics);
      const bMap: Record<string, Question[]> = {};
      chosenTopics.forEach(t => {
        const allTopicQs = topicMap.get(t) || [];
        bMap[t] = getTieredQuestionsForTopic(allTopicQs);
      });
      setBoardQuestions(bMap);

      const initialOffsets = chosenTopics.map(t => {
        const idx = Math.max(0, allTopics.indexOf(t));
        return idx * itemH - centerOffset;
      });
      offsetsRef.current = initialOffsets;
      setSlotOffsets(initialOffsets);
    } else {
      const initialOffsets = selectedTopics.map(t => {
        const idx = Math.max(0, allTopics.indexOf(t));
        return idx * itemH - centerOffset;
      });
      offsetsRef.current = initialOffsets;
      setSlotOffsets(initialOffsets);
    }
  }, [selectedTopics, allTopics, topicMap, getTieredQuestionsForTopic, setSelectedTopics, setBoardQuestions, slotH, itemH]);

  /**
   * Triggers the 4-column Slot Machine Reel Spin animation loop.
   * Prioritizes topics with 4+ valid unused questions, ensuring strictly unique topics per board
   * across both Seeded Shuffle and NO SHUFFLE modes.
   */
  const startSpin = () => {
    setSwState('SPINNING');
    spinStartTimeRef.current = Date.now();

    // Priority Topic Selection Engine:
    // P1: Topics with 4+ unused questions (Full complete categories)
    const p1Topics = allTopics.filter(t => {
      const unused = (topicMap.get(t) || []).filter(q => !q.used);
      return unused.length >= 4;
    });

    // P2: Topics with 1 to 3 unused questions
    const p2Topics = allTopics.filter(t => {
      const unused = (topicMap.get(t) || []).filter(q => !q.used);
      return unused.length > 0 && unused.length < 4;
    });

    // P3: Remaining topics
    const p3Topics = allTopics.filter(t => !p1Topics.includes(t) && !p2Topics.includes(t));

    spinCountRef.current += 1;
    const isNoShuf = isNoShuffle(seed);

    let s1: string[];
    let s2: string[];
    let s3: string[];

    if (isNoShuf) {
      // In NO SHUFFLE mode: deterministically shift/rotate topics by spin count
      const shiftAmount = ((spinCountRef.current - 1) * 4) % (allTopics.length || 1);
      const rotatedAll = [...allTopics.slice(shiftAmount), ...allTopics.slice(0, shiftAmount)];
      
      s1 = rotatedAll.filter(t => p1Topics.includes(t));
      s2 = rotatedAll.filter(t => p2Topics.includes(t));
      s3 = rotatedAll.filter(t => p3Topics.includes(t));
    } else {
      // In Seeded Shuffle mode: shuffle each priority tier independently
      s1 = seededShuffle(p1Topics, `${seed}_p1_${spinCountRef.current}`);
      s2 = seededShuffle(p2Topics, `${seed}_p2_${spinCountRef.current}`);
      s3 = seededShuffle(p3Topics, `${seed}_p3_${spinCountRef.current}`);
    }

    const combinedPool = [...s1, ...s2, ...s3];

    // Pick 4 strictly UNIQUE, non-repeating topics
    const chosenTopics: string[] = [];
    combinedPool.forEach(t => {
      if (chosenTopics.length < 4 && !chosenTopics.includes(t)) {
        chosenTopics.push(t);
      }
    });

    // Fallback: Fill remaining slots with distinct "Bonus N" topics if needed
    let bonusIdx = 1;
    while (chosenTopics.length < 4) {
      const bTopic = `Bonus ${bonusIdx++}`;
      if (!chosenTopics.includes(bTopic)) {
        chosenTopics.push(bTopic);
      }
    }

    const chosenIndices = chosenTopics.map(t => Math.max(0, allTopics.indexOf(t)));
    finalIndicesRef.current = chosenIndices;

    // PRE-SAVE topics to store in case of crash during animation
    setSelectedTopics(chosenTopics);
    const bMap: Record<string, Question[]> = {};
    chosenTopics.forEach(t => {
      const allTopicQs = topicMap.get(t) || [];
      bMap[t] = getTieredQuestionsForTopic(allTopicQs);
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
    (document.activeElement as HTMLElement)?.blur();
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
    (document.activeElement as HTMLElement)?.blur();
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

  /** Keyboard shortcuts listener for Spin & Jeopardy */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const lowerKey = e.key.toLowerCase();

      if (swState === 'SPIN_READY') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startSpin();
        }
      } else if (swState === 'SPIN_DONE') {
        if (e.key === 'Enter' || e.key === ' ' || lowerKey === 'b') {
          e.preventDefault();
          setSwState('BOARD');
        } else if (lowerKey === 'r') {
          e.preventDefault();
          startSpin();
        }
      } else if (swState === 'QUESTION_VIEW' && currentQ) {
        if (e.key === '1') handleAnswer(0);
        if (e.key === '2') handleAnswer(1);
        if (e.key === '3') handleAnswer(2);
        if (e.key === '4') handleAnswer(3);
        if (e.key === 'Escape' || lowerKey === 'b') {
          e.preventDefault();
          setSwState('BOARD');
        }
      } else if (swState === 'BOARD') {
        if (e.key === 'Escape') {
          e.preventDefault();
          resetSw();
          setGameState('MENU');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swState, currentQ, handleAnswer, setSwState, resetSw, setGameState]);

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
                    backgroundColor: 'color-mix(in srgb, var(--color-primary-container) 80%, transparent)', 
                    borderRadius: 'clamp(10px, 2vw, 16px)',
                    border: '2px solid var(--color-primary)',
                    position: 'relative', 
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px color-mix(in srgb, var(--color-primary-dark) 40%, transparent)',
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
                                color: isCenter ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-surface) 65%, transparent)',
                                textAlign: 'center',
                                padding: '0 4px',
                                lineHeight: 1.15,
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                boxSizing: 'border-box',
                                borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                                zIndex: isCenter ? 3 : 2
                              }}
                            >
                              {topic}
                            </div>
                          );
                        });
                      })}
                    </div>

                    {/* Center Glass Highlight Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: `${centerY}px`, left: 0, right: 0,
                      height: `${itemH}px`,
                      backgroundColor: 'color-mix(in srgb, var(--color-surface) 10%, transparent)',
                      pointerEvents: 'none',
                      zIndex: 4
                    }} />

                    {/* TOP ACCENT LINE (3px) */}
                    <div style={{
                      position: 'absolute', top: `${centerY}px`, left: 0, right: 0,
                      height: '3px', backgroundColor: 'var(--color-accent)', zIndex: 10
                    }} />

                    {/* BOTTOM ACCENT LINE (3px) */}
                    <div style={{
                      position: 'absolute', top: `${centerY + itemH}px`, left: 0, right: 0,
                      height: '3px', backgroundColor: 'var(--color-accent)', zIndex: 10
                    }} />
                  </div>
                );
              })}
            </div>

            {totalUnusedSwjCount < 16 && (
              <div style={{
                backgroundColor: 'color-mix(in srgb, var(--color-danger) 15%, transparent)',
                border: '2px solid var(--color-danger)',
                borderRadius: '16px',
                padding: '10px 20px',
                marginTop: '15px',
                maxWidth: '650px',
                textAlign: 'center',
                boxShadow: '0 4px 15px color-mix(in srgb, var(--color-danger) 25%, transparent)'
              }}>
                <div style={{ color: 'var(--color-accent)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>⚠️</span>
                  <span>Question Quantity Warning</span>
                </div>
                <p style={{ color: 'var(--color-surface)', fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
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
                    backgroundColor: 'var(--color-action)',
                    color: 'var(--color-surface)',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px color-mix(in srgb, var(--color-primary-dark) 40%, transparent)',
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
                      backgroundColor: 'var(--color-action)',
                      color: 'var(--color-surface)',
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
                      backgroundColor: 'var(--color-accent)', 
                      color: 'var(--color-primary-dark)',
                      borderRadius: '14px',
                      flex: '1 1 auto',
                      maxWidth: '360px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    To Jeopardy Board &gt;
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* REFINED JEOPARDY BOARD VIEW */}
        {swState === 'BOARD' && (
          <div className="animate-slide-up" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%', 
            maxWidth: '1400px', 
            flex: 1,
            padding: '0 clamp(4px, 1.5vw, 15px)',
            boxSizing: 'border-box'
          }}>
            {/* BOARD CONTROLS & PROGRESS BANNER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginBottom: 'clamp(10px, 2vh, 18px)',
              padding: '8px 18px',
              backgroundColor: 'var(--color-primary-container)',
              border: '2px solid var(--color-primary)',
              borderRadius: '18px',
              boxSizing: 'border-box',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontWeight: 800, fontSize: 'clamp(0.95rem, 2vw, 1.25rem)' }}>
                <Sparkles size={22} color="var(--color-accent)" />
                <span>JEOPARDY BOARD</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-primary-dark)',
                padding: '6px 18px',
                borderRadius: '20px',
                color: 'var(--color-surface)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                fontWeight: 'bold',
                border: '1px solid var(--color-primary)'
              }}>
                <Award size={18} color="var(--color-accent)" />
                <span>Progress: {boardProgress.usedCount} / {boardProgress.totalTiles} Answered</span>
              </div>

              <button 
                onClick={startSpin}
                title="Spin categories reel again (Shortcut: R)"
                style={{
                  padding: '8px 20px',
                  fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                  backgroundColor: 'var(--color-action)',
                  color: 'var(--color-surface)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <RotateCcw size={16} />
                Respin Categories
              </button>
            </div>

            {/* INCOMPLETE TOPICS WARNING BANNER */}
            {incompleteTopicsWarning.length > 0 && (
              <div style={{
                width: '100%',
                backgroundColor: 'color-mix(in srgb, var(--color-danger) 18%, transparent)',
                border: '2px solid var(--color-danger)',
                borderRadius: '14px',
                padding: '10px 16px',
                marginBottom: 'clamp(10px, 1.8vh, 16px)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--color-accent)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px color-mix(in srgb, var(--color-danger) 20%, transparent)'
              }}>
                <AlertTriangle size={22} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--color-accent)' }}>Category Question Warning: </span>
                  <span style={{ color: 'var(--color-surface)', fontWeight: 600 }}>
                    {incompleteTopicsWarning.map(w => `${w.topic} (${w.unusedCount} unused)`).join(', ')}.
                  </span>
                  <span style={{ fontWeight: 400, color: 'var(--color-secondary)', marginLeft: '6px' }}>
                    Fewer than 4 questions were available; fallback questions are mapped to maintain 10-40 tiers.
                  </span>
                </div>
              </div>
            )}

            {/* 4 JEOPARDY COLUMNS GRID */}
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(6px, 1.5vw, 24px)', 
              width: '100%', 
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              {selectedTopics.map((topic, colIdx) => {
                const list = boardQuestions[topic] || getTieredQuestionsForTopic(topicMap.get(topic) || []);

                return (
                  <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.8vh, 18px)', flex: '1 1 0px', minWidth: 0, maxWidth: '300px' }}>
                    
                    {/* SOLID CATEGORY HEADER */}
                    <div style={{ 
                      backgroundColor: 'var(--color-accent)', 
                      color: 'var(--color-primary-dark)', 
                      padding: 'clamp(10px, 1.8vh, 16px) clamp(6px, 1vw, 12px)', 
                      borderRadius: '16px', 
                      textAlign: 'center', 
                      fontWeight: 900, 
                      fontSize: 'clamp(0.8rem, 2.2vw, 1.45rem)',
                      lineHeight: 1.15,
                      minHeight: 'clamp(48px, 8vh, 68px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      wordBreak: 'break-word',
                      boxSizing: 'border-box',
                      border: '2px solid var(--color-accent)',
                      letterSpacing: '0.5px'
                    }}>
                      {topic}
                    </div>
                    
                    {/* 4 POINT VALUE TILES */}
                    {list.map((q, rowIdx) => {
                      const isTileUsed = q.used;

                      return (
                        <button 
                          key={rowIdx} 
                          onClick={() => handleTileClick(q)}
                          className={isTileUsed ? 'jeopardy-tile-used' : 'jeopardy-tile-active'}
                          title={isTileUsed ? `Review ${q.scoreVal} Points Question` : `Select ${q.scoreVal} Points Question`}
                          style={{ 
                            position: 'relative',
                            padding: 'clamp(12px, 2.2vh, 22px) clamp(4px, 1vw, 10px)', 
                            fontSize: 'clamp(1.4rem, 3.8vw, 3rem)', 
                            fontWeight: 900,
                            letterSpacing: '1px',
                            backgroundColor: isTileUsed 
                              ? 'color-mix(in srgb, var(--color-primary-dark) 60%, transparent)' 
                              : 'var(--color-primary-container)',
                            color: isTileUsed 
                              ? 'color-mix(in srgb, var(--color-surface) 35%, transparent)' 
                              : 'var(--color-accent)',
                            border: isTileUsed 
                              ? '2px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' 
                              : '2px solid var(--color-primary)',
                            cursor: 'pointer',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}
                        >
                          {isTileUsed && (
                            <CheckCircle2 
                              size={18} 
                              color="var(--color-success)" 
                              style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.85 }} 
                            />
                          )}
                          <span>{q.scoreVal}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUESTION VIEW & FEEDBACK */}
        {(swState === 'QUESTION_VIEW' || swState === 'FEEDBACK') && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1500px', height: '100%', boxSizing: 'border-box' }}>
            
            <div style={{ margin: '0 clamp(10px, 3vw, 50px)', flexShrink: 0 }}>
              <p style={{ color: 'var(--color-secondary)', fontSize: 'clamp(1rem, 2.2vw, 1.4rem)', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Topic: {currentQ.topic} | Points: {currentQ.scoreVal}
              </p>
            </div>

            <div className="card" style={{ 
              flex: '1 1 0px', 
              minHeight: 'clamp(100px, 18vh, 220px)', 
              margin: '0 clamp(10px, 3vw, 50px) clamp(8px, 1.5vh, 18px)', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              padding: 'clamp(16px, 3vh, 30px)' 
            }}>
              {currentQ.image && <QuestionImage src={currentQ.image} maxHeight="180px" style={{ marginBottom: '12px' }} />}
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2.8rem)', color: 'var(--color-surface)', margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.25 }}>{currentQ.question}</h2>
            </div>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                let bgColor = 'var(--color-primary-container)';
                const isSelected = i === selectedOptIdx;
                const isRightAnswer = opt === currentQ.answer;

                if (swState === 'FEEDBACK' || (currentQ.used && selectedOptIdx !== -1)) {
                  if (isSelected) {
                    bgColor = isCorrect ? 'var(--color-success)' : 'var(--color-danger)';
                  } else if (!isCorrect && isRightAnswer) {
                    bgColor = 'var(--color-success)';
                  }
                }

                const optLetter = String.fromCharCode(65 + i);

                return (
                  <div 
                    key={i} 
                    className="option-card"
                    onClick={() => handleAnswer(i)}
                    style={{ backgroundColor: bgColor }}
                  >
                    <span style={{ color: 'var(--color-accent)', marginRight: '14px', flexShrink: 0 }}>
                      {optLetter}
                      <span className="option-kbd-badge">{i + 1}</span>
                    </span>
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
                backgroundColor: 'var(--color-action)',
                color: 'var(--color-surface)',
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

