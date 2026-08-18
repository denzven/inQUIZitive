import React, { useRef, useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { PRESET_THEMES } from '../config/themes';
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
import { loadGoogleFont } from '../utils/fontLoader';

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
  const handleExportProgress = async () => {
    const state = useQuizStore.getState();
    await exportProgressToExcel(state.questions, state.teams);
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
                  border: `2px solid ${isNoShuffle(seed) ? 'var(--color-action)' : 'var(--color-primary)'}`,
                  backgroundColor: 'var(--color-primary-container)',
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
                      color: 'var(--color-surface)',
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
                      backgroundColor: 'var(--color-accent)', 
                      color: 'var(--color-primary-dark)',
                      border: 'none',
                      borderLeft: '2px solid var(--color-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
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

              {/* Color Swatch Dots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <ColorPickerDot label="Canvas Base" colorKey="primaryDark" />
                <ColorPickerDot label="Primary Fill" colorKey="primary" />
                <ColorPickerDot label="Card Container" colorKey="primaryContainer" />
                <ColorPickerDot label="Highlight Accent" colorKey="accent" />
                <ColorPickerDot label="Secondary Subtext" colorKey="secondary" />
                <ColorPickerDot label="Action Fill" colorKey="action" />
                <ColorPickerDot label="Surface Text" colorKey="surface" />
                <ColorPickerDot label="Success Feedback" colorKey="success" />
                <ColorPickerDot label="Danger Feedback" colorKey="danger" />
              </div>

              {/* Categorized Theme Presets with Live Font & Design Token Previews */}
              <div style={{ marginTop: '16px', borderTop: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-surface)', fontWeight: 800, marginBottom: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="var(--color-accent)" />
                  <span>Design System Theme Presets</span>
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    {
                      title: '✨ Signature Competition',
                      subtitle: 'Default quiz show stage aesthetic',
                      ids: ['ariseClassic']
                    },
                    {
                      title: '🎮 Pop Culture & Gaming',
                      subtitle: 'Superhero comics, voxel blocks, wizarding scrolls & Y2K plastic',
                      ids: ['arachnidHero', 'blockBuilder', 'wizardingScroll', 'y2kPlastic']
                    },
                    {
                      title: '♟️ Specialty & Strategy',
                      subtitle: 'Hazardous labs, watchmaker chronos, tabletop brass, grandmaster chess & night metropolis',
                      ids: ['neonCatalyst', 'titaniumChronograph', 'mysticArtificer', 'grandmasterChess', 'midnightMetropolis']
                    },
                    {
                      title: '💥 Quirky & Highly Stylized Themes',
                      subtitle: 'Custom fonts, halftone textures & retro geometry',
                      ids: ['popArtComic', 'retroArcade', 'bubblegumPop', 'chalkboardScholar', 'wildWestWanted']
                    },
                    {
                      title: '☀️ Radiant Light Modes',
                      subtitle: 'High contrast light canvas presets',
                      ids: ['alabasterMinimal', 'sunshineRadiance', 'sakuraBlossom', 'mintBreeze', 'ivoryAndRose', 'matchaLatte']
                    },
                    {
                      title: '🔮 Synthwave, Cyber & Digital Voids',
                      subtitle: 'Matrix greens, neon outrun & cyber grids',
                      ids: ['cyberTerminal', 'vaporwaveHorizon', 'cosmicNebula', 'neonSunset', 'tacticalLazer', 'tokyoPastel']
                    },
                    {
                      title: '🌲 Nature, Earth & Dark Metals',
                      subtitle: 'Deep botanicals, OLED black & ocean trenches',
                      ids: ['emeraldPrestige', 'autumnHarvest', 'obsidianRuby', 'midnightGold', 'monochromeOnyx', 'analogResin', 'nordicDusk', 'royalSapphire', 'abyssalTrench', 'coralReef']
                    }
                  ].map((category, catIdx) => (
                    <div key={catIdx}>
                      <div style={{ marginBottom: '8px', borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', paddingBottom: '4px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                          {category.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-secondary)' }}>
                          {category.subtitle}
                        </div>
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', 
                        gap: '10px' 
                      }}>
                        {category.ids.map(id => {
                          const preset = PRESET_THEMES[id];
                          if (!preset) return null;

                          // Load Google Fonts into DOM for live typography preview in settings cards
                          if (preset.typography?.headingFont) loadGoogleFont(preset.typography.headingFont);
                          if (preset.typography?.bodyFont) loadGoogleFont(preset.typography.bodyFont);

                          const isSelected = (theme.primaryDark || theme.darkGreen) === preset.colors.primaryDark &&
                                             (theme.primary || theme.teal) === preset.colors.primary;

                          return (
                            <button 
                              key={preset.id}
                              className="preset-theme-card"
                              onClick={() => setTheme(preset.colors)}
                              title={preset.description}
                              style={{ 
                                padding: '10px 12px', 
                                fontSize: '0.82rem', 
                                borderRadius: preset.geometry?.radiusSm || '12px', 
                                backgroundColor: preset.colors.primaryDark, 
                                color: preset.colors.surface, 
                                border: isSelected 
                                  ? '3px solid var(--color-accent)' 
                                  : `${preset.geometry?.borderWidth || '2px'} solid color-mix(in srgb, ${preset.colors.primary} 60%, transparent)`, 
                                cursor: 'pointer', 
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                boxShadow: isSelected 
                                  ? '0 0 14px color-mix(in srgb, var(--color-accent) 70%, transparent)' 
                                  : (preset.effects?.buttonShadow || '0 3px 8px rgba(0,0,0,0.3)'),
                                transform: isSelected ? 'scale(1.02)' : 'none',
                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                position: 'relative',
                                backgroundImage: preset.effects?.bgTexture !== 'none' ? preset.effects?.bgTexture : undefined
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                                <span style={{ 
                                  fontSize: '0.88rem', 
                                  fontWeight: 900, 
                                  fontFamily: preset.typography?.headingFont || 'inherit', 
                                  color: isSelected ? 'var(--color-accent)' : preset.colors.surface,
                                  lineHeight: 1.15
                                }}>
                                  {preset.name}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                                )}
                              </div>

                              <span style={{ 
                                fontSize: '0.72rem', 
                                fontFamily: preset.typography?.bodyFont || 'inherit', 
                                color: `color-mix(in srgb, ${preset.colors.surface} 80%, transparent)`, 
                                lineHeight: 1.25, 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                              }}>
                                {preset.description}
                              </span>

                              {/* Color Swatch Strip */}
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                                <span title={`Canvas: ${preset.colors.primaryDark}`} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.colors.primaryDark, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                                <span title={`Container: ${preset.colors.primaryContainer}`} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.colors.primaryContainer, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                                <span title={`Primary: ${preset.colors.primary}`} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.colors.primary, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                                <span title={`Accent: ${preset.colors.accent}`} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.colors.accent, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                                <span title={`Action: ${preset.colors.action}`} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.colors.action, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Dataset Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-surface)' }}>
                <FileSpreadsheet size={24} color="var(--color-surface)" />
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-surface)' }}>Dataset Manager</h2>
              </div>

              {/* Status Counters */}
              <div style={{ 
                backgroundColor: 'rgba(0,0,0,0.25)', 
                padding: '12px 15px', 
                borderRadius: '12px', 
                border: '1px solid var(--color-primary)' 
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: 'var(--color-primary-dark)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Total</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-surface)' }}>{totalQuestions}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-primary-dark)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>Available</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-success)' }}>{unusedQuestions}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-primary-dark)', padding: '8px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>Used</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-danger)' }}>{usedQuestions}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Object.entries(roundCounts).map(([code, count]) => (
                    <span key={code} style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
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
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary-dark)',
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
                <Edit3 size={20} color="var(--color-primary-dark)" />
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


