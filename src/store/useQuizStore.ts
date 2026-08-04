import { create } from 'zustand';

export interface Team {
  id: number;
  name: string;
  score: number;
}

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

export interface QuizState {
  // Navigation States
  gameState: 'SETUP' | 'MENU' | 'START' | 'SETTINGS' | 'ABOUT' | 'LEADERBOARD' | 'PLAYING' | 'END';
  
  // Game Data
  teams: Team[];
  questions: Question[];
  currentQuestionIndex: number;
  isAnswerRevealed: boolean;
  activeRound: string | null;

  // Settings
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
  seed: number;
  subtitle: string;
  hasLoaded: boolean;

  // Actions - Core
  setGameState: (state: QuizState['gameState']) => void;
  loadQuestions: (questions: Question[]) => void;
  startRound: (roundCode: string) => void;
  markQuestionUsed: (index: number) => void;
  
  // Actions - Gameplay
  nextQuestion: () => void;
  prevQuestion: () => void;
  revealAnswer: () => void;
  awardPoints: (teamId: number, customVal?: number) => void;
  
  // Actions - Settings & Teams
  setTeams: (teams: Team[]) => void;
  addTeam: (name: string) => void;
  removeTeam: (id: number) => void;
  updateTeamScore: (id: number, delta: number) => void;
  updateTeamName: (id: number, name: string) => void;
  setThemeColor: (key: keyof QuizState['theme'], color: string) => void;
  setSeed: (seed: number) => void;
  setSubtitle: (subtitle: string) => void;
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

export const useQuizStore = create<QuizState>((set) => ({
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
  seed: 12342026,
  subtitle: 'ARISE 2k26',
  hasLoaded: false,

  setGameState: (state) => set({ gameState: state }),
  
  loadQuestions: (questions) => set({ questions }),
  
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
    // We could apply CSS variables here, or let App.tsx observe changes.
    return { theme: newTheme };
  }),

  setSeed: (seed) => set({ seed }),
  
  setSubtitle: (subtitle) => set({ subtitle }),

  setHasLoaded: () => set({ hasLoaded: true }),
}));
