import React, { useState } from 'react';
import { ScreenLayout } from './ScreenLayout';
import { useQuizStore } from '../store/useQuizStore';
import { PrintableRulesDocument, type PrintMode } from './PrintableRulesDocument';
import QLogo from '../assets/Q.png';
import { 
  Trophy, 
  Clock, 
  Gamepad2, 
  BookOpen, 
  EyeOff, 
  Keyboard, 
  FileSpreadsheet, 
  Printer, 
  WifiOff, 
  HelpCircle,
  Grid,
  Bell,
  ShieldCheck,
  FileText,
  Download,
  Sparkles
} from 'lucide-react';
import { playButtonClick } from '../utils/soundEffects';
import {
  generalGuidelines,
  round1Rules,
  round2Rules,
  round3Rules,
  round4Rules,
  championshipRules,
  tiebreakerRules,
  hostGuideSections
} from '../data/rulesData';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'EyeOff': return EyeOff;
    case 'Keyboard': return Keyboard;
    case 'FileSpreadsheet': return FileSpreadsheet;
    case 'Trophy': return Trophy;
    case 'Printer': return Printer;
    case 'WifiOff': return WifiOff;
    default: return HelpCircle;
  }
};

/**
 * RulesScreen Component.
 * Displays interactive 2-tab view with inQUIZitive Logo:
 * 1. Rules for Players (General Competition Guidelines a-h & round mechanics)
 * 2. How to Use the App (Host guide, keyboard hotkeys & stealth controls)
 * 3. Bottom Controls: Theme Style Selector (App Theme, Eco-Print, Receipt) & PDF Export
 */
