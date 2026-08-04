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
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{label}</span>
      <input 
        type="color" 
        value={theme[colorKey]} 
        onChange={(e) => setThemeColor(colorKey, e.target.value)}
        style={{ width: '60px', height: '40px', cursor: 'pointer', border: `2px solid var(--white)`, borderRadius: '8px', background: 'none', padding: 0 }}
      />
    </div>
  );

  const inputStyle = { 
    padding: '12px', 
    fontSize: '1.2rem', 
    width: '100%', 
    boxSizing: 'border-box' as const, 
    borderRadius: '10px', 
    border: `2px solid var(--teal)`,
    backgroundColor: 'var(--white)',
    color: 'var(--dark-green)',
    fontFamily: 'inherit',
    fontWeight: 'bold'
  };

  const cardStyle = { 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: '15px',
    backgroundColor: 'var(--dark-teal)',
    border: `3px solid var(--teal)`
  };

  return (
    <div className="projector-container" style={{ padding: 'max(20px, 4vw)', overflowY: 'auto' }}>
      <button 
        onClick={() => setGameState('MENU')}
        style={{ 
          position: 'absolute', top: '50px', left: '50px', 
          width: '80px', height: '80px', borderRadius: '15px', 
          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
          backgroundColor: 'var(--yellow)',
          border: 'none'
        }}
        aria-label="Home"
      >
        <Home size={40} color="var(--dark-green)" strokeWidth={3} />
      </button>

      <h1 className="title" style={{ marginTop: 0 }}>SETTINGS</h1>

      <div className="settings-grid">
        
        {/* Section: Event Configuration */}
        <div className="card settings-card" style={cardStyle}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--yellow)', textAlign: 'center' }}>Event Setup</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 'bold' }}>Event Subtitle</label>
            <input 
              type="text" 
              value={useQuizStore(s => s.subtitle)} 
              onChange={e => useQuizStore.getState().setSubtitle(e.target.value)}
              style={inputStyle}
              placeholder="e.g., Annual Tech Quiz 2026"
            />
          </div>
        </div>

        {/* Section: Game Mechanics */}
        <div className="card settings-card" style={cardStyle}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--yellow)', textAlign: 'center' }}>Mechanics</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 'bold' }}>Random Seed</label>
            <input 
              type="number" 
              value={seed} 
              onChange={e => setSeed(Number(e.target.value))}
              style={inputStyle}
            />
            <p style={{ fontSize: '0.9rem', color: 'var(--white)', opacity: 0.8, marginTop: '10px' }}>
              Setting the same seed guarantees the same random question order across sessions.
            </p>
          </div>
        </div>

        {/* Section: Data Management */}
        <div className="card settings-card" style={cardStyle}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--yellow)', textAlign: 'center' }}>Data Management</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 'bold' }}>Import Questions</label>
            <label className="file-upload-label" style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              Upload Excel File
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </label>
            {msg && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: msg.includes('Failed') ? 'var(--wrong-red)' : 'var(--correct-green)', 
                color: 'var(--white)',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {msg}
              </div>
            )}
          </div>
        </div>

        {/* Section: Theme Palette */}
        <div className="card settings-card" style={{ ...cardStyle, flex: '1 1 100%', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--yellow)', textAlign: 'center' }}>Theme Palette</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
    </div>
  );
};
