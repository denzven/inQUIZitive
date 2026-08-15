import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reshuffleAllQuestions } from '../utils/excelParser';
import { useRapidFireStore } from './useRapidFireStore';
import { useBuzzerStore } from './useBuzzerStore';
import { useSpinWheelStore } from './useSpinWheelStore';
import { useTicTacToeStore } from './useTicTacToeStore';

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
    primaryDark: string;
    primary: string;
    primaryContainer: string;
    accent: string;
    secondary: string;
    action: string;
    surface: string;
    success: string;
    danger: string;

    // Legacy aliases
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

  /** Sets entire theme object or single color token */
  setTheme: (theme: Partial<QuizState['theme']>) => void;
  /** Resets theme to default palette */
  resetTheme: () => void;
  /** Randomization seed for wheel/grids or 'NOSHUFFLE' safeword */
  seed: string | number;
  /** Subtitle banner text displayed on screens */
  subtitle: string;
  /** Flag indicating whether question dataset has loaded into persistent storage */
  hasLoaded: boolean;
  /** Admin quizmaster passcode for question bank access */
  adminPasscode: string;

  /** Undo history stack for Ctrl+Z emergency recovery */
  undoStack: Array<{ teams: Team[]; questions: Question[] }>;
  /** Stealth mode flag for single-screen presentation (hides administrative UI overlays) */
  isStealthMode: boolean;

  /** Toggles stealth presentation mode on/off */
  toggleStealthMode: () => void;
  /** Pushes a snapshot of current teams and questions to undo stack */
  pushUndoSnapshot: () => void;
  /** Reverts to previous state snapshot if available. Returns true if reverted. */
  undoLastAction: () => boolean;

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

export interface ThemePalette {
  primaryDark: string;
  primary: string;
  primaryContainer: string;
  accent: string;
  secondary: string;
  action: string;
  surface: string;
  success: string;
  danger: string;
}

export const PRESET_THEMES: Record<string, {
  id: string;
  name: string;
  description: string;
  colors: ThemePalette;
}> = {
  ariseClassic: {
    id: 'ariseClassic',
    name: 'Arise Classic (Default)',
    description: 'Signature quiz competition palette with deep teal, forest canvas & golden highlights',
    colors: {
      primaryDark: '#1f3742',
      primaryContainer: '#144d46',
      primary: '#2a9d8f',
      accent: '#e9c46a',
      action: '#e76f51',
      surface: '#ffffff',
      secondary: '#8ab4f8',
      success: '#2ecc71',
      danger: '#e74c3c'
    }
  },
  nord: {
    id: 'nord',
    name: 'Nord Frost',
    description: 'Arctic ice palette with deep polar canvas, frost blue & aurora yellow',
    colors: {
      primaryDark: '#242933',
      primaryContainer: '#3b4252',
      primary: '#81a1c1',
      accent: '#ebcb8b',
      action: '#bf616a',
      surface: '#e5e9f0',
      secondary: '#a3be8c',
      success: '#a3be8c',
      danger: '#bf616a'
    }
  },
  oneDark: {
    id: 'oneDark',
    name: 'One Dark Pro',
    description: 'Iconic developer dark theme with soft cyan primary & chalk gold accents',
    colors: {
      primaryDark: '#1e2227',
      primaryContainer: '#282c34',
      primary: '#528bff',
      accent: '#e5c07b',
      action: '#e06c75',
      surface: '#abb2bf',
      secondary: '#98c379',
      success: '#98c379',
      danger: '#e06c75'
    }
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Dark',
    description: 'Vibrant dark theme featuring soft purple, dracula yellow & rich pink',
    colors: {
      primaryDark: '#191a21',
      primaryContainer: '#282a36',
      primary: '#9a86fd',
      accent: '#f1fa8c',
      action: '#ff7bc1',
      surface: '#f8f8f2',
      secondary: '#50fa7b',
      success: '#50fa7b',
      danger: '#ff5555'
    }
  },
  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin',
    description: 'Soothing crust canvas with mauve primary, warm yellow & red action',
    colors: {
      primaryDark: '#11111b',
      primaryContainer: '#1e1e2e',
      primary: '#cba6f7',
      accent: '#f9e2af',
      action: '#f38ba8',
      surface: '#cdd6f4',
      secondary: '#a6e3a1',
      success: '#a6e3a1',
      danger: '#f38ba8'
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    description: 'High-octane night city canvas with mint cyan, neon gold & deep magenta',
    colors: {
      primaryDark: '#090911',
      primaryContainer: '#141424',
      primary: '#02c39a',
      accent: '#fce114',
      action: '#f50057',
      surface: '#e0e0ff',
      secondary: '#7b2cbf',
      success: '#02c39a',
      danger: '#f50057'
    }
  },
  midnightGold: {
    id: 'midnightGold',
    name: 'Midnight Gold',
    description: 'Onyx canvas with metallic gold primary, bright amber & royal crimson',
    colors: {
      primaryDark: '#121217',
      primaryContainer: '#1e1e26',
      primary: '#d4af37',
      accent: '#f5d061',
      action: '#9b2226',
      surface: '#f5f5f5',
      secondary: '#8b7355',
      success: '#10b981',
      danger: '#9b2226'
    }
  },
  debugBlack: {
    id: 'debugBlack',
    name: 'OLED Black',
    description: 'True black #000000 canvas with graphite card, electric cyan & warning yellow',
    colors: {
      primaryDark: '#000000',
      primaryContainer: '#1a1a1a',
      primary: '#14f1d9',
      accent: '#ffeb3b',
      action: '#ff4081',
      surface: '#ffffff',
      secondary: '#b0bec5',
      success: '#00ff00',
      danger: '#ff0000'
    }
  }
};

