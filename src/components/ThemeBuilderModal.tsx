import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import {
  PRESET_THEMES,
  registerPresetTheme,
  findMatchingPreset,
  type PresetTheme,
  type ThemeCategory,
  type ThemeOverlayEffect,
  type ThemeSfxPreset
} from '../config/themes';
import { ThemeOverlay } from './ThemeOverlay';
import { exportThemeToJson } from '../utils/themeExporter';
import { playCorrectFanfare, playButtonClick, playTileChime, playBuzzerLockout } from '../utils/soundEffects';
import { X, Sparkles, Palette, Type, Sliders, Save, Download, Code, Eye, AlertTriangle, CheckCircle, RefreshCw, Volume2 } from 'lucide-react';

interface ThemeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONTS_HEADING = [
  { label: 'League Spartan (Default)', value: '"League Spartan", "Montserrat", sans-serif' },
  { label: 'Bangers (Comic Pop)', value: '"Bangers", system-ui' },
  { label: 'Fira Code (Cyber Tech)', value: '"Fira Code", monospace' },
  { label: 'Silkscreen (8-Bit Pixel)', value: '"Silkscreen", sans-serif' },
  { label: 'Cinzel (Magical Serif)', value: '"Cinzel", serif' },
  { label: 'Fredoka (Bubblegum Round)', value: '"Fredoka", sans-serif' },
  { label: 'Oswald (Heroic Condensed)', value: '"Oswald", sans-serif' },
  { label: 'Playfair Display (Grandmaster)', value: '"Playfair Display", serif' },
  { label: 'Space Grotesk (Modern Tech)', value: '"Space Grotesk", sans-serif' },
  { label: 'VT323 (Terminal Retro)', value: '"VT323", monospace' },
];

const FONTS_BODY = [
  { label: 'League Spartan / Inter', value: '"League Spartan", "Inter", sans-serif' },
  { label: 'Fira Code Mono', value: '"Fira Code", monospace' },
  { label: 'Comic Neue Cursive', value: '"Comic Neue", cursive' },
  { label: 'Roboto Mono', value: '"Roboto Mono", monospace' },
  { label: 'Patrick Hand Chalk', value: '"Patrick Hand", cursive' },
];

const OVERLAY_EFFECTS: { label: string; value: ThemeOverlayEffect }[] = [
  { label: 'None (Solid Background)', value: 'none' },
  { label: 'Custom JS Canvas Animation Script', value: 'customJs' },
  { label: 'Matrix Digital Code Rain', value: 'matrixRain' },
  { label: 'Toxic Vat Liquid Bubbles', value: 'toxicVat' },
  { label: 'Retro CRT Arcade Scanlines', value: 'crtScanlines' },
  { label: 'Radar Spider Web Grid', value: 'spiderWebs' },
  { label: 'Lumos Snitch Golden Glow', value: 'lumosGlow' },
  { label: 'Voxel Block Particles', value: 'voxelGrid' },
  { label: 'Vaporwave 3D Synth Horizon', value: 'vaporwaveHorizon' },
];

const SFX_PRESETS: { label: string; value: ThemeSfxPreset }[] = [
  { label: 'Broadcast Studio Standard (Default)', value: 'default' },
  { label: 'Chiptune 8-Bit Arcade Synthesizer', value: 'retro8bit' },
  { label: 'Matrix Cyberpunk Neon Pulse', value: 'cyber' },
  { label: 'Magical Snitch Sparkle Chimes', value: 'magical' },
  { label: 'Pop Art Cartoon Comic SFX', value: 'comic' },
  { label: 'Soft Minimal Woodblock Taps', value: 'minimal' },
  { label: 'Heroic Orchestral Fanfare', value: 'heroic' },
  { label: 'Saloon Western Acoustic', value: 'western' },
  { label: 'Minecraft Block Voxel Chimes', value: 'block' },
];

