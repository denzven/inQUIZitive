import React, { useRef, useState } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { parseExcelData, exportProgressToExcel, exportQuestionBankToExcel } from '../../utils/excelParser';
import { 
  UploadCloud, 
  RotateCcw, 
  FileSpreadsheet, 
  Download, 
  Edit3, 
  AlertOctagon, 
  FileCheck, 
  CheckCircle2, 
  RefreshCw, 
  Dices, 
  Layers, 
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  Trash2
} from 'lucide-react';
import trialSheetUrl from '../../assets/trial_iQz_sheet.xlsx?url';

interface DatasetSettingsPanelProps {
  onOpenAudit: () => void;
  onAuditFile: (file: File) => void;
  onOpenEditor: () => void;
}

export const DatasetSettingsPanel: React.FC<DatasetSettingsPanelProps> = ({ onOpenAudit, onAuditFile, onOpenEditor }) => {
  const { seed, setSeed, questions, loadQuestions, resetAllQuestionsUsed, teams } = useQuizStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)',
    padding: '18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  // Format file size nicely
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please upload a valid Excel spreadsheet (.xlsx or .xls file).");
      return;
    }
    try {
      setUploadedFileName(file.name);
      setUploadedFileSize(formatFileSize(file.size));
      setLastUploadedFile(file);

      // Parse and load questions into global state
      const parsed = await parseExcelData(file, seed);
      loadQuestions(parsed);

      // Trigger pre-flight audit report modal
      onAuditFile(file);
    } catch (err) {
      alert("Failed to parse Excel file. Please ensure it follows the required format.");
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setLastUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateRandomSeed = () => {
    const randomSeed = Math.floor(10000000 + Math.random() * 90000000).toString();
    setSeed(randomSeed);
  };

  const handleExportProgress = async () => {
    try {
      await exportProgressToExcel(questions, teams);
      triggerExportNotice("Match Progress & Leaderboard exported (.xlsx)");
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportQuestionBank = async () => {
    try {
      await exportQuestionBankToExcel(questions);
      triggerExportNotice("Clean Question Bank exported (.xlsx)");
    } catch (err) {
      console.error(err);
    }
  };

  const triggerExportNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Round breakdown calculations
  const roundCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      const code = (q.roundCode || 'RF').toUpperCase();
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const usedCount = questions.filter(q => q.used).length;
  const imageCount = questions.filter(q => Boolean(q.image)).length;
  const isNoShuffle = String(seed).toUpperCase().trim() === 'NOSHUFFLE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast Export Notice */}
      {exportNotice && (
        <div style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-surface)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} color="var(--color-accent)" />
          {exportNotice}
        </div>
      )}

      {/* Title & Overview Header */}
      <div>
        <h3 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
          Dataset & Question Bank Management
        </h3>
        <p style={{ color: 'var(--color-surface)', opacity: 0.85, fontSize: '0.92rem', marginTop: '4px' }}>
          Upload custom Excel workbooks, run pre-flight audits, configure seed randomization, and export competition progress.
        </p>
      </div>

      {/* Top Section: Drag and Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: isDragging 
            ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)' 
            : uploadedFileName 
              ? 'color-mix(in srgb, var(--color-primary-container) 60%, transparent)' 
              : 'color-mix(in srgb, var(--color-primary-container) 40%, transparent)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: isDragging 
            ? '2px dashed var(--color-accent)' 
            : uploadedFileName 
              ? '2px solid var(--color-success)' 
              : '2px dashed color-mix(in srgb, var(--color-primary) 40%, transparent)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".xlsx, .xls" 
          style={{ display: 'none' }} 
        />

        {uploadedFileName ? (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                border: '1.5px solid var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCheck size={26} color="var(--color-success)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-surface)', wordBreak: 'break-all' }}>
                    {uploadedFileName}
                  </span>
                  {uploadedFileSize && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', color: 'var(--color-accent)', fontWeight: 800 }}>
                      {uploadedFileSize}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-surface)', opacity: 0.75, marginTop: '2px' }}>
                  {questions.length} questions loaded • {imageCount} media assets • Active Workbook
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => lastUploadedFile ? onAuditFile(lastUploadedFile) : onOpenAudit()}
                className="action-btn secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={16} /> Audit File
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="action-btn"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} /> Change File
              </button>
              <button
                onClick={handleClearUploadedFile}
                title="Restore default sample dataset"
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ cursor: 'pointer', width: '100%' }} onClick={() => fileInputRef.current?.click()}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
              border: '2px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--color-accent)'
            }}>
              <UploadCloud size={30} />
            </div>
            <h4 style={{ margin: 0, color: 'var(--color-surface)', fontSize: '1.15rem', fontWeight: 800 }}>
              Drop your Excel Question Sheet here, or <span style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>browse</span>
            </h4>
            <p style={{ margin: '6px 0 14px', fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75 }}>
              Supports standard <code style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '2px 6px', borderRadius: '4px' }}>.xlsx</code> and <code style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '2px 6px', borderRadius: '4px' }}>.xls</code> workbooks. Pre-flight audit runs automatically on upload.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
              <a
                href={trialSheetUrl}
                download="sample_inquizitive_questions.xlsx"
                className="action-btn secondary"
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '0.8rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  textDecoration: 'none',
                  borderRadius: '20px'
                }}
              >
                <FileSpreadsheet size={14} /> Download Sample Template (.xlsx)
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Statistics Dashboard & Round Breakdown */}
      <div style={{
        background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
        padding: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--color-accent)" />
            <span style={{ fontWeight: 800, color: 'var(--color-surface)', fontSize: '1.05rem' }}>
              Active Question Bank Breakdown
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-surface)', opacity: 0.8 }}>
            Total Questions: <strong style={{ color: 'var(--color-accent)' }}>{questions.length}</strong>
          </span>
        </div>

        {/* Counters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-surface)', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800 }}>Available Qs</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-success)' }}>
              {questions.length - usedCount}
            </div>
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-surface)', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800 }}>Used Qs</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-secondary)' }}>
              {usedCount}
            </div>
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-surface)', opacity: 0.7, textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ImageIcon size={12} /> Embedded Media
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#5DADE2' }}>
              {imageCount}
            </div>
          </div>
        </div>

        {/* Round Code Distribution Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.8, fontWeight: 800 }}>Rounds Breakdown:</span>
          {Object.entries(roundCounts).map(([code, count]) => (
            <span
              key={code}
              style={{
                fontSize: '0.78rem',
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-surface)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ color: 'var(--color-accent)' }}>{code}</span>
              <span style={{ opacity: 0.8 }}>({count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {/* Pre-Flight Audit Card */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <AlertOctagon size={22} color="var(--color-secondary)" />
              <span style={{ fontWeight: 800, color: 'var(--color-surface)' }}>Pre-Flight Excel Audit</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75, marginBottom: '14px' }}>
              Verify column headers, detect missing answers, unedited placeholders & typos before hosting.
            </p>
          </div>
          <button
            onClick={() => lastUploadedFile ? onAuditFile(lastUploadedFile) : onOpenAudit()}
            className="action-btn secondary"
            style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FileCheck size={16} /> Run Pre-Flight Audit
          </button>
        </div>

        {/* Live Question Bank Editor Card */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Edit3 size={22} color="var(--color-accent)" />
              <span style={{ fontWeight: 800, color: 'var(--color-surface)' }}>Question Bank Editor</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75, marginBottom: '14px' }}>
              Passcode-protected live question manager & media attachment studio.
            </p>
          </div>
          <button
            onClick={onOpenEditor}
            className="action-btn"
            style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--color-accent)', color: 'var(--color-primary-dark)' }}
          >
            <Edit3 size={16} /> Edit Question Bank
          </button>
        </div>

        {/* Dual Export Hub */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Download size={22} color="var(--color-success)" />
              <span style={{ fontWeight: 800, color: 'var(--color-surface)' }}>Export & Backup Hub</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75, marginBottom: '14px' }}>
              Download match leaderboards or backup your clean question bank to Excel.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleExportProgress}
              className="action-btn secondary"
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Download size={14} /> Match Backup (.xlsx)
            </button>
            <button
              onClick={handleExportQuestionBank}
              className="action-btn secondary"
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <FileText size={14} /> Question Bank (.xlsx)
            </button>
          </div>
        </div>

        {/* Sample Template & Instructions Card */}
        <div style={cardStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileSpreadsheet size={22} color="var(--color-primary)" />
              <span style={{ fontWeight: 800, color: 'var(--color-surface)' }}>Sample Template</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75, marginBottom: '14px' }}>
              Download pre-formatted Excel template with correct headers & instructions.
            </p>
          </div>
          <a
            href={trialSheetUrl}
            download="sample_inquizitive_questions.xlsx"
            className="action-btn"
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              boxShadow: 'none',
              textShadow: 'none'
            }}
          >
            <Download size={18} /> Download Template (.xlsx)
          </a>
        </div>
      </div>

      {/* Bottom Section: Seed Config & Quick Reset */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '4px' }}>
        {/* Seed Config Control */}
        <div style={{ background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 800, color: 'var(--color-accent)', fontSize: '0.95rem' }}>
              Randomization Seed Controller
            </label>

            {/* Mode Switch Pill */}
            <button
              onClick={() => setSeed(isNoShuffle ? '12342026' : 'NOSHUFFLE')}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isNoShuffle ? 'rgba(244, 162, 97, 0.2)' : 'rgba(42, 157, 143, 0.2)',
                color: isNoShuffle ? 'var(--color-secondary)' : 'var(--color-success)',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {isNoShuffle ? 'Sequential Mode' : 'Randomized Mode'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. 12342026 or NOSHUFFLE"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)',
                background: 'color-mix(in srgb, var(--color-primary-dark) 85%, transparent)',
                color: 'var(--color-surface)',
                fontWeight: 800,
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleGenerateRandomSeed}
              title="Generate new random seed key"
              className="action-btn"
              style={{
                padding: '10px 14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 800
              }}
            >
              <Dices size={18} /> Spin Seed
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-surface)', opacity: 0.7, marginTop: '8px', margin: '8px 0 0' }}>
            Type <code style={{ background: 'color-mix(in srgb, var(--color-primary-dark) 50%, transparent)', padding: '2px 4px', borderRadius: '4px' }}>NOSHUFFLE</code> to retain exact Excel sequence.
          </p>
        </div>

        {/* Quick Reset Tools */}
        <div style={{ background: 'color-mix(in srgb, var(--color-primary-container) 50%, transparent)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--color-accent)', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>
              Question Availability Reset
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-surface)', opacity: 0.75, margin: 0 }}>
              Reset used question indicators for a fresh round without re-uploading the file.
            </p>
          </div>
          <button
            onClick={() => {
              resetAllQuestionsUsed();
              triggerExportNotice("Question availability reset!");
            }}
            className="action-btn secondary"
            style={{ width: '100%', padding: '10px', marginTop: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} /> Reset All Questions to Available
          </button>
        </div>
      </div>
    </div>
  );
};
