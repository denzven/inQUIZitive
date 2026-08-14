import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertOctagon, CheckCircle2, FileCheck, X, Sparkles, Edit3 } from 'lucide-react';
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

  if (!isOpen || !auditResult) return null;

  const { totalRows, validCount, errorCount, placeholderCount, warningCount, issues } = auditResult;

  const filteredIssues = issues.filter(issue => {
    if (filterType === 'error') return issue.type === 'error';
    if (filterType === 'placeholder') return issue.type === 'placeholder';
    if (filterType === 'warning') return issue.type === 'warning';
    return true;
  });

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
          maxWidth: '820px',
          width: '95%',
          maxHeight: '90vh',
          backgroundColor: 'var(--dark-green)',
          border: '2px solid var(--teal)',
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
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--white)',
            opacity: 0.8,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: errorCount > 0 ? 'rgba(231, 76, 60, 0.2)' : placeholderCount > 0 ? 'rgba(155, 89, 182, 0.25)' : warningCount > 0 ? 'rgba(244, 162, 97, 0.2)' : 'rgba(46, 204, 113, 0.2)',
            border: `2px solid ${errorCount > 0 ? 'var(--wrong-red)' : placeholderCount > 0 ? '#9b59b6' : warningCount > 0 ? 'var(--yellow)' : 'var(--correct-green)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {errorCount > 0 ? (
              <AlertOctagon size={28} color="var(--wrong-red)" />
            ) : placeholderCount > 0 ? (
              <AlertTriangle size={28} color="#d7bde2" />
            ) : warningCount > 0 ? (
              <AlertTriangle size={28} color="var(--yellow)" />
            ) : (
              <FileCheck size={28} color="var(--correct-green)" />
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--yellow)' }}>
              Spreadsheet Pre-Flight Audit
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: 'var(--white)', opacity: 0.85 }}>
              Automatically audited {totalRows} spreadsheet rows for fatal errors, unedited templates & scores.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 6px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--teal)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--white)', opacity: 0.7 }}>Total Rows</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--white)' }}>{totalRows}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 6px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--correct-green)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--correct-green)' }}>Valid Qs</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--correct-green)' }}>{validCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 6px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${errorCount > 0 ? 'var(--wrong-red)' : 'var(--teal)'}` }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--wrong-red)' }}>Fatal Errors</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: errorCount > 0 ? 'var(--wrong-red)' : 'var(--white)' }}>{errorCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 6px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${placeholderCount > 0 ? '#9b59b6' : 'var(--teal)'}` }}>
            <div style={{ fontSize: '0.72rem', color: '#d7bde2' }}>Placeholders</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: placeholderCount > 0 ? '#d7bde2' : 'var(--white)' }}>{placeholderCount}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 6px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${warningCount > 0 ? 'var(--yellow)' : 'var(--teal)'}` }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--yellow)' }}>Warnings</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: warningCount > 0 ? 'var(--yellow)' : 'var(--white)' }}>{warningCount}</div>
          </div>
        </div>

        {/* Issue Filter Tabs */}
        {issues.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--white)', opacity: 0.8 }}>Filter Issues:</span>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'all' ? 'var(--yellow)' : 'var(--dark-teal)',
                color: filterType === 'all' ? 'var(--dark-green)' : 'var(--white)',
                border: '1px solid var(--teal)',
                cursor: 'pointer'
              }}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilterType('error')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'error' ? 'var(--wrong-red)' : 'var(--dark-teal)',
                color: 'var(--white)',
                border: '1px solid var(--wrong-red)',
                cursor: 'pointer'
              }}
            >
              Fatal Errors ({errorCount})
            </button>
            <button
              onClick={() => setFilterType('placeholder')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'placeholder' ? '#9b59b6' : 'var(--dark-teal)',
                color: 'var(--white)',
                border: '1px solid #9b59b6',
                cursor: 'pointer'
              }}
            >
              Placeholders ({placeholderCount})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: filterType === 'warning' ? 'var(--yellow)' : 'var(--dark-teal)',
                color: filterType === 'warning' ? 'var(--dark-green)' : 'var(--white)',
                border: '1px solid var(--yellow)',
                cursor: 'pointer'
              }}
            >
              Warnings ({warningCount})
            </button>
          </div>
        )}

        {/* Issue List Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'rgba(0,0,0,0.25)',
          borderRadius: '16px',
          border: '1px solid var(--teal)',
          padding: '12px',
          marginBottom: '20px',
          minHeight: '180px',
          maxHeight: '340px'
        }}>
          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle2 size={48} color="var(--correct-green)" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: 0, color: 'var(--correct-green)' }}>Pre-Flight Audit Clean!</h3>
              <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--white)', opacity: 0.8 }}>
                No formatting errors, unedited templates or missing fields detected. Ready to import cleanly.
              </p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--white)', opacity: 0.7 }}>
              No issues match the selected filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredIssues.map((issue, idx) => {
                const style = getCategoryBadgeColor(issue.category);
                const tagStyle = getIssueTypeStyle(issue.type);
                const borderLeftColor = issue.type === 'error' ? 'var(--wrong-red)' : issue.type === 'placeholder' ? '#9b59b6' : 'var(--yellow)';
                return (
                  <div key={idx} style={{
                    backgroundColor: 'var(--dark-teal)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    borderLeft: `4px solid ${borderLeftColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: tagStyle.bg,
                          color: tagStyle.text,
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {issue.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--white)' }}>
                          Row {issue.rowIndex}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
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
                      <span style={{ fontSize: '0.8rem', color: 'var(--yellow)', fontStyle: 'italic' }}>
                        "{issue.questionSnippet}"
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--white)', opacity: 0.95 }}>
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
              color: 'var(--white)',
              border: '2px solid var(--teal)',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancel Upload
          </button>

          <button
            onClick={onImportAndEdit}
            style={{
              flex: 1,
              padding: '12px 18px',
              backgroundColor: 'var(--teal)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Edit3 size={18} />
            Import & Edit in Question Bank
          </button>

          <button
            onClick={onImportAutoFix}
            style={{
              flex: 1,
              padding: '12px 18px',
              backgroundColor: 'var(--yellow)',
              color: 'var(--dark-green)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={18} />
            Import & Auto-Fix ({validCount} Valid Qs)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
