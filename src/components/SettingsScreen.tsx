import React, { useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { parseExcelData } from '../utils/excelParser';
import { Home } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { setGameState, seed, setSeed, theme, setThemeColor, loadQuestions } = useQuizStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedQuestions = await parseExcelData(file);
      loadQuestions(parsedQuestions);
      setMsg('Loaded questions from file!');
    } catch (err) {
      setMsg('Failed to parse Excel file.');
      console.error(err);
    }
  };

  const ColorPickerRow = ({ label, colorKey }: { label: string, colorKey: keyof typeof theme }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <span>{label}</span>
      <input 
        type="color" 
        value={theme[colorKey]} 
        onChange={(e) => setThemeColor(colorKey, e.target.value)}
        style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', background: 'none' }}
      />
    </div>
  );

  return (
    <div className="projector-container" style={{ padding: 'max(20px, 4vw)', overflowY: 'auto' }}>
      <button 
        onClick={() => setGameState('MENU')}
        style={{ 
          position: 'absolute', top: '50px', left: '50px', 
          width: '80px', height: '80px', borderRadius: '15px', 
          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 
        }}
        aria-label="Home"
      >
        <Home size={40} color="var(--dark-green)" strokeWidth={3} />
      </button>

      <h1 className="title" style={{ marginTop: 0 }}>SETTINGS</h1>

      <div className="settings-grid">
        {/* Left Column: Data & Seed */}
        <div className="card settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Game Data</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Event Subtitle</label>
            <input 
              type="text" 
              value={useQuizStore(s => s.subtitle)} 
              onChange={e => useQuizStore.getState().setSubtitle(e.target.value)}
              style={{ padding: '10px', fontSize: '1.2rem', width: '100%', boxSizing: 'border-box', borderRadius: '10px', border: 'none', marginBottom: '10px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Random Seed</label>
            <input 
              type="number" 
              value={seed} 
              onChange={e => setSeed(Number(e.target.value))}
              style={{ padding: '10px', fontSize: '1.2rem', width: '100%', boxSizing: 'border-box', borderRadius: '10px', border: 'none' }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Custom Excel File</label>
            <label className="file-upload-label" style={{ display: 'block', textAlign: 'center' }}>
              Browse...
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </label>
            {msg && <p style={{ color: 'var(--yellow)', marginTop: '10px' }}>{msg}</p>}
          </div>
        </div>

        {/* Right Column: Theme */}
        <div className="card settings-card">
          <h2 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Theme Palette</h2>
          <ColorPickerRow label="Dark Green (BG)" colorKey="darkGreen" />
          <ColorPickerRow label="Teal (Cards)" colorKey="teal" />
          <ColorPickerRow label="Dark Teal (Hover)" colorKey="darkTeal" />
          <ColorPickerRow label="Yellow (Accent)" colorKey="yellow" />
          <ColorPickerRow label="Orange (Buttons)" colorKey="orange" />
          <ColorPickerRow label="White (Text)" colorKey="white" />
          <ColorPickerRow label="Correct Green" colorKey="correctGreen" />
          <ColorPickerRow label="Wrong Red" colorKey="wrongRed" />
        </div>
      </div>
    </div>
  );
};
