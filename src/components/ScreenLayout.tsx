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
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [children]);

  return (
    <div className="projector-container animate-fade-in" style={{ justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
      
      {backgroundDecor}

      {/* Top Left Action Buttons (Home / Settings) */}
      <div 
        className="animate-fade-in"
        style={{ 
          position: 'absolute', 
          top: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-top, 0px))', 
          left: 'max(clamp(12px, 2.5vw, 25px), env(safe-area-inset-left, 0px))', 
          display: 'flex', 
          gap: '10px', 
          zIndex: 20, 
          animationDelay: '0.5s' 
        }}
      >
        {showHomeButton && onHomeClick && (
          <button 
            onClick={onHomeClick}
            style={{ 
              width: 'clamp(44px, 5vw, 65px)', 
              height: 'clamp(44px, 5vw, 65px)', 
              borderRadius: '15px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
            aria-label="Home"
          >
            <Home style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--dark-green)" strokeWidth={1.5} />
          </button>
        )}

        {showSettingsButton && onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            style={{ 
              width: 'clamp(44px, 5vw, 65px)', 
              height: 'clamp(44px, 5vw, 65px)', 
              borderRadius: '15px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
            aria-label="Settings"
          >
            <Settings style={{ width: 'clamp(20px, 2.5vw, 32px)', height: 'clamp(20px, 2.5vw, 32px)' }} color="var(--dark-green)" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Main Content Area: Centered Title + Children with safe top padding & zero scroll clipping */}
      <div 
        ref={scrollRef} 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%', 
          minHeight: 0, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          boxSizing: 'border-box',
          paddingTop: 'max(clamp(50px, 7vh, 80px), calc(env(safe-area-inset-top, 0px) + 45px))',
          paddingBottom: 'max(clamp(15px, 2vh, 25px), env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(clamp(10px, 2.5vw, 25px), env(safe-area-inset-left, 0px))',
          paddingRight: 'max(clamp(10px, 2.5vw, 25px), env(safe-area-inset-right, 0px))'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            width: '100%', 
            height: '100%',
            minHeight: '100%',
            flex: 1,
            boxSizing: 'border-box' 
          }}
        >
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