const CODE_PRESETS = [
  {
    label: 'Pulsing Sine Wave Fireflies',
    code: `// Pulsing Neon Sine Wave Fireflies
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
ctx.fillRect(0, 0, width, height);

for (let i = 0; i < 14; i++) {
  const x = (width * 0.5) + Math.sin(time + i * 0.7) * (width * 0.35);
  const y = (height * 0.5) + Math.cos(time * 0.8 + i * 1.5) * (height * 0.35);
  const size = 3 + Math.sin(time * 3 + i) * 2;
  
  ctx.fillStyle = \`hsl(\${(time * 40 + i * 25) % 360}, 100%, 65%)\`;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2);
  ctx.fill();
}
ctx.shadowBlur = 0;`
  },
  {
    label: 'Cosmic Starfield Particles',
    code: `// Floating Cosmic Starfield
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = 'rgba(10, 5, 25, 0.25)';
ctx.fillRect(0, 0, width, height);

for (let i = 0; i < 30; i++) {
  const speed = (i % 5) + 1;
  const x = (i * 37 + time * 20 * speed) % width;
  const y = (i * 23 + Math.sin(time + i) * 15) % height;
  const alpha = 0.3 + Math.sin(time * 2 + i) * 0.3;

  ctx.fillStyle = \`rgba(255, 255, 255, \${Math.max(0.1, alpha)})\`;
  ctx.beginPath();
  ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
  ctx.fill();
}`
  },
  {
    label: 'Cyber Concentric Neon Pulse',
    code: `// Cyberpunk Pulsing Concentric Rings
ctx.clearRect(0, 0, width, height);
ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
ctx.fillRect(0, 0, width, height);

const centerX = width / 2;
const centerY = height / 2;

for (let r = 10; r < Math.max(width, height); r += 25) {
  const pulse = Math.sin(time * 3 - r * 0.05) * 5;
  ctx.strokeStyle = \`rgba(0, 255, 240, \${Math.max(0.05, 0.3 - r * 0.001)})\`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, Math.max(2, r + pulse), 0, Math.PI * 2);
  ctx.stroke();
}`
  }
];

const GEOMETRY_PRESETS = [
  { label: 'Soft Rounded (6px / 12px / 20px)', radiusSm: '6px', radiusMd: '12px', radiusLg: '20px' },
  { label: 'Sharp Square (0px / 0px / 0px)', radiusSm: '0px', radiusMd: '0px', radiusLg: '0px' },
  { label: 'Ultra Pills (16px / 26px / 36px)', radiusSm: '16px', radiusMd: '26px', radiusLg: '36px' },
];

const SHADOW_PROFILES = [
  { label: 'Soft Elevated Shadow', value: '0 12px 35px rgba(0,0,0,0.4)' },
  { label: 'Hard 3D Offset Shadow', value: '8px 8px 0px #000000' },
  { label: 'Deep Directional Shadow', value: '0 20px 40px rgba(0,0,0,0.6)' },
  { label: 'Flat Minimal', value: 'none' }
];

const HOVER_PROFILES = [
  { label: 'Smooth Lift (-4px)', value: 'translateY(-4px)' },
  { label: 'Brutalist Shift (-4px, -4px)', value: 'translate(-4px, -4px)' },
  { label: 'Bouncy Scale (1.05x)', value: 'scale(1.05)' },
  { label: 'Static (No Motion)', value: 'none' }
];

/**
 * Syntax Highlighting Helper for JavaScript Canvas Code.
 */
