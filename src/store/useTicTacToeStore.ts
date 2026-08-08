import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from './useQuizStore';

/** Sub-states for Tic-Tac-Toe round */
export type TTTState = 'READY' | 'PLAYING' | 'FEEDBACK' | 'END';

/**
 * Zustand store interface for managing the Tic-Tac-Toe Quiz round.
 */
export interface TicTacToeState {
  /** 3x3 board grid state containing 'X', 'O', or null per cell index (0-8) */
  board: Array<string | null>;
  /** Current phase state of Tic-Tac-Toe round */
  tttState: TTTState;
  /** Current active player symbol ('X' or 'O') */
  currentPlayer: 'X' | 'O';
  /** Game outcome winner symbol ('X', 'O', 'DRAW', or null) */
  winner: 'X' | 'O' | 'DRAW' | null;
  /** Currently selected grid cell index */
  selectedIdx: number;
  /** Array of questions allocated to Tic-Tac-Toe cells */
  tttQuestions: Question[];
  /** Flag indicating if cell question answer is revealed */
  isAnswerRevealed: boolean;

  /** Updates 3x3 board cell array via new array or updater function */
  setBoard: (updater: Array<string | null> | ((prev: Array<string | null>) => Array<string | null>)) => void;
  /** Sets active Tic-Tac-Toe phase state */
  setTttState: (state: TTTState) => void;
  /** Switches current active player turn */
  setCurrentPlayer: (player: 'X' | 'O') => void;
  /** Sets game winner or draw result */
  setWinner: (winner: 'X' | 'O' | 'DRAW' | null) => void;
  /** Sets active cell index selected by player */
  setSelectedIdx: (idx: number) => void;
  /** Sets question dataset for Tic-Tac-Toe cells */
  setTttQuestions: (questions: Question[]) => void;
  /** Sets answer reveal state for active cell question */
  setIsAnswerRevealed: (revealed: boolean) => void;
  /** Resets Tic-Tac-Toe board and state back to default */
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

/**
 * Global Zustand store hook with local storage persistence for Tic-Tac-Toe state.
 */
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