export const defaultTheme = {
  ...PRESET_THEMES.ariseClassic.colors,

  // Legacy aliases synced 1:1
  darkGreen: PRESET_THEMES.ariseClassic.colors.primaryDark,
  teal: PRESET_THEMES.ariseClassic.colors.primary,
  darkTeal: PRESET_THEMES.ariseClassic.colors.primaryContainer,
  yellow: PRESET_THEMES.ariseClassic.colors.accent,
  lightOrange: PRESET_THEMES.ariseClassic.colors.secondary,
  orange: PRESET_THEMES.ariseClassic.colors.action,
  white: PRESET_THEMES.ariseClassic.colors.surface,
  correctGreen: PRESET_THEMES.ariseClassic.colors.success,
  wrongRed: PRESET_THEMES.ariseClassic.colors.danger,
};

/**
 * Global Zustand store hook with local storage persistence for main quiz state.
 */
export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
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
  undoStack: [],
  isStealthMode: false,

  theme: defaultTheme,
  seed: '12342026',
  subtitle: 'ARISE 2k26',
  hasLoaded: false,
  adminPasscode: 'ARISE2026',

  toggleStealthMode: () => set((state) => ({ isStealthMode: !state.isStealthMode })),

  pushUndoSnapshot: () => {
    const { teams, questions, undoStack } = get();
    const snapshot = {
      teams: JSON.parse(JSON.stringify(teams)),
      questions: JSON.parse(JSON.stringify(questions))
    };
    // Limit stack size to 25 items
    const updatedStack = [...undoStack, snapshot].slice(-25);
    set({ undoStack: updatedStack });
  },

  undoLastAction: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return false;
    const lastSnapshot = undoStack[undoStack.length - 1];
    const newStack = undoStack.slice(0, -1);
    set({
      teams: lastSnapshot.teams,
      questions: lastSnapshot.questions,
      undoStack: newStack
    });
    return true;
  },

  setGameState: (state) => set({ gameState: state }),
  
  loadQuestions: (questions) => set({ questions }),
  
  setQuestions: (questions) => {
    get().pushUndoSnapshot();
    set({ questions });
  },

  addQuestion: (newQ) => set((state) => {
    get().pushUndoSnapshot();
    const nextIndex = state.questions.length > 0 
      ? Math.max(...state.questions.map(q => q.index)) + 1 
      : 0;
    const questionToAdd: Question = {
      ...newQ,
      index: nextIndex,
    };
    return { questions: [...state.questions, questionToAdd] };
  }),

  updateQuestion: (index, updated) => {
    get().pushUndoSnapshot();
    set((state) => ({
      questions: state.questions.map(q => 
        q.index === index ? { ...q, ...updated } : q
      )
    }));
  },

  deleteQuestion: (index) => {
    get().pushUndoSnapshot();
    set((state) => {
      const filtered = state.questions.filter(q => q.index !== index);
      const reindexed = filtered.map((q, idx) => ({ ...q, index: idx }));
      return { questions: reindexed };
    });
  },

  setAdminPasscode: (adminPasscode) => set({ adminPasscode }),
  
  startRound: (roundCode) => {
    if (roundCode === 'RF') useRapidFireStore.getState().resetRf();
    if (roundCode === 'B') useBuzzerStore.getState().resetBuzzer();
    if (roundCode === 'SWJ') useSpinWheelStore.getState().resetSw();
    if (roundCode === 'TTT') useTicTacToeStore.getState().resetTtt();

    set({
      gameState: 'PLAYING',
      activeRound: roundCode,
      currentQuestionIndex: 0,
      isAnswerRevealed: false,
    });
  },

  markQuestionUsed: (index) => {
    set((state) => ({
      questions: state.questions.map(q => 
        q.index === index ? { ...q, used: true } : q
      )
    }));
  },

  resetAllQuestionsUsed: () => {
    get().pushUndoSnapshot();
    set((state) => ({
      questions: state.questions.map(q => ({ ...q, used: false }))
    }));
  },

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

  awardPoints: (teamId, customVal) => {
    get().pushUndoSnapshot();
    set((state) => {
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
    });
  },

  setTeams: (teams) => {
    get().pushUndoSnapshot();
    set({ teams });
  },
  
  addTeam: (name) => {
    get().pushUndoSnapshot();
    set((state) => {
      const maxId = state.teams.reduce((max, t) => Math.max(max, t.id), 0);
      return {
        teams: [...state.teams, { id: maxId + 1, name, score: 0 }]
      };
    });
  },
  
  removeTeam: (id) => {
    get().pushUndoSnapshot();
    set((state) => ({
      teams: state.teams.filter(t => t.id !== id)
    }));
  },

  updateTeamScore: (id, delta) => {
    get().pushUndoSnapshot();
    set((state) => ({
      teams: state.teams.map(t => t.id === id ? { ...t, score: t.score + delta } : t)
    }));
  },

  updateTeamName: (id, name) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, name } : t)
  })),

  setThemeColor: (key, color) => set((state) => {
    const updated = { ...state.theme, [key]: color };
    // Synchronize semantic & legacy keys 1:1
    if (key === 'primaryDark') updated.darkGreen = color;
    if (key === 'darkGreen') updated.primaryDark = color;
    if (key === 'primary') updated.teal = color;
    if (key === 'teal') updated.primary = color;
    if (key === 'primaryContainer') updated.darkTeal = color;
    if (key === 'darkTeal') updated.primaryContainer = color;
    if (key === 'accent') updated.yellow = color;
    if (key === 'yellow') updated.accent = color;
    if (key === 'secondary') updated.lightOrange = color;
    if (key === 'lightOrange') updated.secondary = color;
    if (key === 'action') updated.orange = color;
    if (key === 'orange') updated.action = color;
    if (key === 'surface') updated.white = color;
    if (key === 'white') updated.surface = color;
    if (key === 'success') updated.correctGreen = color;
    if (key === 'correctGreen') updated.success = color;
    if (key === 'danger') updated.wrongRed = color;
    if (key === 'wrongRed') updated.danger = color;

    return { theme: updated };
  }),

  setTheme: (newPartialTheme) => set((state) => {
    const merged = { ...state.theme, ...newPartialTheme };
    // Synchronize aliases
    if (newPartialTheme.primaryDark) merged.darkGreen = newPartialTheme.primaryDark;
    if (newPartialTheme.primary) merged.teal = newPartialTheme.primary;
    if (newPartialTheme.primaryContainer) merged.darkTeal = newPartialTheme.primaryContainer;
    if (newPartialTheme.accent) merged.yellow = newPartialTheme.accent;
    if (newPartialTheme.secondary) merged.lightOrange = newPartialTheme.secondary;
    if (newPartialTheme.action) merged.orange = newPartialTheme.action;
    if (newPartialTheme.surface) merged.white = newPartialTheme.surface;
    if (newPartialTheme.success) merged.correctGreen = newPartialTheme.success;
    if (newPartialTheme.danger) merged.wrongRed = newPartialTheme.danger;

    return { theme: merged };
  }),

  resetTheme: () => set({ theme: defaultTheme }),

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

