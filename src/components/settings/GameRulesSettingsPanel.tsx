import React from 'react';
import { useGameRulesStore } from '../../store/useGameRulesStore';
import { RotateCcw, Clock, Zap, Grid, RotateCw } from 'lucide-react';

export const GameRulesSettingsPanel: React.FC = () => {
  const rules = useGameRulesStore();

  const cardStyle: React.CSSProperties = {
    background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)',
    padding: '18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)',
    background: 'color-mix(in srgb, var(--color-primary-dark) 85%, transparent)',
    color: 'var(--color-surface)',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    outline: 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
            Modular Game Rules & Mechanics Configuration
          </h3>
          <p style={{ color: 'var(--color-surface)', opacity: 0.85, fontSize: '0.95rem', marginTop: '4px' }}>
            Customize round timers, question point steps, pass penalties, lockout durations, and score rules across all game modes.
          </p>
        </div>

        <button 
          onClick={rules.resetRules} 
          className="action-btn secondary" 
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'none', textShadow: 'none' }}
        >
          <RotateCcw size={16} /> Reset Default Rules
        </button>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
        {/* 1. Rapid Fire Round Rules */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Clock size={22} color="var(--color-primary)" />
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '1.05rem' }}>Rapid Fire Rules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.9, display: 'block', marginBottom: '4px' }}>
                Countdown Timer: <strong style={{ color: 'var(--color-accent)' }}>{rules.rapidFireDuration}s</strong>
              </label>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={rules.rapidFireDuration}
                onChange={(e) => rules.setRapidFireRules({ rapidFireDuration: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Correct Score</label>
                <input
                  type="number"
                  value={rules.rapidFireCorrectPoints}
                  onChange={(e) => rules.setRapidFireRules({ rapidFireCorrectPoints: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Pass Penalty</label>
                <input
                  type="number"
                  value={rules.rapidFirePassPenalty}
                  onChange={(e) => rules.setRapidFireRules({ rapidFirePassPenalty: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Max Questions Per Round</label>
              <input
                type="number"
                min="5"
                max="30"
                value={rules.rapidFireMaxQuestions}
                onChange={(e) => rules.setRapidFireRules({ rapidFireMaxQuestions: Math.max(5, parseInt(e.target.value) || 10) })}
                style={inputStyle}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-surface)', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={rules.rapidFireRevisitPassed}
                onChange={(e) => rules.setRapidFireRules({ rapidFireRevisitPassed: e.target.checked })}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              Allow revisiting passed questions
            </label>
          </div>
        </div>

        {/* 2. Spin Wheel Jeopardy Rules */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <RotateCw size={22} color="var(--color-action)" />
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '1.05rem' }}>Jeopardy Wheel Rules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block' }}>Tier Point Values (4 Levels)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { label: 'T1', key: 'swjTier1Points' },
                { label: 'T2', key: 'swjTier2Points' },
                { label: 'T3', key: 'swjTier3Points' },
                { label: 'T4', key: 'swjTier4Points' }
              ].map((tier) => (
                <div key={tier.label}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', display: 'block', textAlign: 'center', fontWeight: 'bold' }}>{tier.label}</span>
                  <input
                    type="number"
                    value={(rules as any)[tier.key]}
                    onChange={(e) => rules.setSwjRules({ [tier.key]: parseInt(e.target.value) || 0 })}
                    style={{ ...inputStyle, textAlign: 'center', padding: '6px 4px' }}
                  />
                </div>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Wrong Answer Penalty</label>
              <input
                type="number"
                value={rules.swjWrongPenalty}
                onChange={(e) => rules.setSwjRules({ swjWrongPenalty: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* 3. Buzzer Round Rules */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Zap size={22} color="var(--color-danger)" />
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '1.05rem' }}>Buzzer Round Rules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Question Points</label>
                <input
                  type="number"
                  value={rules.buzzerPoints}
                  onChange={(e) => rules.setBuzzerRules({ buzzerPoints: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Wrong Penalty</label>
                <input
                  type="number"
                  value={rules.buzzerWrongPenalty}
                  onChange={(e) => rules.setBuzzerRules({ buzzerWrongPenalty: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Tic Tac Toe & Global Gameplay Mechanics */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Grid size={22} color="var(--color-accent)" />
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '1.05rem' }}>Grid & Global Scoring</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>TTT Cell Points</label>
                <input
                  type="number"
                  value={rules.ticTacToePoints}
                  onChange={(e) => rules.setTicTacToeRules({ ticTacToePoints: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>Tie Points</label>
                <input
                  type="number"
                  value={rules.ticTacToeTiePoints}
                  onChange={(e) => rules.setTicTacToeRules({ ticTacToeTiePoints: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-surface)' }}>
              <input
                type="checkbox"
                checked={rules.autoAdvanceOnAward}
                onChange={(e) => rules.setGeneralRules({ autoAdvanceOnAward: e.target.checked })}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Auto-advance question on score award
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-surface)' }}>
              <input
                type="checkbox"
                checked={rules.allowNegativeScores}
                onChange={(e) => rules.setGeneralRules({ allowNegativeScores: e.target.checked })}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Allow negative team scores
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
