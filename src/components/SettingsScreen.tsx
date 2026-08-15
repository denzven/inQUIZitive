import React, { useRef, useState } from 'react';
import { useQuizStore, PRESET_THEMES } from '../store/useQuizStore';
import { fetchExcelData, exportProgressToExcel, auditExcelData, type AuditResult } from '../utils/excelParser';
import { isNoShuffle } from '../utils/random';
import { UploadCloud, RotateCcw, RefreshCw, FileSpreadsheet, Download, Sliders, Palette, Shuffle, Edit3, Volume2, VolumeX, Bell, AlertOctagon, CheckCircle2, XCircle, Clock, Play, Square, Sparkles, MousePointerClick, Music, RotateCw } from 'lucide-react';
import trialSheetUrl from '../assets/trial_iQz_sheet.xlsx?url';
import { ScreenLayout } from './ScreenLayout';
import { SpreadsheetAuditModal } from './SpreadsheetAuditModal';
import { QuestionBankEditor } from './QuestionBankEditor';
import { CustomColorPickerModal } from './CustomColorPickerModal';
import { useAudioStore, type SfxKey } from '../store/useAudioStore';
import { playTickTock, playTileChime, playBuzzerLockout, playCorrectFanfare, playWrongBuzz, playButtonClick, playBubblePopSequence, playWheelTick, stopWheelTick } from '../utils/soundEffects';
import { startBgmForKey, stopBgm, isBgmPlaying } from '../utils/bgmSynthesizer';
import { playCustomSoundbite, stopCustomSoundbite } from '../utils/customAudioPlayer';

/**
 * SettingsScreen Component.
 * Provides controls for dataset management (custom Excel uploads, progress export/backup, sample template downloads),
 * question status reset, event subtitle configuration, random seed adjustment, real-time color theme palette picking,
 * spreadsheet pre-flight audits, and password-protected in-app question editing.
 */
