import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

/** Represents the current state of the Buzzer round */
export type BuzzerState = 'READY' | 'PLAYING';

/**
 * Zustand store interface for managing the Buzzer Round state.
 */
export interface BuzzerRoundState {
  /** Array of questions allocated for the Buzzer round */
  buzzerQuestions: Question[];
  /** Index of currently active question */
  currentIdx: number;
  /** Current state of the buzzer round ('READY' | 'PLAYING') */
  buzzerState: BuzzerState;
  /** Record mapping question index to selected answer option index */
  userAnswers: Record<number, number>;
  /** Record tracking revealed answer state by question index */
  revealedQuestions: Record<number, boolean>;

  /** Sets the list of questions for the buzzer round */
  setBuzzerQuestions: (questions: Question[]) => void;
  /** Updates current question index via static number or updater function */
  setCurrentIdx: (updater: number | ((prev: number) => number)) => void;
  /** Sets active state of the buzzer round */
  setBuzzerState: (state: BuzzerState) => void;
  /** Records user's selected option index for a given question index */
  setUserAnswer: (qIdx: number, optIdx: number) => void;
  /** Marks a question's answer as revealed */
  setQuestionRevealed: (qIdx: number) => void;
  /** Resets buzzer state back to initial state */
  resetBuzzer: () => void;
}

const initialState = {
  buzzerQuestions: [],
  currentIdx: 0,
  buzzerState: 'READY' as BuzzerState,
  userAnswers: {},
  revealedQuestions: {},
};

/**
 * Global Zustand store hook with local storage persistence for Buzzer round state.
 */
export const useBuzzerStore = create<BuzzerRoundState>()(
  persist(
    (set) => ({
      ...initialState,
      setBuzzerQuestions: (questions) => set({ buzzerQuestions: questions }),
      setCurrentIdx: (updater) => set((state) => ({
        currentIdx: typeof updater === 'function' ? updater(state.currentIdx) : updater
      })),
      setBuzzerState: (state) => set({ buzzerState: state }),
      setUserAnswer: (qIdx, optIdx) => set((state) => ({
        userAnswers: { ...state.userAnswers, [qIdx]: optIdx }
      })),
      setQuestionRevealed: (qIdx) => set((state) => ({
        revealedQuestions: { ...state.revealedQuestions, [qIdx]: true }
      })),
      resetBuzzer: () => set(initialState),
    }),
    {
      name: 'inquizitive-buzzer-storage',
    }
  )
);

