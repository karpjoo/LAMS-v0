import { describe, it, expect } from 'vitest';
import { validateEvaluationForm } from '../src/utils/formValidator';

describe('Evaluation Form Invariants Unit Tests', () => {

  it('should validate form as valid when toxicity is Absent, ignoring other fields', () => {
    const result = validateEvaluationForm({
      toxicity: 'Absent',
      category_id: null,
      risk_level: null,
      evidence_phrases: []
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should validate form as invalid when toxicity is Present but all detail fields are empty', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: null,
      risk_level: null,
      evidence_phrases: []
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(3); // category, risk, and evidence errors
  });

  it('should validate form as invalid when toxicity is Present but evidence phrases are empty', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: 2,
      risk_level: 1,
      evidence_phrases: []
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('evidence phrase is required');
  });

  it('should validate form as invalid when toxicity is Present and evidence phrases has only empty spaces', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: 2,
      risk_level: 1,
      evidence_phrases: ['  ', '']
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
  });

  it('should validate form as valid when toxicity is Present and all mandatory details are provided', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: 2,
      risk_level: 3,
      evidence_phrases: ['harassing text here']
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should validate form as invalid when safety category ID is out of bounds (not 1-7)', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: 8,
      risk_level: 2,
      evidence_phrases: ['some phrase']
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Invalid safety category ID');
  });

  it('should validate form as invalid when risk level is out of bounds (not 1-3)', () => {
    const result = validateEvaluationForm({
      toxicity: 'Present',
      category_id: 1,
      risk_level: 5,
      evidence_phrases: ['some phrase']
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Invalid risk level');
  });
});
