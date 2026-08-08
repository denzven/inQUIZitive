import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { useQuizStore } from '../store/useQuizStore';

interface PasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  title = "Quizmaster Passcode",
  subtitle = "Questions are bound behind password protection to prevent audience preview."
}) => {
  const { adminPasscode, setAdminPasscode } = useQuizStore();
  const [inputPasscode, setInputPasscode] = useState('');
  const [filePasscode, setFilePasscode] = useState<string>('ARISE2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [changeMsg, setChangeMsg] = useState({ text: '', isError: false });

  // Fetch passcode from public/admin_passcode.txt on mount/open
  useEffect(() => {
    if (!isOpen) return;
    const loadPasscodeFromFile = async () => {
      try {
        const response = await fetch('/admin_passcode.txt');
        if (response.ok) {
          const text = await response.text();
          const trimmed = text.trim();
          if (trimmed) {
            setFilePasscode(trimmed);
          }
        }
      } catch (err) {
        console.warn('Could not fetch admin_passcode.txt, using store default:', err);
      }
    };
    loadPasscodeFromFile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputPasscode.trim();
    const isCorrect = 
      cleanInput === adminPasscode || 
      cleanInput === 'ARISE2026' || 
      cleanInput === filePasscode;

    if (isCorrect) {
      setErrorMsg('');
      setInputPasscode('');
      onSuccess();
    } else {
      setErrorMsg('Incorrect passcode. Access denied.');
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOld = oldPasscode.trim();
    const isOldCorrect = 
      cleanOld === adminPasscode || 
      cleanOld === 'ARISE2026' || 
      cleanOld === filePasscode;

    if (!isOldCorrect) {
      setChangeMsg({ text: 'Current passcode is incorrect.', isError: true });
      return;
    }
    if (!newPasscode || newPasscode.length < 3) {
      setChangeMsg({ text: 'New passcode must be at least 3 characters.', isError: true });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setChangeMsg({ text: 'New passcodes do not match.', isError: true });
      return;
    }

    setAdminPasscode(newPasscode.trim());
    setChangeMsg({ text: 'Passcode updated successfully!', isError: false });
    setTimeout(() => {
      setIsChangingPasscode(false);
      setOldPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setChangeMsg({ text: '', isError: false });
    }, 1500);
  };

  return createPortal(
    <div className="modal-overlay">
      <div 
        className="modal-box animate-pop-in" 
        style={{ 
          maxWidth: '460px', 
          width: '90%', 
          backgroundColor: 'var(--dark-green)', 
          border: '2px solid var(--teal)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          padding: '28px 24px',
          borderRadius: '20px',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--white)',
            opacity: 0.7,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(233, 196, 106, 0.15)',
            border: '2px solid var(--yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Lock size={30} color="var(--yellow)" />
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', color: 'var(--yellow)' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--white)', opacity: 0.85 }}>{subtitle}</p>
        </div>

        {!isChangingPasscode ? (
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Passcode (default: 1234)"
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  border: `2px solid ${errorMsg ? 'var(--wrong-red)' : 'var(--teal)'}`,
                  backgroundColor: 'var(--white)',
                  color: 'var(--dark-green)',
                  fontWeight: 'bold',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--dark-green)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errorMsg && (
              <div style={{ 
                color: 'var(--wrong-red)', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--wrong-red)'
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button 
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'var(--dark-teal)',
                  color: 'var(--white)',
                  border: '1px solid var(--teal)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>

              <button 
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={18} />
                Unlock
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsChangingPasscode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--teal)',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Change Passcode
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePasscode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--white)', textAlign: 'center' }}>Change Passcode</h4>

            <input 
              type="password"
              placeholder="Current Passcode"
              value={oldPasscode}
              onChange={(e) => setOldPasscode(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--teal)',
                backgroundColor: 'var(--white)',
                color: 'var(--dark-green)',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
            />

            <input 
              type="password"
              placeholder="New Passcode"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--teal)',
                backgroundColor: 'var(--white)',
                color: 'var(--dark-green)',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
            />

            <input 
              type="password"
              placeholder="Confirm New Passcode"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--teal)',
                backgroundColor: 'var(--white)',
                color: 'var(--dark-green)',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
            />

            {changeMsg.text && (
              <div style={{ 
                color: changeMsg.isError ? 'var(--wrong-red)' : 'var(--correct-green)', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: changeMsg.isError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)'
              }}>
                {changeMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsChangingPasscode(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--dark-teal)',
                  color: 'var(--white)',
                  border: '1px solid var(--teal)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>

              <button 
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--yellow)',
                  color: 'var(--dark-green)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save New Passcode
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
