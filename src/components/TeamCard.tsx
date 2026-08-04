import React from 'react';
import type { Team } from '../store/useQuizStore';

interface TeamCardProps {
  team: Team;
  onUpdateName: (id: number, name: string) => void;
  onUpdateScore: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onUpdateName, onUpdateScore, onRemove }) => {
  return (
    <div className="team-card animate-pop-in">
      <input 
        value={team.name}
        onChange={(e) => onUpdateName(team.id, e.target.value)}
        className="team-name-input"
      />
      
      <div className="team-score">
        {team.score}
      </div>

      <div className="score-controls">
        <button 
          onClick={() => onUpdateScore(team.id, -10)} 
          className="btn-minus"
        >
          -10
        </button>
        <button 
          onClick={() => onUpdateScore(team.id, 10)} 
          className="btn-plus"
        >
          +10
        </button>
      </div>
      
      <button 
        onClick={() => onRemove(team.id)} 
        className="btn-remove"
      >
        Remove Team
      </button>
    </div>
  );
};
