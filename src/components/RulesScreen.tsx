import React from 'react';
import { ScreenLayout } from './ScreenLayout';
import { useQuizStore } from '../store/useQuizStore';
import { Trophy, Clock, AlertTriangle, ListChecks } from 'lucide-react';

export const RulesScreen: React.FC = () => {
  const { setGameState } = useQuizStore();

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
      showSettingsButton={true}
      onSettingsClick={() => setGameState('SETTINGS')}
      hideTitle={true}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '900px', margin: 'auto', paddingTop: '80px', paddingBottom: '40px' }}>
        <h1 className="title animate-slide-down" style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '30px', textAlign: 'center' }}>
          Rules
        </h1>
        
        <div className="card animate-fade-in" style={{ padding: 'clamp(20px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <ListChecks size={40} color="var(--yellow)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ color: 'var(--yellow)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>General Rules</h3>
              <p style={{ color: 'var(--white)', fontSize: '1.2rem', margin: 0, lineHeight: '1.5' }}>
                Teams compete to score the highest points across multiple rounds. Any questions answered are marked as used and won't reappear.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <Clock size={40} color="var(--orange)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ color: 'var(--orange)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>Rapid Fire Round</h3>
              <p style={{ color: 'var(--white)', fontSize: '1.2rem', margin: 0, lineHeight: '1.5' }}>
                Answer 10 questions in 60 seconds. +10 points for each correct answer. Bonus points awarded for high accuracy!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <AlertTriangle size={40} color="var(--teal)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ color: 'var(--teal)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>Buzzer Round</h3>
              <p style={{ color: 'var(--white)', fontSize: '1.2rem', margin: 0, lineHeight: '1.5' }}>
                The fastest team to hit the buzzer gets to answer. Up to 20 questions are available per session. Standard buzzer rules apply!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <Trophy size={40} color="var(--correct-green)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ color: 'var(--correct-green)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>Winning</h3>
              <p style={{ color: 'var(--white)', fontSize: '1.2rem', margin: 0, lineHeight: '1.5' }}>
                Check the Leaderboard to see the current standings. The team with the highest total score wins the event!
              </p>
            </div>
          </div>

        </div>
      </div>
    </ScreenLayout>
  );
};
