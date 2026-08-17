import React, { useEffect, useMemo } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { QuestionImage } from './QuestionImage';
import { Trophy, X, Circle, RotateCcw, Home } from 'lucide-react';
import { useTicTacToeStore } from '../store/useTicTacToeStore';
import { seededShuffle } from '../utils/random';
import { playTileChime, playCorrectFanfare, playWrongBuzz } from '../utils/soundEffects';
import { preloadQuestionImages } from '../utils/imagePreloader';

/**
 * TicTacToeScreen Component (Tiebreaker Round).
 * Features a 3x3 interactive grid for head-to-head tiebreaker competition between Team X and Team O.
 * Clicking a cell launches its assigned question and awards the cell mark upon answer verification.
 */
export const TicTacToeScreen: React.FC = () => {
  const { questions, setGameState, markQuestionUsed, teams, seed } = useQuizStore();

  // Pick first 2 teams as Tiebreaker participants
  const teamX = teams[0] ? teams[0].name : 'Team X';
  const teamO = teams[1] ? teams[1].name : 'Team O';

  const unusedTttCount = useMemo(() => questions.filter(q => q.roundCode === 'TTT' && !q.used).length, [questions]);

  /** Prepares 9 questions allocated for the 3x3 Tic-Tac-Toe grid */
  const tttQuestions = useMemo(() => {
    const available = questions.filter(q => q.roundCode === 'TTT' && !q.used);
    const shuffled = seededShuffle(available, `${seed}_ttt`);
    // Fill up to 9 with dummy if needed
    const list = [...shuffled];
    let i = 1;
    while (list.length < 9) {
      list.push({
        index: -100 - i,
        roundCode: 'TTT',
        topic: 'Tiebreaker',
        question: `Tiebreaker Question ${i}`,
        answer: 'Correct Answer',
        options: ['Correct Answer', 'Option B', 'Option C', 'Option D'],
        scoreVal: 10,
        used: false
      });
      i++;
    }
    return list.slice(0, 9);
  }, [questions, seed]);

  /** Preload grid images into browser cache */
  useEffect(() => {
    preloadQuestionImages(tttQuestions);
  }, [tttQuestions]);


  // Persisted Store State
  const {
    board, setBoard,
    selectedIdx, setSelectedIdx,
    isAnswerRevealed, setIsAnswerRevealed,
    resetTtt
  } = useTicTacToeStore();

  /**
   * Evaluates 3x3 board array for winning 3-in-a-row lines (rows, columns, diagonals).
   * 
   * @param b - The current 9-element board state array.
   * @returns 'X', 'O', or null if no 3-in-a-row winner exists.
   */
  const checkWinner = (b: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, c, d] = lines[i];
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return b[a];
      }
    }
    return null;
  };

  const winner = checkWinner(board);

  /**
   * Handles user click on a 3x3 grid tile button to view its assigned question.
   * 
   * @param index - The cell index (0 to 8).
   */
  const handleTileClick = (index: number) => {
    (document.activeElement as HTMLElement)?.blur();
    if (winner) return;
    playTileChime(index);
    setSelectedIdx(index);
    setIsAnswerRevealed(false);

    // Mark question as used immediately when displayed/opened
    const q = tttQuestions[index];
    if (q) {
      q.used = true;
      if (q.index >= 0) {
        markQuestionUsed(q.index);
      }
    }
  };

  /**
   * Assigns 'X', 'O', or null to the currently active tile upon answer resolution.
   * 
   * @param claim - Symbol to claim cell ('X' | 'O' | null).
   */
  const handleAssignTile = (claim: 'X' | 'O' | null) => {
    (document.activeElement as HTMLElement)?.blur();
    if (selectedIdx === null || selectedIdx === -1) return;

    if (claim === 'X' || claim === 'O') {
      playCorrectFanfare();
    } else {
      playWrongBuzz();
    }

    const newBoard = [...board];
    newBoard[selectedIdx] = claim;
    setBoard(newBoard);

    setSelectedIdx(-1);
    setIsAnswerRevealed(false);
  };

  /** Keyboard shortcuts listener for Tic-Tac-Toe Tiebreaker */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const lowerKey = e.key.toLowerCase();

      if (selectedIdx !== -1 && selectedIdx !== null) {
        // Active Question Modal View
        if (e.key === ' ') {
          e.preventDefault();
          setIsAnswerRevealed(true);
        } else if (isAnswerRevealed) {
          if (lowerKey === 'x') {
            e.preventDefault();
            handleAssignTile('X');
          } else if (lowerKey === 'o') {
            e.preventDefault();
            handleAssignTile('O');
          } else if (lowerKey === 'u' || lowerKey === 'p') {
            e.preventDefault();
            handleAssignTile(null);
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedIdx(-1);
          setIsAnswerRevealed(false);
        }
      } else {
        // Grid View: 1-9 key presses launch corresponding grid tile
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
          const tileIdx = parseInt(e.key) - 1;
          if (tileIdx >= 0 && tileIdx < 9 && board[tileIdx] === null) {
            e.preventDefault();
            handleTileClick(tileIdx);
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          resetTtt();
          setGameState('MENU');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, isAnswerRevealed, board, handleAssignTile, handleTileClick, setIsAnswerRevealed, setSelectedIdx, resetTtt, setGameState]);

  const activeQuestion = selectedIdx !== -1 ? tttQuestions[selectedIdx] : null;

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => { resetTtt(); setGameState('MENU'); }}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%',
        flex: 1,
        boxSizing: 'border-box',
        margin: 'auto 0',
        padding: '5px 10px'
      }}>
        {/* TITLE DIRECTLY ABOVE GRID */}
        <h1 className="title" style={{ 
          marginTop: 0, 
          fontSize: 'clamp(2rem, min(5vw, 4.5vh), 3.5rem)', 
          marginBottom: '8px', 
          textAlign: 'center', 
          width: '100%',
          letterSpacing: '1px'
        }}>
          Tic-Tac-Toe (Tiebreaker)
        </h1>

        {/* QUESTION QUANTITY WARNING BANNER */}
        {unusedTttCount < 9 && (
          <div style={{
            backgroundColor: 'rgba(231, 76, 60, 0.15)',
            border: '2px solid var(--wrong-red)',
            borderRadius: '16px',
            padding: '8px 20px',
            marginBottom: '10px',
            maxWidth: '650px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.25)'
          }}>
            <div style={{ color: 'var(--yellow)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <span>Question Quantity Warning</span>
            </div>
            <p style={{ color: 'var(--white)', fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Only {unusedTttCount} unused TTT question(s) available (9 required). Used questions were excluded to prevent duplicates.
            </p>
          </div>
        )}

        {/* TEAM BADGES WITH LUCIDE ICONS */}
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(15px, 4vw, 30px)', 
          marginBottom: 'clamp(10px, 2vh, 18px)', 
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
          fontWeight: 'bold', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%', 
          textAlign: 'center' 
        }}>
          <span style={{ color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <X size={22} strokeWidth={3} color="var(--yellow)" /> {teamX}
          </span>
          <span style={{ color: 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Circle size={20} strokeWidth={3} color="var(--orange)" /> {teamO}
          </span>
        </div>

        {/* WINNER MODAL DIALOG - ABSOLUTE VIEWPORT CENTER */}
        {winner && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.88)', 
            zIndex: 200,
            backdropFilter: 'blur(8px)'
          }}>
            <div className="animate-pop-in-absolute" style={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--yellow)', 
              color: 'var(--dark-green)',
              border: '4px solid var(--orange)', 
              borderRadius: '32px', 
              width: 'min(90vw, 550px)', 
              padding: '40px 30px', 
              textAlign: 'center',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              zIndex: 210,
              boxSizing: 'border-box'
            }}>
              <div style={{ 
                width: '85px', height: '85px', borderRadius: '50%', backgroundColor: 'var(--dark-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <Trophy size={48} color="var(--yellow)" strokeWidth={2} />
              </div>

              <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', color: 'var(--dark-green)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
                Tiebreaker Champion
              </h2>

              <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', color: 'var(--orange)', margin: '12px 0 25px 0', fontWeight: 900 }}>
                {winner === 'X' ? teamX : teamO}
              </h1>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                <button 
                  onClick={() => setBoard(Array(9).fill(null))} 
                  style={{ 
                    padding: '14px 28px', fontSize: '1.2rem', backgroundColor: 'var(--dark-green)', color: 'var(--white)', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <RotateCcw size={20} /> Play Again
                </button>
                <button className="menu-btn" onClick={() => { resetTtt(); setGameState('MENU'); }} style={{ flex: 1, backgroundColor: 'var(--orange)' }}>
                  <Home size={24} /> Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3x3 GRID - PERFECT 1:1 SQUARE & NO MOBILE CLIPPING */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 'clamp(8px, 1.8vh, 18px)', 
          width: 'min(86vw, 60vh, 560px)', 
          maxWidth: 'calc(100vw - 32px)',
          aspectRatio: '1',
          margin: '0 auto',
          justifyContent: 'center',
          alignContent: 'center',
          boxSizing: 'border-box'
        }}>
          {board.map((tile, idx) => {
            const q = tttQuestions[idx];
            const isUsed = tile !== null || (q && q.used);

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: '1',
                  fontSize: 'clamp(2.8rem, min(9vw, 8vh), 5.5rem)',
                  fontWeight: 900,
                  backgroundColor: tile === 'X' ? 'var(--orange)' : tile === 'O' ? 'var(--yellow)' : 'var(--teal)',
                  color: tile === 'O' ? 'var(--dark-green)' : 'var(--white)',
                  borderRadius: 'clamp(14px, 3.5vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  border: isUsed ? '2px solid transparent' : '2px solid var(--light-orange)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {tile ? tile : idx + 1}
              </button>
            );
          })}
        </div>

        {/* QUESTION MODAL - ABSOLUTE VIEWPORT CENTER */}
        {activeQuestion && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', 
            zIndex: 100,
            backdropFilter: 'blur(5px)'
          }}>
            <div className="animate-pop-in-absolute" style={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--dark-green)', border: '3px solid var(--teal)', borderRadius: '28px', 
              width: 'min(92vw, 850px)', padding: '35px clamp(20px, 4vw, 45px)', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              zIndex: 110,
              boxSizing: 'border-box'
            }}>
              <h3 style={{ color: 'var(--light-orange)', fontSize: '1.3rem', marginTop: 0, marginBottom: '10px' }}>
                Tile #{selectedIdx! + 1} Question
              </h3>
              
              {activeQuestion.image && <QuestionImage src={activeQuestion.image} maxHeight="180px" />}

              <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', color: 'var(--white)', margin: '10px auto 25px auto', textAlign: 'center', width: '100%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {activeQuestion.question}
              </h2>

              {/* OPTIONS GRID - CENTERED */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '15px', 
                width: '100%', 
                marginBottom: '25px',
                boxSizing: 'border-box' 
              }}>
                {activeQuestion.options.map((opt, i) => (
                  <div 
                    key={i} 
                    className="option-card"
                    style={{ 
                      backgroundColor: isAnswerRevealed && opt === activeQuestion.answer ? 'var(--correct-green)' : 'var(--dark-teal)',
                      color: 'var(--white)',
                      fontSize: '1.3rem',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ color: 'var(--yellow)', marginRight: '15px', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                    <span style={{ wordBreak: 'break-word' }}>{opt}</span>
                  </div>
                ))}
              </div>

              {!isAnswerRevealed ? (
                <button 
                  onClick={() => setIsAnswerRevealed(true)}
                  style={{ padding: '14px 40px', fontSize: '1.4rem', backgroundColor: 'var(--yellow)', color: 'var(--dark-green)' }}
                >
                  Reveal Answer
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleAssignTile('X')} 
                    style={{ padding: '14px 28px', fontSize: '1.2rem', backgroundColor: 'var(--orange)' }}
                  >
                    Assign to {teamX} (X)
                  </button>
                  <button 
                    onClick={() => handleAssignTile('O')} 
                    style={{ padding: '14px 28px', fontSize: '1.2rem', backgroundColor: 'var(--yellow)', color: 'var(--dark-green)' }}
                  >
                    Assign to {teamO} (O)
                  </button>
                  <button 
                    onClick={() => handleAssignTile(null)} 
                    style={{ padding: '14px 28px', fontSize: '1.2rem', backgroundColor: 'var(--dark-teal)' }}
                  >
                    Unanswered / Pass
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
};

