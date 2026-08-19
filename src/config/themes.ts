export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
}

export interface ThemeGeometry {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  borderWidth: string;
}

export interface ThemeEffects {
  cardShadow: string;
  buttonShadow: string;
  bgTexture: string; // e.g., 'none', or 'url(...)', or a radial-gradient string
  textShadow: string;
  backdropBlur: string;
}

export interface ThemeAnimation {
  transitionSpeed: string;
  hoverTransform: string;
  activeTransform: string;
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

export type ThemeOverlayEffect = 
  | 'toxicVat'       // Bubbling green liquid vat + rising bubbles (Neon Catalyst)
  | 'spiderWebs'     // Web grid radar overlay + subtle animated webs (Spider-Hero Webs)
  | 'crtScanlines'   // Retro arcade CRT scanline flicker (8-Bit Arcade / Retro themes)
  | 'matrixRain'     // Matrix digital phosphor code rain (Cyber Terminal)
  | 'lumosGlow'      // Magical Snitch golden floating snitch particles (Wizarding Scroll)
  | 'voxelGrid'      // Minecraft block grid voxel lines (Minecraft Crafting Voxel)
  | 'vaporwaveHorizon' // 80s Retro synthwave perspective horizon grid + radial sunset sun glow
  | 'plasmaArc'      // Electric Plasma Storm & Lightning Discharges (Plasma Tesla)
  | 'steampunkGears' // Industrial Brass Clockwork Gears & Steam Embers (Steampunk Engine)
  | 'customJs'       // Custom User Coded HTML5 Canvas Overlay Script
  | 'none';

export type ThemeCategory = 
  | 'signature'
  | 'radiant'       // Radiant Light & Pastels
  | 'onyx'          // Stealth, Metals & Greyscale
  | 'emerald'       // Emerald & Natural Earth
  | 'sapphire'      // Deep Sapphire & Oceans
  | 'synthwave'     // Cyberpunk, Vaporwave & Cosmic
  | 'popCulture'    // Pop Culture, Gaming & Fantasy
  | 'custom';

export type ThemeSfxPreset =
  | 'default'       // Broadcast Studio Standard
  | 'retro8bit'     // Chiptune 8-Bit Arcade Synthesizer
  | 'cyber'         // Matrix Cyberpunk Neon Pulse
  | 'magical'       // Orchestral Snitch Sparkle Chimes
  | 'comic'         // Pop Art Cartoon Boing & Whistle
  | 'minimal'       // Soft Clean Woodblock Taps
  | 'heroic'        // Grand Cinematic Orchestral
  | 'western'       // Saloon Acoustic Guitar & Clack
  | 'block';        // Block Building Voxel Chimes

export interface ThemeAudioConfig {
  /** Audio soundscape & SFX timbre style */
  sfxPreset?: ThemeSfxPreset;
  /** Custom MP3 soundbite file path or Data URL bound to this theme */
  themeBgmPath?: string;
  /** Pitch shift multiplier for Web Audio synthesis */
  pitchMultiplier?: number;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  colors: ThemePalette;
  typography: ThemeTypography;
  geometry: ThemeGeometry;
  effects: ThemeEffects;
  animation: ThemeAnimation;
  overlayEffect?: ThemeOverlayEffect;
  customOverlayCode?: string;
  audioProfile?: ThemeAudioConfig;
}

// Default Token Presets for smooth reuse across categories
export const defaultTypography: ThemeTypography = {
  headingFont: '"League Spartan", "Montserrat", sans-serif',
  bodyFont: '"League Spartan", "Inter", sans-serif'
};

export const monoTypography: ThemeTypography = {
  headingFont: '"Fira Code", monospace',
  bodyFont: '"Fira Code", monospace'
};

const softGeometry: ThemeGeometry = {
  radiusSm: '6px',
  radiusMd: '12px',
  radiusLg: '20px',
  borderWidth: '2px'
};

const sharpGeometry: ThemeGeometry = {
  radiusSm: '0px',
  radiusMd: '0px',
  radiusLg: '0px',
  borderWidth: '3px'
};

const roundedGeometry: ThemeGeometry = {
  radiusSm: '8px',
  radiusMd: '16px',
  radiusLg: '24px',
  borderWidth: '2px'
};

const minimalGeometry: ThemeGeometry = {
  radiusSm: '6px',
  radiusMd: '10px',
  radiusLg: '16px',
  borderWidth: '1px'
};

// Motion / Kinetics Tokens
const smoothAnimation: ThemeAnimation = {
  transitionSpeed: '0.2s ease-in-out',
  hoverTransform: 'translateY(-2px)',
  activeTransform: 'translateY(0) scale(0.98)'
};

const brutalistAnimation: ThemeAnimation = {
  transitionSpeed: '0.1s linear',
  hoverTransform: 'translate(-4px, -4px)',
  activeTransform: 'translate(4px, 4px)'
};

const bouncyAnimation: ThemeAnimation = {
  transitionSpeed: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  hoverTransform: 'scale(1.06)',
  activeTransform: 'scale(0.95)'
};

export const softEffects: ThemeEffects = {
  cardShadow: '0 8px 30px rgba(0,0,0,0.12)',
  buttonShadow: '0 4px 15px rgba(0,0,0,0.15)',
  bgTexture: 'none',
  textShadow: 'none',
  backdropBlur: 'none'
};

export const brutalistEffects: ThemeEffects = {
  cardShadow: '6px 6px 0px var(--color-primary)',
  buttonShadow: '4px 4px 0px var(--color-primary)',
  bgTexture: 'repeating-linear-gradient(0deg, rgba(0, 255, 60, 0.03) 0px, rgba(0, 255, 60, 0.03) 1px, transparent 1px, transparent 2px)',
  textShadow: '3px 3px 0px #000000',
  backdropBlur: 'none'
};

export const lightEffects: ThemeEffects = {
  cardShadow: '0 10px 25px rgba(0,0,0,0.06)',
  buttonShadow: '0 4px 12px rgba(0,0,0,0.08)',
  bgTexture: 'none',
  textShadow: 'none',
  backdropBlur: 'none'
};

export const darkEffects: ThemeEffects = {
  cardShadow: '0 12px 35px rgba(0,0,0,0.5)',
  buttonShadow: '0 4px 16px rgba(0,0,0,0.3)',
  bgTexture: 'none',
  textShadow: 'none',
  backdropBlur: 'blur(10px)'
};

export const glowEffects: ThemeEffects = {
  cardShadow: '0 12px 35px rgba(0,0,0,0.4)',
  buttonShadow: '0 4px 16px rgba(0,0,0,0.35)',
  bgTexture: 'none',
  textShadow: 'none',
  backdropBlur: 'blur(8px)'
};

export const PRESET_THEMES: Record<string, PresetTheme> = {
  // --- SIGNATURE COMPETITION ---
  ariseClassic: {
    id: 'ariseClassic',
    name: 'Arise Classic (Default)',
    description: 'Signature quiz competition palette with deep teal, forest canvas & golden highlights',
    category: 'signature',
    colors: {
      primaryDark: '#1f3742',
      primaryContainer: '#144d46',
      primary: '#2a9d8f',
      accent: '#e9c46a',
      action: '#e76f51',
      surface: '#ffffff',
      secondary: '#94A3B8',
      success: '#2ecc71',
      danger: '#e74c3c'
    },
    typography: {
      headingFont: '"League Spartan", "Montserrat", sans-serif',
      bodyFont: '"League Spartan", "Inter", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 14px 40px rgba(0, 0, 0, 0.5)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(42, 157, 143, 0.12), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'blur(8px)'
    },
    animation: smoothAnimation
  },

  // --- RADIANT LIGHT MODES (White, Cream, Ivory & Soft Pastels) ---
  alabasterMinimal: {
    id: 'alabasterMinimal',
    name: '◻️ Alabaster Minimal',
    description: 'A polished light mode utilizing dark charcoal typography and vibrant blue accents',
    category: 'radiant',
    colors: {
      primaryDark: '#F3F4F6',
      primaryContainer: '#FFFFFF',
      primary: '#E5E7EB',
      accent: '#2563EB',
      action: '#DC2626',
      surface: '#111827',
      secondary: '#4B5563',
      success: '#16A34A',
      danger: '#DC2626'
    },
    typography: {
      headingFont: '"Cabinet Grotesk", "Plus Jakarta Sans", sans-serif',
      bodyFont: '"Plus Jakarta Sans", "Inter", sans-serif'
    },
    geometry: minimalGeometry,
    effects: {
      cardShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  sunshineRadiance: {
    id: 'sunshineRadiance',
    name: '☀️ Sunshine Radiance',
    description: 'A bright, energetic light mode with warm amber foundations and punchy orange accents',
    category: 'radiant',
    colors: {
      primaryDark: '#FFF8E1',
      primaryContainer: '#FFFFFF',
      primary: '#FFA000',
      accent: '#FF6D00',
      action: '#D32F2F',
      surface: '#1E293B',
      secondary: '#475569',
      success: '#2E7D32',
      danger: '#C62828'
    },
    typography: {
      headingFont: '"Sora", "Outfit", sans-serif',
      bodyFont: '"Outfit", "Inter", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.12)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(255, 160, 0, 0.15), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  sakuraBlossom: {
    id: 'sakuraBlossom',
    name: '🌸 Sakura Blossom',
    description: 'A delicate light pastel aesthetic using soft blush tones and deep plum typography',
    category: 'radiant',
    colors: {
      primaryDark: '#FFF5F8',
      primaryContainer: '#FFFFFF',
      primary: '#F48FB1',
      accent: '#EC407A',
      action: '#AB47BC',
      surface: '#3A0956',
      secondary: '#6A1B9A',
      success: '#388E3C',
      danger: '#D32F2F'
    },
    typography: {
      headingFont: '"Fraunces", "Comfortaa", serif',
      bodyFont: '"Quicksand", "Nunito", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.12)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(244, 143, 177, 0.15), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  mintBreeze: {
    id: 'mintBreeze',
    name: '🍃 Mint Breeze',
    description: 'A crisp, refreshing light mode featuring soft mint greens and cool teal highlights',
    category: 'radiant',
    colors: {
      primaryDark: '#F0FFF4',
      primaryContainer: '#FFFFFF',
      primary: '#68D391',
      accent: '#0D9488',
      action: '#F6AD55',
      surface: '#0F172A',
      secondary: '#334155',
      success: '#38A169',
      danger: '#E53E3E'
    },
    typography: {
      headingFont: '"Lexend", "Urbanist", sans-serif',
      bodyFont: '"Lexend", "Inter", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.12)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(104, 211, 145, 0.15), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  ivoryAndRose: {
    id: 'ivoryAndRose',
    name: '🥂 Ivory & Rose',
    description: 'An ultra-premium light mode inspired by white marble, soft blush, and deep charcoal',
    category: 'radiant',
    colors: {
      primaryDark: '#FAF9F6',
      primaryContainer: '#FFFFFF',
      primary: '#F4EAE6',
      accent: '#B56576',
      action: '#E5989B',
      surface: '#1E1F29',
      secondary: '#5C5465',
      success: '#2A9D8F',
      danger: '#D90429'
    },
    typography: {
      headingFont: '"Bodoni Moda", "Playfair Display", serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 14px 40px rgba(0, 0, 0, 0.12)',
      buttonShadow: 'none',
      bgTexture: 'linear-gradient(180deg, #FAF9F6 0%, #F5EBE6 100%)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  matchaLatte: {
    id: 'matchaLatte',
    name: '🍵 Matcha Latte',
    description: 'A soothing, organic light mode featuring creamy whites and rich ceremonial matcha greens',
    category: 'radiant',
    colors: {
      primaryDark: '#F4F9F4',
      primaryContainer: '#FFFFFF',
      primary: '#D4E0D7',
      accent: '#386641',
      action: '#F28482',
      surface: '#1E2B20',
      secondary: '#4A6050',
      success: '#2D6A4F',
      danger: '#D90429'
    },
    typography: {
      headingFont: '"Manrope", "DM Sans", sans-serif',
      bodyFont: '"DM Sans", "Inter", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.12)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(212, 224, 215, 0.4), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },

  // --- ONYX, STEALTH & GREYSCALE (OLED Black & Dark Metals) ---
  monochromeOnyx: {
    id: 'monochromeOnyx',
    name: '◼️ Monochrome Onyx',
    description: 'Ultra-modern greyscale layout maximizing legibility with stark pure white contrasts',
    category: 'onyx',
    colors: {
      primaryDark: '#000000',
      primaryContainer: '#121212',
      primary: '#262626',
      accent: '#FFFFFF',
      action: '#DC2626',
      surface: '#FFFFFF',
      secondary: '#B3B3B3',
      success: '#22C55E',
      danger: '#DC2626'
    },
    typography: {
      headingFont: '"Syne", "Inter", sans-serif',
      bodyFont: '"Inter", "Roboto", sans-serif'
    },
    geometry: minimalGeometry,
    effects: {
      cardShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: smoothAnimation
  },
  midnightGold: {
    id: 'midnightGold',
    name: 'Midnight Gold',
    description: 'A luxurious OLED-black canvas with sleek zinc elements and striking metallic gold accents',
    category: 'onyx',
    colors: {
      primaryDark: '#050505',
      primaryContainer: '#171717',
      primary: '#27272A',
      accent: '#D4AF37',
      action: '#9F1239',
      surface: '#FFFFFF',
      secondary: '#CCCCCC',
      success: '#10B981',
      danger: '#EF4444'
    },
    typography: {
      headingFont: '"Cormorant Garamond", "Montserrat", serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 15px 45px rgba(0, 0, 0, 0.5)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.08), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'lumosGlow'
  },
  analogResin: {
    id: 'analogResin',
    name: '⌚ Analog Resin',
    description: 'Retro resin black canvas emphasizing dark plastic tones and vivid LCD cyan elements',
    category: 'onyx',
    colors: {
      primaryDark: '#0A0A0A',
      primaryContainer: '#1A1A1A',
      primary: '#333333',
      accent: '#00FFCC',
      action: '#FF3300',
      surface: '#FFFFFF',
      secondary: '#B8B8B8',
      success: '#39FF14',
      danger: '#FF0000'
    },
    typography: {
      headingFont: '"JetBrains Mono", "Share Tech Mono", monospace',
      bodyFont: '"Share Tech Mono", monospace'
    },
    geometry: minimalGeometry,
    effects: darkEffects,
    animation: smoothAnimation,
    overlayEffect: 'crtScanlines'
  },

  // --- EMERALD & FOREST GREENS (Deep Botanicals) ---
  emeraldPrestige: {
    id: 'emeraldPrestige',
    name: 'Emerald Prestige',
    description: 'Lush Brunswick green canvas featuring rich emerald bases and warm champagne gold accents',
    category: 'emerald',
    colors: {
      primaryDark: '#022C22',
      primaryContainer: '#064E3B',
      primary: '#047857',
      accent: '#FDE047',
      action: '#B45309',
      surface: '#F0FDF4',
      secondary: '#A7F3D0',
      success: '#34D399',
      danger: '#EF4444'
    },
    typography: {
      headingFont: '"Cinzel Decorative", "Playfair Display", serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 15px 45px rgba(0, 0, 0, 0.5)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(4, 120, 87, 0.15), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: smoothAnimation
  },

  // --- DEEP OCEAN & SAPPHIRE BLUES (Pitch Navy & Slate) ---
  nordicDusk: {
    id: 'nordicDusk',
    name: '❄️ Nordic Dusk',
    description: 'A sophisticated polar night canvas with steel grey foundations and frost blue accents',
    category: 'sapphire',
    colors: {
      primaryDark: '#242933',
      primaryContainer: '#3B4252',
      primary: '#4C566A',
      accent: '#88C0D0',
      action: '#BF616A',
      surface: '#ECEFF4',
      secondary: '#E5E9F0',
      success: '#A3BE8C',
      danger: '#BF616A'
    },
    typography: {
      headingFont: '"Space Grotesk", "Sora", sans-serif',
      bodyFont: '"Space Grotesk", "Inter", sans-serif'
    },
    geometry: softGeometry,
    effects: softEffects,
    animation: smoothAnimation
  },
  royalSapphire: {
    id: 'royalSapphire',
    name: '💎 Royal Sapphire',
    description: 'Deep pitch navy canvas paired with rich royal blue elements and neon cyan accents',
    category: 'sapphire',
    colors: {
      primaryDark: '#020617',
      primaryContainer: '#0F172A',
      primary: '#1D4ED8',
      accent: '#00F0FF',
      action: '#E11D48',
      surface: '#F8FAFC',
      secondary: '#CBD5E1',
      success: '#2DD4BF',
      danger: '#E11D48'
    },
    typography: {
      headingFont: '"Cabinet Grotesk", "Outfit", sans-serif',
      bodyFont: '"Outfit", "Inter", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 0%, rgba(29, 78, 216, 0.2), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: smoothAnimation
  },
  abyssalTrench: {
    id: 'abyssalTrench',
    name: '🌊 Abyssal Trench',
    description: 'Deepest ocean blue canvas illuminated by mid-trench blues and bioluminescent cyan',
    category: 'sapphire',
    colors: {
      primaryDark: '#082F49',
      primaryContainer: '#0369A1',
      primary: '#0284C7',
      accent: '#38BDF8',
      action: '#F43F5E',
      surface: '#F0F9FF',
      secondary: '#E0F2FE',
      success: '#10B981',
      danger: '#E11D48'
    },
    typography: {
      headingFont: '"Exo 2", "Sora", sans-serif',
      bodyFont: '"Outfit", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(8px)'
    },
    animation: smoothAnimation
  },
  coralReef: {
    id: 'coralReef',
    name: '🐠 Coral Reef',
    description: 'A vibrant oceanic theme contrasting deep water navy with bright coral and sand tones',
    category: 'sapphire',
    colors: {
      primaryDark: '#001524',
      primaryContainer: '#002240',
      primary: '#0A9396',
      accent: '#FF7D00',
      action: '#FFB703',
      surface: '#FFFFFF',
      secondary: '#BEE9E8',
      success: '#00B4D8',
      danger: '#D62828'
    },
    typography: {
      headingFont: '"Urbanist", "Lexend", sans-serif',
      bodyFont: '"Lexend", "Inter", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 15px 40px rgba(0, 0, 0, 0.8)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: smoothAnimation
  },

  // --- SYNTHWAVE, VAPOR & COSMIC PURPLES (Twilight & Cyber Void) ---
  tokyoPastel: {
    id: 'tokyoPastel',
    name: '🌸 Tokyo Pastel',
    description: 'A soothing dark aesthetic featuring muted purple bases and pastel mauve highlights',
    category: 'synthwave',
    colors: {
      primaryDark: '#1E1E2E',
      primaryContainer: '#313244',
      primary: '#585B70',
      accent: '#CBA6F7',
      action: '#F38BA8',
      surface: '#CDD6F4',
      secondary: '#BAC2DE',
      success: '#A6E3A1',
      danger: '#F38BA8'
    },
    typography: {
      headingFont: '"Sora", "Outfit", sans-serif',
      bodyFont: '"Outfit", "Inter", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(203, 166, 247, 0.25)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: bouncyAnimation
  },
  tacticalLazer: {
    id: 'tacticalLazer',
    name: '🔴 Tactical Lazer',
    description: 'Cyberpunk void canvas driven by deep neon violet and hyper-saturated cyan highlights',
    category: 'synthwave',
    colors: {
      primaryDark: '#050014',
      primaryContainer: '#11002C',
      primary: '#9D00FF',
      accent: '#00FFFF',
      action: '#FF007F',
      surface: '#FFFFFF',
      secondary: '#D8C7FF',
      success: '#00FF99',
      danger: '#FF0055'
    },
    typography: {
      headingFont: '"JetBrains Mono", "Share Tech Mono", monospace',
      bodyFont: '"Fira Code", monospace'
    },
    geometry: sharpGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.7)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'crtScanlines'
  },
  neonSunset: {
    id: 'neonSunset',
    name: '🌇 Neon Sunset',
    description: 'A vibrant outrun aesthetic with deep twilight purple and glowing magenta',
    category: 'synthwave',
    colors: {
      primaryDark: '#120428',
      primaryContainer: '#240A4D',
      primary: '#7209B7',
      accent: '#F72585',
      action: '#4CC9F0',
      surface: '#F8F9FA',
      secondary: '#D0C8FF',
      success: '#10B981',
      danger: '#F72585'
    },
    typography: {
      headingFont: '"Syncopate", "Cabinet Grotesk", sans-serif',
      bodyFont: '"Space Grotesk", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(10px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'crtScanlines'
  },
  cyberTerminal: {
    id: 'cyberTerminal',
    name: '📟 Cyber Terminal',
    description: 'A hacker-inspired dark mode with matrix greens and stark phosphor glows',
    category: 'synthwave',
    colors: {
      primaryDark: '#0D1117',
      primaryContainer: '#161B22',
      primary: '#0F5323',
      accent: '#39FF14',
      action: '#FF003C',
      surface: '#E6FDF4',
      secondary: '#A3B3A8',
      success: '#39FF14',
      danger: '#FF003C'
    },
    typography: {
      headingFont: '"Fira Code", "JetBrains Mono", monospace',
      bodyFont: '"Fira Code", monospace'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '3px'
    },
    effects: {
      cardShadow: '6px 6px 0px var(--color-primary)',
      buttonShadow: 'none',
      bgTexture: 'repeating-linear-gradient(0deg, rgba(0, 255, 60, 0.03) 0px, rgba(0, 255, 60, 0.03) 1px, transparent 1px, transparent 2px)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'matrixRain'
  },
  vaporwaveHorizon: {
    id: 'vaporwaveHorizon',
    name: '🌴 Vaporwave Horizon',
    description: 'An 80s retro-futuristic aesthetic with deep grid purples, magenta, and neon cyan',
    category: 'synthwave',
    colors: {
      primaryDark: '#0c021e',
      primaryContainer: '#1b0638',
      primary: '#38006b',
      accent: '#00FFFF',
      action: '#FF007F',
      surface: '#FFFFFF',
      secondary: '#E2CCFF',
      success: '#00FFCC',
      danger: '#FF0055'
    },
    typography: {
      headingFont: '"Syncopate", "Syne", sans-serif',
      bodyFont: '"Space Grotesk", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(10px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'vaporwaveHorizon'
  },
  cosmicNebula: {
    id: 'cosmicNebula',
    name: '🌌 Cosmic Nebula',
    description: 'A deep space aesthetic featuring starlight whites, dark matter indigo, and cosmic pinks',
    category: 'synthwave',
    colors: {
      primaryDark: '#090014',
      primaryContainer: '#1A0B2E',
      primary: '#3B0066',
      accent: '#D400FF',
      action: '#00E5FF',
      surface: '#F8F9FA',
      secondary: '#D6C8E6',
      success: '#00FF9D',
      danger: '#FF0055'
    },
    typography: {
      headingFont: '"Orbitron", "Syne", sans-serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: roundedGeometry,
    effects: {
      cardShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(8px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'lumosGlow'
  },

  // --- WARM EARTH & BORDEAUX ---
  autumnHarvest: {
    id: 'autumnHarvest',
    name: '🍂 Autumn Harvest',
    description: 'A warm, earthy dark mode inspired by fall foliage, deep bark, and burnt sienna',
    category: 'emerald',
    colors: {
      primaryDark: '#1A120B',
      primaryContainer: '#2E2115',
      primary: '#5C3D2E',
      accent: '#E56B1F',
      action: '#F4CE14',
      surface: '#FDF8F5',
      secondary: '#C4B5A5',
      success: '#4E9F3D',
      danger: '#D91656'
    },
    typography: {
      headingFont: '"Fraunces", "Lora", serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 10px 30px rgba(229, 107, 31, 0.15)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  obsidianRuby: {
    id: 'obsidianRuby',
    name: 'Obsidian Ruby',
    description: 'Deep bordeaux canvas driven by rich ruby elements and stark rose gold contrasts',
    category: 'synthwave',
    colors: {
      primaryDark: '#170308',
      primaryContainer: '#390A15',
      primary: '#881337',
      accent: '#FDA4AF',
      action: '#D97757',
      surface: '#FFF1F2',
      secondary: '#FECDD3',
      success: '#10B981',
      danger: '#E11D48'
    },
    typography: {
      headingFont: '"Prata", "Playfair Display", serif',
      bodyFont: '"Plus Jakarta Sans", sans-serif'
    },
    geometry: softGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(225, 29, 72, 0.25)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(10px)'
    },
    animation: smoothAnimation
  },

  // --- QUIRKY & HIGHLY STYLIZED ---
  popArtComic: {
    id: 'popArtComic',
    name: '💥 Pop Art Comic',
    description: 'A loud, retro comic book aesthetic with thick ink borders, hard shadows, and halftone textures',
    category: 'popCulture',
    colors: {
      primaryDark: '#FFDF00',     // Canvas: Comic Yellow
      primaryContainer: '#FFFFFF',// Cards: Paper White
      primary: '#00E5FF',         // Buttons: Cyan Pop
      accent: '#FF007F',          // Scores/Active: Magenta Punch
      action: '#FF007F',          // Action: Magenta Punch
      surface: '#000000',         // Text: Solid Ink Black
      secondary: '#222222',       // Subtext: Deep Charcoal
      success: '#00D600',
      danger: '#FF0033'
    },
    typography: {
      headingFont: '"Bangers", system-ui, cursive',
      bodyFont: '"Comic Neue", cursive'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '4px'
    },
    effects: {
      cardShadow: '8px 8px 0px #000000',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle, #f3d400 20%, transparent 20%), radial-gradient(circle, #f3d400 20%, transparent 20%)',
      textShadow: '3px 3px 0px #000000',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation
  },
  retroArcade: {
    id: 'retroArcade',
    name: '👾 8-Bit Arcade',
    description: 'A nostalgic retro gaming layout with pixelated fonts, pitch black void, and neon game colors',
    category: 'popCulture',
    colors: {
      primaryDark: '#000000',     // Canvas: CRT Black
      primaryContainer: '#111111',// Cards: Arcade Cabinet Dark Grey
      primary: '#2D00F7',         // Buttons: 8-Bit Blue
      accent: '#FFEA00',          // Scores/Active: Coin Yellow
      action: '#FF004D',          // Action: Player 1 Red
      surface: '#FFFFFF',         // Text: Pixel White
      secondary: '#CCCCCC',       // Subtext: Crisp Pixel Grey
      success: '#00FF00',
      danger: '#FF004D'
    },
    typography: {
      headingFont: '"Silkscreen", monospace',
      bodyFont: '"Silkscreen", monospace'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '4px'
    },
    effects: {
      cardShadow: 'inset -4px -4px 0px rgba(0,0,0,0.5)',
      buttonShadow: 'none',
      bgTexture: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
      textShadow: '2px 2px 0px #FFEA00',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'crtScanlines'
  },
  bubblegumPop: {
    id: 'bubblegumPop',
    name: '🍬 Bubblegum Pop',
    description: 'A bouncy, hyper-rounded aesthetic with vibrant candy pinks, cyan, and zero sharp edges',
    category: 'radiant',
    colors: {
      primaryDark: '#FFD6E8',     // Canvas: Soft Pink
      primaryContainer: '#FFFFFF',// Cards: Glossy White
      primary: '#00E5FF',         // Buttons: Candy Cyan
      accent: '#FF007F',          // Scores/Active: Hot Pink
      action: '#FFD600',          // Action: Lemon Yellow
      surface: '#1A1A1A',         // Text: Deep Charcoal
      secondary: '#2D2D2D',       // Subtext: Dark Slate
      success: '#00C853',
      danger: '#FF1744'
    },
    typography: {
      headingFont: '"Fredoka", sans-serif',
      bodyFont: '"Quicksand", sans-serif'
    },
    geometry: {
      radiusSm: '20px',
      radiusMd: '30px',
      radiusLg: '40px',
      borderWidth: '0px'
    },
    effects: {
      cardShadow: '0 20px 40px rgba(255, 0, 127, 0.15)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(12px)'
    },
    animation: bouncyAnimation
  },
  chalkboardScholar: {
    id: 'chalkboardScholar',
    name: '🎓 Chalkboard Scholar',
    description: 'An old-school academic vibe featuring deep dusty greens and handwritten chalk typography',
    category: 'emerald',
    colors: {
      primaryDark: '#1B2E26',     // Canvas: Slate Green
      primaryContainer: '#13221C',// Cards: Darker Board
      primary: '#2D4A3E',         // Buttons: Chalkboard Green
      accent: '#FFD700',          // Scores/Active: Yellow Chalk
      action: '#E55353',          // Action: Pink Chalk
      surface: '#FFFFFF',         // Text: White Chalk
      secondary: '#D4E2DB',       // Subtext: Crisp Chalk
      success: '#4CAF50',
      danger: '#FF6B6B'
    },
    typography: {
      headingFont: '"Cinzel Decorative", "Cinzel", serif',
      bodyFont: '"Lora", serif'
    },
    geometry: {
      radiusSm: '2px',
      radiusMd: '6px',
      radiusLg: '10px',
      borderWidth: '2px'
    },
    effects: {
      cardShadow: '0 10px 30px rgba(0,0,0,0.5)',
      buttonShadow: 'none',
      bgTexture: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")',
      textShadow: '1px 1px 2px rgba(255,255,255,0.4)',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },
  wildWestWanted: {
    id: 'wildWestWanted',
    name: '🤠 Wild West Wanted',
    description: 'A dusty, sepia-toned vintage aesthetic with heavy slab-serif fonts and wooden textures',
    category: 'emerald',
    colors: {
      primaryDark: '#D4C4A8',     // Canvas: Dusty Sepia
      primaryContainer: '#EBE0C8',// Cards: Parchment Paper
      primary: '#C49A6C',         // Buttons: Golden Parchment Wood
      accent: '#8B0000',          // Scores/Active: Wanted Crimson
      action: '#B85D19',          // Action: Rust Orange
      surface: '#1F140E',         // Text: Deep Ink Brown
      secondary: '#4A3B30',       // Subtext: Dark Sepia Ink
      success: '#2E7D32',
      danger: '#8B0000'
    },
    typography: {
      headingFont: '"Rye", serif',
      bodyFont: '"Courier Prime", "Courier New", monospace'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '2px',
      radiusLg: '4px',
      borderWidth: '3px'
    },
    effects: {
      cardShadow: '4px 4px 12px rgba(74, 53, 37, 0.2)',
      buttonShadow: 'none',
      bgTexture: 'repeating-linear-gradient(45deg, rgba(74, 53, 37, 0.03) 0px, rgba(74, 53, 37, 0.03) 2px, transparent 2px, transparent 4px)',
      textShadow: '2px 2px 0px rgba(74, 53, 37, 0.3)',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation
  },

  // --- POP CULTURE & GAMING ---
  arachnidHero: {
    id: 'arachnidHero',
    name: '🕷️ Spider-Hero Webs',
    description: 'A dynamic comic suit aesthetic featuring NYC sky blues, crimson red, spider-sense yellow, and web grid textures',
    category: 'popCulture',
    colors: {
      primaryDark: '#0A0A12',     // Canvas: Midnight NYC Sky
      primaryContainer: '#152238',// Cards: Deep Suit Blue
      primary: '#B71C1C',         // Buttons: Crimson Red
      accent: '#FFEB3B',          // Scores/Active: Spider-Sense Yellow
      action: '#2196F3',          // Action: Web Fluid Blue
      surface: '#FFFFFF',         // Text: Pure White
      secondary: '#C0D0DC',       // Subtext: Web Grey
      success: '#00E676',
      danger: '#FF1744'
    },
    typography: {
      headingFont: '"Oswald", sans-serif',
      bodyFont: '"Roboto Condensed", sans-serif'
    },
    geometry: {
      radiusSm: '4px',
      radiusMd: '8px',
      radiusLg: '12px',
      borderWidth: '3px'
    },
    effects: {
      cardShadow: '8px 8px 0px rgba(183, 28, 28, 0.4)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.15) 0%, transparent 70%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(255, 255, 255, 0.08) 41px, transparent 42px), repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 28deg, rgba(255, 255, 255, 0.08) 29deg, transparent 30deg)',
      textShadow: '3px 3px 0px #B71C1C',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'spiderWebs'
  },
  blockBuilder: {
    id: 'blockBuilder',
    name: '⛏️ Minecraft Java Edition',
    description: 'Official Minecraft Java UI layout featuring dark stone inventory panels, white drop-shadow text, yellow hover buttons, and lush forest panorama',
    category: 'popCulture',
    colors: {
      primaryDark: '#142414',     // Canvas: Dark Minecraft Foliage Green
      primaryContainer: '#3C3C3C',// Cards: Official Minecraft Dark GUI Container Panel
      primary: '#737373',         // Buttons: Official Minecraft Stone Slab Button
      accent: '#FFFF55',          // Active/Scores: Official Minecraft Splash Yellow
      action: '#55FF55',          // Action: Minecraft Emerald Green
      surface: '#FFFFFF',         // Text: Pure White
      secondary: '#D0D0D0',       // Subtext: Minecraft Silver Grey
      success: '#55FF55',
      danger: '#FF5555'
    },
    typography: {
      headingFont: '"Silkscreen", monospace',
      bodyFont: '"Silkscreen", monospace'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '3px'
    },
    effects: {
      cardShadow: 'inset 3px 3px 0px #555555, inset -3px -3px 0px #222222, 0 8px 0px #000000',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at 50% 50%, rgba(40, 80, 40, 0.4) 0%, rgba(10, 20, 10, 0.95) 100%), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0, 0, 0, 0.2) 23px, rgba(0, 0, 0, 0.2) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0, 0, 0, 0.2) 23px, rgba(0, 0, 0, 0.2) 24px)',
      textShadow: '2px 2px 0px #000000',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'voxelGrid'
  },
  wizardingScroll: {
    id: 'wizardingScroll',
    name: '⚡ Wizarding Scroll',
    description: 'A magical aesthetic with midnight castle skies, deep mahogany wood, and golden snitch highlights',
    category: 'popCulture',
    colors: {
      primaryDark: '#0B0C1A',     // Canvas: Night Sky
      primaryContainer: '#2D1F16',// Cards: Mahogany Tables
      primary: '#740001',         // Buttons: House Crimson
      accent: '#D3A625',          // Scores/Active: Magic Gold
      action: '#1A472A',          // Action: House Emerald
      surface: '#F5DEB3',         // Text: Pale Parchment
      secondary: '#D2C4AE',       // Subtext: Dusty Tome Parchment
      success: '#2E8B57',
      danger: '#8B0000'
    },
    typography: {
      headingFont: '"Cinzel Decorative", "Cinzel", serif',
      bodyFont: '"Lora", serif'
    },
    geometry: {
      radiusSm: '2px',
      radiusMd: '6px',
      radiusLg: '10px',
      borderWidth: '1px'
    },
    effects: {
      cardShadow: '0 10px 30px rgba(0,0,0,0.8)',
      buttonShadow: 'none',
      bgTexture: 'radial-gradient(circle at top, rgba(211, 166, 37, 0.05), transparent 70%)',
      textShadow: 'none',
      backdropBlur: 'blur(6px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'lumosGlow'
  },
  y2kPlastic: {
    id: 'y2kPlastic',
    name: '💿 Y2K Plastic',
    description: 'A hyper-pop 2000s light mode featuring frosted translucent pinks, cyan, and glossy curves',
    category: 'radiant',
    colors: {
      primaryDark: '#FFCCF9',     // Canvas: Pastel Pink
      primaryContainer: '#FFFFFF',// Cards: Pure White
      primary: '#FF66CC',         // Buttons: Hot Magenta
      accent: '#00E5FF',          // Scores/Active: Cyan
      action: '#B000FF',          // Action: Electric Purple
      surface: '#111111',         // Text: Deep Charcoal
      secondary: '#444444',       // Subtext: Slate Grey
      success: '#00E676',
      danger: '#FF1744'
    },
    typography: {
      headingFont: '"Fredoka", sans-serif',
      bodyFont: '"Nunito", sans-serif'
    },
    geometry: {
      radiusSm: '12px',
      radiusMd: '24px',
      radiusLg: '32px',
      borderWidth: '0px'
    },
    effects: {
      cardShadow: '0 15px 35px rgba(255, 102, 204, 0.2)',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(16px)'
    },
    animation: bouncyAnimation
  },

  // --- SPECIALTY & STRATEGY ---
  neonCatalyst: {
    id: 'neonCatalyst',
    name: '🧪 Neon Catalyst',
    description: 'A hazardous lab aesthetic with toxic greens, biohazard yellows, and dark matte slate',
    category: 'popCulture',
    colors: {
      primaryDark: '#0D1110',     // Canvas: Dark Slate
      primaryContainer: '#161F1A',// Cards: Deep Lab Green
      primary: '#2D8659',         // Buttons: Chemical Green
      accent: '#39FF14',          // Scores/Active: Toxic Neon Glow
      action: '#FDE047',          // Action: Biohazard Yellow
      surface: '#F8FAFC',         // Text: Sterile White
      secondary: '#CBD5E1',       // Subtext: Faded Slate
      success: '#10B981',
      danger: '#EF4444'
    },
    typography: {
      headingFont: '"Rajdhani", sans-serif',
      bodyFont: '"Roboto Mono", monospace'
    },
    geometry: {
      radiusSm: '16px',
      radiusMd: '24px',
      radiusLg: '32px',
      borderWidth: '2px'
    },
    effects: {
      cardShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      buttonShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      bgTexture: 'radial-gradient(circle at 50% 100%, rgba(57, 255, 20, 0.1) 0%, transparent 80%)',
      textShadow: 'none',
      backdropBlur: 'blur(8px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'toxicVat'
  },

  titaniumChronograph: {
    id: 'titaniumChronograph',
    name: '⏱️ Titanium Chrono',
    description: 'Inspired by high-end mechanical watches with brushed steel, matte black, and luminescent teal',
    category: 'onyx',
    colors: {
      primaryDark: '#121212',     // Canvas: Matte Black Dial
      primaryContainer: '#1E1E1E',// Cards: Dark Titanium
      primary: '#4A5568',         // Buttons: Gunmetal
      accent: '#00FFCC',          // Scores/Active: Lume Teal
      action: '#E53E3E',          // Action: Second-Hand Red
      surface: '#F7FAFC',         // Text: Bright White
      secondary: '#CBD5E0',       // Subtext: Brushed Steel
      success: '#00FA9A',
      danger: '#FF4500'
    },
    typography: {
      headingFont: '"JetBrains Mono", "Share Tech Mono", monospace',
      bodyFont: '"Jura", sans-serif'
    },
    geometry: {
      radiusSm: '2px',
      radiusMd: '4px',
      radiusLg: '8px',
      borderWidth: '1px'
    },
    effects: {
      cardShadow: '0 4px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
      buttonShadow: '0 2px 4px rgba(0,0,0,0.5)',
      bgTexture: 'repeating-radial-gradient(circle at center, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation
  },

  mysticArtificer: {
    id: 'mysticArtificer',
    name: '🔮 Mystic Artificer',
    description: 'A tabletop-inspired aesthetic blending dark leather, brass, and crackling arcane blue energy',
    category: 'popCulture',
    colors: {
      primaryDark: '#1A1412',     // Canvas: Dark Leather
      primaryContainer: '#2C1E16',// Cards: Aged Wood
      primary: '#8D6E63',         // Buttons: Tarnished Brass
      accent: '#00E5FF',          // Scores/Active: Arcane Blue Magic
      action: '#FF6F00',          // Action: Forge Sparks
      surface: '#FFF8E7',         // Text: Old Parchment
      secondary: '#D7CCC8',       // Subtext: Faded Brass
      success: '#00BFA5',
      danger: '#D84315'
    },
    typography: {
      headingFont: '"Cormorant Garamond", serif',
      bodyFont: '"Alegreya Sans", sans-serif'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '2px'
    },
    effects: {
      cardShadow: '6px 6px 0px rgba(0,0,0,0.7)',
      buttonShadow: '2px 2px 0px rgba(0,0,0,0.8)',
      bgTexture: 'none',
      textShadow: '2px 2px 0px #000000',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation
  },

  grandmasterChess: {
    id: 'grandmasterChess',
    name: '♞ Grandmaster',
    description: 'An elegant, high-stakes competition theme featuring pure white, obsidian black, and tournament gold',
    category: 'radiant',
    colors: {
      primaryDark: '#F0F0F0',     // Canvas: Light Marble
      primaryContainer: '#FFFFFF',// Cards: Pure White Board
      primary: '#C62828',         // Buttons: Velvet Tournament Red
      accent: '#D4AF37',          // Scores/Active: Trophy Gold
      action: '#0A0A0A',          // Action: Obsidian Black
      surface: '#121212',         // Text: Ink Black
      secondary: '#444444',       // Subtext: Slate Grey
      success: '#2E7D32',
      danger: '#C62828'
    },
    typography: {
      headingFont: '"Playfair Display", serif',
      bodyFont: '"Lato", sans-serif'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '1px'
    },
    effects: {
      cardShadow: '0 20px 40px rgba(0,0,0,0.08)',
      buttonShadow: '0 4px 10px rgba(0,0,0,0.15)',
      bgTexture: 'linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.02)), linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.02))',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: smoothAnimation
  },

  midnightMetropolis: {
    id: 'midnightMetropolis',
    name: '🌃 Midnight Metropolis',
    description: 'A bustling neon-city night vibe with deep indigo skies, electric pinks, and traffic-light yellows',
    category: 'synthwave',
    colors: {
      primaryDark: '#0A001A',     // Canvas: Deepest Indigo
      primaryContainer: '#170033',// Cards: Night Purple
      primary: '#4B0082',         // Buttons: Dark Purple
      accent: '#FF007F',          // Scores/Active: Neon Pink
      action: '#FFD700',          // Action: Traffic Yellow
      surface: '#FFFFFF',         // Text: Pure White
      secondary: '#D0C2FF',       // Subtext: Soft Violet
      success: '#00FFCC',
      danger: '#FF0055'
    },
    typography: {
      headingFont: '"Syncopate", sans-serif',
      bodyFont: '"Space Grotesk", sans-serif'
    },
    geometry: {
      radiusSm: '8px',
      radiusMd: '16px',
      radiusLg: '24px',
      borderWidth: '2px'
    },
    effects: {
      cardShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
      buttonShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
      bgTexture: 'linear-gradient(180deg, rgba(10, 0, 26, 1) 0%, rgba(23, 0, 51, 0.8) 100%)',
      textShadow: 'none',
      backdropBlur: 'blur(10px)'
    },
    animation: smoothAnimation
  },

  plasmaTesla: {
    id: 'plasmaTesla',
    name: '⚡ Plasma Tesla',
    description: 'High-voltage experimental laboratory theme with electric blue arc discharges, neon violet energy, and raw copper conduits',
    category: 'synthwave',
    colors: {
      primaryDark: '#040209',     // Canvas: Vacuum Chamber Black
      primaryContainer: '#0E091C',// Cards: Arc Chamber Indigo
      primary: '#7B2CBF',         // Buttons: Tesla Coil Violet
      accent: '#00F0FF',          // Scores/Active: Electric Plasma Cyan
      action: '#FF007F',          // Action: High Voltage Magenta
      surface: '#F0F4FF',         // Text: Ionized Air White
      secondary: '#C79DFF',       // Subtext: Arc Field Purple
      success: '#00FF88',
      danger: '#FF1744'
    },
    typography: {
      headingFont: '"JetBrains Mono", "Share Tech Mono", monospace',
      bodyFont: '"Fira Code", monospace'
    },
    geometry: sharpGeometry,
    effects: {
      cardShadow: '0 12px 35px rgba(0, 0, 0, 0.7)',
      buttonShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
      bgTexture: 'repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.03) 0px, rgba(0, 240, 255, 0.03) 1px, transparent 1px, transparent 20px)',
      textShadow: 'none',
      backdropBlur: 'blur(4px)'
    },
    animation: smoothAnimation,
    overlayEffect: 'plasmaArc',
    audioProfile: {
      sfxPreset: 'cyber',
      pitchMultiplier: 1.1
    }
  },

  steampunkEngine: {
    id: 'steampunkEngine',
    name: '⚙️ Steampunk Engine',
    description: 'Victorian industrial machinery theme featuring oxidized brass, mahogany wood, copper rivets, and amber gauge illumination',
    category: 'emerald',
    colors: {
      primaryDark: '#140D0A',     // Canvas: Coal Smoked Mahogany
      primaryContainer: '#241712',// Cards: Polished Walnut Case
      primary: '#B8860B',         // Buttons: Dark Goldenrod Brass
      accent: '#FFBF00',          // Scores/Active: Amber Gauge Glow
      action: '#CD5C5C',          // Action: Pressure Relief Red
      surface: '#F5E6C8',         // Text: Aged Sepia Parchment
      secondary: '#D4B896',       // Subtext: Brushed Copper Parchment
      success: '#2E8B57',         // Verdigris Copper Rust
      danger: '#B22222'
    },
    typography: {
      headingFont: '"Special Elite", "Courier New", monospace',
      bodyFont: '"IM Fell English", serif'
    },
    geometry: {
      radiusSm: '4px',
      radiusMd: '8px',
      radiusLg: '12px',
      borderWidth: '3px'
    },
    effects: {
      cardShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 4px 4px 10px rgba(0,0,0,0.6)',
      buttonShadow: 'inset 1px 1px 0px rgba(255,255,255,0.2), 2px 2px 4px rgba(0,0,0,0.7)',
      bgTexture: 'radial-gradient(circle at center, rgba(255, 191, 0, 0.05) 0%, transparent 70%), repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 8px)',
      textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'steampunkGears',
    audioProfile: {
      sfxPreset: 'western',
      pitchMultiplier: 0.95
    }
  },

  devDebug: {
    id: 'devDebug',
    name: '⬛ Dev / Debug Null',
    description: 'Pure pitch black #000000 minimalist theme with clean white text, zero shadows, and full black zeroed surfaces',
    category: 'onyx',
    colors: {
      primaryDark: '#000000',     // Canvas: Pure Pitch Black #000000
      primaryContainer: '#000000',// Cards: Pure Pitch Black #000000
      primary: '#000000',         // Buttons: Pure Pitch Black #000000
      accent: '#FFFFFF',          // Scores/Active: Pure White #FFFFFF
      action: '#FFFFFF',          // Action: Pure White #FFFFFF
      surface: '#FFFFFF',         // Text: Pure White #FFFFFF
      secondary: '#CCCCCC',       // Subtext: Soft White/Light Grey #CCCCCC
      success: '#FFFFFF',         // Success: Pure White #FFFFFF
      danger: '#FFFFFF'           // Danger: Pure White #FFFFFF
    },
    typography: {
      headingFont: '"JetBrains Mono", "Fira Code", monospace',
      bodyFont: '"JetBrains Mono", "Fira Code", monospace'
    },
    geometry: {
      radiusSm: '0px',
      radiusMd: '0px',
      radiusLg: '0px',
      borderWidth: '1px'
    },
    effects: {
      cardShadow: 'none',
      buttonShadow: 'none',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'none'
    },
    animation: brutalistAnimation,
    overlayEffect: 'none',
    audioProfile: {
      sfxPreset: 'minimal',
      pitchMultiplier: 1.0
    }
  }
};

export const defaultTheme = {
  ...PRESET_THEMES.ariseClassic.colors,
  darkGreen: PRESET_THEMES.ariseClassic.colors.primaryDark,
  teal: PRESET_THEMES.ariseClassic.colors.primary,
  darkTeal: PRESET_THEMES.ariseClassic.colors.primaryContainer,
  yellow: PRESET_THEMES.ariseClassic.colors.accent,
  lightOrange: PRESET_THEMES.ariseClassic.colors.secondary,
  orange: PRESET_THEMES.ariseClassic.colors.action,
  white: PRESET_THEMES.ariseClassic.colors.surface,
  correctGreen: PRESET_THEMES.ariseClassic.colors.success,
  wrongRed: PRESET_THEMES.ariseClassic.colors.danger
};

/** Utility to dynamically register a custom theme preset at runtime */
export const registerPresetTheme = (preset: PresetTheme) => {
  PRESET_THEMES[preset.id] = preset;
};

/**
 * Safely finds matching PresetTheme object from active theme state,
 * matching by theme ID, color tokens, or color signatures.
 */
export function findMatchingPreset(theme: any): PresetTheme {
  if (theme?.id && PRESET_THEMES[theme.id]) {
    return PRESET_THEMES[theme.id];
  }

  const primaryDark = theme?.primaryDark || theme?.darkGreen;
  const primary = theme?.primary || theme?.teal;

  const match = Object.values(PRESET_THEMES).find(
    (p) => p.colors.primaryDark === primaryDark && p.colors.primary === primary
  );
  if (match) return match;

  // Fallback signature matching for vaporwaveHorizon
  if ((primaryDark === '#120324' || primaryDark === '#0c021e') || (theme?.action === '#FF007F' && theme?.accent === '#00FFFF')) {
    return PRESET_THEMES.vaporwaveHorizon;
  }

  return PRESET_THEMES.ariseClassic;
}