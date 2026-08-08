import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reshuffleAllQuestions } from '../utils/excelParser';

/**
 * Represents a competing team in the quiz competition.
 */
export interface Team {
  id: number;
  name: string;
  score: number;
}

/**
 * Represents a single quiz question item imported from spreadsheet data.
 */
export interface Question {
  index: number;
  roundCode: string;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  scoreVal: number;
  used: boolean;
}

/**
 * Main Zustand store state interface for the Quiz application.
 */
export interface QuizState {
  /** Current active application screen or mode */
  gameState: 'SETUP' | 'MENU' | 'START' | 'SETTINGS' | 'ABOUT' | 'LEADERBOARD' | 'PLAYING' | 'END' | 'RULES';
  
  /** List of participating teams */
  teams: Team[];
  /** Array of all imported questions */
  questions: Question[];
  /** Index of currently displayed question in active round */
  currentQuestionIndex: number;
  /** Whether correct answer is currently revealed on screen */
  isAnswerRevealed: boolean;
  /** Current active round code (e.g. 'RF', 'SWJ', 'TTT', 'B') */
  activeRound: string | null;

  /** Color theme configuration tokens */
  theme: {
    darkGreen: string;
    teal: string;
    darkTeal: string;
    yellow: string;
    lightOrange: string;
    orange: string;
    white: string;
    correctGreen: string;
    wrongRed: string;
  };
  /** Randomization seed for wheel/grids or 'NOSHUFFLE' safeword */
  seed: string | number;
  /** Subtitle banner text displayed on screens */
  subtitle: string;
  /** Flag indicating whether question dataset has loaded into persistent storage */
  hasLoaded: boolean;
  /** Admin quizmaster passcode for question bank access */
  adminPasscode: string;

  /** Sets the active application screen state */
  setGameState: (state: QuizState['gameState']) => void;
  /** Loads parsed question items into global store */
  loadQuestions: (questions: Question[]) => void;
  /** Replaces entire questions array directly */
  setQuestions: (questions: Question[]) => void;
  /** Adds a new question item to question bank */
  addQuestion: (question: Omit<Question, 'index'>) => void;
  /** Updates existing question by index */
  updateQuestion: (index: number, updated: Partial<Question>) => void;
  /** Deletes question by index and re-indexes remaining questions */
  deleteQuestion: (index: number) => void;
  /** Sets admin quizmaster password */
  setAdminPasscode: (passcode: string) => void;
  /** Initializes and starts a named quiz round */
  startRound: (roundCode: string) => void;
  /** Marks a question as used by index */
  markQuestionUsed: (index: number) => void;
  /** Resets used status for all questions */
  resetAllQuestionsUsed: () => void;
  
  /** Advances to next question or completes round if last question */
  nextQuestion: () => void;
  /** Navigates back to previous question index */
  prevQuestion: () => void;
  /** Reveals answer for current active question */
  revealAnswer: () => void;
  /** Awards question score or custom points to target team */
  awardPoints: (teamId: number, customVal?: number) => void;
  
  /** Replaces entire team roster array */
  setTeams: (teams: Team[]) => void;
  /** Appends new team with auto-incremented ID */
  addTeam: (name: string) => void;
  /** Removes team from roster by ID */
  removeTeam: (id: number) => void;
  /** Adjusts team score by delta amount */
  updateTeamScore: (id: number, delta: number) => void;
  /** Updates team display name */
  updateTeamName: (id: number, name: string) => void;
  /** Updates single color token in theme state */
  setThemeColor: (key: keyof QuizState['theme'], color: string) => void;
  /** Updates seed number or string */
  setSeed: (seed: string | number) => void;
  /** Updates event subtitle string */
  setSubtitle: (subtitle: string) => void;
  /** Sets question dataset load status to true */
  setHasLoaded: () => void;
}

const defaultTheme = {
  darkGreen: '#264653',
  teal: '#2a9d8f',
  darkTeal: '#1c695f',
  yellow: '#e9c46a',
  lightOrange: '#f4a261',
  orange: '#e76f51',
  white: '#e8eddf',
  correctGreen: '#2ecc71',
  wrongRed: '#e74c3c',
};

/**
 * Global Zustand store hook with local storage persistence for main quiz state.
 */
