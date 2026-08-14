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

interface PrintableRulesDocumentProps {
  printMode: 'players' | 'host' | 'formal';
}

export const PrintableRulesDocument: React.FC<PrintableRulesDocumentProps> = ({ printMode }) => {
  const generalGuidelines = [
    { label: 'a', text: 'The quiz progresses through four stage rounds after qualifying screening.' },
    { label: 'b', text: 'Points will be entirely reset to zero at the start of new rounds following eliminations to ensure a levelled baseline for advancing teams.' },
    { label: 'c', text: 'Tie-Breakers will be conducted in case of a Tie (equal points to two or more teams at the end of the round before elimination), a tie-breaker question will be asked to each of the teams that are tied.' },
    { label: 'd', text: 'All decisions of the Quiz Master and the Organizing team will be final and binding.' },
    { label: 'e', text: 'Interruptions and doubts will not be entertained once the round starts, the participants must answer the question and then doubts will be clarified at the end of the round.' },
    { label: 'f', text: 'Tallying and Display of the points of the scoreboard will be finalized by the Quiz Master and the Organizing team.' },
    { label: 'g', text: 'Use of Electronic Devices such as Mobile Phones and Smartwatches and /or engaging in any Malpractice will lead to disqualification.' },
    { label: 'h', text: 'Calculators, pen/pencils and papers/pads will be provided by the Organizing team.' }
  ];

  const round1Rules = [
    { label: 'a', text: 'Format: Written offline paper-and-pen aptitude evaluation conducted on-site prior to live stage presentations.' },
    { label: 'b', text: 'Eligibility & Advancement: All registered competition teams participate. Top-scoring teams qualify to advance to the stage tournament.' },
    { label: 'c', text: 'Score Baseline Reset: Aptitude test scores determine stage qualifiers; points are reset to zero upon entering Round 2 to ensure a level playing field.' }
  ];

  const round2Rules = [
    { label: 'a', text: 'Time Limit: Each team faces 10 rapid-fire questions against a strict 60-second countdown clock.' },
    { label: 'b', text: 'Base Scoring: +10 points awarded for every correct answer. No negative marking for incorrect or skipped questions.' },
    { label: 'c', text: 'Accuracy Bonus Points: +10 Bonus Points awarded for scoring >5 correct answers (>50% accuracy); +20 Bonus Points awarded for a Perfect Score (100% accuracy on all 10 questions).' },
    { label: 'd', text: 'Stage Controls: The Quiz Master reserves the right to pause the countdown clock or apply a +5-second emergency time buffer under technical or stage disruptions.' }
  ];

  const round3Rules = [
    { label: 'a', text: 'Selection Mechanics: Teams take turns spinning the slot machine category reel to randomly select quiz topics and point values.' },
    { label: 'b', text: 'Option Selection: After category selection, multiple-choice options are presented on screen for the active team.' },
    { label: 'c', text: 'Variable Point Values: Point values range from 10 to 50 points per question based on difficulty and spin multipliers.' },
    { label: 'd', text: 'Question Retirement: Answered categories/questions are marked as used and retired for the remainder of the session.' }
  ];

  const round4Rules = [
    { label: 'a', text: 'Lockout Mechanics: Questions are read aloud to all active teams simultaneously. The first team to hit the buzzer locks out all rival teams.' },
    { label: 'b', text: 'Answering Window: The locked-in team has 5 seconds to announce their answer.' },
    { label: 'c', text: 'Scoring & Penalties: Correct answer awards full question points. Incorrect answer penalizes points from team score and re-opens buzzing to rival teams.' },
    { label: 'd', text: 'Early Buzzing: Buzzing prior to question completion is permitted at the team\'s own risk.' }
  ];

  const championshipRules = [
    { label: 'a', text: 'Real-Time Scoreboard: Live tournament standings update dynamically after each question and round.' },
    { label: 'b', text: 'Championship Victory: The team with the highest aggregate accumulated score at the end of the final round is crowned the inQUIZitive Champion.' },
    { label: 'c', text: 'Sudden-Death Tiebreaker: In case of an equal score tie after the final round, a sudden-death tiebreaker question will determine the champion.' }
  ];

  const tiebreakerRules = [
    { label: 'a', text: 'Usage & Trigger: Administered by the Quiz Master whenever a tie occurs between two or more teams before an elimination phase or for overall victory.' },
    { label: 'b', text: 'Grid Setup: A 3x3 interactive game board with grid positions numbered 1 through 9.' },
    { label: 'c', text: 'Turn-Based Duel: Tied teams alternate selecting grid positions. To claim a cell (X or O), the team must answer the corresponding question correctly.' },
    { label: 'd', text: 'Victory Condition: The first team to form a continuous line of 3 matching symbols (horizontally, vertically, or diagonally) wins the tie-breaker.' }
  ];

  const totalPages = printMode === 'formal' ? 3 : (printMode === 'players' ? 2 : 1);

  return createPortal(
    <div className="printable-rules-root">
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
            background-color: #264653 !important;
            background: #264653 !important;
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
            background-color: #264653 !important;
            color: #e8eddf !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            box-sizing: border-box !important;
          }
          .print-a4-page {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            padding: 12mm 14mm 12mm 14mm !important;
            background-color: #264653 !important;
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
            background-color: #1c695f !important;
            border-radius: 10px !important;
            padding: 12px 16px !important;
            margin-bottom: 10px !important;
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
            border-bottom: 2px solid #2a9d8f !important;
          }
          .print-footer-bar {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding-top: 8px !important;
            margin-top: auto !important;
            border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
            font-size: 0.8rem !important;
            color: #e9c46a !important;
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
          }
        }
      `}</style>

      {/* PAGE 1: PLAYER RULES PART 1 (General Guidelines, R1, R2) */}
      {(printMode === 'players' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Main Title Header for Page 1 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={QLogo} alt="Q" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f4a261', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: '#e9c46a', fontWeight: 'bold', fontSize: '1.05rem' }}>Official Competition Rules & Event Guide</span>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.85, backgroundColor: 'rgba(0,0,0,0.25)', padding: '3px 9px', borderRadius: '6px' }}>Part 1: General & Rounds 1-2</span>
            </div>

            {/* Section 1: General Competition Guidelines */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <ShieldCheck size={26} color="#e9c46a" />
                <h3 style={{ color: '#e9c46a', fontSize: '1.25rem', margin: 0, fontWeight: 900 }}>
                  1. General Competition Guidelines
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {generalGuidelines.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#e9c46a', color: '#264653' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Round 1 – Offline Aptitude Round */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <FileText size={26} color="#e9c46a" />
                <h3 style={{ color: '#e9c46a', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  2. Round 1: Offline Aptitude Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {round1Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#e9c46a', color: '#264653' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Round 2 – Rapid Fire Speed Round & Bonus Points */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Clock size={26} color="#f4a261" />
                <h3 style={{ color: '#f4a261', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  3. Round 2: Rapid Fire Speed Round & Bonus Points
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {round2Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#f4a261', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
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
            {/* Continuation Header for Page 2 */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={QLogo} alt="Q" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#f4a261', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: '#e9c46a', fontWeight: 'bold', fontSize: '0.98rem' }}>Stage Mechanics & Tournament Scoring</span>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.85, backgroundColor: 'rgba(0,0,0,0.25)', padding: '3px 9px', borderRadius: '6px' }}>Part 2: Rounds 3-4 & Tiebreaker</span>
            </div>

            {/* Section 4: Round 3 – Jeopardy & Spin Wheel */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <HelpCircle size={26} color="#2a9d8f" />
                <h3 style={{ color: '#2a9d8f', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  4. Round 3: Jeopardy & Spin Wheel
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {round3Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#2a9d8f', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Round 4 – Rapid Lockout Buzzer Round */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Bell size={26} color="#e74c3c" />
                <h3 style={{ color: '#e74c3c', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  5. Round 4: Rapid Lockout Buzzer Round
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {round4Rules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#e74c3c', color: '#ffffff' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Tournament Scoring & Victory */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Trophy size={26} color="#2ecc71" />
                <h3 style={{ color: '#2ecc71', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  6. Tournament Scoring & Championship Victory
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {championshipRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#2ecc71', color: '#264653' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Tie-Breaker Duel – Tic-Tac-Toe Grid */}
            <div className="print-card-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Grid size={26} color="#f4a261" />
                <h3 style={{ color: '#f4a261', fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>
                  7. Tie-Breaker Duel: Tic-Tac-Toe Grid
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tiebreakerRules.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="print-rule-badge" style={{ backgroundColor: '#f4a261', color: '#264653' }}>
                      {item.label}
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '0.92rem', lineHeight: '1.4' }}>
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

      {/* PAGE 3 (or PAGE 1 if host printMode): HOST GUIDE & SYSTEM OPERATING MANUAL */}
      {(printMode === 'host' || printMode === 'formal') && (
        <div className="print-a4-page">
          <div>
            {/* Header Banner for Host Guide */}
            <div className="print-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={QLogo} alt="Q" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#f4a261', letterSpacing: '1px' }}>INQUIZITIVE</span>
              </div>
              <span style={{ color: '#e9c46a', fontWeight: 'bold', fontSize: '1.05rem' }}>Host Operating Instructions & Technical Guide</span>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.85, backgroundColor: 'rgba(0,0,0,0.25)', padding: '3px 9px', borderRadius: '6px' }}>Host Event Manual</span>
            </div>

            <div className="print-card-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <EyeOff size={28} color="#e9c46a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: '#e9c46a', fontSize: '1.15rem', margin: '0 0 4px 0', fontWeight: 800 }}>
                  1. Stealth Mode & Single-Screen Broadcast
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
                  Designed for single shared screen presentation (where audience sees host display). Top action bars fade to near-invisible opacity (8%) in Stealth Mode for a clean TV game show appearance. Hover top corners to reveal host controls or press <strong>H</strong> to toggle Stealth Mode.
                </p>
              </div>
            </div>

            <div className="print-card-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <Keyboard size={28} color="#2a9d8f" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: '#2a9d8f', fontSize: '1.15rem', margin: '0 0 4px 0', fontWeight: 800 }}>
                  2. Keyboard Hotkeys & Emergency Protection
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
                  Control the entire event without touching a mouse on stage:
                </p>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: '#ffffff', fontSize: '0.9rem', lineHeight: '1.45' }}>
                  <li><strong>1 - 4</strong>: Quick select option A, B, C, D</li>
                  <li><strong>Space</strong>: Reveal answer or advance step</li>
                  <li><strong>Ctrl + Z / Cmd + Z</strong>: Instant Undo stack to revert accidental score edits</li>
                  <li><strong>+ / =</strong>: Inject +5s emergency time buffer during Rapid Fire countdown</li>
                  <li><strong>H</strong>: Toggle Stealth Presentation Mode on/off | <strong>Esc</strong>: Return to Home / Menu</li>
                </ul>
              </div>
            </div>

            <div className="print-card-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <FileSpreadsheet size={28} color="#f4a261" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: '#f4a261', fontSize: '1.15rem', margin: '0 0 4px 0', fontWeight: 800 }}>
                  3. Excel Ingestion & Pre-Flight Audit Engine
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
                  Upload custom <code>.xlsx</code> spreadsheets. The built-in Pre-Flight Audit Engine validates rows for missing options, duplicate questions, non-numeric scores, and unedited template placeholders. Use 1-click <strong>Auto-Fix</strong> or edit questions live in the Question Bank.
                </p>
              </div>
            </div>

            <div className="print-card-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <Printer size={28} color="#e76f51" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: '#e76f51', fontSize: '1.15rem', margin: '0 0 4px 0', fontWeight: 800 }}>
                  4. Host Cheat Sheet & Answer Key Printing
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
                  Generate a multi-page printable <strong>Host Cheat Sheet & Answer Key</strong> directly from the Question Bank Editor. Print to paper or export as PDF to view answer keys on a secondary phone or clipboard during the live show.
                </p>
              </div>
            </div>

            <div className="print-card-panel" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <WifiOff size={28} color="#2ecc71" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ color: '#2ecc71', fontSize: '1.15rem', margin: '0 0 4px 0', fontWeight: 800 }}>
                  5. Offline PWA & Procedural Audio Engine
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.92rem', margin: 0, lineHeight: '1.45' }}>
                  inQUIZitive is an offline-first Progressive Web App (PWA). All sound effects and background music are generated in real-time via the Web Audio API without requiring any external MP3 files or active internet connection.
                </p>
              </div>
            </div>
          </div>

          {/* Host Guide Running Print Footer */}
          <div className="print-footer-bar">
            <span>inQUIZitive — Host Event Manual & Operating Instructions</span>
            <span>Page {printMode === 'formal' ? '3 of 3' : '1 of 1'}</span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
