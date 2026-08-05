import React, { useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { X, Plus } from 'lucide-react';
import './Leaderboard.css';

export const LeaderboardScreen: React.FC = () => {
  const { teams, updateTeamScore, updateTeamName, addTeam, removeTeam, setGameState, setTeams } = useQuizStore();
  const [isSorted, setIsSorted] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleAdd = () => {
    addTeam(`Team ${teams.length + 1}`);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setTeams(teams.map(t => ({ ...t, score: 0 })));
    setShowResetModal(false);
  };

  const displayedTeams = isSorted 
    ? [...teams].sort((a, b) => b.score - a.score) 
    : teams;

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      hideTitle={true}
    >
      <div className="test-grid-container">
        <h2 className="test-title">LEADERBOARD</h2>
        
        <div className="leaderboard-global-actions">
          <button 
            className={`global-btn ${isSorted ? 'active' : ''}`}
            onClick={() => setIsSorted(!isSorted)}
          >
            {isSorted ? 'Unsort' : 'Sort by Score'}
          </button>
          <button 
            className="global-btn btn-reset"
            onClick={handleReset}
          >
            Reset Scores
          </button>
        </div>

        <div className="test-grid">
          {displayedTeams.map((team) => (
            <div key={team.id} className="test-box">
              <button onClick={() => removeTeam(team.id)} className="btn-delete-corner" aria-label="Delete">
                <X style={{ width: 'clamp(14px, 3vw, 18px)', height: 'clamp(14px, 3vw, 18px)' }} strokeWidth={3} />
              </button>
              
              <input 
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className="team-name-input"
              />
              
              <div className="test-box-content">{team.score}</div>

              <div className="score-controls">
                <button onClick={() => updateTeamScore(team.id, -10)} className="test-btn btn-minus">-10</button>
                <button onClick={() => updateTeamScore(team.id, 10)} className="test-btn btn-plus">+10</button>
              </div>
            </div>
          ))}
          
          <button onClick={handleAdd} className="test-add-box" aria-label="Add Team">
            <Plus style={{ width: 'clamp(28px, 6vw, 48px)', height: 'clamp(28px, 6vw, 48px)' }} strokeWidth={3} />
          </button>
        </div>
      </div>

      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop-in">
            <h3>Reset Scores</h3>
            <p>Are you sure you want to reset all team scores to 0? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="global-btn" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="global-btn btn-reset" onClick={confirmReset}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ScreenLayout>
  );
};
