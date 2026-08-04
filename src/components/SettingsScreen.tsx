import React, { useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { parseExcelData, fetchExcelData } from '../utils/excelParser';
import { UploadCloud, RotateCcw, RefreshCw, FileSpreadsheet, Download, Sliders, Palette } from 'lucide-react';
import trialSheetUrl from '../assets/trial_iQz_sheet.xlsx?url';
import { ScreenLayout } from './ScreenLayout';

export const SettingsScreen: React.FC = () => {
  const { 
    setGameState, 
    seed, 
    setSeed, 
    theme, 
    setThemeColor, 
    questions, 
    loadQuestions, 
    resetAllQuestionsUsed 
  } = useQuizStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const totalQuestions = questions.length;
  const usedQuestions = questions.filter(q => q.used).length;
  const unusedQuestions = totalQuestions - usedQuestions;

  // Round counts
  const roundCounts = questions.reduce((acc, q) => {
    const code = q.roundCode || 'Other';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processFile = async (file: File) => {
    try {
      setMsg('Parsing file...');
      const parsedQuestions = await parseExcelData(file);
      
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

  const handleReloadDefault = async () => {
    try {
      setMsg('Reloading default questions...');
      const defaultQs = await fetchExcelData(trialSheetUrl);
      loadQuestions(defaultQs);
      setMsg(`Reloaded default dataset (${defaultQs.length} questions)!`);
    } catch (err: any) {
      setMsg("Failed to reload default dataset.");
      console.error(err);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = trialSheetUrl;
    link.download = 'sample_inQUIZitive_sheet.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg('Sample Excel template downloaded!');
  };

  const handleResetUsedStatus = () => {
    resetAllQuestionsUsed();
    setMsg('Reset all question used statuses!');
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
        setMsg("Invalid file type. Upload .xlsx or .xls file.");
        return;
      }
      processFile(file);
    }
  };

  const ColorPickerDot = ({ label, colorKey }: { label: string, colorKey: keyof typeof theme }) => (
    <div title={label} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input 
          type="color" 
          value={theme[colorKey]} 
          onChange={(e) => setThemeColor(colorKey, e.target.value)}
          style={{ opacity: 0, position: 'absolute', width: '0', height: '0' }}
        />
        <div style={{ 
          width: '32px', height: '32px', 
          backgroundColor: theme[colorKey],
          borderRadius: '50%',
          border: '2px solid var(--white)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }} 
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </label>
      <span style={{ fontSize: '0.75rem', opacity: 0.8, maxWidth: '65px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label.split(' ')[0]}
      </span>
    </div>
  );

  const inputStyle = { 
    padding: '10px 14px', 
    fontSize: '1rem', 
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
    gap: '12px',
    backgroundColor: 'var(--dark-teal)',
    border: `2px solid var(--teal)`,
    padding: '20px',
    margin: 0,
    borderRadius: '20px'
  };

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      hideTitle={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: 'auto' }}>
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '15px' }}>
          SETTINGS
        </h1>

        {/* 2-COLUMN DESKTOP GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', 
          gap: '20px', 
          width: '100%', 
          alignItems: 'start'
        }}>
          
          {/* LEFT COLUMN: Setup, Mechanics & Theme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Event & Mechanics Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yellow)' }}>
                <Sliders size={24} />
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Setup & Mechanics</h2>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.95rem', fontWeight: 'bold' }}>Event Subtitle</label>
                <input 
                  type="text" 
                  value={useQuizStore(s => s.subtitle)} 
                  onChange={e => useQuizStore.getState().setSubtitle(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., Annual Tech Quiz 2026"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.95rem', fontWeight: 'bold' }}>Random Seed</label>
                <input 
                  type="number" 
                  value={seed} 
                  onChange={e => setSeed(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Theme Palette Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yellow)' }}>
                <Palette size={24} />
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Theme Palette</h2>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-around', paddingTop: '5px' }}>
                <ColorPickerDot label="Background" colorKey="darkGreen" />
                <ColorPickerDot label="Teal" colorKey="teal" />
                <ColorPickerDot label="Dark Teal" colorKey="darkTeal" />
                <ColorPickerDot label="Yellow" colorKey="yellow" />
                <ColorPickerDot label="Orange" colorKey="orange" />
                <ColorPickerDot label="White" colorKey="white" />
                <ColorPickerDot label="Correct" colorKey="correctGreen" />
                <ColorPickerDot label="Wrong" colorKey="wrongRed" />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Dataset Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yellow)' }}>
                <FileSpreadsheet size={24} />
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Dataset Manager</h2>
              </div>

              {/* Status Counters */}
              <div style={{ 
                backgroundColor: 'rgba(0,0,0,0.25)', 
                padding: '12px 15px', 
                borderRadius: '12px', 
                border: '1px solid var(--teal)' 
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: 'var(--dark-green)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--light-orange)' }}>Total</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{totalQuestions}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--dark-green)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--correct-green)' }}>Available</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{unusedQuestions}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--dark-green)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--wrong-red)' }}>Used</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{usedQuestions}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Object.entries(roundCounts).map(([code, count]) => (
                    <span key={code} style={{ backgroundColor: 'var(--teal)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {code}: {count} Qs
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={handleResetUsedStatus} 
                  disabled={usedQuestions === 0}
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '8px 12px', 
                    backgroundColor: usedQuestions === 0 ? 'var(--dark-teal)' : 'var(--orange)',
                    opacity: usedQuestions === 0 ? 0.6 : 1,
                    cursor: usedQuestions === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <RotateCcw size={16} />
                  Reset Used
                </button>

                <button 
                  onClick={handleReloadDefault} 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '8px 12px', 
                    backgroundColor: 'var(--teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <RefreshCw size={16} />
                  Reload Default
                </button>
              </div>

              <button 
                onClick={handleDownloadSample} 
                style={{ 
                  fontSize: '0.9rem', 
                  padding: '8px 12px', 
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%'
                }}
              >
                <Download size={16} />
                Download Sample Template (.xlsx)
              </button>

              {/* Drag & Drop File Upload */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--yellow)' : 'var(--teal)'}`,
                  borderRadius: '12px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={28} color={isDragging ? 'var(--yellow)' : 'var(--white)'} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--white)' }}>
                  Upload Custom Excel File
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--white)', opacity: 0.8 }}>
                  Drag & Drop or click to browse (.xlsx)
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
                  padding: '8px', 
                  backgroundColor: msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('error') ? 'var(--wrong-red)' : 'var(--correct-green)', 
                  color: 'var(--white)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {msg}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ScreenLayout>
  );
};

