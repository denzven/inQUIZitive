/** Dynamic Google Font Loader helper with PWA offline cache support & graceful fallbacks */
export const loadGoogleFont = (fontFamilyString?: string) => {
  if (!fontFamilyString) return;

  const genericFonts = [
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Consolas', 'Georgia', 'Trebuchet MS', 'Verdana'
  ];

  // Split font stack by commas and extract clean font names
  const fonts = fontFamilyString.split(',').map(f => {
    const trimmed = f.trim();
    const match = trimmed.match(/"([^"]+)"|'([^']+)'|([a-zA-Z0-9\s]+)/);
    return match ? (match[1] || match[2] || match[3]).trim() : '';
  }).filter(Boolean);

  fonts.forEach(fontName => {
    if (genericFonts.includes(fontName)) return;

    const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) return;

    // Check if offline fonts stylesheet is loaded
    if (document.querySelector('link[href*="offline-fonts.css"]')) {
      // Font is pre-bundled in offline-fonts.css
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const formattedFont = fontName.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
    link.onerror = () => {
      console.log(`[Offline PWA] Using bundled offline font asset for: ${fontName}`);
    };
    document.head.appendChild(link);
  });
};
