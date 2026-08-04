import React, { useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Home } from 'lucide-react';

export const LeaderboardScreen: React.FC = () => {
  const { teams, updateTeamScore, updateTeamName, addTeam, removeTeam, setGameState } = useQuizStore();
  const [newTeamName, setNewTeamName] = useState('');

  // Sort teams by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  return (
    <div className="projector-container" style={{ padding: 'max(20px, 4vw)', overflowY: 'auto' }}>
      <button 
        onClick={() => setGameState('MENU')}
        style={{ position: 'absolute', top: 'max(20px, 4vw)', left: 'max(20px, 4vw)', padding: '15px', borderRadius: '50%', zIndex: 10 }}
        aria-label="Home"
      >
        <Home size={32} color="var(--dark-green)" strokeWidth={3} />
      </button>

      <h1 className="title" style={{ marginTop: 0 }}>LEADERBOARD</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(15px, 3vw, 30px)',
        justifyContent: 'center',
        marginTop: 'clamp(20px, 4vw, 40px)'
      }}>
        {sortedTeams.map(team => (
          <div key={team.id} className="card" style={{ flex: '1 1 250px', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              value={team.name}
              onChange={(e) => updateTeamName(team.id, e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--yellow)',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 'bold',
                textAlign: 'center',
                outline: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.2)'
              }}
            />
            
            <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 900, textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {team.score}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => updateTeamScore(team.id, -10)} style={{ flex: 1, padding: '10px' }}>-10</button>
              <button onClick={() => updateTeamScore(team.id, 10)} style={{ flex: 1, padding: '10px' }}>+10</button>
            </div>
            
            <button 
              onClick={() => removeTeam(team.id)} 
              style={{ backgroundColor: 'var(--wrong-red)', padding: '5px', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}
            >
              Remove Team
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: 'clamp(40px, 6vw, 60px)' }}>
        <input 
          placeholder="New Team Name" 
          value={newTeamName}
          onChange={e => setNewTeamName(e.target.value)}
          style={{
            padding: '10px 20px',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            borderRadius: '10px',
            border: 'none'
          }}
        />
        <button onClick={handleAddTeam}>Add Team</button>
      </div>
    </div>
  );
};
