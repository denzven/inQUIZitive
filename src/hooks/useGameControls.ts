import { useEffect, useRef } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { useRapidFireStore } from '../store/useRapidFireStore';
import { useAudioStore } from '../store/useAudioStore';
import { playButtonClick, playTileChime } from '../utils/soundEffects';

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
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
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
          rfStore.setTimer(prev => prev + 5);
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

      switch (e.key) {
        case ' ': // Spacebar
          e.preventDefault();
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, nextQuestion, prevQuestion, revealAnswer, awardPoints, undoLastAction, toggleStealthMode]);
};


