import React, { useState } from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenLayout } from './ScreenLayout';
import { SpreadsheetAuditModal } from './SpreadsheetAuditModal';
import { QuestionBankEditor } from './QuestionBankEditor';
import { CustomColorPickerModal } from './CustomColorPickerModal';
import { ThemeBuilderModal } from './ThemeBuilderModal';
import { PasswordModal } from './PasswordModal';
import { DatasetSettingsPanel } from './settings/DatasetSettingsPanel';
import { ThemeSettingsPanel } from './settings/ThemeSettingsPanel';
import { AudioSettingsPanel } from './settings/AudioSettingsPanel';
import { GameRulesSettingsPanel } from './settings/GameRulesSettingsPanel';
import { auditExcelData, type AuditResult } from '../utils/excelParser';
import trialSheetUrl from '../assets/trial_iQz_sheet.xlsx?url';
import { FileSpreadsheet, Palette, Volume2, Sliders } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { setGameState, theme, setThemeColor, loadQuestions, seed } = useQuizStore();
  const [activeTab, setActiveTab] = useState<'dataset' | 'theme' | 'audio' | 'rules'>('dataset');

  // Modals state
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [activePickerToken, setActivePickerToken] = useState<{ label: string; key: keyof typeof theme } | null>(null);

  const handleOpenEditor = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setShowQuestionEditor(true);
  };

  const handleRunAudit = async () => {
    try {
      const resp = await fetch(trialSheetUrl);
      const arrayBuffer = await resp.arrayBuffer();
      const res = await auditExcelData(arrayBuffer, seed);
      setAuditResult(res);
      setShowAuditModal(true);
    } catch (err) {
      alert("Failed to run Excel audit.");
    }
  };

  const handleAuditForFile = async (file: File) => {
    try {
      const res = await auditExcelData(file, seed);
      setAuditResult(res);
      setShowAuditModal(true);
    } catch (err) {
      alert("Failed to run audit for uploaded file.");
      console.error(err);
    }
  };

  return (
    <ScreenLayout
      showHomeButton={true}
      onHomeClick={() => setGameState('MENU')}
    >
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ color: 'var(--color-surface)', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>Settings & Customization</h1>
          <p style={{ color: 'var(--color-accent)', margin: '6px 0 0 0', fontSize: '1rem' }}>
            Configure visual themes, question dataset management, soundboard audio, and competition game rules
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            background: 'color-mix(in srgb, var(--color-primary-container) 60%, transparent)',
            padding: '8px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
            flexWrap: 'wrap',
            boxShadow: 'none'
          }}
        >
          {[
            { id: 'dataset', label: 'Dataset & Questions', icon: <FileSpreadsheet size={18} /> },
            { id: 'theme', label: 'Themes & Aesthetics', icon: <Palette size={18} /> },
            { id: 'audio', label: 'Audio & Soundboard', icon: <Volume2 size={18} /> },
            { id: 'rules', label: 'Game Rules & Mechanics', icon: <Sliders size={18} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--color-accent)' : 'none',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-surface) 75%, transparent)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                  textShadow: 'none'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-Panel Body */}
        <div
          key={activeTab}
          className="animate-tab-content"
          style={{
            background: 'color-mix(in srgb, var(--color-primary-container) 45%, transparent)',
            backdropFilter: 'var(--backdrop-blur, blur(10px))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
            padding: '24px',
            boxShadow: 'none'
          }}
        >
          {activeTab === 'dataset' && (
            <DatasetSettingsPanel
              onOpenAudit={handleRunAudit}
              onAuditFile={handleAuditForFile}
              onOpenEditor={handleOpenEditor}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeSettingsPanel
              onOpenColorPicker={() => setActivePickerToken({ label: 'Primary Brand Color', key: 'primary' })}
              onOpenThemeBuilder={() => setShowThemeBuilder(true)}
            />
          )}

          {activeTab === 'audio' && <AudioSettingsPanel />}

          {activeTab === 'rules' && <GameRulesSettingsPanel />}
        </div>

        {/* Custom Theme Studio Modal */}
        <ThemeBuilderModal
          isOpen={showThemeBuilder}
          onClose={() => setShowThemeBuilder(false)}
        />

        {/* Password Modal */}
        {showPasswordModal && (
          <PasswordModal
            isOpen={showPasswordModal}
            onSuccess={handlePasswordSuccess}
            onClose={() => setShowPasswordModal(false)}
          />
        )}

        {/* Question Bank Editor Overlay */}
        {showQuestionEditor && (
          <div style={{ width: '100%', marginTop: '20px' }}>
            <QuestionBankEditor onClose={() => setShowQuestionEditor(false)} />
          </div>
        )}

        {/* Pre-Flight Audit Modal */}
        <SpreadsheetAuditModal
          isOpen={showAuditModal}
          auditResult={auditResult}
          onImportAutoFix={() => {
            if (auditResult) {
              loadQuestions(auditResult.cleanQuestions);
              alert(`Successfully imported & auto-fixed ${auditResult.cleanQuestions.length} questions!`);
            }
            setShowAuditModal(false);
          }}
          onImportAndEdit={() => {
            if (auditResult) {
              loadQuestions(auditResult.cleanQuestions);
            }
            setShowAuditModal(false);
            setShowQuestionEditor(true);
          }}
          onCancel={() => setShowAuditModal(false)}
        />

        {/* Color Picker Modal */}
        <CustomColorPickerModal
          isOpen={!!activePickerToken}
          tokenName={activePickerToken?.label || ''}
          colorKey={activePickerToken?.key || ''}
          currentColor={activePickerToken ? theme[activePickerToken.key] : '#000000'}
          onSave={(key, newHex) => setThemeColor(key as any, newHex)}
          onClose={() => setActivePickerToken(null)}
        />
      </div>
    </ScreenLayout>
  );
};
