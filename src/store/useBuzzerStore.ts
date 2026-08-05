import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

export type BuzzerState = 'READY' | 'PLAYING';

export interface BuzzerRoundState {
  buzzerQuestions: Question[];
  currentIdx: number;
  buzzerState: BuzzerState;
  userAnswers: Record<number, number>;
  revealedQuestions: Record<number, boolean>;

  setBuzzerQuestions: (questions: Question[]) => void;
  setCurrentIdx: (updater: number | ((prev: number) => number)) => void;
  setBuzzerState: (state: BuzzerState) => void;
  setUserAnswer: (qIdx: number, optIdx: number) => void;
  setQuestionRevealed: (qIdx: number) => void;
  resetBuzzer: () => void;
}

const initialState = {
  buzzerQuestions: [],
  currentIdx: 0,
  buzzerState: 'READY' as BuzzerState,
  userAnswers: {},
  revealedQuestions: {},
};

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
