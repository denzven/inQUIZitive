/**
 * Unified Round Registry System for InQUIZitive.
 * Provides a single source of truth for all game round modes, metadata, descriptions,
 * icons, background audio keys, and default game parameters.
 */

export interface RoundDefinition {
  /** Unique code identifier used throughout the application (e.g. 'RF', 'SWJ', 'TTT', 'B') */
  code: string;
  /** Primary display title for round selector cards and headers */
  title: string;
  /** Concise category or gameplay style subtitle */
  subtitle: string;
  /** Full descriptive summary of rules and mechanics */
  description: string;
  /** BGM audio track identifier matching SfxKey */
  bgmKey: string;
  /** Badge color variable or accent color hex */
  accentColor: string;
  /** Default target round score value per question */
  defaultQuestionScore: number;
  /** Icon identifier key for dynamic icon rendering */
  iconName: 'Clock' | 'RotateCw' | 'Grid' | 'Zap';
  /** Keyboard shortcut help hint */
  shortcutHelp: string;
}

/**
 * Registry mapping round codes to their full definitions.
 */
export const ROUND_REGISTRY: Record<string, RoundDefinition> = {
  RF: {
    code: 'RF',
    title: 'Rapid Fire',
    subtitle: '60s Speed Round',
    description: 'High-energy timed round where teams answer as many rapid questions as possible within the timer countdown.',
    bgmKey: 'bgm_rapid_fire',
    accentColor: 'var(--color-primary)',
    defaultQuestionScore: 10,
    iconName: 'Clock',
    shortcutHelp: '1: Correct (+10) | 2: Incorrect | 3: Pass | Space: Start/Pause'
  },
  SWJ: {
    code: 'SWJ',
    title: 'Jeopardy Wheel',
    subtitle: 'Category Wheel & Tiles',
    description: 'Spin the wheel to select a category, then pick point-valued Jeopardy tiles to attempt higher-stake questions.',
    bgmKey: 'bgm_spin_wheel',
    accentColor: 'var(--color-action)',
    defaultQuestionScore: 20,
    iconName: 'RotateCw',
    shortcutHelp: 'Space: Spin Wheel | 1-4: Pick Topic | ESC: Back to Wheel'
  },
  TTT: {
    code: 'TTT',
    title: 'Tic Tac Toe',
    subtitle: '3x3 Grid Battle',
    description: 'Strategic grid round where two teams select grid cells, answer correctly to claim marks, and attempt 3-in-a-row.',
    bgmKey: 'bgm_tictactoe',
    accentColor: 'var(--color-accent)',
    defaultQuestionScore: 10,
    iconName: 'Grid',
    shortcutHelp: '1-9: Select Grid Cell | Space: Reveal Answer | R: Reset Grid'
  },
  B: {
    code: 'B',
    title: 'Buzzer Round',
    subtitle: 'First-to-Buzz Lockout',
    description: 'Fast-reaction lockout round. The fastest team to hit their key locks out rivals and earns the right to answer.',
    bgmKey: 'bgm_buzzer',
    accentColor: 'var(--color-danger)',
    defaultQuestionScore: 10,
    iconName: 'Zap',
    shortcutHelp: 'Keys A/S/D/F: Team Buzzers | Space: Unlock Buzzers | R: Reset Lock'
  }
};

/**
 * Returns list of all registered round definitions.
 */
export const getAllRounds = (): RoundDefinition[] => {
  return Object.values(ROUND_REGISTRY);
};

/**
 * Retrieves a round definition by its round code.
 */
export const getRoundDefinition = (code: string | null): RoundDefinition | undefined => {
  if (!code) return undefined;
  return ROUND_REGISTRY[code];
};

/**
 * Helper to check if a code is a recognized registered round.
 */
export const isValidRoundCode = (code: string): boolean => {
  return code in ROUND_REGISTRY;
};
