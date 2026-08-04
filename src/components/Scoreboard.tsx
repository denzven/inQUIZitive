import React from 'react';
import { useQuizStore } from '../store/useQuizStore';

export const Scoreboard: React.FC = () => {
  const { teams } = useQuizStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      zIndex: 10
    }}>
      {teams.map((team) => (
        <div key={team.id} style={{
          backgroundColor: 'var(--teal)',
          padding: '10px 20px',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          minWidth: '150px'
        }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--yellow)', fontWeight: 'bold' }}>
            {team.name}
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>
            {team.score}
          </span>
        </div>
      ))}
    </div>
  );
};
