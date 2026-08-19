/**
 * Centralized Keyboard Shortcuts Registry for InQUIZitive.
 * Standardizes keyboard navigation, audio mute toggles, round actions, and stealth mode shortcuts.
 */

export interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: 'Global' | 'Scoring' | 'Round Control' | 'Presentation';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'toggle_stealth', key: 'S', description: 'Toggle Stealth Presentation Mode (Hides admin overlays)', category: 'Presentation' },
  { id: 'toggle_mute', key: 'M', description: 'Toggle Global Audio Mute', category: 'Global' },
  { id: 'reveal_answer', key: 'Space', description: 'Reveal Answer / Action Trigger', category: 'Round Control' },
  { id: 'award_t1', key: '1', description: 'Award Points to Team 1 (or Rapid Fire Correct / Cell 1)', category: 'Scoring' },
  { id: 'award_t2', key: '2', description: 'Award Points to Team 2 (or Rapid Fire Wrong / Cell 2)', category: 'Scoring' },
  { id: 'award_t3', key: '3', description: 'Award Points to Team 3 (or Rapid Fire Pass / Cell 3)', category: 'Scoring' },
  { id: 'award_t4', key: '4', description: 'Award Points to Team 4 (or Cell 4)', category: 'Scoring' },
  { id: 'undo', key: 'Ctrl + Z', description: 'Emergency Undo Last Action', category: 'Global' },
  { id: 'navigate_menu', key: 'Esc', description: 'Return to Main Menu / Close Modals', category: 'Global' }
];

export const getShortcutsByCategory = (): Record<string, KeyboardShortcut[]> => {
  return KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
};
