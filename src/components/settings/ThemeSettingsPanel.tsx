import React, { useState, useRef } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { PRESET_THEMES, registerPresetTheme, type PresetTheme, type ThemeCategory } from '../../config/themes';
import { exportThemeToJson, importThemeFromJson } from '../../utils/themeExporter';
import { ThemeOverlay } from '../ThemeOverlay';
import { Palette, Download, UploadCloud, RotateCcw, Plus, Trash2, Check, Sparkles, ChevronDown, Sliders, Volume2, Info, X } from 'lucide-react';

interface ThemeSettingsPanelProps {
  onOpenColorPicker: () => void;
  onOpenThemeBuilder: () => void;
}

const getOverlayBadgeLabel = (effect?: string) => {
  switch (effect) {
    case 'toxicVat': return 'Toxic Vat';
    case 'spiderWebs': return 'Spider Webs';
    case 'crtScanlines': return 'CRT Arcade';
    case 'matrixRain': return 'Matrix Code';
    case 'lumosGlow': return 'Lumos Glow';
    case 'voxelGrid': return 'Voxel Grid';
    case 'vaporwaveHorizon': return 'Vaporwave';
    case 'customJs': return 'Custom JS';
    default: return 'Effect';
  }
};

const formatCategoryLabel = (cat?: string): string => {
  switch (cat) {
    case 'signature': return 'SIGNATURE';
    case 'radiant': return 'RADIANT';
    case 'onyx': return 'STEALTH ONYX';
    case 'emerald': return 'EMERALD';
    case 'sapphire': return 'SAPPHIRE';
    case 'synthwave': return 'CYBER SYNTH';
    case 'popCulture': return 'POP CULTURE';
    case 'custom': return 'CUSTOM';
    default: return 'PRESET';
  }
};

const formatAudioBadgeLabel = (sfx?: string): string | null => {
  switch (sfx) {
    case 'retro8bit': return '8-Bit Chiptune';
    case 'cyber': return 'Cyber Pulse';
    case 'magical': return 'Magic Chimes';
    case 'comic': return 'Comic SFX';
    case 'minimal': return 'Woodblock Taps';
    case 'heroic': return 'Heroic Fanfare';
    case 'western': return 'Western Saloon';
    case 'block': return 'Block Chimes';
    default: return null;
  }
};

/**
 * Cohesive Theme Details Modal component.
 * Adapts 100% to the target theme's styling, colors, typography, overlays, and kinetics.
 */
