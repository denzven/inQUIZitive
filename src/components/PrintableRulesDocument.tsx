import React from 'react';
import { createPortal } from 'react-dom';
import QLogo from '../assets/Q.png';
import { 
  Trophy, 
  Clock, 
  EyeOff, 
  Keyboard, 
  FileSpreadsheet, 
  Printer, 
  WifiOff, 
  HelpCircle,
  Grid,
  Bell,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  generalGuidelines,
  round1Rules,
  round2Rules,
  round3Rules,
  round4Rules,
  championshipRules,
  tiebreakerRules,
  hostGuideSections
} from '../data/rulesData';

export type PrintMode = 'players' | 'host' | 'formal';

interface PrintableRulesDocumentProps {
  printMode: PrintMode;
  isEcoPrint?: boolean;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'EyeOff': return EyeOff;
    case 'Keyboard': return Keyboard;
    case 'FileSpreadsheet': return FileSpreadsheet;
    case 'Trophy': return Trophy;
    case 'Printer': return Printer;
    case 'WifiOff': return WifiOff;
    default: return HelpCircle;
  }
};

export const PrintableRulesDocument: React.FC<PrintableRulesDocumentProps> = ({ 
  printMode,
  isEcoPrint = false
}) => {
  const totalPages = printMode === 'formal' ? 4 : 2;

  // Split Host Guide modules into Part 1 (Modules 1 & 2) and Part 2 (Modules 3 & 4)
  const hostPart1 = hostGuideSections.slice(0, 2);
  const hostPart2 = hostGuideSections.slice(2, 4);

  /** Helper component for Start-Screen Styled inQUIZitive Text Logo */
  const BrandedLogoText: React.FC = () => (
    <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '1.5px', display: 'block', lineHeight: 1 }}>
      <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)' }}>in</span>
      <span style={{ color: isEcoPrint ? '#b45309' : 'var(--yellow, #e9c46a)' }}>QUIZ</span>
      <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)' }}>itive</span>
    </div>
  );

  /** Helper component for Primary Background Q-Logo Circle */
  const PrimaryQBadge: React.FC<{ size?: number }> = ({ size = 38 }) => (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)',
      border: `2px solid ${isEcoPrint ? '#b45309' : 'var(--yellow, #e9c46a)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      flexShrink: 0
    }}>
      <img src={QLogo} alt="Q Logo" style={{ width: `${size * 0.65}px`, height: `${size * 0.65}px`, objectFit: 'contain' }} />
    </div>
  );

  return createPortal(
    <div className={`printable-rules-root ${isEcoPrint ? 'eco-print-mode' : ''}`} id="printable-rules-document-portal">
      <style>{`
        @media screen {
          .printable-rules-root {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            background-color: ${isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)'} !important;
            background: ${isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)'} !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #root {
            display: none !important;
          }
          .printable-rules-root {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            background-color: ${isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)'} !important;
            color: ${isEcoPrint ? '#0f172a' : 'var(--white, #ffffff)'} !important;
            font-family: 'League Spartan', system-ui, -apple-system, sans-serif !important;
            box-sizing: border-box !important;
          }
          .print-a4-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            padding: 12mm 14mm 12mm 14mm !important;
            background-color: ${isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)'} !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            position: relative !important;
          }
          .print-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
          .print-card-panel {
            background-color: ${isEcoPrint ? '#f8fafc' : 'var(--dark-teal, #1c695f)'} !important;
            border-radius: 10px !important;
            border: ${isEcoPrint ? '1px solid #e2e8f0' : 'none'} !important;
            border-left: 5px solid var(--teal, #2a9d8f) !important;
            padding: 12px 16px !important;
            margin-bottom: 12px !important;
            box-sizing: border-box !important;
          }
          .print-card-panel:last-child {
            margin-bottom: 0 !important;
          }
          .print-header-bar {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding-bottom: 10px !important;
            margin-bottom: 12px !important;
            border-bottom: 2px solid ${isEcoPrint ? '#cbd5e1' : 'var(--teal, #2a9d8f)'} !important;
          }
          .print-footer-bar {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding-top: 8px !important;
            margin-top: auto !important;
            border-top: 1px solid ${isEcoPrint ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'} !important;
            font-size: 0.8rem !important;
            color: ${isEcoPrint ? '#475569' : 'var(--light-orange, #f4a261)'} !important;
            font-weight: bold !important;
          }
          .print-rule-badge {
            border-radius: 50% !important;
            min-width: 22px !important;
            height: 22px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 0.82rem !important;
            font-weight: 900 !important;
            flex-shrink: 0 !important;
            margin-top: 1px !important;
            background-color: ${isEcoPrint ? '#0f172a' : 'var(--yellow, #e9c46a)'} !important;
            color: ${isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)'} !important;
          }
        }
      `}</style>

      {/* PAGE 1: PLAYER RULES PART 1 (General Guidelines, R1, R2) */}
      {(printMode === 'players' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Header Banner for Page 1 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PrimaryQBadge size={38} />
                <div>
                  <BrandedLogoText />
                  <span style={{ fontSize: '0.75rem', color: isEcoPrint ? '#475569' : 'var(--light-orange, #f4a261)', fontWeight: 'bold' }}>
                    Official Stage Competition Regulations
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: isEcoPrint ? '#0f172a' : 'var(--dark-green, #264653)', backgroundColor: isEcoPrint ? '#e2e8f0' : 'var(--yellow, #e9c46a)', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>
                  Part 1: General & Rounds 1–2
                </span>
              </div>
            </div>

            {/* Section 1: General Competition Guidelines */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#d97706' : 'var(--yellow, #e9c46a)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <ShieldCheck size={24} color={isEcoPrint ? '#d97706' : 'var(--yellow, #e9c46a)'} />
                <h3 style={{ color: isEcoPrint ? '#b45309' : 'var(--yellow, #e9c46a)', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  1. General Competition Guidelines
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {generalGuidelines.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge">{item.label}</span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Round 1 – Offline Aptitude Round */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <FileText size={24} color={isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)'} />
                <h3 style={{ color: isEcoPrint ? '#0f766e' : 'var(--teal, #2a9d8f)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  2. Round 1: Offline Aptitude Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {round1Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Round 2 – Rapid Fire Speed Round */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Clock size={24} color={isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)'} />
                <h3 style={{ color: isEcoPrint ? '#c2410c' : 'var(--light-orange, #f4a261)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  3. Round 2: Rapid Fire Speed Round & Bonus Points
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {round2Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)', color: isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page 1 Running Print Footer */}
          <div className="print-footer-bar">
            <span>inQUIZitive — Official Competition Guidelines & Stage Rules</span>
            <span>Page 1 of {totalPages}</span>
          </div>
        </div>
      )}

      {/* PAGE 2: PLAYER RULES PART 2 (Stage Mechanics, Round 3 & 4, Scoring, Tie-Breaker) */}
      {(printMode === 'players' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Header Banner for Page 2 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PrimaryQBadge size={34} />
                <div>
                  <BrandedLogoText />
                  <span style={{ fontSize: '0.72rem', color: isEcoPrint ? '#475569' : 'var(--light-orange, #f4a261)', fontWeight: 'bold' }}>
                    Stage Tournament Mechanics
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: isEcoPrint ? '#0f172a' : 'var(--dark-green, #264653)', backgroundColor: isEcoPrint ? '#e2e8f0' : 'var(--yellow, #e9c46a)', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>
                  Part 2: Rounds 3–4 & Tiebreaker
                </span>
              </div>
            </div>

            {/* Section 4: Round 3 – Jeopardy & Spin Wheel */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <HelpCircle size={24} color={isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)'} />
                <h3 style={{ color: isEcoPrint ? '#0f766e' : 'var(--teal, #2a9d8f)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  4. Round 3: Jeopardy & Spin Wheel Category Selection
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {round3Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#0d9488' : 'var(--teal, #2a9d8f)', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Round 4 – Rapid Lockout Buzzer Round */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#dc2626' : 'var(--orange, #e76f51)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Bell size={24} color={isEcoPrint ? '#dc2626' : 'var(--orange, #e76f51)'} />
                <h3 style={{ color: isEcoPrint ? '#b91c1c' : 'var(--orange, #e76f51)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  5. Round 4: Rapid Lockout Buzzer Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {round4Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#dc2626' : 'var(--orange, #e76f51)', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Tournament Scoring & Victory */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#16a34a' : 'var(--correct-green, #2ecc71)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Trophy size={24} color={isEcoPrint ? '#16a34a' : 'var(--correct-green, #2ecc71)'} />
                <h3 style={{ color: isEcoPrint ? '#15803d' : 'var(--correct-green, #2ecc71)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  6. Tournament Scoring & Championship Victory
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {championshipRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#16a34a' : 'var(--correct-green, #2ecc71)', color: isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Tie-Breaker Duel – Tic-Tac-Toe Grid */}
            <div className="print-card-panel" style={{ borderLeftColor: isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Grid size={24} color={isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)'} />
                <h3 style={{ color: isEcoPrint ? '#c2410c' : 'var(--light-orange, #f4a261)', fontSize: '1.15rem', margin: 0, fontWeight: 900 }}>
                  7. Sudden-Death Tie-Breaker: Tic-Tac-Toe Grid Duel
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {tiebreakerRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: isEcoPrint ? '#ea580c' : 'var(--light-orange, #f4a261)', color: isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)' }}>
                      {item.label}
                    </span>
                    <span style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.38' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page 2 Running Print Footer */}
          <div className="print-footer-bar">
            <span>inQUIZitive — Stage Mechanics & Sudden-Death Tiebreaker Duel</span>
            <span>Page 2 of {totalPages}</span>
          </div>
        </div>
      )}

      {/* HOST GUIDE PAGE 1 (PAGE 3 IN FORMAL MANUAL): BROADCAST ARCHITECTURE & HOTKEY MATRIX */}
      {(printMode === 'host' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Header Banner for Host Guide Part 1 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PrimaryQBadge size={38} />
                <div>
                  <BrandedLogoText />
                  <span style={{ fontSize: '0.75rem', color: isEcoPrint ? '#475569' : 'var(--light-orange, #f4a261)', fontWeight: 'bold' }}>
                    Host Technical Operating Manual
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: isEcoPrint ? '#0f172a' : 'var(--dark-green, #264653)', backgroundColor: isEcoPrint ? '#e2e8f0' : 'var(--yellow, #e9c46a)', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>
                  Host Guide Part 1: Broadcast & Hotkeys
                </span>
              </div>
            </div>

            {/* Render Modules 1 & 2 */}
            {hostPart1.map((section) => {
              const IconComp = getIconComponent(section.iconName);
              return (
                <div 
                  key={section.id} 
                  className="print-card-panel" 
                  style={{ borderLeftColor: section.borderColor || 'var(--teal, #2a9d8f)', marginBottom: '14px', padding: '14px 18px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComp size={24} color={section.color} />
                      <h3 style={{ color: isEcoPrint ? '#0f172a' : section.color, fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                        {section.number}. {section.title}
                      </h3>
                    </div>
                    {section.subtitle && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: isEcoPrint ? '#e2e8f0' : 'rgba(0,0,0,0.3)', color: isEcoPrint ? '#0f172a' : 'var(--yellow, #e9c46a)', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {section.subtitle}
                      </span>
                    )}
                  </div>
                  
                  {section.description && (
                    <p style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', margin: '0 0 10px 0', lineHeight: '1.45', opacity: 0.95 }}>
                      {section.description}
                    </p>
                  )}

                  {/* Module 2: Presenter Hotkeys Formatted Table */}
                  {section.gridShortcuts ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.86rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: isEcoPrint ? '#e2e8f0' : 'rgba(0, 0, 0, 0.4)', color: isEcoPrint ? '#0f172a' : 'var(--yellow, #e9c46a)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left', width: '32%', borderBottom: '1px solid #cbd5e1' }}>Shortcut</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Stage Function</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.gridShortcuts.map((sc, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 0 ? 'transparent' : (isEcoPrint ? '#f1f5f9' : 'rgba(0,0,0,0.15)') }}>
                            <td style={{ padding: '6px 10px', fontWeight: 'bold' }}>
                              <span style={{ backgroundColor: isEcoPrint ? '#0f172a' : 'var(--yellow, #e9c46a)', color: isEcoPrint ? '#ffffff' : 'var(--dark-green, #264653)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                {sc.key}
                              </span>
                            </td>
                            <td style={{ padding: '6px 10px', color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', opacity: 0.95, lineHeight: '1.35' }}>
                              {sc.label}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '20px', color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.45' }}>
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: '6px' }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Host Guide Part 1 Running Print Footer */}
          <div className="print-footer-bar">
            <span>inQUIZitive — Host Manual (Broadcast & Hotkeys)</span>
            <span>Page {printMode === 'formal' ? '3 of 4' : '1 of 2'}</span>
          </div>
        </div>
      )}

      {/* HOST GUIDE PAGE 2 (PAGE 4 IN FORMAL MANUAL): AUDIT ENGINE & STAGE OVERRIDES */}
      {(printMode === 'host' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Header Banner for Host Guide Part 2 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PrimaryQBadge size={38} />
                <div>
                  <BrandedLogoText />
                  <span style={{ fontSize: '0.75rem', color: isEcoPrint ? '#475569' : 'var(--light-orange, #f4a261)', fontWeight: 'bold' }}>
                    Host Technical Operating Manual
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: isEcoPrint ? '#0f172a' : 'var(--dark-green, #264653)', backgroundColor: isEcoPrint ? '#e2e8f0' : 'var(--yellow, #e9c46a)', padding: '4px 12px', borderRadius: '20px', fontWeight: 900 }}>
                  Host Guide Part 2: Audit & Overrides
                </span>
              </div>
            </div>

            {/* Render Modules 3 & 4 */}
            {hostPart2.map((section) => {
              const IconComp = getIconComponent(section.iconName);
              return (
                <div 
                  key={section.id} 
                  className="print-card-panel" 
                  style={{ borderLeftColor: section.borderColor || 'var(--teal, #2a9d8f)', marginBottom: '14px', padding: '14px 18px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComp size={24} color={section.color} />
                      <h3 style={{ color: isEcoPrint ? '#0f172a' : section.color, fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                        {section.number}. {section.title}
                      </h3>
                    </div>
                    {section.subtitle && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: isEcoPrint ? '#e2e8f0' : 'rgba(0,0,0,0.3)', color: isEcoPrint ? '#0f172a' : 'var(--yellow, #e9c46a)', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {section.subtitle}
                      </span>
                    )}
                  </div>
                  
                  {section.description && (
                    <p style={{ color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', margin: '0 0 10px 0', lineHeight: '1.45', opacity: 0.95 }}>
                      {section.description}
                    </p>
                  )}

                  <ul style={{ margin: 0, paddingLeft: '20px', color: isEcoPrint ? '#1e293b' : 'var(--white, #ffffff)', fontSize: '0.9rem', lineHeight: '1.45' }}>
                    {section.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: '8px' }}>{b}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Host Guide Part 2 Running Print Footer */}
          <div className="print-footer-bar">
            <span>inQUIZitive — Host Manual (Pre-Flight Audit & Stage Overrides)</span>
            <span>Page {printMode === 'formal' ? '4 of 4' : '2 of 2'}</span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