export const SettingsScreen: React.FC = () => {
  const { 
    setGameState, 
    seed, 
    setSeed, 
    theme, 
    setThemeColor, 
    setTheme,
    resetTheme,
    questions, 
    loadQuestions, 
    resetAllQuestionsUsed 
  } = useQuizStore();
  
  const { volume, isMuted, setVolume, toggleMute, disabledSfx, toggleSfxDisabled, customSoundbites, setCustomSoundbite } = useAudioStore();
  const [playingPreviewKey, setPlayingPreviewKey] = useState<SfxKey | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  const sfxList: Array<{
    key: SfxKey;
    label: string;
    desc: string;
    icon: React.ReactNode;
    durationMs: number;
    play: (ignoreDisabled: boolean) => void;
    stop: () => void;
  }> = [
    {
      key: 'bgm_menu',
      label: 'Main Menu Screen BGM',
      desc: 'Upbeat game show lobby theme (C-Major, 115 BPM)',
      icon: <Music size={20} color="var(--yellow)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_menu', ignore, true) || startBgmForKey('bgm_menu', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_menu', true); stopBgm(true); },
    },
    {
      key: 'bgm_rounds',
      label: 'Rounds Selection Screen BGM',
      desc: 'Exciting round selector theme (E-Major, 110 BPM)',
      icon: <Sparkles size={20} color="var(--light-orange)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_rounds', ignore, true) || startBgmForKey('bgm_rounds', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_rounds', true); stopBgm(true); },
    },
    {
      key: 'bgm_rapid_fire',
      label: 'Rapid Fire Round BGM',
      desc: 'High-energy tension speed theme (D-Minor, 130 BPM)',
      icon: <Clock size={20} color="var(--teal)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_rapid_fire', ignore, true) || startBgmForKey('bgm_rapid_fire', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_rapid_fire', true); stopBgm(true); },
    },
    {
      key: 'bgm_spin_wheel',
      label: 'Spin Wheel Round BGM',
      desc: 'Suspenseful slot machine wheel theme (G-Major, 105 BPM)',
      icon: <RotateCw size={20} color="var(--light-orange)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_spin_wheel', ignore, true) || startBgmForKey('bgm_spin_wheel', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_spin_wheel', true); stopBgm(true); },
    },
    {
      key: 'bgm_tictactoe',
      label: 'Tic Tac Toe Round BGM',
      desc: 'Strategic synth-pop grid theme (F-Major, 100 BPM)',
      icon: <Sliders size={20} color="var(--yellow)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_tictactoe', ignore, true) || startBgmForKey('bgm_tictactoe', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_tictactoe', true); stopBgm(true); },
    },
    {
      key: 'bgm_buzzer',
      label: 'Buzzer Round BGM',
      desc: 'High-tension lock-in pulse theme (E-Minor, 125 BPM)',
      icon: <AlertOctagon size={20} color="var(--wrong-red)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_buzzer', ignore, true) || startBgmForKey('bgm_buzzer', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_buzzer', true); stopBgm(true); },
    },
    {
      key: 'bgm_leaderboard',
      label: 'Leaderboard & Winner Podium BGM',
      desc: 'Triumphant fanfare winner theme (A-Major, 120 BPM)',
      icon: <Sparkles size={20} color="var(--yellow)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_leaderboard', ignore, true) || startBgmForKey('bgm_leaderboard', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_leaderboard', true); stopBgm(true); },
    },
    {
      key: 'bgm_rules',
      label: 'Rules Screen BGM',
      desc: 'Relaxed informative lounge theme (Bb-Major, 95 BPM)',
      icon: <FileSpreadsheet size={20} color="var(--teal)" />,
      durationMs: Infinity,
      play: (ignore) => playCustomSoundbite('bgm_rules', ignore, true) || startBgmForKey('bgm_rules', ignore, true),
      stop: () => { stopCustomSoundbite('bgm_rules', true); stopBgm(true); },
    },
    {
      key: 'buttonClick',
      label: 'UI Button Click',
      desc: 'Click tone when clicking buttons or controls',
      icon: <MousePointerClick size={20} color="var(--white)" />,
      durationMs: 250,
      play: (ignore) => playButtonClick(ignore),
      stop: () => {},
    },
    {
      key: 'tickTock',
      label: 'Countdown Tick-Tock',
      desc: 'Rapid Fire 60s timer woodblock tick-tock audio',
      icon: <Clock size={20} color="var(--yellow)" />,
      durationMs: 200,
      play: (ignore) => playTickTock(false, false, ignore),
      stop: () => {},
    },
    {
      key: 'tileChime',
      label: 'Jeopardy Tile Chime',
      desc: 'Sparkling glass chime played on tile click',
      icon: <Bell size={20} color="var(--teal)" />,
      durationMs: 500,
      play: (ignore) => playTileChime(2, ignore),
      stop: () => {},
    },
    {
      key: 'wrongBuzz',
      label: 'Wrong Answer Buzz',
      desc: 'Dissonant double-burst tone on wrong answer',
      icon: <XCircle size={20} color="var(--orange)" />,
      durationMs: 400,
      play: (ignore) => playWrongBuzz(ignore),
      stop: () => {},
    },
    {
      key: 'correctFanfare',
      label: 'Correct Fanfare',
      desc: 'Ascending C-major chord on correct answer',
      icon: <CheckCircle2 size={20} color="var(--correct-green)" />,
      durationMs: 1200,
      play: (ignore) => playCorrectFanfare(ignore),
      stop: () => {},
    },
    {
      key: 'buzzerLockout',
      label: 'Buzzer Lockout Buzz',
      desc: 'Game show lockout buzzer tone on buzz-in',
      icon: <AlertOctagon size={20} color="var(--wrong-red)" />,
      durationMs: 500,
      play: (ignore) => playBuzzerLockout(ignore),
      stop: () => {},
    },
    {
      key: 'bubblePop',
      label: 'Menu Circle Bubble Pops',
      desc: 'Water bubble pops when background circles appear',
      icon: <Sparkles size={20} color="var(--yellow)" />,
      durationMs: 600,
      play: (ignore) => playBubblePopSequence(ignore),
      stop: () => {},
    },
    {
      key: 'wheelTick',
      label: 'Spin Wheel Mechanical Ticks',
      desc: 'Continuous 5.5s mechanical reel notch ticks synced with category wheel spin',
      icon: <RotateCw size={20} color="var(--teal)" />,
      durationMs: 5500,
      play: (ignore) => playWheelTick(ignore),
      stop: () => stopWheelTick(),
    },
  ];

  /** Toggles preview playback dynamically based on exact audio duration */
  const handlePreviewToggle = (item: (typeof sfxList)[0]) => {
    const isCurrentlyPlaying = item.key.startsWith('bgm')
      ? playingPreviewKey === item.key || (item.key === 'bgm_menu' && isBgmPlaying())
      : playingPreviewKey === item.key;

    // If currently playing THIS item, stop it immediately!
    if (isCurrentlyPlaying) {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      item.stop();
      setPlayingPreviewKey(null);
      return;
    }

    // Stop any other currently running audio previews
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    stopBgm(true);
    stopWheelTick();

    // Start playing new preview
    item.play(true);
    setPlayingPreviewKey(item.key);

    // If duration is finite, reset button state after exact audio duration
    if (Number.isFinite(item.durationMs)) {
      previewTimerRef.current = window.setTimeout(() => {
        setPlayingPreviewKey(prev => (prev === item.key ? null : prev));
        previewTimerRef.current = null;
      }, item.durationMs);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Pre-flight audit state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Question Editor state
  const [showQuestionEditor, setShowQuestionEditor] = useState<boolean>(false);

  /** Generates a new random 8-digit seed number */
  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(10000000 + Math.random() * 90000000).toString();
    setSeed(newSeed);
    setMsg(`Generated new seed: ${newSeed}`);
  };

  const totalQuestions = questions.length;
  const usedQuestions = questions.filter(q => q.used).length;
  const unusedQuestions = totalQuestions - usedQuestions;

  /** Summarizes questions count per round code */
  const roundCounts = questions.reduce((acc, q) => {
    const code = q.roundCode || 'Other';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  /**
   * Runs pre-flight audit scan on uploaded Excel file and triggers Audit Modal.
   * 
   * @param file - The raw .xlsx / .xls File instance.
   */
  const processFile = async (file: File) => {
    try {
      setMsg('Auditing spreadsheet...');
      const result = await auditExcelData(file, seed);
      
      if (result.cleanQuestions.length === 0) {
        throw new Error("No valid questions found in workbook. Check Excel format.");
      }

      setAuditResult(result);
      setShowAuditModal(true);
      setMsg('');
    } catch (err: any) {
      setMsg(err.message || 'Failed to parse Excel file.');
      console.error(err);
    }
  };

  /** Reloads the bundled default trial questions dataset into state */
  const handleReloadDefault = async () => {
    try {
      setMsg('Reloading default questions...');
      const defaultQs = await fetchExcelData(trialSheetUrl, seed);
      loadQuestions(defaultQs);
      setMsg(`Reloaded default dataset (${defaultQs.length} questions)!`);
    } catch (err: any) {
      setMsg("Failed to reload default dataset.");
      console.error(err);
    }
  };

  /** Downloads sample template .xlsx file for offline editing */
  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = trialSheetUrl;
    link.download = 'sample_inQUIZitive_sheet.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg('Sample Excel template downloaded!');
  };

  /** Exports current question used state and team scores to Excel backup file */
  const handleExportProgress = () => {
    const state = useQuizStore.getState();
    exportProgressToExcel(state.questions, state.teams);
    setMsg('Progress exported to Excel!');
  };

  /** Resets used status for all loaded questions */
  const handleResetUsedStatus = () => {
    resetAllQuestionsUsed();
    setMsg('Reset all question used statuses!');
  };

  /** File input change event handler */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  /** Drag over event handler for drop zone styling */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /** Drag leave handler */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /** Drop event handler for uploading drag-and-dropped spreadsheet files */
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

  const [activePickerToken, setActivePickerToken] = useState<{ label: string; key: keyof typeof theme } | null>(null);

  /** Color picker circular button component triggering Custom Color Picker Modal */
  const ColorPickerDot = ({ label, colorKey }: { label: string, colorKey: keyof typeof theme }) => (
    <div title={`Click to customize ${label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <button 
        type="button"
        onClick={() => setActivePickerToken({ label, key: colorKey })}
        style={{ 
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          maxWidth: '36px',
          maxHeight: '36px',
          padding: 0,
          margin: 0,
          borderRadius: '50%',
          backgroundColor: theme[colorKey],
          border: '3px solid var(--white)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxSizing: 'border-box',
          display: 'inline-block',
          flexShrink: 0,
          outline: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
      <span style={{ fontSize: '0.75rem', color: 'var(--white)', fontWeight: 'bold', textAlign: 'center' }}>{label}</span>
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
        <h1 className="title" style={{ marginTop: 0, fontSize: 'clamp(2.2rem, min(6vw, 5vh), 4.2rem)', marginBottom: '15px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Random Seed / Safeword</label>
                  {isNoShuffle(seed) && (
                    <span className="badge badge-yellow" style={{ fontSize: '0.75rem' }}>
                      NOSHUFFLE Mode Active
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'stretch', 
                  width: '100%', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  border: '2px solid var(--teal)',
                  backgroundColor: 'var(--white)',
                  boxSizing: 'border-box'
                }}>
                  <input 
                    type="text" 
                    value={seed} 
                    onChange={e => setSeed(e.target.value)}
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      outline: 'none', 
                      padding: '10px 14px', 
                      fontSize: '1rem', 
                      backgroundColor: 'transparent',
                      color: 'var(--dark-green)',
                      fontFamily: 'inherit',
                      fontWeight: 'bold',
                      minWidth: 0
                    }}
                    placeholder="e.g., 12342026 or NOSHUFFLE"
                  />
                  <button 
                    type="button"
                    onClick={handleRandomizeSeed}
                    title="Generate New Random Seed"
                    style={{ 
                      padding: '0 16px',
                      backgroundColor: 'var(--yellow)', 
                      color: 'var(--dark-green)',
                      border: 'none',
                      borderLeft: '2px solid var(--teal)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--light-orange)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--yellow)'}
                  >
                    <Shuffle size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>





            {/* Presenter Audio & Synthesized SFX Test Bench Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--yellow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Volume2 size={24} />
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Presenter Master Audio & SFX</h2>
                </div>
                <button
                  type="button"
                  onClick={toggleMute}
                  style={{
                    backgroundColor: isMuted ? 'var(--wrong-red)' : 'var(--teal)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
              </div>

              {/* Master Volume Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
                  <span>Master SFX Volume</span>
                  <span style={{ color: isMuted ? 'var(--orange)' : 'var(--yellow)', fontFamily: 'monospace' }}>
                    {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--yellow)', cursor: 'pointer', width: '100%' }}
                />
              </div>

              {/* Per-SFX Preview & Individual Enable/Disable Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--yellow)' }}>
                  Individual Sound Effect Controls ({sfxList.filter(item => !disabledSfx[item.key]).length}/{sfxList.length} Enabled):
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sfxList.map((item) => {
                    const isDisabled = !!disabledSfx[item.key];
                    const isCurrentlyPlaying = item.key === 'bgm' ? isBgmPlaying() : playingPreviewKey === item.key;
                    const customMp3Url = customSoundbites[item.key];

                    return (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          border: `1.5px solid ${isDisabled ? 'rgba(255,255,255,0.1)' : customMp3Url ? 'var(--yellow)' : 'var(--teal)'}`,
                          borderRadius: '12px',
                          padding: '10px 14px',
                          gap: '12px',
                          opacity: isDisabled ? 0.75 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isDisabled ? 'rgba(255,255,255,0.6)' : 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                              {customMp3Url && (
                                <span style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', fontSize: '0.68rem', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>
                                  CUSTOM MP3
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--yellow)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.desc}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {/* Hidden File Input for Custom MP3 Soundbite */}
                          <input
                            type="file"
                            accept="audio/*"
                            id={`mp3-upload-${item.key}`}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  if (evt.target?.result) {
                                    setCustomSoundbite(item.key, evt.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                          {/* Upload MP3 Custom Soundbite Button */}
                          <label
                            htmlFor={`mp3-upload-${item.key}`}
                            title={`Upload Custom MP3 for ${item.label}`}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              color: 'var(--white)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 'bold'
                            }}
                          >
                            <UploadCloud size={14} color="var(--yellow)" />
                            MP3
                          </label>

                          {/* Reset Custom MP3 to Synthesizer Default */}
                          {customMp3Url && (
                            <button
                              type="button"
                              onClick={() => setCustomSoundbite(item.key, null)}
                              title="Reset back to built-in synthesized Web Audio default"
                              style={{
                                backgroundColor: 'transparent',
                                color: 'var(--orange)',
                                border: '1px solid var(--orange)',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          {/* Preview Play / Stop Button */}
                          <button
                            type="button"
                            onClick={() => handlePreviewToggle(item)}
                            title={isCurrentlyPlaying ? `Stop ${item.label}` : `Preview ${item.label}`}
                            style={{
                              backgroundColor: isCurrentlyPlaying ? 'var(--wrong-red)' : 'var(--dark-green)',
                              color: 'var(--white)',
                              border: `1px solid ${isCurrentlyPlaying ? 'var(--orange)' : 'var(--teal)'}`,
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 'bold',
                              minWidth: '78px',
                              justifyContent: 'center'
                            }}
                          >
                            {isCurrentlyPlaying ? (
                              <>
                                <Square size={14} fill="var(--white)" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play size={14} fill="var(--white)" />
                                Preview
                              </>
                            )}
                          </button>

                          {/* Enable / Disable Toggle Switch Button */}
                          <button
                            type="button"
                            onClick={() => toggleSfxDisabled(item.key)}
                            title={isDisabled ? `Enable ${item.label}` : `Disable ${item.label}`}
                            style={{
                              backgroundColor: isDisabled ? 'rgba(229, 56, 59, 0.25)' : 'var(--correct-green)',
                              color: isDisabled ? 'var(--wrong-red)' : 'var(--dark-green)',
                              border: `1.5px solid ${isDisabled ? 'var(--wrong-red)' : 'var(--correct-green)'}`,
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '900',
                              letterSpacing: '0.5px',
                              minWidth: '85px',
                              textAlign: 'center'
                            }}
                          >
                            {isDisabled ? 'OFF' : 'ON'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Theme Palette Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--yellow)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Palette size={24} />
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Semantic Theme Palette Editor</h2>
                </div>
                <button 
                  onClick={resetTheme}
                  title="Reset Theme Palette to Default"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--dark-teal)',
                    color: 'var(--yellow)',
                    borderRadius: '8px',
                    border: '1px solid var(--yellow)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              {/* Color Picker Swatches Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', padding: '10px 0' }}>
                <ColorPickerDot label="Canvas (Dark)" colorKey="primaryDark" />
                <ColorPickerDot label="Primary Teal" colorKey="primary" />
                <ColorPickerDot label="Container Teal" colorKey="primaryContainer" />
                <ColorPickerDot label="Accent Gold" colorKey="accent" />
                <ColorPickerDot label="Secondary Soft" colorKey="secondary" />
                <ColorPickerDot label="Action Coral" colorKey="action" />
                <ColorPickerDot label="Surface Text" colorKey="surface" />
                <ColorPickerDot label="Success Green" colorKey="success" />
                <ColorPickerDot label="Danger Red" colorKey="danger" />
              </div>

              {/* Preset Palettes */}
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--light-orange)', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                  Professional Theme Presets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.values(PRESET_THEMES).map((preset) => (
                    <button 
                      key={preset.id}
                      onClick={() => setTheme(preset.colors)}
                      title={preset.description}
                      style={{ 
                        padding: '8px 10px', 
                        fontSize: '0.8rem', 
                        borderRadius: '10px', 
                        backgroundColor: preset.colors.primaryDark, 
                        color: preset.colors.accent, 
                        border: `2px solid ${preset.colors.primary}`, 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{preset.name}</span>
                      <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.colors.primaryDark, border: '1px solid #fff' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.colors.primary, border: '1px solid #fff' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.colors.accent, border: '1px solid #fff' }} />
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.colors.action, border: '1px solid #fff' }} />
                      </div>
                    </button>
                  ))}
                </div>
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

              {/* Question Bank Editor Toggle Button */}
              <button 
                onClick={() => setShowQuestionEditor(!showQuestionEditor)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                <Edit3 size={20} />
                {showQuestionEditor ? 'Close Question Bank Editor' : 'Open Question Bank Editor (Password Protected)'}
              </button>

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

              {/* Download Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={handleDownloadSample} 
                  style={{ 
                    flex: 1,
                    fontSize: '0.9rem', 
                    padding: '8px 12px', 
                    backgroundColor: 'var(--yellow)',
                    color: 'var(--dark-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <FileSpreadsheet size={16} />
                  Template
                </button>
                <button 
                  onClick={handleExportProgress} 
                  style={{ 
                    flex: 1,
                    fontSize: '0.9rem', 
                    padding: '8px 12px', 
                    backgroundColor: 'var(--correct-green)',
                    color: 'var(--dark-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Download size={16} />
                  Backup Progress
                </button>
              </div>
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
                  Upload Custom Excel File (Pre-Flight Audit)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--white)', opacity: 0.8 }}>
                  Drag & Drop or click to audit & browse (.xlsx)
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

        {/* In-App Question Bank Editor Section */}
        {showQuestionEditor && (
          <div style={{ width: '100%', marginTop: '30px' }}>
            <QuestionBankEditor onClose={() => setShowQuestionEditor(false)} />
          </div>
        )}

        {/* Pre-Flight Audit Modal */}
        <SpreadsheetAuditModal 
          isOpen={showAuditModal}
          auditResult={auditResult}
          onImportAutoFix={() => {
            if (auditResult) {
              loadQuestions(auditResult.cleanQuestions);
              setMsg(`Successfully imported & auto-fixed ${auditResult.cleanQuestions.length} questions!`);
            }
            setShowAuditModal(false);
          }}
          onImportAndEdit={() => {
            if (auditResult) {
              loadQuestions(auditResult.cleanQuestions);
              setMsg(`Loaded ${auditResult.cleanQuestions.length} questions. Opening Editor...`);
            }
            setShowAuditModal(false);
            setShowQuestionEditor(true);
          }}
          onCancel={() => {
            setShowAuditModal(false);
            setMsg('Excel import cancelled.');
          }}
        />
        {/* Custom Color Picker Modal */}
        <CustomColorPickerModal 
          isOpen={!!activePickerToken}
          tokenName={activePickerToken?.label || ''}
          colorKey={activePickerToken?.key || ''}
          currentColor={activePickerToken ? theme[activePickerToken.key] : '#000000'}
          onSave={(key, newHex) => setThemeColor(key as any, newHex)}
          onClose={() => setActivePickerToken(null)}
        />

      </div>
    </ScreenLayout>
  );
};


