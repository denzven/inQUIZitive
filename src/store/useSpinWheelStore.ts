import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

export type SWState = 'SPIN_READY' | 'SPINNING' | 'SPIN_DONE' | 'BOARD' | 'QUESTION_VIEW' | 'FEEDBACK';

export interface SpinWheelState {
  swState: SWState;
  selectedTopics: string[];
  boardQuestions: Record<string, Question[]>;
  currentQ: Question | null;
  selectedOptIdx: number;
  isCorrect: boolean;
  isReviewing: boolean;
  userAnswers: Record<number, number>;

  setSwState: (state: SWState) => void;
  setSelectedTopics: (topics: string[]) => void;
  setBoardQuestions: (bq: Record<string, Question[]>) => void;
  setCurrentQ: (q: Question | null) => void;
  setSelectedOptIdx: (idx: number) => void;
  setIsCorrect: (correct: boolean) => void;
  setIsReviewing: (reviewing: boolean) => void;
  setUserAnswer: (qIndex: number, optIdx: number) => void;
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