const ThemeDetailsModal: React.FC<{
  preset: PresetTheme | null;
  onClose: () => void;
  onSelectTheme: (preset: PresetTheme) => void;
}> = ({ preset, onClose, onSelectTheme }) => {
  if (!preset) return null;

  const headingFont = preset.typography?.headingFont || '"League Spartan", sans-serif';
  const bodyFont = preset.typography?.bodyFont || '"League Spartan", sans-serif';

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
        padding: '16px'
      }}
    >
      <div
        className="animate-modal-in"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          background: preset.colors.primaryDark || '#0d1117',
          border: `2px solid ${preset.colors.accent}`,
          borderRadius: preset.geometry?.radiusLg || '16px',
          boxShadow: preset.effects?.cardShadow || '0 25px 60px rgba(0,0,0,0.7)',
          color: preset.colors.surface,
          fontFamily: bodyFont,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Live Overlay Effect inside Detail Modal */}
        {preset.overlayEffect && preset.overlayEffect !== 'none' && (
          <ThemeOverlay effect={preset.overlayEffect} customOverlayCode={preset.customOverlayCode} isMiniPreview={true} />
        )}

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: preset.geometry?.radiusSm || '6px',
                background: preset.colors.primaryContainer,
                color: preset.colors.accent,
                border: `1px solid ${preset.colors.primary}`,
                fontFamily: headingFont
              }}
            >
              {formatCategoryLabel(preset.category)}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: preset.colors.accent, fontFamily: headingFont }}>
              {preset.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: preset.colors.surface, opacity: 0.8, cursor: 'pointer', padding: '6px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '22px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Full Untruncated Description */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: preset.colors.accent, fontFamily: headingFont }}>
              Theme Description
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
              {preset.description}
            </p>
          </div>

          {/* Palette Swatch Grid */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: preset.colors.accent, fontFamily: headingFont }}>
              Color Token Palette
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { label: 'Canvas Dark', color: preset.colors.primaryDark },
                { label: 'Card Container', color: preset.colors.primaryContainer },
                { label: 'Primary Brand', color: preset.colors.primary },
                { label: 'Accent / Gold', color: preset.colors.accent },
                { label: 'Action Button', color: preset.colors.action },
                { label: 'Text Surface', color: preset.colors.surface },
                { label: 'Subtext Muted', color: preset.colors.secondary },
                { label: 'Correct Green', color: preset.colors.success },
                { label: 'Wrong Red', color: preset.colors.danger },
              ].map((token) => (
                <div
                  key={token.label}
                  style={{
                    padding: '8px',
                    borderRadius: preset.geometry?.radiusSm || '6px',
                    background: preset.colors.primaryContainer,
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: token.color, border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>{token.label}</span>
                    <strong style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{token.color}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features & Kinetics Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>Canvas Overlay:</span>
              <strong style={{ fontSize: '0.85rem', color: preset.colors.accent, fontFamily: headingFont }}>
                {getOverlayBadgeLabel(preset.overlayEffect)}
              </strong>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>Hover Motion Profile:</span>
              <strong style={{ fontSize: '0.85rem', color: preset.colors.surface, fontFamily: headingFont }}>
                {preset.animation?.hoverTransform || 'Smooth Lift'}
              </strong>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '2px' }}>SFX Soundscape:</span>
              <strong style={{ fontSize: '0.85rem', color: preset.colors.surface, fontFamily: headingFont }}>
                {preset.audioProfile?.sfxPreset || 'Broadcast Studio'}
              </strong>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <button
            onClick={onClose}
            className="action-btn secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem', minHeight: '44px' }}
          >
            Close
          </button>

          <button
            onClick={() => {
              onSelectTheme(preset);
              onClose();
            }}
            className="action-btn"
            style={{
              padding: '10px 24px',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: preset.colors.accent,
              color: preset.colors.primaryDark,
              fontWeight: 'bold',
              minHeight: '44px'
            }}
          >
            <Sparkles size={16} /> Apply This Theme
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Isolated Theme Preview Card Component.
 */
const ThemeCard: React.FC<{
  preset: PresetTheme;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: (preset: PresetTheme) => void;
}> = ({ preset, isSelected, onSelect, onOpenDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardBg = preset.colors.primaryDark || preset.colors.primaryContainer;
  const textColor = preset.colors.surface;
  const headingFont = preset.typography?.headingFont || '"League Spartan", sans-serif';
  const bodyFont = preset.typography?.bodyFont || '"League Spartan", sans-serif';
  const cardRadius = preset.geometry?.radiusMd || '12px';
  const borderWidth = preset.geometry?.borderWidth || '2px';
  const btnRadius = preset.geometry?.radiusSm || '6px';
  const hoverTransform = preset.animation?.hoverTransform || 'translateY(-4px)';

  const getMotionBadgeLabel = (transform?: string): string => {
    if (!transform || transform === 'none') return 'Static';
    if (transform.includes('scale')) return 'Bouncy Scale';
    if (transform.includes('translate(-')) return '3D Shift';
    if (transform.includes('translateY')) return 'Smooth Lift';
    return 'Kinetics';
  };

  return (
    <div
      className="theme-card card-interactive"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: cardBg,
        color: textColor,
        fontFamily: bodyFont,
        borderRadius: cardRadius,
        padding: '16px',
        border: isSelected
          ? `3px solid ${preset.colors.accent}`
          : `${borderWidth} solid ${preset.colors.primary}`,
        boxShadow: preset.effects?.cardShadow || '0 8px 25px rgba(0,0,0,0.3)',
        cursor: 'var(--cursor-pointer, pointer)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? hoverTransform : 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '310px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Live Theme Overlay Effect Canvas inside Preview Card (Strict pointer-events: none) */}
      {preset.overlayEffect && preset.overlayEffect !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>
          <ThemeOverlay effect={preset.overlayEffect} isMiniPreview={true} />
        </div>
      )}

      {/* Card Header: Category Badge ONLY on Top */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          {/* Category Label FIRST & ONLY at the top */}
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 'bold',
              padding: '2px 7px',
              borderRadius: btnRadius,
              background: preset.colors.primaryContainer,
              color: preset.colors.accent,
              border: `1px solid rgba(255,255,255,0.15)`,
              fontFamily: headingFont,
              lineHeight: '1.2',
              cursor: 'var(--cursor-pointer, pointer)',
              boxShadow: 'none',
              textShadow: 'none'
            }}
          >
            {formatCategoryLabel(preset.category)}
          </span>

          {/* Action Group: Hover Details Glass Pill & Selection Checkmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(preset);
              }}
              style={{
                background: preset.colors.primaryContainer,
                border: `1px solid rgba(255,255,255,0.2)`,
                color: preset.colors.surface,
                borderRadius: '14px',
                padding: '3px 9px',
                fontSize: '0.68rem',
                fontWeight: 'bold',
                fontFamily: headingFont,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'var(--cursor-pointer, pointer)',
                opacity: isHovered ? 1 : 0.7,
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: 'none',
                textShadow: 'none'
              }}
            >
              <Info size={12} /> Details
            </button>

            {isSelected && (
              <div style={{ background: preset.colors.accent, color: preset.colors.primaryDark, borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', boxShadow: 'none' }}>
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* Theme Title */}
        <span
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            color: preset.colors.surface,
            fontSize: '1.02rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: 'none',
            lineHeight: '1.25',
            marginBottom: '4px',
            cursor: 'var(--cursor-pointer, pointer)',
            userSelect: 'none'
          }}
        >
          {preset.name}
        </span>

        {/* Theme Description - Clickable to open Cohesive Detail Modal */}
        <p
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(preset);
          }}
          title="Click to read full description and theme specs"
          style={{
            fontFamily: bodyFont,
            fontSize: '0.78rem',
            color: preset.colors.surface,
            opacity: 0.88,
            margin: '0 0 8px 0',
            lineHeight: '1.35',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'var(--cursor-pointer, pointer)'
          }}
        >
          {preset.description}
        </p>

        {/* Feature Pills (Overlay, Motion, Audio) BELOW Description Text */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
          {/* Overlay Effect Pill */}
          {preset.overlayEffect && preset.overlayEffect !== 'none' && (
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: btnRadius,
                background: 'rgba(0,0,0,0.35)',
                color: preset.colors.surface,
                border: `1px solid rgba(255,255,255,0.15)`,
                fontFamily: headingFont,
                lineHeight: '1.2',
                boxShadow: 'none',
                textShadow: 'none'
              }}
            >
              {getOverlayBadgeLabel(preset.overlayEffect)}
            </span>
          )}

          {/* Motion Kinetics Pill */}
          <span
            style={{
              fontSize: '0.64rem',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: btnRadius,
              background: 'rgba(0,0,0,0.35)',
              color: preset.colors.surface,
              opacity: 0.9,
              border: `1px solid rgba(255,255,255,0.15)`,
              fontFamily: headingFont,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              lineHeight: '1.2',
              boxShadow: 'none',
              textShadow: 'none'
            }}
          >
            <Sliders size={10} /> {getMotionBadgeLabel(hoverTransform)}
          </span>

          {/* Audio Soundscape Pill */}
          {preset.audioProfile?.sfxPreset && formatAudioBadgeLabel(preset.audioProfile.sfxPreset) && (
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: btnRadius,
                background: 'rgba(0,0,0,0.35)',
                color: preset.colors.surface,
                opacity: 0.85,
                border: `1px solid rgba(255,255,255,0.15)`,
                fontFamily: headingFont,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                lineHeight: '1.2',
                boxShadow: 'none',
                textShadow: 'none'
              }}
            >
              <Volume2 size={10} /> {formatAudioBadgeLabel(preset.audioProfile.sfxPreset)}
            </span>
          )}
        </div>
      </div>

      {/* Internal Theme Components Showcase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
        <div
          style={{
            padding: '6px 10px',
            background: preset.colors.primaryContainer,
            borderRadius: btnRadius,
            border: `1px solid ${preset.colors.primary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: preset.colors.accent, fontFamily: headingFont }}>
            Accent Sample
          </span>
          <div
            style={{
              padding: '2px 6px',
              borderRadius: btnRadius,
              background: preset.colors.action,
              color: preset.colors.surface,
              fontSize: '0.68rem',
              fontWeight: 'bold',
              boxShadow: preset.effects?.buttonShadow || 'none',
              fontFamily: bodyFont
            }}
          >
            Action
          </div>
        </div>

        {/* Swatches Bar */}
        <div style={{ display: 'flex', gap: '3px', padding: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: btnRadius }}>
          {[preset.colors.primaryDark, preset.colors.primaryContainer, preset.colors.primary, preset.colors.accent, preset.colors.action, preset.colors.secondary, preset.colors.surface].map((c, i) => (
            <div key={i} style={{ flex: 1, height: '14px', borderRadius: '3px', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({
  onOpenColorPicker,
  onOpenThemeBuilder
}) => {
  const { theme, setTheme, customPresets, saveCustomPreset, deleteCustomPreset } = useQuizStore();
  const [activeCategory, setActiveCategory] = useState<'all' | 'custom' | ThemeCategory>('all');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [detailPresetModal, setDetailPresetModal] = useState<PresetTheme | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const isCurrentTheme = (preset: PresetTheme) => {
    return (
      theme.primary === preset.colors.primary &&
      theme.accent === preset.colors.accent &&
      theme.primaryDark === preset.colors.primaryDark
    );
  };

  const handleExportCurrentTheme = () => {
    const activePreset = Object.values(PRESET_THEMES).find(isCurrentTheme) || {
      id: `theme_${Date.now()}`,
      name: 'Active Theme',
      description: 'Exported InQUIZitive Theme',
      category: 'custom' as ThemeCategory,
      colors: theme,
      typography: { headingFont: '"League Spartan", sans-serif', bodyFont: '"League Spartan", sans-serif' },
      geometry: { radiusSm: '6px', radiusMd: '12px', radiusLg: '20px', borderWidth: '2px' },
      effects: { cardShadow: '0 8px 30px rgba(0,0,0,0.12)', buttonShadow: '0 4px 15px rgba(0,0,0,0.15)', bgTexture: 'none', textShadow: 'none', backdropBlur: 'none' },
      animation: { transitionSpeed: '0.2s ease-in-out', hoverTransform: 'translateY(-2px)', activeTransform: 'translateY(0) scale(0.98)' }
    };

    exportThemeToJson(activePreset);
  };

  const handleImportThemeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const imported = importThemeFromJson(content);
      registerPresetTheme(imported);
      saveCustomPreset(imported);
      setTheme(imported.colors);
      alert(`Successfully imported theme: ${imported.name}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import theme JSON file');
    }
  };

  const handleSaveCurrentAsCustom = () => {
    const name = prompt("Enter a name for your custom theme preset:", "My Custom Theme");
    if (name && name.trim()) {
      const newPreset: PresetTheme = {
        id: `custom_${Date.now()}`,
        name: name.trim(),
        description: 'User saved custom theme preset',
        category: 'custom',
        colors: { ...theme },
        typography: { headingFont: '"League Spartan", sans-serif', bodyFont: '"League Spartan", sans-serif' },
        geometry: { radiusSm: '6px', radiusMd: '12px', radiusLg: '20px', borderWidth: '2px' },
        effects: { cardShadow: '0 8px 30px rgba(0,0,0,0.12)', buttonShadow: '0 4px 15px rgba(0,0,0,0.15)', bgTexture: 'none', textShadow: 'none', backdropBlur: 'none' },
        animation: { transitionSpeed: '0.2s ease-in-out', hoverTransform: 'translateY(-2px)', activeTransform: 'translateY(0) scale(0.98)' }
      };
      saveCustomPreset(newPreset);
      setTheme(newPreset.colors);
    }
  };

  const presetList = Object.values(PRESET_THEMES);
  const filteredPresets = presetList.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const categoriesList = [
    { id: 'all', label: `All Presets (${presetList.length})` },
    { id: 'custom', label: `Custom Slots (${customPresets.length})` },
    { id: 'signature', label: 'Signature' },
    { id: 'radiant', label: 'Radiant Light' },
    { id: 'onyx', label: 'Stealth & Onyx' },
    { id: 'emerald', label: 'Emerald & Earth' },
    { id: 'sapphire', label: 'Sapphire & Ocean' },
    { id: 'synthwave', label: 'Cyber & Synthwave' },
    { id: 'popCulture', label: 'Pop Culture & Gaming' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '1.4rem' }}>Theme & Visual Design Customization</h3>
          <p style={{ color: 'var(--color-surface)', opacity: 0.8, fontSize: '0.95rem', marginTop: '4px' }}>
            Choose from 40+ curated visual presets with custom card flair, create RGB color palettes, or launch the Custom Theme Studio.
          </p>
        </div>

        {/* Clean Hero Action Group */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <button
            onClick={onOpenThemeBuilder}
            className="action-btn"
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-accent)',
              color: 'var(--color-primary-dark)',
              fontWeight: 'bold',
              minHeight: '44px',
              boxShadow: 'none',
              textShadow: 'none'
            }}
          >
            <Sparkles size={18} /> Create & Edit Theme Studio
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="action-btn secondary"
              style={{
                padding: '10px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
                boxShadow: 'none',
                textShadow: 'none'
              }}
            >
              Quick Actions <ChevronDown size={16} />
            </button>

            {showToolsMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  background: 'rgba(20, 25, 35, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  backdropFilter: 'blur(12px)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '220px',
                  zIndex: 100
                }}
              >
                <button
                  onClick={() => {
                    onOpenColorPicker();
                    setShowToolsMenu(false);
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Palette size={16} /> RGB Color Picker
                </button>
                <button
                  onClick={() => {
                    handleSaveCurrentAsCustom();
                    setShowToolsMenu(false);
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Plus size={16} /> Save Active Palette
                </button>
                <button
                  onClick={() => {
                    handleExportCurrentTheme();
                    setShowToolsMenu(false);
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Download size={16} /> Export Theme JSON
                </button>
                <input type="file" ref={importInputRef} onChange={handleImportThemeFile} accept=".json" style={{ display: 'none' }} />
                <button
                  onClick={() => {
                    importInputRef.current?.click();
                    setShowToolsMenu(false);
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <UploadCloud size={16} /> Import Theme JSON
                </button>
                <button
                  onClick={() => {
                    setTheme(PRESET_THEMES.classicTheme.colors);
                    setShowToolsMenu(false);
                  }}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <RotateCcw size={16} /> Reset Default Theme
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeCategory === cat.id ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
              background: activeCategory === cat.id ? 'var(--color-primary-container)' : 'rgba(255,255,255,0.04)',
              color: activeCategory === cat.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
              boxShadow: 'none',
              textShadow: 'none'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* User Custom Presets Section */}
      {activeCategory === 'custom' && (
        <div>
          {customPresets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>No custom presets saved yet. Click "Save Active Theme" to store custom palette slots!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {customPresets.map((preset) => (
                <div
                  key={preset.id}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: isCurrentTheme(preset) ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--color-surface)', fontSize: '1rem' }}>{preset.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Custom Preset</span>
                    </div>
                    <button
                      onClick={() => deleteCustomPreset(preset.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px' }}
                      title="Delete Preset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                    {[preset.colors.primaryDark, preset.colors.primary, preset.colors.accent, preset.colors.surface].map((c, i) => (
                      <div key={i} style={{ flex: 1, background: c }} />
                    ))}
                  </div>

                  <button
                    onClick={() => setTheme(preset.colors)}
                    className="action-btn secondary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    {isCurrentTheme(preset) ? 'Applied Theme' : 'Apply Theme'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preset Themes Grid with Responsive Layout Clamping & Staggered Kinetic Animations */}
      {activeCategory !== 'custom' && (
        <div
          key={activeCategory}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredPresets.map((preset, idx) => (
            <div
              key={preset.id}
              className="animate-stagger-item"
              style={{ animationDelay: `${Math.min(idx * 0.035, 0.35)}s` }}
            >
              <ThemeCard
                preset={preset}
                isSelected={isCurrentTheme(preset)}
                onSelect={() => setTheme(preset.colors)}
                onOpenDetails={(p) => setDetailPresetModal(p)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Cohesive Theme Details Modal */}
      <ThemeDetailsModal
        preset={detailPresetModal}
        onClose={() => setDetailPresetModal(null)}
        onSelectTheme={(p) => setTheme(p.colors)}
      />
    </div>
  );
};