const highlightJsCode = (code: string): string => {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return html
    .replace(/(\/\/[^\n]*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178;">$1</span>')
    .replace(/\b(const|let|var|for|if|else|return|function|try|catch|while|new)\b/g, '<span style="color: #569cd6; font-weight: bold;">$1</span>')
    .replace(/\b(ctx|canvas|width|height|time|frameCount|Math|console)\b/g, '<span style="color: #4ec9b0; font-weight: bold;">$1</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span style="color: #b5cea8;">$1</span>')
    .replace(/\b(fillRect|strokeRect|clearRect|fillText|beginPath|arc|fill|stroke|createLinearGradient|createRadialGradient|addColorStop|save|restore)\b/g, '<span style="color: #dcdcaa;">$1</span>');
};

/**
 * Syntax-Highlighted Code Editor Component with Real-Time Error Diagnostics.
 */
const SyntaxHighlightedJsEditor: React.FC<{
  code: string;
  onChange: (val: string) => void;
  onReset: () => void;
}> = ({ code, onChange, onReset }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      new Function('canvas', 'ctx', 'width', 'height', 'time', 'frameCount', code);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [code]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        {error ? (
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'rgba(248, 81, 73, 0.18)',
              border: '1px solid #f85149',
              color: '#ff7b72',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'monospace'
            }}
          >
            <AlertTriangle size={16} />
            <span><strong>Syntax Error:</strong> {error}</span>
          </div>
        ) : (
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(57, 255, 20, 0.12)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              color: '#39ff14',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'monospace'
            }}
          >
            <CheckCircle size={14} />
            <span>JS Code Compiled Successfully & Valid</span>
          </div>
        )}

        <button
          onClick={onReset}
          className="action-btn secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <RefreshCw size={14} /> Auto-Fix / Reset Template
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '250px',
          borderRadius: 'var(--radius-sm, 8px)',
          border: error ? '1.5px solid #f85149' : '1.5px solid var(--color-accent)',
          background: '#090d16',
          overflow: 'hidden'
        }}
      >
        <pre
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightJsCode(code) + '\n' }}
          style={{
            position: 'absolute',
            inset: 0,
            padding: '12px',
            margin: 0,
            fontFamily: '"Fira Code", "Roboto Mono", monospace',
            fontSize: '0.82rem',
            lineHeight: '1.45',
            tabSize: 2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            pointerEvents: 'none',
            overflow: 'auto',
            color: '#d4d4d4'
          }}
        />

        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{
            position: 'absolute',
            inset: 0,
            padding: '12px',
            margin: 0,
            width: '100%',
            height: '100%',
            fontFamily: '"Fira Code", "Roboto Mono", monospace',
            fontSize: '0.82rem',
            lineHeight: '1.45',
            tabSize: 2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'transparent',
            color: 'transparent',
            caretColor: '#00ffcc',
            border: 'none',
            outline: 'none',
            resize: 'none'
          }}
          placeholder="// Write JS canvas animation code here..."
        />
      </div>
    </div>
  );
};

