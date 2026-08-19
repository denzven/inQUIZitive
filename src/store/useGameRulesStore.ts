import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameRulesState {
  // Rapid Fire Round Mechanics
  rapidFireDuration: number;
  rapidFireCorrectPoints: number;
  rapidFirePassPenalty: number;
  rapidFireRevisitPassed: boolean;
  rapidFireMaxQuestions: number;

  // Spin Wheel Jeopardy Mechanics
  swjTier1Points: number;
  swjTier2Points: number;
  swjTier3Points: number;
  swjTier4Points: number;
  swjWrongPenalty: number;

  // Tic Tac Toe Mechanics
  ticTacToePoints: number;
  ticTacToeTiePoints: number;

  // Buzzer Round Mechanics
  buzzerPoints: number;
  buzzerWrongPenalty: number;

  // General Gameplay Mechanics
  autoAdvanceOnAward: boolean;
  allowNegativeScores: boolean;
  showAnswerOnAward: boolean;

  // Actions
  setRapidFireRules: (rules: Partial<Pick<GameRulesState, 'rapidFireDuration' | 'rapidFireCorrectPoints' | 'rapidFirePassPenalty' | 'rapidFireRevisitPassed' | 'rapidFireMaxQuestions'>>) => void;
  setSwjRules: (rules: Partial<Pick<GameRulesState, 'swjTier1Points' | 'swjTier2Points' | 'swjTier3Points' | 'swjTier4Points' | 'swjWrongPenalty'>>) => void;
  setTicTacToeRules: (rules: Partial<Pick<GameRulesState, 'ticTacToePoints' | 'ticTacToeTiePoints'>>) => void;
  setBuzzerRules: (rules: Partial<Pick<GameRulesState, 'buzzerPoints' | 'buzzerWrongPenalty'>>) => void;
  setGeneralRules: (rules: Partial<Pick<GameRulesState, 'autoAdvanceOnAward' | 'allowNegativeScores' | 'showAnswerOnAward'>>) => void;
  resetRules: () => void;
}

const DEFAULT_RULES = {
  rapidFireDuration: 60,
  rapidFireCorrectPoints: 10,
  rapidFirePassPenalty: 0,
  rapidFireRevisitPassed: true,
  rapidFireMaxQuestions: 10,

  swjTier1Points: 10,
  swjTier2Points: 20,
  swjTier3Points: 30,
  swjTier4Points: 40,
  swjWrongPenalty: 0,

  ticTacToePoints: 10,
  ticTacToeTiePoints: 5,

  buzzerPoints: 10,
  buzzerWrongPenalty: -5,

  autoAdvanceOnAward: false,
  allowNegativeScores: true,
  showAnswerOnAward: true,
};

export const useGameRulesStore = create<GameRulesState>()(
  persist(
    (set) => ({
      ...DEFAULT_RULES,

      setRapidFireRules: (rules) => set((state) => ({ ...state, ...rules })),
      setSwjRules: (rules) => set((state) => ({ ...state, ...rules })),
      setTicTacToeRules: (rules) => set((state) => ({ ...state, ...rules })),
      setBuzzerRules: (rules) => set((state) => ({ ...state, ...rules })),
      setGeneralRules: (rules) => set((state) => ({ ...state, ...rules })),
      resetRules: () => set(DEFAULT_RULES),
    }),
    {
      name: 'inquizitive-game-rules-v2',
    }
  )
);
