import React from 'react';
import { useQuizStore } from '../store/useQuizStore';

/**
 * Scoreboard Component.
 * Displays a live horizontal score strip of all participating teams and their accumulated points.
 */
export const Scoreboard: React.FC = () => {
  const { teams } = useQuizStore();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 'clamp(8px, 2vw, 20px)',
      flexWrap: 'wrap',
      zIndex: 10,
      width: '100%',
      padding: '0 10px',
      boxSizing: 'border-box'
    }}>
      {teams.map((team) => (
        <div key={team.id} style={{
          backgroundColor: 'var(--teal)',
          padding: 'clamp(8px, 1.5vh, 12px) clamp(12px, 3vw, 20px)',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          minWidth: 'clamp(100px, 25vw, 150px)',
          flex: '1 1 auto',
          maxWidth: '200px'
        }}>
          <span style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--yellow)', fontWeight: 'bold' }}>
            {team.name}
          </span>
          <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900 }}>
            {team.score}
          </span>
        </div>
      ))}
    </div>
  );
};

