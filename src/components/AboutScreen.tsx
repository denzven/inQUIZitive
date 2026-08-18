import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Keyboard, Info, Rocket } from 'lucide-react';
import { ScreenLayout } from './ScreenLayout';
import { playButtonClick } from '../utils/soundEffects';

/**
 * AboutScreen Component.
 * Displays application background information, PWA feature highlights,
 * and keyboard shortcut documentation for live quiz presentation.
 */
export const AboutScreen: React.FC = () => {
  const { setGameState } = useQuizStore();

  /** Background decorative circle nodes */
  const decorCircles = (
    <>
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '15%', left: '15%', width: 'clamp(200px, 40vw, 400px)', height: 'clamp(200px, 40vw, 400px)', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.6 }} />
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '85%', left: '85%', width: 'clamp(200px, 50vw, 500px)', height: 'clamp(200px, 50vw, 500px)', borderRadius: '50%', backgroundColor: 'var(--color-accent)', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.6, animationDelay: '0.2s' }} />
    </>
  );

  const kbdBadgeStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-primary-dark)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    boxShadow: '0 2px 0 #999',
    display: 'inline-block'
  };

  const shortcuts = [
    { keys: ['1', '2', '3', '4'], desc: 'Select Option A, B, C, or D' },
    { keys: ['Space'], desc: 'Reveal Correct Answer' },
    { keys: ['←', '→'], desc: 'Previous / Next Question (Auto-Passes Unanswered Question)' },
    { keys: ['Enter'], desc: 'Start Round / Start Timer' },
    { keys: ['P', 'K'], desc: 'Pause / Resume Countdown Timer' },
    { keys: ['1 - 5', 'T', 'L', 'R', 'S', 'A'], desc: 'Main Menu: Navigate to Start (T), Leaderboard (L), Rules (R), Settings (S), About (A)' },
    { keys: ['2 - 5'], desc: 'Start Screen: Directly Launch Quiz Rounds 2-5' },
    { keys: ['1', '2', '←', '→'], desc: 'Rules Screen: Switch Player / Host Rules Tabs' },
    { keys: ['F'], desc: 'Toggle Fullscreen Projection Mode' },
    { keys: ['M'], desc: 'Toggle Mute / Unmute Audio' },
    { keys: ['H'], desc: 'Toggle Stealth Presentation Mode' },
    { keys: ['Esc'], desc: 'Return to Home / Main Menu' },
    { keys: ['1 - 9'], desc: 'Award Points to Team 1 through 9' },
    { keys: ['+'], desc: 'Emergency +5s Rapid Fire Timer Buffer' },
    { keys: ['Ctrl', 'Z'], desc: 'Undo Last Score / Question Action' },
  ];

  return (
    <ScreenLayout 
      backgroundDecor={decorCircles} 
      hideTitle={true} 
      footerText="Made with Love by Denzven and AI using React and Vite"
      showHomeButton={true}
      onHomeClick={() => { playButtonClick(); setGameState('MENU'); }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 1, padding: '0 20px', boxSizing: 'border-box' }}>
        <h1 className="title animate-slide-up" style={{ marginTop: 0, marginBottom: 'clamp(15px, 3vh, 30px)', fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>ABOUT</h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
          
          {/* Card 1: About */}
          <div className="card animate-slide-up" style={{ flex: '1 1 400px', backgroundColor: 'var(--color-primary-container)', border: '3px solid var(--color-primary)', padding: '30px', margin: 0, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: 'var(--color-accent)' }}>
              <Info size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>InQUIZitive</h2>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--color-surface)' }}>
              Originally built in Python and Pygame for live projection, this application has been reimagined 
              as a modern Progressive Web App (PWA) using React and Vite.
            </p>
          </div>

          {/* Card 2: Features */}
          <div className="card animate-slide-up" style={{ flex: '1 1 400px', backgroundColor: 'var(--color-primary-container)', border: '3px solid var(--color-primary)', padding: '30px', margin: 0, boxSizing: 'border-box', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: 'var(--color-accent)' }}>
              <Rocket size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>Features</h2>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--color-surface)' }}>
              Designed to handle multiple rounds (Rapid Fire, Spin Wheel, Buzzer) seamlessly 
              with robust global state management, offline support, and installability.
            </p>
          </div>

          {/* Card 3: Shortcuts */}
          <div className="card animate-slide-up" style={{ flex: '1 1 100%', backgroundColor: 'var(--color-primary-container)', border: '3px solid var(--color-primary)', padding: '30px', margin: 0, boxSizing: 'border-box', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', color: 'var(--color-accent)' }}>
              <Keyboard size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>Presenter Keyboard Shortcuts</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', fontSize: '1.1rem' }}>
              {shortcuts.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {item.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>/</span>}
                        <kbd style={kbdBadgeStyle}>{k}</kbd>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ color: 'var(--color-surface)', opacity: 0.95, fontSize: '1rem', lineHeight: 1.3 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </ScreenLayout>
  );
};
