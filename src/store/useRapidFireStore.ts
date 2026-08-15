import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

/** Sub-states for Rapid Fire gameplay phase */
export type RFState = 'READY' | 'PLAYING' | 'FEEDBACK' | 'END';

/**
 * Zustand store state interface for managing the Rapid Fire round.
 */
export interface RapidFireState {
  /** Array of questions allocated for Rapid Fire */
  rfQuestions: Question[];
  /** Current state of the Rapid Fire round */
  rfState: RFState;
  /** Timer countdown in seconds */
  timer: number;
  /** Whether countdown timer is currently paused */
  isPaused: boolean;
  /** Index of currently active question */
  currentIdx: number;
  /** Accumulated total score in Rapid Fire */
  score: number;
  /** Count of correct answers given */
  correctCount: number;
  /** Index of selected option in current question */
  selectedOptIdx: number;
  /** Flag indicating whether the last submitted answer was correct */
  isCorrect: boolean;
  /** Map of question index to user's selected option index */
  userAnswers: Record<number, number>;
  /** Map tracking revealed questions */
  revealedQuestions: Record<number, boolean>;
  /** Map tracking passed questions that can be revisited */
  passedQuestions: Record<number, boolean>;

  /** Sets questions for Rapid Fire round */
  setRfQuestions: (questions: Question[]) => void;
  /** Sets active Rapid Fire phase state */
  setRfState: (state: RFState) => void;
  /** Updates countdown timer */
  setTimer: (updater: number | ((prev: number) => number)) => void;
  /** Toggles countdown timer pause state */
  setIsPaused: (isPaused: boolean) => void;
  /** Updates current question index */
  setCurrentIdx: (updater: number | ((prev: number) => number)) => void;
  /** Updates team score count */
  setScore: (updater: number | ((prev: number) => number)) => void;
  /** Updates count of correct answers */
  setCorrectCount: (updater: number | ((prev: number) => number)) => void;
  /** Sets selected option index for question feedback */
  setSelectedOptIdx: (idx: number) => void;
  /** Sets correctness flag for answer feedback view */
  setIsCorrect: (isCorrect: boolean) => void;
  /** Records user option selection for question index */
  setUserAnswer: (qIdx: number, optIdx: number) => void;
  /** Marks question index as revealed */
  setQuestionRevealed: (qIdx: number) => void;
  /** Marks question index as passed */
  passQuestion: (qIdx: number) => void;
  /** Removes question index from passed map */
  removePassQuestion: (qIdx: number) => void;
  /** Resets entire Rapid Fire state back to initial default */
  resetRf: () => void;
}

const initialState = {
  rfQuestions: [],
  rfState: 'READY' as RFState,
  timer: 60,
  isPaused: false,
  currentIdx: 0,
  score: 0,
  correctCount: 0,
  selectedOptIdx: -1,
  isCorrect: false,
  userAnswers: {},
  revealedQuestions: {},
  passedQuestions: {},
};

/**
 * Global Zustand store hook with local storage persistence for Rapid Fire state.
 */
export const useRapidFireStore = create<RapidFireState>()(
  persist(
    (set) => ({
      ...initialState,
      setRfQuestions: (questions) => set({ rfQuestions: questions }),
      setRfState: (state) => set({ rfState: state }),
      setTimer: (updater) => set((state) => ({ 
        timer: typeof updater === 'function' ? updater(state.timer) : updater 
      })),
      setIsPaused: (isPaused) => set({ isPaused }),
      setCurrentIdx: (updater) => set((state) => ({ 
        currentIdx: typeof updater === 'function' ? updater(state.currentIdx) : updater 
      })),
      setScore: (updater) => set((state) => ({ 
        score: typeof updater === 'function' ? updater(state.score) : updater 
      })),
      setCorrectCount: (updater) => set((state) => ({ 
        correctCount: typeof updater === 'function' ? updater(state.correctCount) : updater 
      })),
      setSelectedOptIdx: (idx) => set({ selectedOptIdx: idx }),
      setIsCorrect: (isCorrect) => set({ isCorrect }),
      setUserAnswer: (qIdx, optIdx) => set((state) => ({
        userAnswers: { ...state.userAnswers, [qIdx]: optIdx }
      })),
      setQuestionRevealed: (qIdx) => set((state) => ({
        revealedQuestions: { ...state.revealedQuestions, [qIdx]: true }
      })),
      passQuestion: (qIdx) => set((state) => ({
        passedQuestions: { ...state.passedQuestions, [qIdx]: true }
      })),
      removePassQuestion: (qIdx) => set((state) => {
        const nextPassed = { ...state.passedQuestions };
        delete nextPassed[qIdx];
        return { passedQuestions: nextPassed };
      }),
      resetRf: () => set(initialState),
    }),
    {
      name: 'inquizitive-rf-storage',
    }
  )
);

