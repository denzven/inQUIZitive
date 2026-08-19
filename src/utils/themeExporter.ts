import type { PresetTheme } from '../config/themes';

/**
 * Interface for Theme Package JSON export / import structure.
 */
export interface ThemePackage {
  schemaVersion: '1.0';
  exportedAt: string;
  theme: PresetTheme;
}

/**
 * Downloads a PresetTheme as a JSON file package.
 */
export const exportThemeToJson = (theme: PresetTheme) => {
  const pkg: ThemePackage = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    theme
  };

  const jsonString = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `inquizitive-theme-${theme.id || 'custom'}-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Parses and validates an imported theme JSON file content.
 * Returns PresetTheme if valid, or throws an error.
 */
export const importThemeFromJson = (fileContent: string): PresetTheme => {
  try {
    const data = JSON.parse(fileContent);
    
    // Support raw PresetTheme or wrapped ThemePackage
    const theme: PresetTheme = data.theme || data;

    if (!theme.name || !theme.colors || !theme.colors.primary || !theme.colors.accent) {
      throw new Error("Invalid theme structure: Missing essential color properties.");
    }

    return {
      id: theme.id || `custom_${Date.now()}`,
      name: theme.name.startsWith('🎨') ? theme.name : `🎨 ${theme.name}`,
      description: theme.description || 'Imported custom theme palette',
      category: theme.category || 'custom',
      colors: theme.colors,
      typography: theme.typography || {
        headingFont: '"League Spartan", "Montserrat", sans-serif',
        bodyFont: '"League Spartan", "Inter", sans-serif'
      },
      geometry: theme.geometry || {
        radiusSm: '6px',
        radiusMd: '12px',
        radiusLg: '20px',
        borderWidth: '2px'
      },
      effects: theme.effects || {
        cardShadow: '0 8px 30px rgba(0,0,0,0.12)',
        buttonShadow: '0 4px 15px rgba(0,0,0,0.15)',
        bgTexture: 'none',
        textShadow: 'none',
        backdropBlur: 'none'
      },
      animation: theme.animation || {
        transitionSpeed: '0.2s ease-in-out',
        hoverTransform: 'translateY(-2px)',
        activeTransform: 'translateY(0) scale(0.98)'
      },
      overlayEffect: theme.overlayEffect || 'none'
    };
  } catch (err: any) {
    throw new Error(`Failed to parse theme file: ${err.message || 'Invalid JSON format'}`);
  }
};
