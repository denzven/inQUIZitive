import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertOctagon, CheckCircle2, X, Sparkles, Edit3, Image, Search, ShieldCheck } from 'lucide-react';
import type { AuditResult } from '../utils/excelParser';

interface SpreadsheetAuditModalProps {
  isOpen: boolean;
  auditResult: AuditResult | null;
  onImportAutoFix: () => void;
  onImportAndEdit: () => void;
  onCancel: () => void;
}

export const SpreadsheetAuditModal: React.FC<SpreadsheetAuditModalProps> = ({
  isOpen,
  auditResult,
  onImportAutoFix,
  onImportAndEdit,
  onCancel
}) => {
  const [filterType, setFilterType] = useState<'all' | 'error' | 'placeholder' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !auditResult) return null;

  const {
    totalRows,
    validCount,
    errorCount,
    placeholderCount,
    warningCount,
    imageCount = 0,
    healthScore = 100,
    issues
  } = auditResult;

  // Filter issues by type and search query
  const filteredIssues = issues.filter(issue => {
    if (filterType === 'error' && issue.type !== 'error') return false;
    if (filterType === 'placeholder' && issue.type !== 'placeholder') return false;
    if (filterType === 'warning' && issue.type !== 'warning') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMsg = issue.message.toLowerCase().includes(q);
      const matchCategory = issue.category.toLowerCase().includes(q);
      const matchSnippet = issue.questionSnippet.toLowerCase().includes(q);
      const matchRow = `row ${issue.rowIndex}`.includes(q) || String(issue.rowIndex) === q;
      return matchMsg || matchCategory || matchSnippet || matchRow;
    }
    return true;
  });

  const getHealthBadgeStyle = (score: number) => {
    if (score >= 90) return { color: 'var(--color-success)', bg: 'rgba(46, 204, 113, 0.15)', border: 'rgba(46, 204, 113, 0.4)', text: 'Excellent' };
    if (score >= 70) return { color: 'var(--color-accent)', bg: 'rgba(233, 196, 106, 0.15)', border: 'rgba(233, 196, 106, 0.4)', text: 'Fair' };
    return { color: 'var(--color-danger)', bg: 'rgba(231, 76, 60, 0.15)', border: 'rgba(231, 76, 60, 0.4)', text: 'Needs Attention' };
  };

  const healthStyle = getHealthBadgeStyle(healthScore);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'MISSING_QUESTION':
      case 'MISSING_ANSWER':
      case 'INSUFFICIENT_OPTIONS':
      case 'DUPLICATE_OPTIONS':
        return { bg: 'rgba(231, 76, 60, 0.2)', border: 'var(--wrong-red)', text: 'var(--wrong-red)' };
      case 'UNEDITED_TEMPLATE_PLACEHOLDER':
        return { bg: 'rgba(155, 89, 182, 0.25)', border: '#9b59b6', text: '#e8daef' };
      case 'DUPLICATE_QUESTION':
      case 'INVALID_SCORE':
      case 'MISSING_ROUND_CODE':
      case 'MISSPELLED_ROUND_CODE':
      case 'NON_DEFAULT_ROUND_CODE':
        return { bg: 'rgba(244, 162, 97, 0.2)', border: 'var(--light-orange)', text: 'var(--yellow)' };
      default:
        return { bg: 'rgba(42, 157, 143, 0.2)', border: 'var(--teal)', text: 'var(--white)' };
    }
  };

  const getIssueTypeStyle = (type: string) => {
    switch (type) {
      case 'error':
        return { bg: 'var(--wrong-red)', text: 'var(--white)' };
      case 'placeholder':
        return { bg: '#9b59b6', text: 'var(--white)' };
      default:
        return { bg: 'var(--yellow)', text: 'var(--dark-green)' };
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div 
        className="modal-box animate-pop-in"
        style={{
          maxWidth: '860px',
          width: '95%',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-primary-dark)',
          border: '2px solid var(--color-primary)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onCancel}
          className="modal-close-btn"
          title="Close Audit Modal"
        >
          <X size={20} />
        </button>

        {/* Header & Health Score Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: errorCount > 0 ? 'rgba(231, 76, 60, 0.2)' : (warningCount > 0 ? 'rgba(244, 162, 97, 0.2)' : 'rgba(42, 157, 143, 0.2)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${errorCount > 0 ? 'var(--color-danger)' : (warningCount > 0 ? 'var(--color-secondary)' : 'var(--color-primary)')}`
            }}>
              {errorCount > 0 ? (
                <AlertOctagon size={30} color="var(--color-danger)" />
              ) : warningCount > 0 ? (
                <AlertTriangle size={30} color="var(--color-accent)" />
              ) : (
                <ShieldCheck size={30} color="var(--color-success)" />
              )}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--color-surface)', fontWeight: 800 }}>
                Spreadsheet Pre-Flight Audit
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: 'var(--color-secondary)' }}>
                Audited {totalRows} workbook rows • Extracted {imageCount} media asset{imageCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Health Score Pill Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: healthStyle.bg,
            border: `1.5px solid ${healthStyle.border}`,
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-surface)', opacity: 0.8, fontWeight: 'bold' }}>
                Health Score
              </div>
              <div style={{ fontSize: '0.78rem', color: healthStyle.color, fontWeight: 800 }}>
                {healthStyle.text}
              </div>
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: healthStyle.color,
              lineHeight: 1
            }}>
              {healthScore}%
            </div>
          </div>
        </div>

        {/* Interactive Metrics Grid (Click to Filter) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div 
            onClick={() => setFilterType('all')}
            style={{
              backgroundColor: filterType === 'all' ? 'rgba(42, 157, 143, 0.25)' : 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${filterType === 'all' ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>Total Rows</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-surface)' }}>{totalRows}</div>
          </div>

          <div 
            onClick={() => setFilterType('all')}
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(46, 204, 113, 0.3)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 'bold' }}>Valid Qs</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-success)' }}>{validCount}</div>
          </div>

          <div 
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(52, 152, 219, 0.3)'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#5DADE2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontWeight: 'bold' }}>
              <Image size={11} /> Images
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#5DADE2' }}>{imageCount}</div>
          </div>

          <div 
            onClick={() => setFilterType('error')}
            style={{
              backgroundColor: filterType === 'error' ? 'rgba(231, 76, 60, 0.25)' : 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1.5px solid ${errorCount > 0 ? 'var(--color-danger)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>Fatal Errors</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: errorCount > 0 ? 'var(--color-danger)' : 'var(--color-surface)' }}>{errorCount}</div>
          </div>

          <div 
            onClick={() => setFilterType('placeholder')}
            style={{
              backgroundColor: filterType === 'placeholder' ? 'rgba(155, 89, 182, 0.25)' : 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1.5px solid ${placeholderCount > 0 ? '#9b59b6' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#d7bde2', fontWeight: 'bold' }}>Placeholders</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: placeholderCount > 0 ? '#d7bde2' : 'var(--color-surface)' }}>{placeholderCount}</div>
          </div>

          <div 
            onClick={() => setFilterType('warning')}
            style={{
              backgroundColor: filterType === 'warning' ? 'rgba(244, 162, 97, 0.25)' : 'rgba(0,0,0,0.3)',
              padding: '10px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1.5px solid ${warningCount > 0 ? 'var(--color-secondary)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>Warnings</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: warningCount > 0 ? 'var(--color-secondary)' : 'var(--color-surface)' }}>{warningCount}</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by keyword, row, or category..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--color-surface)',
                fontSize: '0.85rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'all' ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)',
                color: filterType === 'all' ? 'var(--color-primary-dark)' : 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilterType('error')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'error' ? 'var(--color-danger)' : 'rgba(255,255,255,0.08)',
                color: filterType === 'error' ? '#fff' : 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Fatal ({errorCount})
            </button>
            <button
              onClick={() => setFilterType('placeholder')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'placeholder' ? '#9b59b6' : 'rgba(255,255,255,0.08)',
                color: filterType === 'placeholder' ? '#fff' : 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Placeholders ({placeholderCount})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'warning' ? 'var(--color-secondary)' : 'rgba(255,255,255,0.08)',
                color: filterType === 'warning' ? 'var(--color-primary-dark)' : 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Warnings ({warningCount})
            </button>
          </div>
        </div>

        {/* Issue List Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px',
          marginBottom: '20px',
          minHeight: '180px',
          maxHeight: '340px'
        }}>
          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle2 size={48} color="var(--color-success)" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: 0, color: 'var(--color-success)', fontSize: '1.3rem' }}>Pre-Flight Audit 100% Clean!</h3>
              <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--color-surface)', opacity: 0.8 }}>
                No formatting errors, unedited templates, or missing answer fields detected. Ready to host!
              </p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              No issues match current search query or filter selection.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredIssues.map((issue, idx) => {
                const style = getCategoryBadgeColor(issue.category);
                const tagStyle = getIssueTypeStyle(issue.type);
                const borderLeftColor = issue.type === 'error' ? 'var(--color-danger)' : issue.type === 'placeholder' ? '#9b59b6' : 'var(--color-secondary)';
                return (
                  <div key={idx} style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    borderLeft: `4px solid ${borderLeftColor}`,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: tagStyle.bg,
                          color: tagStyle.text,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          letterSpacing: '0.5px'
                        }}>
                          {issue.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-surface)' }}>
                          Row {issue.rowIndex}
                        </span>
                        <span style={{
                          fontSize: '0.73rem',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          color: style.text,
                          fontWeight: 'bold'
                        }}>
                          {issue.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontStyle: 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{issue.questionSnippet}"
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--color-surface)', opacity: 0.95, lineHeight: 1.4 }}>
                      {issue.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 18px',
              backgroundColor: 'transparent',
              color: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>

          <button
            onClick={onImportAndEdit}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 18px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            <Edit3 size={18} />
            Review in Question Bank
          </button>

          <button
            onClick={onImportAutoFix}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '12px 18px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary-dark)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            <Sparkles size={18} />
            Auto-Fix & Load ({validCount} Valid Qs)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
