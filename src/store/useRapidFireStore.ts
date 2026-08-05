import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

export type RFState = 'READY' | 'PLAYING' | 'FEEDBACK' | 'END';

export interface RapidFireState {
  rfQuestions: Question[];
  rfState: RFState;
  timer: number;
  isPaused: boolean;
  currentIdx: number;
  score: number;
  correctCount: number;
  selectedOptIdx: number;
  isCorrect: boolean;
  userAnswers: Record<number, number>;
  revealedQuestions: Record<number, boolean>;

  setRfQuestions: (questions: Question[]) => void;
  setRfState: (state: RFState) => void;
  setTimer: (updater: number | ((prev: number) => number)) => void;
  setIsPaused: (isPaused: boolean) => void;
  setCurrentIdx: (updater: number | ((prev: number) => number)) => void;
  setScore: (updater: number | ((prev: number) => number)) => void;
  setCorrectCount: (updater: number | ((prev: number) => number)) => void;
  setSelectedOptIdx: (idx: number) => void;
  setIsCorrect: (isCorrect: boolean) => void;
  setUserAnswer: (qIdx: number, optIdx: number) => void;
  setQuestionRevealed: (qIdx: number) => void;
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
};

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
      resetRf: () => set(initialState),
    }),
    {
      name: 'inquizitive-rf-storage',
    }
  )
);
