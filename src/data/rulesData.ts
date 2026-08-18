export interface RuleItem {
  label: string;
  text: string;
}

export interface HostGuideSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  iconName: 'EyeOff' | 'Keyboard' | 'FileSpreadsheet' | 'Trophy' | 'Printer' | 'WifiOff';
  color: string;
  borderColor: string;
  description: string;
  bullets: string[];
  gridShortcuts?: { key: string; label: string; category: string }[];
}

export const generalGuidelines: RuleItem[] = [
  { label: 'a', text: 'The quiz progresses through four stage rounds after qualifying screening.' },
  { label: 'b', text: 'Points will be entirely reset to zero at the start of new rounds following eliminations to ensure a levelled baseline for advancing teams.' },
  { label: 'c', text: 'Tie-Breakers will be conducted in case of a Tie (equal points to two or more teams at the end of the round before elimination), a tie-breaker question will be asked to each of the teams that are tied.' },
  { label: 'd', text: 'All decisions of the Quiz Master and the Organizing team will be final and binding.' },
  { label: 'e', text: 'Interruptions and doubts will not be entertained once the round starts, the participants must answer the question and then doubts will be clarified at the end of the round.' },
  { label: 'f', text: 'Tallying and Display of the points of the scoreboard will be finalized by the Quiz Master and the Organizing team.' },
  { label: 'g', text: 'Use of Electronic Devices such as Mobile Phones and Smartwatches and /or engaging in any Malpractice will lead to disqualification.' },
  { label: 'h', text: 'Calculators, pen/pencils and papers/pads will be provided by the Organizing team.' }
];

export const round1Rules: RuleItem[] = [
  { label: 'a', text: 'Format: Written offline paper-and-pen aptitude evaluation conducted on-site prior to live stage presentations.' },
  { label: 'b', text: 'Eligibility & Advancement: All registered competition teams participate. Top-scoring teams qualify to advance to the stage tournament.' },
  { label: 'c', text: 'Score Baseline Reset: Aptitude test scores determine stage qualifiers; points are reset to zero upon entering Round 2 to ensure a level playing field.' }
];

export const round2Rules: RuleItem[] = [
  { label: 'a', text: 'Time Limit: Each team faces 10 rapid-fire questions against a strict 60-second countdown clock.' },
  { label: 'b', text: 'Base Scoring: +10 points awarded for every correct answer. No negative marking for incorrect or skipped questions.' },
  { label: 'c', text: 'Accuracy Bonus Points: +10 Bonus Points awarded for scoring >5 correct answers (>50% accuracy); +20 Bonus Points awarded for a Perfect Score (100% accuracy on all 10 questions).' },
  { label: 'd', text: 'Stage Controls: The Quiz Master reserves the right to pause the countdown clock or apply a +5-second emergency time buffer under technical or stage disruptions.' }
];

export const round3Rules: RuleItem[] = [
  { label: 'a', text: 'Selection Mechanics: Teams take turns spinning the slot machine category reel to randomly select quiz topics and point values.' },
  { label: 'b', text: 'Option Selection: After category selection, multiple-choice options are presented on screen for the active team.' },
  { label: 'c', text: 'Variable Point Values: Point values range from 10 to 50 points per question based on difficulty and spin multipliers.' },
  { label: 'd', text: 'Question Retirement: Answered categories/questions are marked as used and retired for the remainder of the session.' }
];

export const round4Rules: RuleItem[] = [
  { label: 'a', text: 'Lockout Mechanics: Questions are read aloud to all active teams simultaneously. The first team to hit the buzzer locks out all rival teams.' },
  { label: 'b', text: 'Answering Window: The locked-in team has 5 seconds to announce their answer.' },
  { label: 'c', text: 'Scoring & Penalties: Correct answer awards full question points. Incorrect answer penalizes points from team score and re-opens buzzing to rival teams.' },
  { label: 'd', text: 'Early Buzzing: Buzzing prior to question completion is permitted at the team\'s own risk.' }
];

export const championshipRules: RuleItem[] = [
  { label: 'a', text: 'Real-Time Scoreboard: Live tournament standings update dynamically after each question and round.' },
  { label: 'b', text: 'Championship Victory: The team with the highest aggregate accumulated score at the end of the final round is crowned the inQUIZitive Champion.' },
  { label: 'c', text: 'Sudden-Death Tiebreaker: In case of an equal score tie after the final round, a sudden-death tiebreaker question will determine the champion.' }
];

