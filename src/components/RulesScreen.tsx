import React, { useState } from 'react';
import { ScreenLayout } from './ScreenLayout';
import { useQuizStore } from '../store/useQuizStore';
import { PrintableRulesDocument } from './PrintableRulesDocument';
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
  ChevronDown,
  FileText,
  FileCheck
} from 'lucide-react';
import { playButtonClick } from '../utils/soundEffects';

/**
 * RulesScreen Component.
 * Displays interactive 2-tab view with inQUIZitive Logo:
 * 1. Rules for Players (General Competition Guidelines a-h & round mechanics)
 * 2. How to Use the App (Host guide, keyboard hotkeys & stealth controls)
 * 3. Bottom Dropdown: Print Webview Rules or Formal PDF Document
 */
export const RulesScreen: React.FC = () => {
  const { setGameState } = useQuizStore();
  const [activeTab, setActiveTab] = useState<'players' | 'app'>('players');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [printDocMode, setPrintDocMode] = useState<'players' | 'host' | 'formal'>('players');

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

  const generalGuidelines = [
    { label: 'a', text: 'The quiz progresses through four stage rounds after qualifying screening.' },
    { label: 'b', text: 'Points will be entirely reset to zero at the start of new rounds following eliminations to ensure a levelled baseline for advancing teams.' },
    { label: 'c', text: 'Tie-Breakers will be conducted in case of a Tie (equal points to two or more teams at the end of the round before elimination), a tie-breaker question will be asked to each of the teams that are tied.' },
    { label: 'd', text: 'All decisions of the Quiz Master and the Organizing team will be final and binding.' },
    { label: 'e', text: 'Interruptions and doubts will not be entertained once the round starts, the participants must answer the question and then doubts will be clarified at the end of the round.' },
    { label: 'f', text: 'Tallying and Display of the points of the scoreboard will be finalized by the Quiz Master and the Organizing team.' },
    { label: 'g', text: 'Use of Electronic Devices such as Mobile Phones and Smartwatches and /or engaging in any Malpractice will lead to disqualification.' },
    { label: 'h', text: 'Calculators, pen/pencils and papers/pads will be provided by the Organizing team.' }
  ];

  const round1Rules = [
    { label: 'a', text: 'Format: Written offline paper-and-pen aptitude evaluation conducted on-site prior to live stage presentations.' },
    { label: 'b', text: 'Eligibility & Advancement: All registered competition teams participate. Top-scoring teams qualify to advance to the stage tournament.' },
    { label: 'c', text: 'Score Baseline Reset: Aptitude test scores determine stage qualifiers; points are reset to zero upon entering Round 2 to ensure a level playing field.' }
  ];

  const round2Rules = [
    { label: 'a', text: 'Time Limit: Each team faces 10 rapid-fire questions against a strict 60-second countdown clock.' },
    { label: 'b', text: 'Base Scoring: +10 points awarded for every correct answer. No negative marking for incorrect or skipped questions.' },
    { label: 'c', text: 'Accuracy Bonus Points: +10 Bonus Points awarded for scoring >5 correct answers (>50% accuracy); +20 Bonus Points awarded for a Perfect Score (100% accuracy on all 10 questions).' },
    { label: 'd', text: 'Stage Controls: The Quiz Master reserves the right to pause the countdown clock or apply a +5-second emergency time buffer under technical or stage disruptions.' }
  ];

  const round3Rules = [
    { label: 'a', text: 'Selection Mechanics: Teams take turns spinning the slot machine category reel to randomly select quiz topics and point values.' },
    { label: 'b', text: 'Option Selection: After category selection, multiple-choice options are presented on screen for the active team.' },
    { label: 'c', text: 'Variable Point Values: Point values range from 10 to 50 points per question based on difficulty and spin multipliers.' },
    { label: 'd', text: 'Question Retirement: Answered categories/questions are marked as used and retired for the remainder of the session.' }
  ];

  const round4Rules = [
    { label: 'a', text: 'Lockout Mechanics: Questions are read aloud to all active teams simultaneously. The first team to hit the buzzer locks out all rival teams.' },
    { label: 'b', text: 'Answering Window: The locked-in team has 5 seconds to announce their answer.' },
    { label: 'c', text: 'Scoring & Penalties: Correct answer awards full question points. Incorrect answer penalizes points from team score and re-opens buzzing to rival teams.' },
    { label: 'd', text: 'Early Buzzing: Buzzing prior to question completion is permitted at the team\'s own risk.' }
  ];

  const championshipRules = [
    { label: 'a', text: 'Real-Time Scoreboard: Live tournament standings update dynamically after each question and round.' },
    { label: 'b', text: 'Championship Victory: The team with the highest aggregate accumulated score at the end of the final round is crowned the inQUIZitive Champion.' },
    { label: 'c', text: 'Sudden-Death Tiebreaker: In case of an equal score tie after the final round, a sudden-death tiebreaker question will determine the champion.' }
  ];

  const tiebreakerRules = [
    { label: 'a', text: 'Usage & Trigger: Administered by the Quiz Master whenever a tie occurs between two or more teams before an elimination phase or for overall victory.' },
    { label: 'b', text: 'Grid Setup: A 3x3 interactive game board with grid positions numbered 1 through 9.' },
    { label: 'c', text: 'Turn-Based Duel: Tied teams alternate selecting grid positions. To claim a cell (X or O), the team must answer the corresponding question correctly.' },
    { label: 'd', text: 'Victory Condition: The first team to form a continuous line of 3 matching symbols (horizontally, vertically, or diagonally) wins the tie-breaker.' }
  ];

  const handlePrintPlayerRules = () => {
    setIsDropdownOpen(false);
    setActiveTab('players');
    setPrintDocMode('players');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintHostGuide = () => {
    setIsDropdownOpen(false);
    setActiveTab('app');
    setPrintDocMode('host');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintFormalDoc = () => {
    setIsDropdownOpen(false);
    setToastMessage('Preparing Formal Official Competition PDF Document...');
    setPrintDocMode('formal');
    setTimeout(() => {
      window.print();
      setToastMessage(null);
    }, 300);
  };

  /** Simpler, rock-solid, 100% visible fixed side decor (5 Left, 5 Right) */
  const rulesBackgroundDecor = (
    <div className="rules-bg-decor" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {/* LEFT SIDE GUTTER SHAPES */}
      <div style={{ position: 'absolute', top: '10vh', left: '2vw', fontSize: 'clamp(8rem, 14vw, 15rem)', color: '#f4a261', transform: 'rotate(18deg)', fontWeight: 900, userSelect: 'none' }}>?</div>
      <div style={{ position: 'absolute', top: '32vh', left: '4vw', width: 'clamp(110px, 15vw, 200px)', height: 'clamp(110px, 15vw, 200px)', borderRadius: '50%', backgroundColor: '#e9c46a' }} />
      <div style={{ position: 'absolute', top: '55vh', left: '1vw', fontSize: 'clamp(10rem, 16vw, 17rem)', color: '#2a9d8f', transform: 'rotate(-24deg)', fontWeight: 900, userSelect: 'none' }}>?</div>
      <div style={{ position: 'absolute', top: '76vh', left: '5vw', width: 'clamp(80px, 11vw, 150px)', height: 'clamp(80px, 11vw, 150px)', borderRadius: '50%', border: '8px solid #e76f51', backgroundColor: 'transparent' }} />
      <div style={{ position: 'absolute', top: '88vh', left: '2vw', fontSize: 'clamp(7rem, 12vw, 12rem)', color: '#e9c46a', transform: 'rotate(32deg)', fontWeight: 900, userSelect: 'none' }}>?</div>

      {/* RIGHT SIDE GUTTER SHAPES */}
      <div style={{ position: 'absolute', top: '12vh', right: '3vw', width: 'clamp(120px, 16vw, 220px)', height: 'clamp(120px, 16vw, 220px)', borderRadius: '50%', backgroundColor: '#2a9d8f' }} />
      <div style={{ position: 'absolute', top: '35vh', right: '1vw', fontSize: 'clamp(9rem, 15vw, 16rem)', color: '#e76f51', transform: 'rotate(-20deg)', fontWeight: 900, userSelect: 'none' }}>?</div>
      <div style={{ position: 'absolute', top: '58vh', right: '4vw', width: 'clamp(90px, 12vw, 170px)', height: 'clamp(90px, 12vw, 170px)', borderRadius: '50%', border: '8px solid #f4a261', backgroundColor: 'transparent' }} />
      <div style={{ position: 'absolute', top: '78vh', right: '2vw', fontSize: 'clamp(11rem, 17vw, 18rem)', color: '#e9c46a', transform: 'rotate(26deg)', fontWeight: 900, userSelect: 'none' }}>?</div>
      <div style={{ position: 'absolute', top: '90vh', right: '5vw', width: 'clamp(100px, 13vw, 180px)', height: 'clamp(100px, 13vw, 180px)', borderRadius: '50%', backgroundColor: '#f4a261' }} />
    </div>
  );

  return (
    <ScreenLayout
      backgroundDecor={rulesBackgroundDecor}
      showHomeButton={true}
      onHomeClick={() => { playButtonClick(); setGameState('MENU'); }}
      showSettingsButton={true}
      onSettingsClick={() => { playButtonClick(); setGameState('SETTINGS'); }}
      hideTitle={true}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1040px', margin: 'auto', paddingBottom: '30px', boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>
        {/* Top Header Section with inQUIZitive Logo */}
        <div className="animate-slide-down" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'clamp(16px, 3vh, 28px)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
            <img 
              src={QLogo} 
              alt="inQUIZitive Logo" 
              style={{ width: 'clamp(48px, 7vw, 75px)', height: 'clamp(48px, 7vw, 75px)', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }} 
            />
            <h1 className="title" style={{ margin: 0, fontSize: 'clamp(2rem, min(5vw, 4.5vh), 3.8rem)' }}>
              <span>IN</span><span>QUIZ</span><span>ITIVE</span>
            </h1>
          </div>
          <div style={{ color: 'var(--yellow)', fontSize: 'clamp(1rem, 2vw, 1.3rem)', fontWeight: 'bold', letterSpacing: '1px' }}>
            Official Competition Rules & Event Guide
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '24px', flexWrap: 'wrap', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => { playButtonClick(); setActiveTab('players'); }}
            style={{
              padding: '12px 26px',
              borderRadius: '16px',
              border: activeTab === 'players' ? '2px solid var(--yellow)' : '2px solid var(--teal)',
              backgroundColor: activeTab === 'players' ? 'var(--yellow)' : 'var(--dark-teal)',
              color: activeTab === 'players' ? 'var(--dark-green)' : 'var(--white)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: activeTab === 'players' ? '0 6px 20px rgba(233, 196, 106, 0.4)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Gamepad2 size={24} color={activeTab === 'players' ? 'var(--dark-green)' : 'var(--yellow)'} />
            Rules for Players
          </button>

          <button
            onClick={() => { playButtonClick(); setActiveTab('app'); }}
            style={{
              padding: '12px 26px',
              borderRadius: '16px',
              border: activeTab === 'app' ? '2px solid var(--yellow)' : '2px solid var(--teal)',
              backgroundColor: activeTab === 'app' ? 'var(--yellow)' : 'var(--dark-teal)',
              color: activeTab === 'app' ? 'var(--dark-green)' : 'var(--white)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: activeTab === 'app' ? '0 6px 20px rgba(233, 196, 106, 0.4)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <BookOpen size={24} color={activeTab === 'app' ? 'var(--dark-green)' : 'var(--yellow)'} />
            How to Use the App (Host Guide)
          </button>
        </div>

        {/* TAB 1: RULES FOR PLAYERS */}
        {activeTab === 'players' && (
          <div 
            className="rules-bg-panel animate-fade-in"
            style={{
              position: 'relative',
              zIndex: 10,
              backgroundColor: 'var(--dark-teal)',
              borderRadius: '26px',
              border: '3px solid var(--teal)',
              padding: 'clamp(20px, 3.5vw, 34px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Section 1: General Competition Guidelines */}
            <div className="card rule-panel rule-panel-1 animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--teal)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <ShieldCheck size={34} color="var(--yellow)" />
                <h3 style={{ color: 'var(--yellow)', fontSize: '1.6rem', margin: 0, fontWeight: 900 }}>
                  1. General Competition Guidelines
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generalGuidelines.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Round 1 – Offline Aptitude Round */}
            <div className="card rule-panel rule-panel-2 animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--yellow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <FileText size={34} color="var(--yellow)" />
                <h3 style={{ color: 'var(--yellow)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  2. Round 1: Offline Aptitude Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round1Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Round 2 – Rapid Fire Speed Round & Bonus Points */}
            <div className="card rule-panel rule-panel-3 animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--orange)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <Clock size={34} color="var(--orange)" />
                <h3 style={{ color: 'var(--orange)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  3. Round 2: Rapid Fire Speed Round & Bonus Points
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round2Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--orange)', color: 'var(--white)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Round 3 – Jeopardy & Spin Wheel */}
            <div className="card rule-panel rule-panel-4 animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--teal)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <HelpCircle size={34} color="var(--teal)" />
                <h3 style={{ color: 'var(--teal)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  4. Round 3: Jeopardy & Spin Wheel
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round3Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--teal)', color: 'var(--white)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Round 4 – Rapid Lockout Buzzer Round */}
            <div className="card rule-panel rule-panel-5 animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--wrong-red)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <Bell size={34} color="var(--wrong-red)" />
                <h3 style={{ color: 'var(--wrong-red)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  5. Round 4: Rapid Lockout Buzzer Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {round4Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--wrong-red)', color: 'var(--white)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Tournament Scoring & Victory */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--correct-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <Trophy size={34} color="var(--correct-green)" />
                <h3 style={{ color: 'var(--correct-green)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  6. Tournament Scoring & Championship Victory
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {championshipRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--correct-green)', color: 'var(--dark-green)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Tie-Breaker Duel – Tic-Tac-Toe Grid */}
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--light-orange)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <Grid size={34} color="var(--light-orange)" />
                <h3 style={{ color: 'var(--light-orange)', fontSize: '1.55rem', margin: 0, fontWeight: 900 }}>
                  7. Tie-Breaker Duel: Tic-Tac-Toe Grid
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tiebreakerRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span className="rule-badge" style={{ backgroundColor: 'var(--light-orange)', color: 'var(--dark-green)', fontWeight: 900, borderRadius: '50%', minWidth: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                      {item.label}
                    </span>
                    <span style={{ color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
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
              backgroundColor: 'var(--dark-teal)',
              borderRadius: '26px',
              border: '3px solid var(--teal)',
              padding: 'clamp(20px, 3.5vw, 34px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Print Continuation Header for Host Guide / Page 3 */}
            <div className="print-header-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={QLogo} alt="Q" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f4a261', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: '#e9c46a', fontWeight: 'bold', fontSize: '0.95rem' }}>Host Operating Instructions & Technical Guide</span>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Host Event Manual</span>
            </div>
            
            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--yellow)', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
              <EyeOff size={34} color="var(--yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: 'var(--yellow)', fontSize: '1.45rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                  1. Stealth Mode & Single-Screen Broadcast
                </h3>
                <p style={{ color: 'var(--white)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', opacity: 1 }}>
                  Designed for single shared screen presentation (where the audience sees the host display). Top action bars fade to near-invisible opacity (8%) in Stealth Mode so the screen looks like a clean TV game show. Hover or focus top corners to reveal host controls, or press <strong>H</strong> to toggle Stealth Mode.
                </p>
              </div>
            </div>

            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--teal)', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
              <Keyboard size={34} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: 'var(--teal)', fontSize: '1.45rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                  2. Keyboard Hotkeys & Emergency Protection
                </h3>
                <p style={{ color: 'var(--white)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', opacity: 1 }}>
                  Control the entire event without touching a mouse on stage:
                </p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: 'var(--white)', fontSize: '1.05rem', lineHeight: '1.6', opacity: 1 }}>
                  <li><strong>1 - 4</strong>: Quick select option A, B, C, D</li>
                  <li><strong>Space</strong>: Reveal answer or advance step</li>
                  <li><strong>Ctrl + Z / Cmd + Z</strong>: Instant Undo stack to revert accidental score edits</li>
                  <li><strong>+ / =</strong>: Inject +5s emergency time buffer during Rapid Fire countdown</li>
                  <li><strong>H</strong>: Toggle Stealth Presentation Mode on/off</li>
                  <li><strong>Esc</strong>: Return to Home / Menu screen</li>
                </ul>
              </div>
            </div>

            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--light-orange)', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
              <FileSpreadsheet size={34} color="var(--light-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: 'var(--light-orange)', fontSize: '1.45rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                  3. Excel Ingestion & Pre-Flight Audit Engine
                </h3>
                <p style={{ color: 'var(--white)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', opacity: 1 }}>
                  Upload custom <code>.xlsx</code> spreadsheets. The built-in Pre-Flight Audit Engine validates rows for missing options, duplicate questions, non-numeric scores, and unedited template placeholders (e.g. <code>Question 255</code>). Use 1-click <strong>Auto-Fix</strong> or edit questions live in the Question Bank.
                </p>
              </div>
            </div>

            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--orange)', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
              <Printer size={34} color="var(--orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: 'var(--orange)', fontSize: '1.45rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                  4. Host Cheat Sheet & Answer Key Printing
                </h3>
                <p style={{ color: 'var(--white)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', opacity: 1 }}>
                  Generate a multi-page printable <strong>Host Cheat Sheet & Answer Key</strong> directly from the Question Bank Editor. Print to paper or export as PDF to view answer keys on a secondary phone or clipboard during the live show.
                </p>
              </div>
            </div>

            <div className="card rule-panel animate-fade-in" style={{ padding: '24px', backgroundColor: 'var(--dark-green)', borderRadius: '22px', border: '2px solid var(--correct-green)', display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
              <WifiOff size={34} color="var(--correct-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: 'var(--correct-green)', fontSize: '1.45rem', margin: '0 0 6px 0', fontWeight: 800 }}>
                  5. Offline PWA & Procedural Audio Engine
                </h3>
                <p style={{ color: 'var(--white)', fontSize: '1.05rem', margin: 0, lineHeight: '1.6', opacity: 1 }}>
                  inQUIZitive is an offline-first Progressive Web App (PWA). All sound effects and background music are generated in real-time via the Web Audio API without requiring any external MP3 files or active internet connection.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Bottom Action Bar: Dynamic Print & Download Rules Button / Dropdown */}
        <div className="no-print" style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            
            {/* Dynamic Split Button */}
            <div style={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--orange)', boxShadow: '0 8px 24px rgba(233, 196, 106, 0.35)' }}>
              {/* Primary Action Button: Prints active view directly */}
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
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  border: 'none',
                  padding: '12px 22px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Printer size={20} color="var(--dark-green)" />
                <span>{activeTab === 'players' ? 'Print Player Rules' : 'Print Host Guide'}</span>
              </button>

              {/* Dropdown Chevron Toggle Button */}
              <button
                onClick={() => { playButtonClick(); setIsDropdownOpen(!isDropdownOpen); }}
                style={{
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  border: 'none',
                  borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Print options"
              >
                <ChevronDown size={20} color="var(--dark-green)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>
            </div>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && (
              <div 
                className="animate-pop-in"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 10px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--dark-teal)',
                  border: '2px solid var(--teal)',
                  borderRadius: '16px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  minWidth: '270px',
                  zIndex: 100
                }}
              >
                {activeTab === 'players' ? (
                  <>
                    <button
                      onClick={handlePrintPlayerRules}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        backgroundColor: 'transparent',
                        color: 'var(--white)',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.98rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(233, 196, 106, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Gamepad2 size={18} color="var(--yellow)" />
                      Print Player Rules (Webview)
                    </button>

                    <button
                      onClick={handlePrintFormalDoc}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        backgroundColor: 'transparent',
                        color: 'var(--white)',
                        border: 'none',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.98rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(233, 196, 106, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FileCheck size={18} color="var(--teal)" />
                      Print Formal Document (PDF)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handlePrintHostGuide}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        backgroundColor: 'transparent',
                        color: 'var(--white)',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.98rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(233, 196, 106, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <BookOpen size={18} color="var(--light-orange)" />
                      Print Host Guide (Webview)
                    </button>

                    <button
                      onClick={handlePrintFormalDoc}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        backgroundColor: 'transparent',
                        color: 'var(--white)',
                        border: 'none',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.98rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(233, 196, 106, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FileCheck size={18} color="var(--teal)" />
                      Print Formal Document (PDF)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
              backgroundColor: 'var(--dark-green)',
              color: 'var(--yellow)',
              border: '2px solid var(--yellow)',
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
            <FileText size={20} color="var(--yellow)" />
            {toastMessage}
          </div>
        )}

        {/* Dedicated Portal for Edge-to-Edge A4 PDF Print Rendering */}
        <PrintableRulesDocument printMode={printDocMode} />

      </div>
    </ScreenLayout>
  );
};

