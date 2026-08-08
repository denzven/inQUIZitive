import React, { useState } from 'react';

/** Props for AddTeamForm component */
interface AddTeamFormProps {
  /** Callback fired when a new team is submitted */
  onAddTeam: (name: string) => void;
}

/**
 * AddTeamForm Component.
 * Form widget featuring a text input field and submit button for adding new team entries.
 */
export const AddTeamForm: React.FC<AddTeamFormProps> = ({ onAddTeam }) => {
  const [newTeamName, setNewTeamName] = useState('');

  /** Handles team submission on Enter key or button click */
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

