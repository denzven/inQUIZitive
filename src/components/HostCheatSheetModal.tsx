import React from 'react';
import { createPortal } from 'react-dom';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { getRoundDefinition } from '../config/rounds';

interface HostCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostCheatSheetModal: React.FC<HostCheatSheetModalProps> = ({ isOpen, onClose }) => {
  const { questions, subtitle } = useQuizStore();

  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group questions by round code
  const questionsByRound = questions.reduce((acc, q) => {
    const round = q.roundCode || 'UNASSIGNED';
    if (!acc[round]) acc[round] = [];
    acc[round].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const getRoundLabel = (code: string) => {
    const def = getRoundDefinition(code);
    if (def) return `${def.title} (${def.subtitle})`;
    return `Round: ${code}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="modal-overlay">
      <div 
        className="modal-box animate-pop-in"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-primary-container)',
          color: 'var(--color-surface)',
          border: '2px solid var(--color-primary)',
          borderRadius: '20px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px color-mix(in srgb, var(--color-primary-dark) 50%, transparent)',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header Actions & Print CSS Rules */}
        <style>{`
          @media print {
            @page {
              size: auto;
              margin: 15mm 12mm 15mm 12mm;
            }
            html, body, #root {
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            #root > * {
              display: none !important;
            }
            .no-print {
              display: none !important;
            }
            .modal-overlay {
              position: static !important;
              background: #ffffff !important;
              padding: 0 !important;
              overflow: visible !important;
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              display: block !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
            .modal-box {
              position: static !important;
              border: none !important;
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              max-height: none !important;
              height: auto !important;
              padding: 0 !important;
              overflow: visible !important;
              background: #ffffff !important;
              color: #000000 !important;
              animation: none !important;
            }
            .cheat-sheet-round-block {
              page-break-inside: auto;
              break-inside: auto;
              margin-bottom: 25px !important;
            }
            .cheat-sheet-q-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 12px !important;
              border: 1px solid #ccc !important;
            }
          }
        `}</style>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} color="var(--color-primary)" />
            <h2 style={{ margin: 0, color: 'var(--color-surface)', fontSize: '1.8rem', fontWeight: 900 }}>
              Host Cheat Sheet & Answer Key
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-surface)',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
            >
              <Printer size={18} color="var(--color-surface)" /> Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'var(--color-surface)',
                border: 'none',
                width: '38px',
                height: '38px',
                minWidth: '38px',
                minHeight: '38px',
                maxWidth: '38px',
                maxHeight: '38px',
                padding: 0,
                margin: 0,
                borderRadius: '50%',
                aspectRatio: '1 / 1',
                boxSizing: 'border-box',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)'
              }}
              title="Close Modal"
            >
              <X size={20} strokeWidth={2.5} color="var(--color-surface)" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div style={{ fontFamily: 'inherit', lineHeight: 1.5 }}>
          <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)', paddingBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-surface)' }}>inQUIZitive Host Answer Key</h1>
            <p style={{ margin: '5px 0 0', color: 'var(--color-secondary)', fontSize: '1.1rem' }}>Event: {subtitle} | Total Questions: {questions.length}</p>
          </div>

          {Object.keys(questionsByRound).map((roundCode) => (
            <div key={roundCode} className="cheat-sheet-round-block" style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                backgroundColor: 'var(--color-primary-dark)', 
                color: 'var(--color-accent)', 
                padding: '8px 14px', 
                borderRadius: '6px', 
                margin: '0 0 15px', 
                fontSize: '1.2rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{getRoundLabel(roundCode)}</span>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{questionsByRound[roundCode].length} Questions</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questionsByRound[roundCode].map((q, idx) => (
                  <div 
                    key={q.index}
                    className="cheat-sheet-q-card"
                    style={{
                      border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      backgroundColor: 'color-mix(in srgb, var(--color-primary-container) 80%, transparent)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-action)' }}>Q{idx + 1}. Topic: {q.topic || 'General'}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', backgroundColor: 'color-mix(in srgb, var(--color-primary-dark) 40%, transparent)', padding: '2px 8px', borderRadius: '4px' }}>
                        Points: {q.scoreVal}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--color-surface)', fontSize: '1.05rem' }}>
                      {q.question}
                    </p>

                    {q.image && (
                      <div style={{ margin: '8px 0', textAlign: 'center' }}>
                        <img 
                          src={q.image} 
                          alt={`Q${idx + 1} Image`} 
                          style={{ maxHeight: '110px', maxWidth: '100%', borderRadius: '6px', border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)', objectFit: 'contain' }} 
                        />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.92rem' }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = opt === q.answer;
                        return (
                          <div 
                            key={oIdx}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: isCorrect ? 'color-mix(in srgb, var(--color-success) 20%, transparent)' : 'transparent',
                              border: isCorrect ? '1px solid var(--color-success)' : '1px solid color-mix(in srgb, var(--color-surface) 15%, transparent)',
                              fontWeight: isCorrect ? 'bold' : 'normal',
                              color: isCorrect ? 'var(--color-success)' : 'var(--color-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrect && <CheckCircle2 size={14} color="var(--color-success)" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
