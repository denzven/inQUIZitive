import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

export type TTTState = 'READY' | 'PLAYING' | 'FEEDBACK' | 'END';

export interface TicTacToeState {
  board: Array<string | null>;
  tttState: TTTState;
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | 'DRAW' | null;
  selectedIdx: number;
  tttQuestions: Question[];
  isAnswerRevealed: boolean;

  setBoard: (updater: Array<string | null> | ((prev: Array<string | null>) => Array<string | null>)) => void;
  setTttState: (state: TTTState) => void;
  setCurrentPlayer: (player: 'X' | 'O') => void;
  setWinner: (winner: 'X' | 'O' | 'DRAW' | null) => void;
  setSelectedIdx: (idx: number) => void;
  setTttQuestions: (questions: Question[]) => void;
  setIsAnswerRevealed: (revealed: boolean) => void;
  resetTtt: () => void;
}

const initialState = {
  board: Array(9).fill(null),
  tttState: 'READY' as TTTState,
  currentPlayer: 'X' as 'X' | 'O',
  winner: null,
  selectedIdx: -1,
  tttQuestions: [],
  isAnswerRevealed: false,
};

export const useTicTacToeStore = create<TicTacToeState>()(
  persist(
    (set) => ({
      ...initialState,
      setBoard: (updater) => set((state) => ({ 
        board: typeof updater === 'function' ? updater(state.board) : updater 
      })),
      setTttState: (state) => set({ tttState: state }),
      setCurrentPlayer: (player) => set({ currentPlayer: player }),
      setWinner: (winner) => set({ winner }),
      setSelectedIdx: (idx) => set({ selectedIdx: idx }),
      setTttQuestions: (questions) => set({ tttQuestions: questions }),
      setIsAnswerRevealed: (revealed) => set({ isAnswerRevealed: revealed }),
      resetTtt: () => set(initialState),
    }),
    {
      name: 'inquizitive-ttt-storage',
    }
  )
);
