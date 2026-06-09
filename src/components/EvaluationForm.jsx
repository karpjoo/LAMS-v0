import React, { useState, useEffect } from 'react';
import { validateEvaluationForm } from '../utils/formValidator';

const CATEGORIES = [
  { id: 1, label: '폭언/욕설 (Abusive / Insult)' },
  { id: 2, label: '성희롱 (Sexual Harassment)' },
  { id: 3, label: '위협 (Threat)' },
  { id: 4, label: '차별/비하 (Hate Speech)' },
  { id: 5, label: '개인정보 노출 (PII Exposure)' },
  { id: 6, label: '불법/유해 정보 (Illegal / Harmful)' },
  { id: 7, label: '기타유해 (Other Harmful)' }
];

export default function EvaluationForm({ selectedCallId, initialData, onSubmit, disabled: forceDisabled }) {
  const [toxicity, setToxicity] = useState('Absent');
  const [categoryId, setCategoryId] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [evidence1, setEvidence1] = useState('');
  const [evidence2, setEvidence2] = useState('');
  const [evidence3, setEvidence3] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Load initialData when selection shifts or data updates
  useEffect(() => {
    if (initialData) {
      setToxicity(initialData.toxicity || 'Absent');
      setCategoryId(initialData.category_id || null);
      setRiskLevel(initialData.risk_level || null);
      const evs = initialData.evidence_phrases || [];
      setEvidence1(evs[0] || '');
      setEvidence2(evs[1] || '');
      setEvidence3(evs[2] || '');
    } else {
      // Reset form
      setToxicity('Absent');
      setCategoryId(null);
      setRiskLevel(null);
      setEvidence1('');
      setEvidence2('');
      setEvidence3('');
    }
  }, [selectedCallId, initialData]);

  // Run completeness validations using domain validator
  useEffect(() => {
    const evidencePhrases = [];
    if (evidence1.trim()) evidencePhrases.push(evidence1.trim());
    if (evidence2.trim()) evidencePhrases.push(evidence2.trim());
    if (evidence3.trim()) evidencePhrases.push(evidence3.trim());

    const result = validateEvaluationForm({
      toxicity,
      category_id: categoryId,
      risk_level: riskLevel,
      evidence_phrases: evidencePhrases
    });
    setIsValid(result.isValid);
  }, [toxicity, categoryId, riskLevel, evidence1, evidence2, evidence3]);

  const handleToxicityChange = (val) => {
    setToxicity(val);
    if (val === 'Absent') {
      // Clear fields on marking Absent
      setCategoryId(null);
      setRiskLevel(null);
      setEvidence1('');
      setEvidence2('');
      setEvidence3('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || forceDisabled) return;

    const evidencePhrases = [];
    if (evidence1.trim()) evidencePhrases.push(evidence1.trim());
    if (evidence2.trim()) evidencePhrases.push(evidence2.trim());
    if (evidence3.trim()) evidencePhrases.push(evidence3.trim());

    onSubmit({
      toxicity,
      category_id: toxicity === 'Present' ? categoryId : null,
      risk_level: toxicity === 'Present' ? riskLevel : null,
      evidence_phrases: toxicity === 'Present' ? evidencePhrases : []
    });
  };

  const isFormLocked = forceDisabled;
  const isFieldsDisabled = toxicity === 'Absent' || isFormLocked;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Toxicity Radio Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          유해 발화 판단 (Toxicity Assessment)
        </span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid ' + (toxicity === 'Absent' ? 'var(--color-toxic-absent-border)' : 'var(--glass-border)'),
            background: toxicity === 'Absent' ? 'var(--color-toxic-absent-bg)' : 'rgba(0,0,0,0.2)',
            cursor: isFormLocked ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-normal)',
            fontWeight: 600,
            color: toxicity === 'Absent' ? 'var(--color-toxic-absent)' : 'var(--text-secondary)'
          }}>
            <input
              type="radio"
              name="toxicity"
              value="Absent"
              checked={toxicity === 'Absent'}
              onChange={() => handleToxicityChange('Absent')}
              disabled={isFormLocked}
              style={{ marginRight: '8px', accentColor: 'var(--color-toxic-absent)' }}
            />
            Absent (안전)
          </label>
          <label style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid ' + (toxicity === 'Present' ? 'var(--color-toxic-present-border)' : 'var(--glass-border)'),
            background: toxicity === 'Present' ? 'var(--color-toxic-present-bg)' : 'rgba(0,0,0,0.2)',
            cursor: isFormLocked ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-normal)',
            fontWeight: 600,
            color: toxicity === 'Present' ? 'var(--color-toxic-present)' : 'var(--text-secondary)'
          }}>
            <input
              type="radio"
              name="toxicity"
              value="Present"
              checked={toxicity === 'Present'}
              onChange={() => handleToxicityChange('Present')}
              disabled={isFormLocked}
              style={{ marginRight: '8px', accentColor: 'var(--color-toxic-present)' }}
            />
            Present (유해)
          </label>
        </div>
      </div>

      {/* 2. Safety Categories Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isFieldsDisabled ? 0.4 : 1 }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          유해 유형 선택 (Safety Category) *
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {CATEGORIES.map((cat) => (
            <label key={cat.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 'var(--border-radius-sm)',
              background: categoryId === cat.id ? 'var(--accent-bg)' : 'rgba(0,0,0,0.15)',
              border: '1px solid ' + (categoryId === cat.id ? 'var(--accent-border)' : 'var(--glass-border)'),
              cursor: isFieldsDisabled ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              transition: 'all var(--transition-normal)'
            }}>
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={categoryId === cat.id}
                onChange={() => setCategoryId(cat.id)}
                disabled={isFieldsDisabled}
                style={{ marginRight: '10px', accentColor: 'var(--accent-color)' }}
              />
              {cat.label}
            </label>
          ))}
        </div>
      </div>

      {/* 3. Risk Level Indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isFieldsDisabled ? 0.4 : 1 }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          위험 수준 (Risk Level) *
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { level: 1, label: 'L1 - Low', color: 'var(--color-risk-1)' },
            { level: 2, label: 'L2 - Medium', color: 'var(--color-risk-2)' },
            { level: 3, label: 'L3 - High', color: 'var(--color-risk-3)' }
          ].map((r) => (
            <button
              key={r.level}
              type="button"
              disabled={isFieldsDisabled}
              onClick={() => setRiskLevel(r.level)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--border-radius-sm)',
                background: riskLevel === r.level ? r.color : 'rgba(0, 0, 0, 0.2)',
                border: '1px solid ' + (riskLevel === r.level ? r.color : 'var(--glass-border)'),
                color: riskLevel === r.level ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                transform: 'none'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Evidence Phrase Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isFieldsDisabled ? 0.4 : 1 }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          판단 근거 구절 (Evidence Phrases) *
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            placeholder="Evidence Phrase #1 (Required if Present)"
            value={evidence1}
            onChange={(e) => setEvidence1(e.target.value)}
            disabled={isFieldsDisabled}
          />
          <input
            type="text"
            placeholder="Evidence Phrase #2 (Optional)"
            value={evidence2}
            onChange={(e) => setEvidence2(e.target.value)}
            disabled={isFieldsDisabled}
          />
          <input
            type="text"
            placeholder="Evidence Phrase #3 (Optional)"
            value={evidence3}
            onChange={(e) => setEvidence3(e.target.value)}
            disabled={isFieldsDisabled}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        id="submit-evaluation-btn"
        type="submit"
        disabled={!isValid || isFormLocked}
        style={{
          padding: '14px',
          marginTop: '12px',
          fontWeight: 600,
          fontSize: '15px'
        }}
      >
        {isFormLocked ? 'Evaluation Locked' : 'Submit Evaluation'}
      </button>
    </form>
  );
}
