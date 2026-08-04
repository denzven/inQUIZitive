import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Home, Settings } from 'lucide-react';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundDecor?: React.ReactNode;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void;
  footerText?: React.ReactNode;
  hideTitle?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ 
  children, 
  backgroundDecor, 
  showHomeButton,
  onHomeClick,
  showSettingsButton,
  onSettingsClick,
  footerText,
  hideTitle
}) => {
  const { subtitle } = useQuizStore();

  return (
    <div className="projector-container animate-fade-in" style={{ justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
      
      {backgroundDecor}

      <div 
        className="animate-fade-in"
        style={{ 
          position: 'absolute', top: 'clamp(10px, 3vw, 50px)', left: 'clamp(10px, 3vw, 50px)', 
          display: 'flex', gap: '10px', zIndex: 10, animationDelay: '0.5s' 
        }}
      >
        {showHomeButton && onHomeClick && (
          <button 
            onClick={onHomeClick}
            style={{ 
              width: 'clamp(50px, 6vw, 80px)', height: 'clamp(50px, 6vw, 80px)', borderRadius: '15px', 
              padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="Home"
          >
            <Home style={{ width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)' }} color="var(--dark-green)" strokeWidth={1.5} />
          </button>
        )}

        {showSettingsButton && onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            style={{ 
              width: 'clamp(50px, 6vw, 80px)', height: 'clamp(50px, 6vw, 80px)', borderRadius: '15px', 
              padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="Settings"
          >
            <Settings style={{ width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)' }} color="var(--dark-green)" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Spacing from Top to avoid absolute positioned buttons */}
      <div style={{ height: 'clamp(20px, 5vh, 60px)', flexShrink: 0 }}></div>

      {/* Main Content Area: Centered Title + Children */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingBottom: 'clamp(5px, 2vh, 20px)', paddingTop: '5px', minHeight: 'min-content', flex: 1 }}>
          {!hideTitle && (
            <div className="animate-slide-up" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: 'clamp(1.2rem, min(5vw, 4vh), 2.5rem)', color: 'var(--white)', margin: 0, zIndex: 1 }}>{subtitle}</h2>
              <h1 className="title" style={{ marginTop: '0px', marginBottom: 'clamp(5px, 2vh, 20px)' }}><span>IN</span><span>QUIZ</span><span>ITIVE</span></h1>
            </div>
          )}
          
          {children}
        </div>
      </div>

      {footerText && (
        <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center', zIndex: 1, color: 'var(--white)', fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', opacity: 0.7, padding: '10px', boxSizing: 'border-box', animationDelay: '0.5s', flexShrink: 0 }}>
          {footerText}
        </div>
      )}
    </div>
  );
};
