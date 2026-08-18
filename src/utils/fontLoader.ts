/** Dynamic Google Font Loader helper with PWA offline cache support & graceful fallbacks */
export const loadGoogleFont = (fontFamilyString?: string) => {
  if (!fontFamilyString) return;
  const match = fontFamilyString.match(/"([^"]+)"|'([^']+)'|([a-zA-Z0-9\s]+)/);
  if (!match) return;
  const fontName = (match[1] || match[2] || match[3]).trim();
  
  const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Consolas'];
  if (genericFonts.includes(fontName)) return;

  const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  const formattedFont = fontName.replace(/\s+/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;
  link.onerror = () => {
    console.log(`[Offline PWA] Using system fallback font for: ${fontName}`);
  };
  document.head.appendChild(link);
};