export const ThemeBuilderModal: React.FC<ThemeBuilderModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, saveCustomPreset } = useQuizStore();
  const [activeTab, setActiveTab] = useState<'info' | 'code' | 'colors' | 'typography' | 'kinetics' | 'audio'>('info');
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const activePreset = findMatchingPreset(theme);
  const allPresetThemesList = Object.values(PRESET_THEMES);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category] = useState<ThemeCategory>('custom');
  const [overlayEffect, setOverlayEffect] = useState<ThemeOverlayEffect>('none');
  const [customOverlayCode, setCustomOverlayCode] = useState(CODE_PRESETS[0].code);

  // Audio Profile State
  const [sfxPreset, setSfxPreset] = useState<ThemeSfxPreset>('default');
  const [themeBgmPath, setThemeBgmPath] = useState('');

  // Palette State
  const [colors, setColors] = useState({
    primaryDark: '#0d1117',
    primaryContainer: '#161b22',
    primary: '#238636',
    accent: '#39ff14',
    action: '#2ea043',
    surface: '#f0f6fc',
    secondary: '#8b949e',
    success: '#39ff14',
    danger: '#f85149'
  });

  // Typography & Geometry State
  const [headingFont, setHeadingFont] = useState(FONTS_HEADING[0].value);
  const [bodyFont, setBodyFont] = useState(FONTS_BODY[0].value);
  const [radiusSm, setRadiusSm] = useState('6px');
  const [radiusMd, setRadiusMd] = useState('12px');
  const [radiusLg, setRadiusLg] = useState('20px');
  const [borderWidth, setBorderWidth] = useState('2px');

  // Effects & Kinetics State
  const [cardShadow, setCardShadow] = useState(SHADOW_PROFILES[0].value);
  const [hoverTransform, setHoverTransform] = useState(HOVER_PROFILES[0].value);

  // Synchronize 100% of parameters with the active theme when modal opens
  useEffect(() => {
    if (isOpen) {
      const cleanActiveName = activePreset?.name ? activePreset.name.replace(/^🎨\s*/, '') : 'My Custom Theme';
      setName(`${cleanActiveName} (Custom Edit)`);
      setDescription(activePreset?.description || 'A custom designed visual theme with custom overlay & kinetics.');
      setOverlayEffect(activePreset?.overlayEffect || 'none');
      setCustomOverlayCode(activePreset?.customOverlayCode || CODE_PRESETS[0].code);

      setColors({ ...theme });

      if (activePreset?.audioProfile) {
        setSfxPreset(activePreset.audioProfile.sfxPreset || 'default');
        setThemeBgmPath(activePreset.audioProfile.themeBgmPath || '');
      } else {
        setSfxPreset('default');
        setThemeBgmPath('');
      }

      if (activePreset?.typography) {
        setHeadingFont(activePreset.typography.headingFont);
        setBodyFont(activePreset.typography.bodyFont);
      }

      if (activePreset?.geometry) {
        setRadiusSm(activePreset.geometry.radiusSm || '6px');
        setRadiusMd(activePreset.geometry.radiusMd || '12px');
        setRadiusLg(activePreset.geometry.radiusLg || '20px');
        setBorderWidth(activePreset.geometry.borderWidth || '2px');
      } else {
        setRadiusSm('6px');
        setRadiusMd('12px');
        setRadiusLg('20px');
        setBorderWidth('2px');
      }

      if (activePreset?.effects?.cardShadow) {
        setCardShadow(activePreset.effects.cardShadow);
      }
      if (activePreset?.animation?.hoverTransform) {
        setHoverTransform(activePreset.animation.hoverTransform);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const constructedPreset: PresetTheme = {
    id: `custom_${Date.now()}`,
    name: name.trim(),
    description,
    category,
    overlayEffect,
    customOverlayCode,
    colors,
    audioProfile: {
      sfxPreset,
      themeBgmPath: themeBgmPath.trim() || undefined
    },
    typography: {
      headingFont,
      bodyFont
    },
    geometry: {
      radiusSm,
      radiusMd,
      radiusLg,
      borderWidth
    },
    effects: {
      cardShadow,
      buttonShadow: '0 4px 15px rgba(0,0,0,0.2)',
      bgTexture: 'none',
      textShadow: 'none',
      backdropBlur: 'blur(8px)'
    },
    animation: {
      transitionSpeed: '0.2s ease-in-out',
      hoverTransform,
      activeTransform: 'scale(0.98)'
    }
  };

  const handleSaveAndApply = () => {
    registerPresetTheme(constructedPreset);
    saveCustomPreset(constructedPreset);
    setTheme(constructedPreset.colors);
    alert(`Successfully created and applied theme "${constructedPreset.name}"!`);
    onClose();
  };

  const handleExportJson = () => {
    exportThemeToJson(constructedPreset);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        className="animate-modal-in"
        style={{
          width: '100%',
          maxWidth: '1020px',
          height: '92vh',
          background: 'var(--color-primary-dark)',
          border: '2px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: 'var(--shadow-card, 0 25px 60px rgba(0, 0, 0, 0.7))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={24} color="var(--color-accent)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                Custom Theme Studio
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-surface)', opacity: 0.8, fontFamily: 'var(--font-body)' }}>
                Editing From Active Theme: <strong style={{ color: 'var(--color-accent)' }}>{activePreset?.name || 'Active Theme'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Live Preview Toggle */}
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="action-btn secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '40px' }}
            >
              <Eye size={15} /> {showMobilePreview ? 'Hide Preview' : 'Live Preview'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--color-surface)', opacity: 0.8, cursor: 'pointer', padding: '6px' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Form Controls Area */}
          <div
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Clean Horizontal Tabs Bar with SVG Icons */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '12px', overflowX: 'auto' }}>
              {[
                { id: 'info', label: '1. Overlay & Info', icon: <Sparkles size={15} /> },
                ...(overlayEffect === 'customJs' ? [{ id: 'code', label: 'JS Code Editor', icon: <Code size={15} /> }] : []),
                { id: 'colors', label: '2. Palette', icon: <Palette size={15} /> },
                { id: 'typography', label: '3. Fonts & Geo', icon: <Type size={15} /> },
                { id: 'kinetics', label: '4. Motion', icon: <Sliders size={15} /> },
                { id: 'audio', label: '5. Audio & SFX', icon: <Volume2 size={15} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.08)',
                    color: activeTab === tab.id ? 'var(--color-primary-dark)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    minHeight: '40px',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: INFO & OVERLAY */}
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      minHeight: '44px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Canvas Overlay Animation Effect
                  </label>
                  <select
                    value={overlayEffect}
                    onChange={(e) => {
                      const val = e.target.value as ThemeOverlayEffect;
                      setOverlayEffect(val);
                      if (val === 'customJs') setActiveTab('code');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      minHeight: '44px'
                    }}
                  >
                    {OVERLAY_EFFECTS.map((eff) => (
                      <option key={eff.value} value={eff.value}>{eff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB: CODE EDITOR */}
            {activeTab === 'code' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-accent)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} /> Syntax-Highlighted JS Canvas Code Editor
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-surface)', opacity: 0.7 }}>
                    Params: <code>canvas, ctx, width, height, time, frameCount</code>
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Load Template Preset:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) setCustomOverlayCode(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontSize: '0.85rem',
                      minHeight: '40px'
                    }}
                  >
                    <option value="">-- Choose Code Template Preset --</option>
                    {CODE_PRESETS.map((p) => (
                      <option key={p.label} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <SyntaxHighlightedJsEditor
                  code={customOverlayCode}
                  onChange={setCustomOverlayCode}
                  onReset={() => setCustomOverlayCode(CODE_PRESETS[0].code)}
                />
              </div>
            )}

            {/* TAB 2: PALETTE COLORS */}
            {activeTab === 'colors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '65vh', paddingRight: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.12)', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={15} /> Import Palette from 40+ Presets ({allPresetThemesList.length}):
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const selected = allPresetThemesList.find(p => p.id === e.target.value);
                        if (selected) setColors({ ...selected.colors });
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontSize: '0.85rem',
                      minHeight: '40px',
                      maxWidth: '100%'
                    }}
                  >
                    <option value="">-- Load Palette from 40+ Presets --</option>
                    {allPresetThemesList.map((preset) => (
                      <option key={preset.id} value={preset.id}>{preset.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                  {[
                    { key: 'primaryDark', label: 'Canvas Background (Dark)' },
                    { key: 'primaryContainer', label: 'Card Container (BG)' },
                    { key: 'primary', label: 'Primary Brand / Border' },
                    { key: 'accent', label: 'Active Accent / Highlight' },
                    { key: 'action', label: 'Interactive Action Button' },
                    { key: 'surface', label: 'Primary Text Surface' },
                    { key: 'secondary', label: 'Subtext & Muted Labels' },
                    { key: 'success', label: 'Correct Answer Green' },
                    { key: 'danger', label: 'Wrong Answer Red' },
                  ].map((token) => (
                    <div
                      key={token.key}
                      style={{
                        background: 'var(--color-primary-container)',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm, 10px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <label style={{ fontSize: '0.82rem', color: 'var(--color-surface)', opacity: 0.9, fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                        {token.label}
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '44px',
                            borderRadius: '8px',
                            background: (colors as any)[token.key],
                            border: '2px solid rgba(255,255,255,0.25)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}
                        >
                          <input
                            type="color"
                            value={(colors as any)[token.key]}
                            onChange={(e) => setColors({ ...colors, [token.key]: e.target.value })}
                            style={{
                              position: 'absolute',
                              inset: '-10px',
                              width: '80px',
                              height: '80px',
                              cursor: 'pointer',
                              opacity: 0
                            }}
                          />
                        </div>

                        <input
                          type="text"
                          value={(colors as any)[token.key]}
                          onChange={(e) => setColors({ ...colors, [token.key]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            fontSize: '0.92rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.4)',
                            color: 'var(--color-surface)',
                            fontFamily: '"Fira Code", monospace',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            textAlign: 'center',
                            minHeight: '44px'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY & GEOMETRY */}
            {activeTab === 'typography' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Heading Font Family
                  </label>
                  <select
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--color-primary-container)', color: 'var(--color-surface)', fontSize: '0.9rem', minHeight: '44px' }}
                  >
                    {FONTS_HEADING.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Body Font Family
                  </label>
                  <select
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--color-primary-container)', color: 'var(--color-surface)', fontSize: '0.9rem', minHeight: '44px' }}
                  >
                    {FONTS_BODY.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Corner Radius Geometry Preset
                  </label>
                  <select
                    value={`${radiusSm}/${radiusMd}/${radiusLg}`}
                    onChange={(e) => {
                      const geo = GEOMETRY_PRESETS.find(g => `${g.radiusSm}/${g.radiusMd}/${g.radiusLg}` === e.target.value);
                      if (geo) {
                        setRadiusSm(geo.radiusSm);
                        setRadiusMd(geo.radiusMd);
                        setRadiusLg(geo.radiusLg);
                      }
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--color-primary-container)', color: 'var(--color-surface)', fontSize: '0.9rem', minHeight: '44px' }}
                  >
                    {GEOMETRY_PRESETS.map((geo) => (
                      <option key={geo.label} value={`${geo.radiusSm}/${geo.radiusMd}/${geo.radiusLg}`}>{geo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Border Width: <strong>{borderWidth}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={parseInt(borderWidth)}
                    onChange={(e) => setBorderWidth(`${e.target.value}px`)}
                    style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: SHADOWS & KINETICS */}
            {activeTab === 'kinetics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Card Shadow Profile
                  </label>
                  <select
                    value={cardShadow}
                    onChange={(e) => setCardShadow(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--color-primary-container)', color: 'var(--color-surface)', fontSize: '0.9rem', minHeight: '44px' }}
                  >
                    {SHADOW_PROFILES.map((s) => (
                      <option key={s.label} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Hover Motion Profile
                  </label>
                  <select
                    value={hoverTransform}
                    onChange={(e) => setHoverTransform(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--color-primary-container)', color: 'var(--color-surface)', fontSize: '0.9rem', minHeight: '44px' }}
                  >
                    {HOVER_PROFILES.map((h) => (
                      <option key={h.label} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 5: AUDIO & SFX SOUNDSCAPE PROFILE */}
            {activeTab === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Theme Soundscape & SFX Style
                  </label>
                  <select
                    value={sfxPreset}
                    onChange={(e) => setSfxPreset(e.target.value as ThemeSfxPreset)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontSize: '0.9rem',
                      minHeight: '44px'
                    }}
                  >
                    {SFX_PRESETS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                    Theme Background Audio MP3 URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={themeBgmPath}
                    onChange={(e) => setThemeBgmPath(e.target.value)}
                    placeholder="e.g. /audio/matrix.mp3 or https://domain.com/audio.mp3"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'var(--color-primary-container)',
                      color: 'var(--color-surface)',
                      fontFamily: '"Fira Code", monospace',
                      fontSize: '0.88rem',
                      minHeight: '44px'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-surface)', opacity: 0.7, marginTop: '4px', display: 'block' }}>
                    Binds custom background music track directly to this visual theme.
                  </span>
                </div>

                {/* Live SFX Sound Preview Section */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-sm, 8px)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={16} /> Test Theme Sound Effects Live:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                    <button
                      onClick={() => playCorrectFanfare(true)}
                      className="action-btn secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Volume2 size={14} /> Correct Fanfare
                    </button>
                    <button
                      onClick={() => playButtonClick(true)}
                      className="action-btn secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Volume2 size={14} /> Button Click
                    </button>
                    <button
                      onClick={() => playTileChime(0, true)}
                      className="action-btn secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Volume2 size={14} /> Tile Chime
                    </button>
                    <button
                      onClick={() => playBuzzerLockout(true)}
                      className="action-btn secondary"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Volume2 size={14} /> Lockout Buzzer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Cohesive Live Theme Preview Panel */}
          <div
            style={{
              width: '320px',
              minWidth: '280px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>
              Live Theme Preview
            </span>

            {/* Interactive Theme Card Showcase */}
            <div
              onMouseEnter={() => setIsPreviewHovered(true)}
              onMouseLeave={() => setIsPreviewHovered(false)}
              style={{
                width: '100%',
                maxWidth: '280px',
                background: colors.primaryDark || colors.primaryContainer,
                color: colors.surface,
                fontFamily: bodyFont,
                borderRadius: radiusMd,
                padding: '16px',
                border: `${borderWidth} solid ${colors.primary}`,
                boxShadow: cardShadow,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                transform: isPreviewHovered ? hoverTransform : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '290px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              {/* Overlay Canvas in Preview */}
              {overlayEffect !== 'none' && (
                <ThemeOverlay effect={overlayEffect} customOverlayCode={customOverlayCode} isMiniPreview={true} />
              )}

              {/* Title & Badge */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: radiusSm,
                      background: colors.primaryContainer,
                      color: colors.accent,
                      border: `1px solid ${colors.accent}`,
                      fontFamily: headingFont
                    }}
                  >
                    PREVIEW
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: headingFont,
                    fontWeight: 800,
                    color: colors.surface,
                    fontSize: '1.02rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.25',
                    marginBottom: '4px'
                  }}
                >
                  {constructedPreset.name}
                </span>

                <p
                  style={{
                    fontFamily: bodyFont,
                    fontSize: '0.75rem',
                    color: colors.surface,
                    opacity: 0.88,
                    margin: '0 0 8px 0',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {constructedPreset.description}
                </p>
              </div>

              {/* Components Showcase */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                <div
                  style={{
                    padding: '6px 8px',
                    background: colors.primaryContainer,
                    borderRadius: radiusSm,
                    border: `1px solid ${colors.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: colors.accent, fontFamily: headingFont }}>
                    Accent Token
                  </span>
                  <div
                    style={{
                      padding: '2px 5px',
                      borderRadius: radiusSm,
                      background: colors.action,
                      color: colors.surface,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      fontFamily: bodyFont
                    }}
                  >
                    Action
                  </div>
                </div>

                {/* Swatch Bar */}
                <div style={{ display: 'flex', gap: '3px', padding: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: radiusSm }}>
                  {[colors.primaryDark, colors.primaryContainer, colors.primary, colors.accent, colors.action, colors.secondary, colors.surface].map((c, i) => (
                    <div key={i} style={{ flex: 1, height: '14px', borderRadius: '3px', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions - Cohesive App Button Class Styling */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <button
            onClick={handleExportJson}
            className="action-btn secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px' }}
          >
            <Download size={16} /> Export Theme JSON
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              className="action-btn secondary"
              style={{ padding: '10px 18px', fontSize: '0.88rem', minHeight: '44px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndApply}
              className="action-btn"
              style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-accent)', color: 'var(--color-primary-dark)', fontWeight: 'bold', minHeight: '44px' }}
            >
              <Save size={16} /> Save & Apply Custom Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
