import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X } from 'lucide-react';

interface CustomColorPickerModalProps {
  isOpen: boolean;
  tokenName: string;
  colorKey: string;
  currentColor: string;
  onSave: (colorKey: string, newHex: string) => void;
  onClose: () => void;
}

const PALETTE_GROUPS = [
  {
    name: '🌲 Arise Classic',
    colors: ['#1f3742', '#144d46', '#2a9d8f', '#e9c46a', '#e76f51', '#ffffff', '#8ab4f8']
  },
  {
    name: '❄️ Nord Frost',
    colors: ['#242933', '#3b4252', '#81a1c1', '#ebcb8b', '#bf616a', '#e5e9f0', '#a3be8c']
  },
  {
    name: '💻 One Dark Pro',
    colors: ['#1e2227', '#282c34', '#528bff', '#e5c07b', '#e06c75', '#abb2bf', '#98c379']
  },
  {
    name: '🧛 Dracula Dark',
    colors: ['#191a21', '#282a36', '#9a86fd', '#f1fa8c', '#ff7bc1', '#f8f8f2', '#50fa7b']
  },
  {
    name: '🐱 Catppuccin',
    colors: ['#11111b', '#1e1e2e', '#cba6f7', '#f9e2af', '#f38ba8', '#cdd6f4', '#a6e3a1']
  },
  {
    name: '⚡ Cyber Neon',
    colors: ['#090911', '#141424', '#02c39a', '#fce114', '#f50057', '#e0e0ff', '#7b2cbf']
  },
  {
    name: '👑 Midnight Gold',
    colors: ['#121217', '#1e1e26', '#d4af37', '#f5d061', '#9b2226', '#f5f5f5', '#8b7355']
  },
  {
    name: '🛠️ OLED Black',
    colors: ['#000000', '#1a1a1a', '#14f1d9', '#ffeb3b', '#ff4081', '#ffffff', '#b0bec5']
  }
];

export const CustomColorPickerModal: React.FC<CustomColorPickerModalProps> = ({
  isOpen,
  tokenName,
  colorKey,
  currentColor,
  onSave,
  onClose
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor, isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(selectedColor);

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-box animate-pop-in"
        style={{
          maxWidth: '540px',
          width: '92%',
          backgroundColor: 'var(--dark-green)',
          border: '3px solid var(--yellow)',
          borderRadius: '24px',
          padding: '28px',
          color: 'var(--white)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={24} color="var(--yellow)" />
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--yellow)' }}>
              Color Token Customizer
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--white)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', opacity: 0.9 }}>
          Editing <strong style={{ color: 'var(--yellow)' }}>{tokenName}</strong> token (Key: <code style={{ color: 'var(--light-orange)' }}>{colorKey}</code>)
        </p>

        {/* Live Color Preview & Inputs */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          backgroundColor: 'rgba(0,0,0,0.3)', 
          padding: '16px', 
          borderRadius: '16px', 
          marginBottom: '20px',
          border: '1px solid var(--teal)'
        }}>
          {/* Native Color Circle Input */}
          <label style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="color" 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            />
            <div style={{ 
              width: '64px', 
              height: '64px', 
              minWidth: '64px',
              minHeight: '64px',
              aspectRatio: '1 / 1',
              borderRadius: '50%', 
              backgroundColor: selectedColor,
              border: '4px solid var(--white)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }} 
            title="Click to open system color wheel"
            />
          </label>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--light-orange)', fontWeight: 'bold' }}>Hex Color Value:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                maxLength={7}
                placeholder="#2A9D8F"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${isValidHex ? 'var(--teal)' : 'var(--wrong-red)'}`,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: 'var(--white)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>
        </div>

        {/* Categorized Palette Rows Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--light-orange)', fontWeight: 'bold', marginBottom: '10px' }}>
            Curated Theme Palette Rows:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '210px', overflowY: 'auto', paddingRight: '4px' }}>
            {PALETTE_GROUPS.map((group, groupIdx) => (
              <div 
                key={groupIdx} 
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.25)', 
                  padding: '8px 12px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--yellow)', minWidth: '105px', whiteSpace: 'nowrap' }}>
                  {group.name}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
                  {group.colors.map((hex, colorIdx) => (
                    <button
                      key={colorIdx}
                      type="button"
                      onClick={() => setSelectedColor(hex)}
                      title={`${group.name}: ${hex}`}
                      style={{
                        width: '30px',
                        height: '30px',
                        minWidth: '30px',
                        minHeight: '30px',
                        maxWidth: '30px',
                        maxHeight: '30px',
                        padding: 0,
                        margin: 0,
                        borderRadius: '50%',
                        backgroundColor: hex,
                        border: selectedColor.toLowerCase() === hex.toLowerCase() ? '3px solid var(--yellow)' : '1px solid rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        boxShadow: selectedColor.toLowerCase() === hex.toLowerCase() ? '0 0 8px var(--yellow)' : '0 2px 4px rgba(0,0,0,0.3)',
                        transform: selectedColor.toLowerCase() === hex.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease, border 0.15s ease',
                        boxSizing: 'border-box',
                        flexShrink: 0,
                        display: 'inline-block',
                        outline: 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={onClose}
            className="menu-btn"
            style={{ 
              flex: 1, 
              padding: '12px', 
              fontSize: '1rem', 
              backgroundColor: 'var(--dark-teal)', 
              color: 'var(--white)' 
            }}
          >
            Cancel
          </button>
          <button 
            type="button"
            disabled={!isValidHex}
            onClick={() => {
              if (isValidHex) {
                onSave(colorKey, selectedColor);
                onClose();
              }
            }}
            className="menu-btn"
            style={{ 
              flex: 1, 
              padding: '12px', 
              fontSize: '1rem', 
              backgroundColor: isValidHex ? 'var(--orange)' : 'var(--dark-teal)', 
              color: 'var(--white)',
              opacity: isValidHex ? 1 : 0.5,
              cursor: isValidHex ? 'pointer' : 'not-allowed'
            }}
          >
            Apply Color
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
