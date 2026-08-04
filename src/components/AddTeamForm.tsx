import React, { useState } from 'react';

interface AddTeamFormProps {
  onAddTeam: (name: string) => void;
}

export const AddTeamForm: React.FC<AddTeamFormProps> = ({ onAddTeam }) => {
  const [newTeamName, setNewTeamName] = useState('');

  const handleSubmit = () => {
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  return (
    <div className="add-team-container">
      <input 
        placeholder="New Team Name" 
        value={newTeamName}
        onChange={e => setNewTeamName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        className="add-team-input"
      />
      <button onClick={handleSubmit} className="btn-add-team">
        Add Team
      </button>
    </div>
  );
};