export const RulesScreen: React.FC = () => {
  const { setGameState } = useQuizStore();
  const [activeTab, setActiveTab] = useState<'players' | 'app'>('players');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [printDocMode, setPrintDocMode] = useState<PrintMode>('players');
  const [isEcoPrint, setIsEcoPrint] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === '1') {
        e.preventDefault();
        setActiveTab('players');
      } else if (e.key === '2') {
        e.preventDefault();
        setActiveTab('app');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveTab(prev => (prev === 'players' ? 'app' : 'players'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick();
        setGameState('MENU');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGameState]);

  const handlePrintPlayerRules = () => {
    setActiveTab('players');
    setPrintDocMode('players');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintHostGuide = () => {
    setActiveTab('app');
    setPrintDocMode('host');
    setTimeout(() => {
      window.print();
    }, 150);
  };



  return (
    <ScreenLayout
      backgroundDecor={null}
      showHomeButton={true}
      onHomeClick={() => { playButtonClick(); setGameState('MENU'); }}
      showSettingsButton={true}
      onSettingsClick={() => { playButtonClick(); setGameState('SETTINGS'); }}
      hideTitle={true}
      footerText="inQUIZitive Stage Regulations & Presentation Guide"
    >
      <style>{`
        @keyframes floatDecorSlow {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateY(-10px) rotate(2deg); }
        }
        .decor-float-node {
          animation: floatDecorSlow var(--float-dur, 6s) ease-in-out infinite;
        }
        @media screen {
          .print-only, .print-header-banner, .print-footer-banner {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body, #root, .projector-container, .screen-layout-content {
            background-color: #264653 !important;
            background: #264653 !important;
            color: #e8eddf !important;
            height: auto !important;
            min-height: 100vh !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            box-shadow: none !important;
            border: none !important;
          }
          .screen-layout-content > div {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            opacity: 1 !important;
            text-shadow: none !important;
            box-shadow: none !important;
            outline: none !important;
          }
          .no-print, .btn-icon, button, nav {
            display: none !important;
          }
          .decor-float-node, .rules-bg-decor {
            display: none !important;
            visibility: hidden !important;
          }
          .print-force-show {
            display: flex !important;
          }
          .print-header-banner {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 4px 0px 12px 0px !important;
            margin-bottom: 14px !important;
            background: transparent !important;
            border: none !important;
            border-bottom: 2px solid #2a9d8f !important;
            border-radius: 0 !important;
            color: #ffffff !important;
            width: 100% !important;
          }
          .print-footer-banner {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px 0 0 0 !important;
            margin-top: 14px !important;
            border: none !important;
            border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
            font-size: 0.82rem !important;
            color: #e9c46a !important;
            font-weight: bold !important;
            width: 100% !important;
          }
          .print-page-block {
            padding: 14mm 16mm 14mm 16mm !important;
            box-sizing: border-box !important;
            width: 100% !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-page-break {
            break-before: page !important;
            page-break-before: always !important;
            margin-top: 0 !important;
          }
          .rules-bg-panel {
            position: relative !important;
            z-index: 10 !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .rule-panel, .card {
            position: relative !important;
            z-index: 11 !important;
            background: #1c695f !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 15px 18px !important;
            margin: 0 0 12px 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }
          .rule-panel:last-child {
            margin-bottom: 0 !important;
          }
          .title span:nth-child(1) { color: #f4a261 !important; }
          .title span:nth-child(2) { color: #e9c46a !important; }
          .title span:nth-child(3) { color: #e76f51 !important; }
          p, span, h1, h2, h3, h4, li, code, strong, b {
            background-color: transparent !important;
            opacity: 1 !important;
          }
          .rule-badge {
            border-radius: 50% !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="rules-outer-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1100px', zIndex: 10, margin: '0 auto', padding: '0 16px 40px 16px', boxSizing: 'border-box' }}>
        
        {/* TOP BRANDING BAR WITH INQUIZITIVE LOGO & TITLE */}
        <div 
          className="rules-header-banner animate-slide-up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 'clamp(20px, 4vh, 32px)',
            gap: '8px'
          }}
        >
          {/* Logo & Text in single flex row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={QLogo} 
              alt="inQUIZitive Logo" 
              style={{
                width: 'clamp(42px, 6vw, 68px)',
                height: 'clamp(42px, 6vw, 68px)',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))'
              }} 
            />
            <h1 
              className="title" 
              style={{ 
                margin: 0, 
                fontSize: 'clamp(2.4rem, 6.5vw, 4.2rem)',
                letterSpacing: '2px',
                lineHeight: 1
              }}
            >
              RULES & GUIDE
            </h1>
          </div>
          <span style={{ color: 'var(--yellow)', fontSize: 'clamp(0.95rem, 2vw, 1.25rem)', fontWeight: 'bold', opacity: 0.9 }}>
            Official Competition Regulations & Technical Manual
          </span>
        </div>

        {/* 2-TAB PILL TOGGLE BUTTONS (Players Rules vs How to Use the App) */}
        <div 
          className="no-print animate-slide-up"
          style={{
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: '6px',
            borderRadius: '20px',
            gap: '8px',
            marginBottom: '28px',
            border: '2px solid var(--teal)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
          }}
        >
          <button
            onClick={() => { playButtonClick(); setActiveTab('players'); }}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: activeTab === 'players' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'players' ? 'var(--color-primary-dark)' : 'var(--color-surface)',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Gamepad2 size={22} color={activeTab === 'players' ? 'var(--color-primary-dark)' : 'var(--color-surface)'} />
            <span>Rules for Players</span>
          </button>

          <button
            onClick={() => { playButtonClick(); setActiveTab('app'); }}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: activeTab === 'app' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'app' ? 'var(--color-primary-dark)' : 'var(--color-surface)',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <BookOpen size={22} color={activeTab === 'app' ? 'var(--color-primary-dark)' : 'var(--color-surface)'} />
            <span>How to Use the App (Host Guide)</span>
          </button>
        </div>

        {/* TAB 1: RULES FOR PLAYERS (a-h General Guidelines + Round Mechanics 1-4 + Champion + Tie-Breaker) */}
        {activeTab === 'players' && (
          <div 
            className="rules-bg-panel animate-fade-in"
            style={{
              backgroundColor: 'var(--color-primary-container)',
              borderRadius: '26px',
              border: '3px solid var(--color-primary)',
              padding: 'clamp(20px, 3.5vw, 34px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Print Header for Webview Print Page 1 */}
            <div className="print-header-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={QLogo} alt="Q" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-secondary)', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '0.95rem' }}>Official Competition Rules & Event Guide</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Player Regulations</span>
            </div>

            {/* Section 1: General Competition Guidelines */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <ShieldCheck size={32} color="var(--color-accent)" />
                <h3 style={{ color: 'var(--color-accent)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  1. General Competition Guidelines
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generalGuidelines.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary-dark)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Round 1 – Offline Aptitude Round */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <FileText size={32} color="var(--color-accent)" />
                <h3 style={{ color: 'var(--color-accent)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  2. Round 1: Offline Aptitude Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round1Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary-dark)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Round 2 – Rapid Fire Speed Round & Bonus Points */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <Clock size={32} color="var(--color-secondary)" />
                <h3 style={{ color: 'var(--color-secondary)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  3. Round 2: Rapid Fire Speed Round & Bonus Points
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round2Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Round 3 – Jeopardy & Spin Wheel */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <HelpCircle size={32} color="var(--color-primary)" />
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  4. Round 3: Jeopardy & Spin Wheel
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round3Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Round 4 – Rapid Lockout Buzzer Round */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <Bell size={32} color="var(--color-danger)" />
                <h3 style={{ color: 'var(--color-danger)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  5. Round 4: Rapid Lockout Buzzer Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round4Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-danger)', color: 'var(--color-surface)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Tournament Scoring & Championship Victory */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <Trophy size={32} color="var(--color-success)" />
                <h3 style={{ color: 'var(--color-success)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  6. Tournament Scoring & Championship Victory
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {championshipRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-primary-dark)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Tie-Breaker Duel – Tic-Tac-Toe Grid */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '22px', border: '2px solid var(--color-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <Grid size={32} color="var(--color-secondary)" />
                <h3 style={{ color: 'var(--color-secondary)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  7. Tie-Breaker Duel: Tic-Tac-Toe Grid
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tiebreakerRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--color-surface)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HOW TO USE THE APP (HOST GUIDE) */}
        {activeTab === 'app' && (
          <div 
            className="rules-bg-panel animate-fade-in"
            style={{
              backgroundColor: 'var(--color-primary-container)',
              borderRadius: '26px',
              border: '3px solid var(--color-primary)',
              padding: 'clamp(20px, 3.5vw, 34px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Print Header for Host Guide / Page 3 */}
            <div className="print-header-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={QLogo} alt="Q" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-secondary)', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '0.95rem' }}>Host Operating Instructions & Technical Guide</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Host Event Manual</span>
            </div>
            
            {/* Dynamic Modular Host Guide Sections */}
            {hostGuideSections.map((section) => {
              const IconComp = getIconComponent(section.iconName);
              return (
                <div 
                  key={section.id} 
                  className="card rule-panel animate-fade-in" 
                  style={{ 
                    padding: '24px', 
                    backgroundColor: 'var(--color-primary-container)', 
                    borderRadius: '22px', 
                    border: '2px solid var(--color-primary)', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '18px' 
                  }}
                >
                  <IconComp size={34} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <h3 style={{ color: 'var(--color-surface)', fontSize: '1.45rem', margin: 0, fontWeight: 800 }}>
                        {section.number}. {section.title}
                      </h3>
                      {section.subtitle && (
                        <span style={{ fontSize: '0.85rem', backgroundColor: 'color-mix(in srgb, var(--color-primary-dark) 40%, transparent)', color: 'var(--color-secondary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                          {section.subtitle}
                        </span>
                      )}
                    </div>

                    {section.description && (
                      <p style={{ color: 'var(--color-surface)', fontSize: '1.05rem', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                        {section.description}
                      </p>
                    )}

                    {section.gridShortcuts ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginTop: '10px' }}>
                        {section.gridShortcuts.map((sc, scIdx) => (
                          <div key={scIdx} style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '12px 16px', borderRadius: '14px', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', color: 'var(--color-surface)', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary-dark)', padding: '3px 9px', borderRadius: '6px', fontWeight: 900, fontFamily: 'monospace', fontSize: '0.9rem', flexShrink: 0 }}>
                              {sc.key}
                            </span>
                            <span style={{ lineHeight: '1.3' }}>{sc.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-surface)', fontSize: '1rem', lineHeight: '1.6' }}>
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: '6px' }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* BOTTOM ACTION BAR: DIRECT DOWNLOAD PDF & PRINT BUTTONS */}
        <div className="no-print" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
          
          {/* Primary Action: Download PDF for Active Tab directly from public folder */}
          <button
            onClick={() => {
              playButtonClick();
              const filename = activeTab === 'players' ? 'inQUIZitive_Player_Rules.pdf' : 'inQUIZitive_Host_Manual.pdf';
              const fileUrl = `/${filename}`;
              
              setToastMessage(`Downloading ${activeTab === 'players' ? 'Player Rules' : 'Host Manual'} PDF...`);
              
              const link = document.createElement('a');
              link.href = fileUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              setTimeout(() => setToastMessage(null), 2500);
            }}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary-dark)',
              border: '2px solid var(--color-accent)',
              borderRadius: '16px',
              padding: '14px 28px',
              fontWeight: 900,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--color-accent) 40%, transparent)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Download size={20} color="var(--color-primary-dark)" />
            <span>{activeTab === 'players' ? 'Download Player Rules (PDF)' : 'Download Host Guide (PDF)'}</span>
          </button>

          {/* Secondary Action: Print Active Tab via Browser */}
          <button
            onClick={() => {
              playButtonClick();
              if (activeTab === 'players') {
                handlePrintPlayerRules();
              } else {
                handlePrintHostGuide();
              }
            }}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface)',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '14px 26px',
              fontWeight: 900,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--color-primary) 35%, transparent)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Printer size={20} color="var(--color-accent)" />
            <span>Print {activeTab === 'players' ? 'Player Rules' : 'Host Guide'}</span>
          </button>

          {/* Eco Print Ink-Saver Mode Toggle */}
          <button
            onClick={() => {
              playButtonClick();
              setIsEcoPrint(prev => !prev);
              setToastMessage(isEcoPrint ? 'Standard Dark Print Theme Active' : 'Eco Ink-Saver White Print Theme Active');
              setTimeout(() => setToastMessage(null), 2500);
            }}
            style={{
              backgroundColor: isEcoPrint ? '#ffffff' : 'rgba(0, 0, 0, 0.3)',
              color: isEcoPrint ? '#0f172a' : 'var(--color-surface)',
              border: `2px solid ${isEcoPrint ? '#0d9488' : 'rgba(255, 255, 255, 0.25)'}`,
              borderRadius: '16px',
              padding: '14px 22px',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: isEcoPrint ? '0 6px 20px rgba(13, 148, 136, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Toggle Eco Ink-Saver Mode (White Background for Printing)"
          >
            <Sparkles size={20} color={isEcoPrint ? '#0d9488' : 'var(--color-accent)'} />
            <span>Eco Print Theme: {isEcoPrint ? 'ON (White BG)' : 'OFF (Dark BG)'}</span>
          </button>

        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div 
            className="animate-slide-up"
            style={{
              position: 'fixed',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--color-primary-dark)',
              color: 'var(--color-accent)',
              border: '2px solid var(--color-accent)',
              padding: '12px 24px',
              borderRadius: '30px',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              zIndex: 1000,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FileText size={20} color="var(--color-accent)" />
            {toastMessage}
          </div>
        )}

        {/* Dedicated Portal for Edge-to-Edge A4 PDF Print Rendering */}
        <PrintableRulesDocument printMode={printDocMode} isEcoPrint={isEcoPrint} />

      </div>
    </ScreenLayout>
  );
};

