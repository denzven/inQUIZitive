import { useEffect, useRef } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { useRapidFireStore } from '../store/useRapidFireStore';
import { useBuzzerStore } from '../store/useBuzzerStore';
import { useSpinWheelStore } from '../store/useSpinWheelStore';
import { useTicTacToeStore } from '../store/useTicTacToeStore';
import { useAudioStore } from '../store/useAudioStore';
import { playButtonClick, playTileChime, playCorrectFanfare, playWrongBuzz } from '../utils/soundEffects';

/**
 * Custom React hook that binds global keyboard controls for live presenter gameplay.
 * Active across presenter gameplay and global state transitions.
 * 
 * Key bindings:
 * - `Ctrl+Z` / `Cmd+Z`: Reverts last state action (score, question, team updates).
 * - `+` or `=`: Emergency +5 Seconds added to active Rapid Fire countdown timer.
 * - `H` or `h`: Toggles Stealth Presentation Overlay.
 * - `Space`: Reveals current question answer (with 300ms debounce).
 * - `ArrowRight`: Advances to next question in round.
 * - `ArrowLeft`: Navigates to previous question.
 * - `Esc`: Return to Main Menu from any screen.
 * - `1-9`: Directly awards points to corresponding team ID (1 through 9).
 */
export const useGameControls = () => {
  const {
    gameState,
    nextQuestion,
    prevQuestion,
    revealAnswer,
    awardPoints,
    undoLastAction,
    toggleStealthMode,
  } = useQuizStore();

  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    /**
     * Window keydown event handler for presenter shortcuts.
     * Checks focused input elements to prevent accidental triggers while typing.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or if event was already handled
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        e.defaultPrevented
      ) {
        return;
      }

      // Universal Escape key handling to return to Menu from any sub-screen
      if (e.key === 'Escape') {
        const currentGameState = useQuizStore.getState().gameState;
        if (currentGameState !== 'MENU') {
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          playButtonClick();
          useQuizStore.getState().setGameState('MENU');
          return;
        }
      }

      // Universal Ctrl+Z / Cmd+Z Undo handling across all views
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const success = undoLastAction();
        if (success) {
          playButtonClick();
        }
        return;
      }

      // Universal 'H' stealth mode toggle
      if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleStealthMode();
        playButtonClick();
        return;
      }

      // Universal 'S' Settings screen navigation
      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useQuizStore.getState().setGameState('SETTINGS');
        playButtonClick();
        return;
      }

      // Universal 'F' Fullscreen mode toggle
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
        playButtonClick();
        return;
      }

      // Universal 'M' audio mute toggle
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const audioStore = useAudioStore.getState();
        audioStore.toggleMute();
        playButtonClick();
        return;
      }

      // Universal 'P' or 'K' key to toggle pause/resume on Rapid Fire timer
      if ((e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'k') && !e.ctrlKey && !e.metaKey) {
        const rfStore = useRapidFireStore.getState();
        if (rfStore.rfState === 'PLAYING' || rfStore.rfState === 'FEEDBACK') {
          e.preventDefault();
          rfStore.setIsPaused(!rfStore.isPaused);
          playButtonClick();
          return;
        }
      }

      // Emergency +5s timer buffer for Rapid Fire round
      if (e.key === '+' || e.key === '=') {
        const rfStore = useRapidFireStore.getState();
        if (rfStore.rfState === 'PLAYING' || rfStore.rfState === 'FEEDBACK') {
          e.preventDefault();
          rfStore.setTimer((prev: number) => prev + 5);
          playTileChime(1);
          return;
        }
      }

      // 300ms Debouncing Lock to prevent accidental double-tap triggering
      const now = Date.now();
      if (now - lastKeyTimeRef.current < 300) {
        if ([' ', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
          e.preventDefault();
          return;
        }
      }

      if (gameState !== 'PLAYING') return;

      lastKeyTimeRef.current = now;

      const activeRound = useQuizStore.getState().activeRound;

      switch (e.key) {
        case ' ': // Spacebar
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          if (activeRound === 'RF') {
            const rfStore = useRapidFireStore.getState();
            if (rfStore.rfQuestions[rfStore.currentIdx]) {
              rfStore.setQuestionRevealed(rfStore.currentIdx);
            }
          } else if (activeRound === 'B') {
            const bStore = useBuzzerStore.getState();
            if (bStore.buzzerQuestions[bStore.currentIdx]) {
              bStore.setQuestionRevealed(bStore.currentIdx);
            }
          } else if (activeRound === 'SWJ') {
            const swStore = useSpinWheelStore.getState();
            if (swStore.swState === 'SPIN_READY') {
              // Space triggers spin
            } else if (swStore.swState === 'QUESTION_VIEW') {
              swStore.setSwState('FEEDBACK');
            }
          } else if (activeRound === 'TTT') {
            const tttStore = useTicTacToeStore.getState();
            if (tttStore.selectedIdx !== -1 && tttStore.selectedIdx !== null) {
              tttStore.setIsAnswerRevealed(true);
            }
          } else {
            revealAnswer();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          if (activeRound === 'RF') {
            const rfStore = useRapidFireStore.getState();
            if (rfStore.rfState === 'PLAYING' || rfStore.rfState === 'FEEDBACK') {
              rfStore.setRfState('PLAYING');
              rfStore.setSelectedOptIdx(-1);
              rfStore.setIsCorrect(false);
              if (rfStore.userAnswers[rfStore.currentIdx] === undefined) {
                rfStore.passQuestion(rfStore.currentIdx);
              }
              if (rfStore.currentIdx < rfStore.rfQuestions.length - 1) {
                rfStore.setCurrentIdx((prev: number) => prev + 1);
              }
            }
          } else if (activeRound === 'B') {
            const bStore = useBuzzerStore.getState();
            if (bStore.currentIdx < bStore.buzzerQuestions.length - 1) {
              bStore.setCurrentIdx((prev: number) => prev + 1);
            }
          } else if (activeRound === 'SWJ') {
            const swStore = useSpinWheelStore.getState();
            if (swStore.swState === 'FEEDBACK' || swStore.swState === 'QUESTION_VIEW') {
              swStore.setSwState('BOARD');
              swStore.setCurrentQ(null);
            }
          } else {
            nextQuestion();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          if (activeRound === 'RF') {
            const rfStore = useRapidFireStore.getState();
            if (rfStore.currentIdx > 0) {
              rfStore.setRfState('PLAYING');
              rfStore.setSelectedOptIdx(-1);
              rfStore.setIsCorrect(false);
              rfStore.setCurrentIdx((prev: number) => prev - 1);
            }
          } else if (activeRound === 'B') {
            const bStore = useBuzzerStore.getState();
            if (bStore.currentIdx > 0) {
              bStore.setCurrentIdx((prev: number) => prev - 1);
            }
          } else if (activeRound === 'SWJ') {
            const swStore = useSpinWheelStore.getState();
            if (swStore.swState === 'FEEDBACK' || swStore.swState === 'QUESTION_VIEW') {
              swStore.setSwState('BOARD');
              swStore.setCurrentQ(null);
            }
          } else {
            prevQuestion();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4': {
          const numVal = parseInt(e.key);
          const optIdx = numVal - 1;
          if (activeRound === 'RF') {
            const rfStore = useRapidFireStore.getState();
            if ((rfStore.rfState === 'PLAYING' || rfStore.rfState === 'FEEDBACK') && !rfStore.isPaused) {
              e.preventDefault();
              (document.activeElement as HTMLElement)?.blur();
              const currentQ = rfStore.rfQuestions[rfStore.currentIdx];
              if (currentQ) {
                const selectedText = currentQ.options[optIdx];
                const correct = selectedText === currentQ.answer;
                if (correct) playCorrectFanfare(); else playWrongBuzz();
                if (rfStore.userAnswers[rfStore.currentIdx] === undefined && correct) {
                  rfStore.setScore((prev: number) => prev + currentQ.scoreVal);
                  rfStore.setCorrectCount((prev: number) => prev + 1);
                }
                if (rfStore.passedQuestions[rfStore.currentIdx]) rfStore.removePassQuestion(rfStore.currentIdx);
                rfStore.setUserAnswer(rfStore.currentIdx, optIdx);
                rfStore.setQuestionRevealed(rfStore.currentIdx);
                rfStore.setSelectedOptIdx(optIdx);
                rfStore.setIsCorrect(correct);
                rfStore.setRfState('FEEDBACK');
              }
            }
          } else if (activeRound === 'B') {
            const bStore = useBuzzerStore.getState();
            if (bStore.buzzerState === 'PLAYING') {
              e.preventDefault();
              (document.activeElement as HTMLElement)?.blur();
              const currentQ = bStore.buzzerQuestions[bStore.currentIdx];
              if (currentQ) {
                if (currentQ.options[optIdx] === currentQ.answer) playCorrectFanfare(); else playWrongBuzz();
                bStore.setUserAnswer(bStore.currentIdx, optIdx);
                bStore.setQuestionRevealed(bStore.currentIdx);
              }
            }
          } else if (activeRound === 'SWJ') {
            const swStore = useSpinWheelStore.getState();
            if (swStore.swState === 'QUESTION_VIEW' && swStore.currentQ) {
              e.preventDefault();
              (document.activeElement as HTMLElement)?.blur();
              const currentQ = swStore.currentQ;
              const correct = currentQ.options[optIdx] === currentQ.answer;
              if (correct) playCorrectFanfare(); else playWrongBuzz();
              swStore.setSelectedOptIdx(optIdx);
              swStore.setIsCorrect(correct);
              swStore.setIsReviewing(false);
              if (currentQ.index !== undefined && currentQ.index !== -1) {
                swStore.setUserAnswer(currentQ.index, optIdx);
              }
              swStore.setSwState('FEEDBACK');
            }
          } else if (activeRound === 'TTT') {
            const tttStore = useTicTacToeStore.getState();
            if (tttStore.selectedIdx !== -1 && tttStore.selectedIdx !== null) {
              e.preventDefault();
              (document.activeElement as HTMLElement)?.blur();
              tttStore.setIsAnswerRevealed(true);
            }
          } else {
            awardPoints(numVal);
          }
          break;
        }
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          awardPoints(parseInt(e.key));
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, nextQuestion, prevQuestion, revealAnswer, awardPoints, undoLastAction, toggleStealthMode]);
};


