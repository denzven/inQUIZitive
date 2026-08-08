import { useEffect } from 'react';
import { useQuizStore } from '../store/useQuizStore';

/**
 * Custom React hook that binds global keyboard controls for live presenter gameplay.
 * Active only when `gameState === 'PLAYING'` and the focused element is not an input/textarea.
 * 
 * Key bindings:
 * - `Space`: Reveals current question answer.
 * - `ArrowRight`: Advances to the next question in the round.
 * - `ArrowLeft`: Navigates to the previous question.
 * - `1-9`: Directly awards points to the corresponding team ID (1 through 9).
 */
export const useGameControls = () => {
  const {
    gameState,
    setGameState,
    nextQuestion,
    prevQuestion,
    revealAnswer,
    awardPoints,
  } = useQuizStore();

  useEffect(() => {
    /**
     * Window keydown event handler for presenter shortcuts.
     * Checks focused input elements to prevent accidental triggers while typing.
     * 
     * @param e - The KeyboardEvent object dispatched by the browser.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (gameState !== 'PLAYING') return;

      switch (e.key) {
        case ' ': // Spacebar
          e.preventDefault(); // Prevent scrolling
          revealAnswer();
          break;
        case 'ArrowRight':
          nextQuestion();
          break;
        case 'ArrowLeft':
          prevQuestion();
          break;
        case '1':
          awardPoints(1);
          break;
        case '2':
          awardPoints(2);
          break;
        case '3':
          awardPoints(3);
          break;
        case '4':
          awardPoints(4);
          break;
        case '5':
          awardPoints(5);
          break;
        case '6':
          awardPoints(6);
          break;
        case '7':
          awardPoints(7);
          break;
        case '8':
          awardPoints(8);
          break;
        case '9':
          awardPoints(9);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, nextQuestion, prevQuestion, revealAnswer, awardPoints, setGameState]);
};

