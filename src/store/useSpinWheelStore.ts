import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

/** Sub-states for Spin Wheel round */
export type SWState = 'SPIN_READY' | 'SPINNING' | 'SPIN_DONE' | 'BOARD' | 'QUESTION_VIEW' | 'FEEDBACK';

/**
 * Zustand store interface for managing the Spin Wheel Jeopardy round.
 */
export interface SpinWheelState {
  /** Phase state of the Spin Wheel round */
  swState: SWState;
  /** List of topic names available on the wheel */
  selectedTopics: string[];
  /** Mapping of topic names to arrays of questions */
  boardQuestions: Record<string, Question[]>;
  /** Currently active/selected Question object */
  currentQ: Question | null;
  /** Index of option selected by user */
  selectedOptIdx: number;
  /** Correctness flag for answer feedback */
  isCorrect: boolean;
  /** Review mode flag for reviewing past questions */
  isReviewing: boolean;
  /** Map of question index to user answer index */
  userAnswers: Record<number, number>;

  /** Sets current Spin Wheel phase state */
  setSwState: (state: SWState) => void;
  /** Sets list of wheel topic names */
  setSelectedTopics: (topics: string[]) => void;
  /** Sets board question mapping per topic */
  setBoardQuestions: (bq: Record<string, Question[]>) => void;
  /** Sets currently active question */
  setCurrentQ: (q: Question | null) => void;
  /** Sets option index selected for active question */
  setSelectedOptIdx: (idx: number) => void;
  /** Sets answer correctness boolean */
  setIsCorrect: (correct: boolean) => void;
  /** Sets answer reviewing mode state */
  setIsReviewing: (reviewing: boolean) => void;
  /** Records user's selected answer index for question */
  setUserAnswer: (qIndex: number, optIdx: number) => void;
  /** Resets Spin Wheel store state back to default */
  resetSw: () => void;
}

const initialState = {
  swState: 'SPIN_READY' as SWState,
  selectedTopics: [],
  boardQuestions: {},
  currentQ: null,
  selectedOptIdx: -1,
  isCorrect: false,
  isReviewing: false,
  userAnswers: {},
};

/**
 * Global Zustand store hook with local storage persistence for Spin Wheel state.
 */
export const useSpinWheelStore = create<SpinWheelState>()(
  persist(
    (set) => ({
      ...initialState,
      setSwState: (state) => set({ swState: state }),
      setSelectedTopics: (topics) => set({ selectedTopics: topics }),
      setBoardQuestions: (bq) => set({ boardQuestions: bq }),
      setCurrentQ: (q) => set({ currentQ: q }),
      setSelectedOptIdx: (idx) => set({ selectedOptIdx: idx }),
      setIsCorrect: (correct) => set({ isCorrect: correct }),
      setIsReviewing: (reviewing) => set({ isReviewing: reviewing }),
      setUserAnswer: (qIndex, optIdx) => set((state) => ({
        userAnswers: { ...state.userAnswers, [qIndex]: optIdx }
      })),
      resetSw: () => set(initialState),
    }),
    {
      name: 'inquizitive-sw-storage',
    }
  )
);

