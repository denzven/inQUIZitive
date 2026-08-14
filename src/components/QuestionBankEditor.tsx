import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuizStore, type Question } from '../store/useQuizStore';
import { PasswordModal } from './PasswordModal';
import { HostCheatSheetModal } from './HostCheatSheetModal';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X,
  HelpCircle,
  Printer
} from 'lucide-react';

interface QuestionBankEditorProps {
  onClose?: () => void;
}

export const QuestionBankEditor: React.FC<QuestionBankEditorProps> = ({ onClose }) => {
  const { 
    questions, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    resetAllQuestionsUsed 
  } = useQuizStore();

  // Authentication Lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(true);
  const [showCheatSheetModal, setShowCheatSheetModal] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'AVAILABLE' | 'USED'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingQuestionIndex, setDeletingQuestionIndex] = useState<number | null>(null);

  // Extract unique round codes dynamically
  const uniqueRounds = useMemo(() => {
    const rounds = new Set<string>();
    questions.forEach(q => {
      if (q.roundCode) rounds.add(q.roundCode);
    });
    return Array.from(rounds).sort();
  }, [questions]);

  // Filter questions dynamically
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        q.question.toLowerCase().includes(query) ||
        q.topic.toLowerCase().includes(query) ||
        q.roundCode.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.options.some(opt => opt.toLowerCase().includes(query));

      // Round filter
      const matchesRound = selectedRound === 'ALL' || q.roundCode === selectedRound;

      // Status filter
      const matchesStatus = selectedStatus === 'ALL' || 
        (selectedStatus === 'AVAILABLE' && !q.used) ||
        (selectedStatus === 'USED' && q.used);

      return matchesSearch && matchesRound && matchesStatus;
    });
  }, [questions, searchQuery, selectedRound, selectedStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Reset page when filters change
  const handleFilterChange = (setter: any, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  // If locked, render Password Prompt overlay
  if (!isUnlocked) {
    return (
      <div style={{
        backgroundColor: 'var(--dark-green)',
        borderRadius: '20px',
        border: '2px solid var(--teal)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--white)',
        margin: '20px 0'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: 'rgba(233, 196, 106, 0.15)',
          border: '2px solid var(--yellow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Lock size={36} color="var(--yellow)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--yellow)', margin: '0 0 10px' }}>
          Question Bank Protected
        </h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 24px', fontSize: '0.95rem', opacity: 0.9 }}>
          Access to browse, search, and edit questions is bound behind quizmaster passcode protection.
        </p>
        <button 
          onClick={() => setShowPasswordModal(true)}
          style={{
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: 'var(--yellow)',
            color: 'var(--dark-green)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Unlock size={20} />
          Enter Passcode to Access
        </button>

        <PasswordModal 
          isOpen={showPasswordModal}
          onSuccess={() => {
            setIsUnlocked(true);
            setShowPasswordModal(false);
          }}
          onClose={() => {
            setShowPasswordModal(false);
            if (onClose) onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--dark-green)',
      borderRadius: '24px',
      border: '2px solid var(--teal)',
      padding: '24px',
      color: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '10px',
            backgroundColor: 'var(--dark-teal)',
            borderRadius: '12px',
            border: '1px solid var(--teal)'
          }}>
            <HelpCircle size={24} color="var(--yellow)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--yellow)' }}>In-App Question Bank Editor</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
              Browse, search, edit, add new questions, or fix typos directly in place.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowCheatSheetModal(true)}
            title="Generate printable host cheat sheet and answer key"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--yellow)',
              color: 'var(--dark-green)',
              fontWeight: 900,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.95rem'
            }}
          >
            <Printer size={18} strokeWidth={2.5} />
            Print Cheat Sheet
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--correct-green)',
              color: 'var(--dark-green)',
              fontWeight: 900,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.95rem'
            }}
          >
            <Plus size={18} strokeWidth={3} />
            Add Question
          </button>

          <button 
            onClick={() => resetAllQuestionsUsed()}
            title="Reset used status for all questions"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--orange)',
              color: 'var(--white)',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <RotateCcw size={16} />
            Reset Used
          </button>

          <button 
            onClick={() => setIsUnlocked(false)}
            title="Lock Editor"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--dark-teal)',
              color: 'var(--yellow)',
              borderRadius: '10px',
              border: '1px solid var(--teal)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <Lock size={16} />
            Lock
          </button>

          {onClose && (
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--white)',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        backgroundColor: 'var(--dark-teal)',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid var(--teal)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--teal)' }} />
          <input 
            type="text"
            placeholder="Search questions, topics, answers, options..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '10px',
              border: '1px solid var(--teal)',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Round Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--yellow)" />
          <select 
            value={selectedRound}
            onChange={(e) => handleFilterChange(setSelectedRound, e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--teal)',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Rounds ({questions.length})</option>
            {uniqueRounds.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select 
            value={selectedStatus}
            onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--teal)',
              backgroundColor: 'var(--white)',
              color: 'var(--dark-green)',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="USED">Used Only</option>
          </select>
        </div>
      </div>

      {/* Stats Counter Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', opacity: 0.9 }}>
        <div>
          Showing <strong>{paginatedQuestions.length}</strong> of <strong>{filteredQuestions.length}</strong> questions (Total: {questions.length})
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem' }}>Page size:</span>
          {[10, 25, 50].map(sz => (
            <button 
              key={sz}
              onClick={() => { setPageSize(sz); setCurrentPage(1); }}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: pageSize === sz ? 'var(--yellow)' : 'var(--dark-teal)',
                color: pageSize === sz ? 'var(--dark-green)' : 'var(--white)',
                border: '1px solid var(--teal)',
                cursor: 'pointer'
              }}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paginatedQuestions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '16px',
            border: '1px dashed var(--teal)'
          }}>
            <HelpCircle size={40} color="var(--yellow)" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: 0, color: 'var(--yellow)' }}>No Questions Found</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
              Try adjusting your search query or round filters.
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q) => {
            const incorrectOptions = q.options.filter(o => o !== q.answer);
            return (
              <div 
                key={q.index}
                style={{
                  backgroundColor: 'var(--dark-teal)',
                  borderRadius: '16px',
                  border: `2px solid ${q.used ? 'rgba(255,255,255,0.15)' : 'var(--teal)'}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  opacity: q.used ? 0.75 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Card Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: 'var(--dark-green)',
                      color: 'var(--yellow)',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      border: '1px solid var(--teal)'
                    }}>
                      #{q.index + 1}
                    </span>

                    <span style={{
                      backgroundColor: 'var(--yellow)',
                      color: 'var(--dark-green)',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}>
                      {q.roundCode || 'General'}
                    </span>

                    {q.topic && (
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'var(--white)',
                        fontSize: '0.8rem',
                        padding: '2px 8px',
                        borderRadius: '8px'
                      }}>
                        {q.topic}
                      </span>
                    )}

                    <span style={{
                      backgroundColor: 'rgba(42, 157, 143, 0.3)',
                      color: 'var(--white)',
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      {q.scoreVal} pts
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuestion(q.index, { used: !q.used })}
                      title={q.used ? "Mark as Available" : "Mark as Used"}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: q.used ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                        color: q.used ? 'var(--wrong-red)' : 'var(--correct-green)',
                        border: `1px solid ${q.used ? 'var(--wrong-red)' : 'var(--correct-green)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {q.used ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      {q.used ? 'Used' : 'Available'}
                    </button>

                    <button
                      onClick={() => setEditingQuestion(q)}
                      title="Edit Question"
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--yellow)',
                        color: 'var(--dark-green)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => setDeletingQuestionIndex(q.index)}
                      title="Delete Question"
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--wrong-red)',
                        color: 'var(--white)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--white)', lineHeight: 1.35 }}>
                  {q.question}
                </div>

                {/* Options Breakdown Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '10px 12px',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--correct-green)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span><strong>Ans:</strong> {q.answer}</span>
                  </div>
                  {incorrectOptions.map((opt, oIdx) => (
                    <div key={oIdx} style={{ fontSize: '0.88rem', opacity: 0.85, color: 'var(--white)' }}>
                      • {opt}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--dark-teal)',
              color: 'var(--white)',
              border: '1px solid var(--teal)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--yellow)' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--dark-teal)',
              color: 'var(--white)',
              border: '1px solid var(--teal)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Add Question Modal Form */}
      {isAddModalOpen && (
        <QuestionFormModal 
          isOpen={true}
          title="Add New Question"
          onSave={(newQ) => {
            addQuestion(newQ);
            setIsAddModalOpen(false);
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Question Modal Form */}
      {editingQuestion && (
        <QuestionFormModal 
          isOpen={true}
          title={`Edit Question #${editingQuestion.index + 1}`}
          initialData={editingQuestion}
          onSave={(updatedQ) => {
            updateQuestion(editingQuestion.index, updatedQ);
            setEditingQuestion(null);
          }}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuestionIndex !== null && createPortal(
        <div className="modal-overlay">
          <div className="modal-box animate-pop-in" style={{ backgroundColor: 'var(--dark-green)', border: '2px solid var(--wrong-red)', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--wrong-red)' }}>Delete Question #{deletingQuestionIndex + 1}?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--white)', opacity: 0.9 }}>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setDeletingQuestionIndex(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--dark-teal)', color: 'var(--white)', border: '1px solid var(--teal)', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteQuestion(deletingQuestionIndex);
                  setDeletingQuestionIndex(null);
                }}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--wrong-red)', color: 'var(--white)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Delete Q#{deletingQuestionIndex + 1}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Host Cheat Sheet Printable Modal */}
      <HostCheatSheetModal 
        isOpen={showCheatSheetModal}
        onClose={() => setShowCheatSheetModal(false)}
      />
    </div>
  );
};

interface QuestionFormModalProps {
  isOpen: boolean;
  title: string;
  initialData?: Question;
  onSave: (data: Omit<Question, 'index'>) => void;
  onClose: () => void;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  title,
  initialData,
  onSave,
  onClose
}) => {
  const incorrectOptions = initialData ? initialData.options.filter(o => o !== initialData.answer) : [];

  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [opt2, setOpt2] = useState(incorrectOptions[0] || '');
  const [opt3, setOpt3] = useState(incorrectOptions[1] || '');
  const [opt4, setOpt4] = useState(incorrectOptions[2] || '');
  const [roundCode, setRoundCode] = useState(initialData?.roundCode || 'General');
  const [topic, setTopic] = useState(initialData?.topic || 'General');
  const [scoreVal, setScoreVal] = useState(initialData?.scoreVal || 10);
  const [used, setUsed] = useState(initialData?.used || false);

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }
    if (!answer.trim()) {
      setErrorMsg('Correct Answer is required.');
      return;
    }
    if (!opt2.trim() && !opt3.trim() && !opt4.trim()) {
      setErrorMsg('At least one distractor option (Option 2) is required.');
      return;
    }

    // Build raw options array with answer first
    const rawOptions = [answer.trim(), opt2.trim(), opt3.trim(), opt4.trim()].filter(Boolean);
    const unique = Array.from(new Set(rawOptions.map(o => o.toLowerCase())));

    if (unique.length < rawOptions.length) {
      setErrorMsg('Duplicate options detected. Please ensure all options are distinct.');
      return;
    }

    onSave({
      question: question.trim(),
      answer: answer.trim(),
      options: rawOptions,
      roundCode: roundCode.trim() || 'General',
      topic: topic.trim() || 'General',
      scoreVal: Number(scoreVal) || 10,
      used
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--teal)',
    backgroundColor: 'var(--white)',
    color: 'var(--dark-green)',
    fontWeight: 'bold' as const,
    fontSize: '0.95rem',
    boxSizing: 'border-box' as const
  };

  return createPortal(
    <div className="modal-overlay">
      <div 
        className="modal-box animate-pop-in"
        style={{
          maxWidth: '650px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--dark-green)',
          border: '2px solid var(--yellow)',
          borderRadius: '20px',
          padding: '24px',
          color: 'var(--white)',
          margin: '0',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: 'var(--yellow)', fontSize: '1.5rem' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
              Question Text *
            </label>
            <textarea 
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the quiz question..."
              required
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px', color: 'var(--correct-green)' }}>
                Correct Answer *
              </label>
              <input 
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Correct option"
                required
                style={{ ...inputStyle, border: '2px solid var(--correct-green)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Option 2 (Distractor) *
              </label>
              <input 
                type="text"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                placeholder="Incorrect option 1"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Option 3 (Distractor)
              </label>
              <input 
                type="text"
                value={opt3}
                onChange={(e) => setOpt3(e.target.value)}
                placeholder="Incorrect option 2 (optional)"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Option 4 (Distractor)
              </label>
              <input 
                type="text"
                value={opt4}
                onChange={(e) => setOpt4(e.target.value)}
                placeholder="Incorrect option 3 (optional)"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Round Code
              </label>
              <input 
                type="text"
                value={roundCode}
                onChange={(e) => setRoundCode(e.target.value)}
                placeholder="e.g. RF, SWJ, TTT, B"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Topic
              </label>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Science, Tech"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                Score Value (pts)
              </label>
              <input 
                type="number"
                value={scoreVal}
                onChange={(e) => setScoreVal(Number(e.target.value))}
                min={1}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <input 
              type="checkbox"
              id="usedCheckbox"
              checked={used}
              onChange={(e) => setUsed(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="usedCheckbox" style={{ fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--white)' }}>
              Mark question as already used / played
            </label>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--wrong-red)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: '8px', borderRadius: '8px', border: '1px solid var(--wrong-red)' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', backgroundColor: 'var(--dark-teal)', color: 'var(--white)', border: '1px solid var(--teal)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ flex: 1, padding: '12px', backgroundColor: 'var(--yellow)', color: 'var(--dark-green)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