export const tiebreakerRules: RuleItem[] = [
  { label: 'a', text: 'Usage & Trigger: Administered by the Quiz Master whenever a tie occurs between two or more teams before an elimination phase or for overall victory.' },
  { label: 'b', text: 'Grid Setup: A 3x3 interactive game board with grid positions numbered 1 through 9.' },
  { label: 'c', text: 'Turn-Based Duel: Tied teams alternate selecting grid positions. To claim a cell (X or O), the team must answer the corresponding question correctly.' },
  { label: 'd', text: 'Victory Condition: The first team to form a continuous line of 3 matching symbols (horizontally, vertically, or diagonally) wins the tie-breaker.' }
];

export const hostGuideSections: HostGuideSection[] = [
  {
    id: 'stealth-audio',
    number: 1,
    title: 'Stage Display & Stealth Broadcast Architecture',
    subtitle: 'Single-Screen Presentation & Offline Audio Engine',
    iconName: 'EyeOff',
    color: 'var(--color-accent)',
    borderColor: 'var(--color-primary)',
    description: 'Designed for single-display or cloned stage setups where the host display is projected directly to the audience.',
    bullets: [
      'Stealth Mode (H): Top navigation bars, header actions, and admin controls fade down to an 8% low-contrast translucent state to maintain a clean TV broadcast look.',
      'Fullscreen Projection (F): Press F anytime to toggle native browser full-screen presentation mode for maximum visual polish on stage.',
      '100% Offline PWA & Web Audio Engine: Runs without venue Wi-Fi using Service Worker caching. Sound FX (timer ticks, correct chimes, wrong buzzers, fanfare) are procedurally synthesized via Web Audio API. Press M to mute instantly.'
    ]
  },
  {
    id: 'presenter-hotkeys',
    number: 2,
    title: 'Master Presenter Keyboard Hotkeys Matrix',
    subtitle: 'Mouse-Free Stage Control & Emergency Hotkeys',
    iconName: 'Keyboard',
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    description: 'Control the entire stage show seamlessly using only a keyboard or wireless presenter clicker:',
    bullets: [],
    gridShortcuts: [
      { key: '1 - 4 / A - D', label: 'Quick select multiple choice option A, B, C, or D', category: 'Input' },
      { key: 'Spacebar', label: 'Master reveal answer key / advance question step', category: 'Flow' },
      { key: 'Ctrl + Z / Cmd + Z', label: 'Global Undo Stack (revert score edits & answer picks)', category: 'Safety' },
      { key: '+ / =', label: 'Inject emergency +5s time buffer during disruptions', category: 'Timer' },
      { key: 'P / K', label: 'Pause / resume active countdown timers', category: 'Timer' },
      { key: 'H / F / M', label: 'Toggle Stealth Mode (H), Fullscreen (F), Mute Audio (M)', category: 'Stage' },
      { key: 'Escape', label: 'Return to Main Menu screen', category: 'Nav' }
    ]
  },
  {
    id: 'audit-ingestion',
    number: 3,
    title: 'Pre-Flight Audit Engine & Question Ingestion',
    subtitle: 'Spreadsheet Validation & Live Bank Editing',
    iconName: 'FileSpreadsheet',
    color: 'var(--color-secondary)',
    borderColor: 'var(--color-primary)',
    description: 'Import custom .xlsx spreadsheets or JSON files and run diagnostic audits before going live:',
    bullets: [
      'Automated Integrity Checks: Scans imported files for missing option text, duplicate questions across rounds, unassigned answer indices, invalid point weights, and default placeholder strings.',
      '1-Click Auto-Fix Engine: Automatically repairs option spacing, populates missing default scores, and purges empty rows with one click.',
      'Live Question Bank Editor & Cheat Sheet: Modify option choices, correct answer flags, and category metadata in real-time or export master answer keys.'
    ]
  },
  {
    id: 'scoreboard-tiebreaker',
    number: 4,
    title: 'Scoreboard Overrides & Sudden-Death Duel',
    subtitle: 'Live Standings, Point Adjustments & Tic-Tac-Toe',
    iconName: 'Trophy',
    color: 'var(--color-success)',
    borderColor: 'var(--color-primary)',
    description: 'Maintain transparent standings while keeping full host override authority over points and draw duels:',
    bullets: [
      'Live Score Tallying & Baseline Resets: Tournament standings update dynamically after each question. Points automatically reset to zero between qualifying and stage elimination rounds.',
      'Manual Score Override Dialog: Click any team\'s score card on the scoreboard to launch the score adjustment modal. Add or deduct custom points with optional reason logging.',
      'Sudden-Death Tiebreaker Grid: Launch the interactive 3x3 Tic-Tac-Toe grid duel directly from the standings screen whenever a round ends in a draw.'
    ]
  }
];
