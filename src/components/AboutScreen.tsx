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
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '15%', left: '15%', width: 'clamp(200px, 40vw, 400px)', height: 'clamp(200px, 40vw, 400px)', borderRadius: '50%', backgroundColor: 'var(--light-orange)', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.6 }} />
      <div className="animate-pop-in-absolute" style={{ position: 'absolute', top: '85%', left: '85%', width: 'clamp(200px, 50vw, 500px)', height: 'clamp(200px, 50vw, 500px)', borderRadius: '50%', backgroundColor: 'var(--yellow)', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.6, animationDelay: '0.2s' }} />
    </>
  );

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
          <div className="card animate-slide-up" style={{ flex: '1 1 400px', backgroundColor: 'var(--dark-teal)', border: '3px solid var(--teal)', padding: '30px', margin: 0, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: 'var(--yellow)' }}>
              <Info size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>InQUIZitive</h2>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--white)' }}>
              Originally built in Python and Pygame for live projection, this application has been reimagined 
              as a modern Progressive Web App (PWA) using React and Vite.
            </p>
          </div>

          {/* Card 2: Features */}
          <div className="card animate-slide-up" style={{ flex: '1 1 400px', backgroundColor: 'var(--dark-teal)', border: '3px solid var(--teal)', padding: '30px', margin: 0, boxSizing: 'border-box', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', color: 'var(--yellow)' }}>
              <Rocket size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>Features</h2>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--white)' }}>
              Designed to handle multiple rounds (Rapid Fire, Spin Wheel, Buzzer) seamlessly 
              with robust global state management, offline support, and installability.
            </p>
          </div>

          {/* Card 3: Shortcuts */}
          <div className="card animate-slide-up" style={{ flex: '1 1 100%', backgroundColor: 'var(--dark-teal)', border: '3px solid var(--teal)', padding: '30px', margin: 0, boxSizing: 'border-box', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', color: 'var(--yellow)' }}>
              <Keyboard size={36} />
              <h2 style={{ margin: 0, fontSize: '2rem' }}>Keyboard Shortcuts</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', fontSize: '1.1rem' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>Space</kbd> or <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>Click</kbd>
                </div>
                <div style={{ color: 'var(--white)', opacity: 0.9 }}>Reveal Correct Answer</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>←</kbd> / <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>→</kbd>
                </div>
                <div style={{ color: 'var(--white)', opacity: 0.9 }}>Previous / Next Question</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>1</kbd> - <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>9</kbd>
                </div>
                <div style={{ color: 'var(--white)', opacity: 0.9 }}>Award points to Team 1-9</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <kbd style={{ backgroundColor: 'var(--white)', color: 'var(--dark-green)', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 0 #999' }}>Esc</kbd>
                </div>
                <div style={{ color: 'var(--white)', opacity: 0.9 }}>Return to Menu</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ScreenLayout>
  );
};

