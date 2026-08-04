import React, { useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { parseExcelData } from '../utils/excelParser';
import { Home, UploadCloud } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { setGameState, seed, setSeed, theme, setThemeColor, loadQuestions } = useQuizStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    try {
      setMsg('Parsing file...');
      const parsedQuestions = await parseExcelData(file);
      
      // Excel Verification
      if (!parsedQuestions || parsedQuestions.length === 0) {
        throw new Error("No questions found. Check Excel format.");
      }
      const q1 = parsedQuestions[0];
      if (!q1.question || !q1.answer) {
        throw new Error("Invalid format: Missing 'Questions' or 'Answer' columns.");
      }

      loadQuestions(parsedQuestions);
      setMsg(`Success: Loaded ${parsedQuestions.length} questions!`);
    } catch (err: any) {
      setMsg(err.message || 'Failed to parse Excel file.');
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.match(/\.(xls|xlsx)$/i)) {
        setMsg("Invalid file type. Please upload an Excel (.xlsx or .xls) file.");
        return;
      }
      processFile(file);
    }
  };

  const ColorPickerDot = ({ label, colorKey }: { label: string, colorKey: keyof typeof theme }) => (
    <div title={label} style={{ display: 'inline-block' }}>
      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input 
          type="color" 
          value={theme[colorKey]} 
          onChange={(e) => setThemeColor(colorKey, e.target.value)}
          style={{ opacity: 0, position: 'absolute', width: '0', height: '0' }}
        />
        <div style={{ 
          width: '40px', height: '40px', 
          backgroundColor: theme[colorKey],
          borderRadius: '50%',
          border: '3px solid var(--white)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }} 
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </label>
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
          position: 'absolute', top: '20px', left: '20px', 
          width: '60px', height: '60px', borderRadius: '15px', 
          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
          backgroundColor: 'var(--yellow)',
          border: 'none'
        }}
        aria-label="Home"
      >
        <Home size={30} color="var(--dark-green)" strokeWidth={3} />
      </button>

      <h1 className="title" style={{ marginTop: '20px', fontSize: 'clamp(2rem, 8vw, 4rem)' }}>SETTINGS</h1>

      <div className="settings-grid" style={{ marginTop: '20px' }}>
        
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
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `3px dashed ${isDragging ? 'var(--yellow)' : 'var(--teal)'}`,
              borderRadius: '15px',
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} color={isDragging ? 'var(--yellow)' : 'var(--white)'} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--white)' }}>
              Drag & Drop Excel File
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--white)', opacity: 0.8, marginTop: '5px' }}>
              or click to browse (.xlsx, .xls)
            </div>
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>

          {msg && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('error') ? 'var(--wrong-red)' : 'var(--correct-green)', 
              color: 'var(--white)',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {msg}
            </div>
          )}
        </div>

        {/* Section: Theme Palette (Minimalist) */}
        <div className="card settings-card" style={{ ...cardStyle, flex: '1 1 100%', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--yellow)', textAlign: 'center' }}>Theme Palette</h2>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8, margin: '0 0 20px 0' }}>Hover over colors to see their role, click to change.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            <ColorPickerDot label="Dark Green (Background)" colorKey="darkGreen" />
            <ColorPickerDot label="Teal (Cards & UI)" colorKey="teal" />
            <ColorPickerDot label="Dark Teal (Hover Effects)" colorKey="darkTeal" />
            <ColorPickerDot label="Yellow (Accents)" colorKey="yellow" />
            <ColorPickerDot label="Orange (Buttons)" colorKey="orange" />
            <ColorPickerDot label="White (Text)" colorKey="white" />
            <ColorPickerDot label="Correct Green" colorKey="correctGreen" />
            <ColorPickerDot label="Wrong Red" colorKey="wrongRed" />
          </div>
        </div>

      </div>
    </div>
  );
};
