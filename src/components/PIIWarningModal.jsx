import React from 'react';

export default function PIIWarningModal({ isOpen, warnings, onCancel, onConfirm }) {
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
        maxWidth: '550px',
        width: '100%',
        padding: '32px',
        border: '1px solid var(--color-risk-2)',
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
            background: 'var(--color-risk-2)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>!</span>
          <h2 style={{ fontSize: '24px', margin: 0 }}>PII Risk Warning</h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
          The uploaded dataset contains potential Personally Identifiable Information (PII) pattern matches (such as Korean mobile phone numbers). Review the matches below:
        </p>

        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {warnings.map((w, idx) => (
            <div key={idx} style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Conversation ID: {w.call_id}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                {w.pii.map((item, pidx) => (
                  <div key={pidx} style={{ color: 'var(--text-secondary)' }}>
                    Turn {item.sequence_no} ({item.speaker}):{' '}
                    <span style={{ color: 'var(--color-risk-2)', fontWeight: '500' }}>
                      {item.found}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.4' }}>
          By clicking <strong>Confirm & Upload</strong>, you acknowledge these PII warning elements will be committed to the datastore. Clicking <strong>Cancel</strong> cancels the ingestion.
        </p>

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
            onClick={onConfirm}
            style={{
              background: 'var(--accent-color)',
              padding: '10px 20px'
            }}
          >
            Confirm & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
