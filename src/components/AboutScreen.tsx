import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Home } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const { setGameState } = useQuizStore();

  return (
    <div className="projector-container" style={{ padding: 'max(20px, 4vw)', alignItems: 'center' }}>
      <button 
        onClick={() => setGameState('MENU')}
        style={{ position: 'absolute', top: 'max(20px, 4vw)', left: 'max(20px, 4vw)', padding: '15px', borderRadius: '50%' }}
        aria-label="Home"
      >
        <Home size={32} color="var(--dark-green)" strokeWidth={3} />
      </button>

      <h1 className="title" style={{ marginTop: 0 }}>ABOUT</h1>
      
      <div className="card" style={{ maxWidth: '800px', width: '100%', marginTop: 'clamp(20px, 4vw, 40px)', lineHeight: '1.6', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <h2 style={{ color: 'var(--yellow)' }}>InQUIZitive React PWA</h2>
        <p>
          Originally built in Python and Pygame for live projection, this application has been reimagined 
          as a modern Progressive Web App using React and Vite.
        </p>
        <p>
          It is designed to handle multiple rounds (Rapid Fire, Spin Wheel, Tic-Tac-Toe, Buzzer) seamlessly 
          with robust global state management and instant keyboard shortcuts for live quizmasters.
        </p>
        <p><strong>Keyboard Shortcuts (Playing Mode):</strong></p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li><code>Space</code> / <code>Click Option</code>: Reveal Correct Answer</li>
          <li><code>Left / Right Arrows</code>: Previous / Next Question</li>
          <li><code>1 - 9</code>: Award points to Team 1 through 9</li>
          <li><code>Escape</code>: Return to Menu</li>
        </ul>
      </div>
    </div>
  );
};