export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
  gameState: 'SETUP',
  teams: [
    { id: 1, name: 'Team 1', score: 0 },
    { id: 2, name: 'Team 2', score: 0 },
    { id: 3, name: 'Team 3', score: 0 },
    { id: 4, name: 'Team 4', score: 0 },
  ],
  questions: [],
  currentQuestionIndex: 0,
  isAnswerRevealed: false,
  activeRound: null,

  theme: defaultTheme,
  seed: '12342026',
  subtitle: 'ARISE 2k26',
  hasLoaded: false,
  adminPasscode: 'ARISE2026',

  setGameState: (state) => set({ gameState: state }),
  
  loadQuestions: (questions) => set({ questions }),
  
  setQuestions: (questions) => set({ questions }),

  addQuestion: (newQ) => set((state) => {
    const nextIndex = state.questions.length > 0 
      ? Math.max(...state.questions.map(q => q.index)) + 1 
      : 0;
    const questionToAdd: Question = {
      ...newQ,
      index: nextIndex,
    };
    return { questions: [...state.questions, questionToAdd] };
  }),

  updateQuestion: (index, updated) => set((state) => ({
    questions: state.questions.map(q => 
      q.index === index ? { ...q, ...updated } : q
    )
  })),

  deleteQuestion: (index) => set((state) => {
    const filtered = state.questions.filter(q => q.index !== index);
    // Re-index remaining questions cleanly
    const reindexed = filtered.map((q, idx) => ({ ...q, index: idx }));
    return { questions: reindexed };
  }),

  setAdminPasscode: (adminPasscode) => set({ adminPasscode }),
  
  startRound: (roundCode) => set(() => {
    return {
      gameState: 'PLAYING',
      activeRound: roundCode,
      currentQuestionIndex: 0,
      isAnswerRevealed: false,
    };
  }),

  markQuestionUsed: (index) => set((state) => ({
    questions: state.questions.map(q => 
      q.index === index ? { ...q, used: true } : q
    )
  })),

  resetAllQuestionsUsed: () => set((state) => ({
    questions: state.questions.map(q => ({ ...q, used: false }))
  })),

  nextQuestion: () => set((state) => {
    const roundQuestions = state.questions.filter(q => q.roundCode === state.activeRound && !q.used);
    if (state.currentQuestionIndex < roundQuestions.length - 1) {
      return {
        currentQuestionIndex: state.currentQuestionIndex + 1,
        isAnswerRevealed: false,
      };
    } else {
      return { gameState: 'END' }; // End of round
    }
  }),

  prevQuestion: () => set((state) => {
    if (state.currentQuestionIndex > 0) {
      return {
        currentQuestionIndex: state.currentQuestionIndex - 1,
        isAnswerRevealed: false,
      };
    }
    return {};
  }),

  revealAnswer: () => set({ isAnswerRevealed: true }),

  awardPoints: (teamId, customVal) => set((state) => {
    if (state.gameState !== 'PLAYING') return {};
    
    const roundQuestions = state.questions.filter(q => q.roundCode === state.activeRound && !q.used);
    if (roundQuestions.length === 0) return {};
    
    const currentQ = roundQuestions[state.currentQuestionIndex];
    const pointsToAdd = customVal !== undefined ? customVal : currentQ.scoreVal;
    
    return {
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, score: t.score + pointsToAdd } : t
      ),
    };
  }),

  setTeams: (teams) => set({ teams }),
  
  addTeam: (name) => set((state) => {
    const maxId = state.teams.reduce((max, t) => Math.max(max, t.id), 0);
    return {
      teams: [...state.teams, { id: maxId + 1, name, score: 0 }]
    };
  }),
  
  removeTeam: (id) => set((state) => ({
    teams: state.teams.filter(t => t.id !== id)
  })),

  updateTeamScore: (id, delta) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, score: t.score + delta } : t)
  })),

  updateTeamName: (id, name) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, name } : t)
  })),

  setThemeColor: (key, color) => set((state) => {
    const newTheme = { ...state.theme, [key]: color };
    return { theme: newTheme };
  }),

  setSeed: (seed) => set((state) => {
    const reshuffled = reshuffleAllQuestions(state.questions, seed);
    return { seed, questions: reshuffled };
  }),
  
  setSubtitle: (subtitle) => set({ subtitle }),

  setHasLoaded: () => set({ hasLoaded: true }),

    }),
    {
      name: 'inquizitive-storage', // name of item in localStorage
    }
  )
);

