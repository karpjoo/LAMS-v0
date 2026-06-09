import React, { useState, useEffect } from 'react';

export default function DeleteConfirmationModal({ isOpen, onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  
  const targetText = "DELETE ALL DATASET";

  useEffect(() => {
    setIsMatch(confirmText === targetText);
  }, [confirmText]);

  // Reset text when modal toggles
  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        border: '1px solid var(--color-toxic-present-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--color-toxic-present)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>⚠</span>
          <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--color-toxic-present)' }}>
            Irreversible Deletion Safety check
          </h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
          You are about to delete all conversations, annotations, llm verdicts, and gold standard labels. 
          <strong> This action cannot be undone.</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="confirm-delete-text" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Type <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>DELETE ALL DATASET</span> to confirm:
          </label>
          <input
            type="text"
            id="confirm-delete-text"
            placeholder="Type confirmation phrase here"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px 20px'
            }}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-button"
            onClick={onConfirm}
            disabled={!isMatch}
            style={{
              background: isMatch ? 'var(--color-toxic-present)' : 'var(--bg-hover)',
              color: isMatch ? 'white' : 'var(--text-muted)',
              border: isMatch ? 'none' : '1px solid var(--border-color)',
              padding: '10px 20px'
            }}
          >
            Confirm & Delete
          </button>
        </div>
      </div>
    </div>
  );
}
