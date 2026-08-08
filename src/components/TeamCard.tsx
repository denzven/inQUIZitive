import React from 'react';
import type { Team } from '../store/useQuizStore';

/** Props for the TeamCard component */
interface TeamCardProps {
  /** Target Team object */
  team: Team;
  /** Callback to update team title */
  onUpdateName: (id: number, name: string) => void;
  /** Callback to increment/decrement team score */
  onUpdateScore: (id: number, delta: number) => void;
  /** Callback to remove team */
  onRemove: (id: number) => void;
}

/**
 * TeamCard Component.
 * Renders an editable card widget for an individual team displaying name input, current score,
 * +/-10 score adjusters, and a delete button.
 */
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

