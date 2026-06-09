import { describe, it, expect } from 'vitest';
import { solveConsensus } from '../src/utils/consensusSolver';

describe('Consensus Solver Unit Tests (AT-015)', () => {
  it('should return isConsensus: false when labels count is less than 3', () => {
    const labels = [
      { toxicity: 'Absent', category_id: null, risk_level: null, evidence_phrases: [] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(false);
    expect(result.resolvedLabel).toBeNull();
  });

  it('should reach consensus for 3 "Absent" labels', () => {
    const labels = [
      { toxicity: 'Absent', category_id: null, risk_level: null, evidence_phrases: [] },
      { toxicity: 'Absent', category_id: null, risk_level: null, evidence_phrases: [] },
      { toxicity: 'Absent', category_id: null, risk_level: null, evidence_phrases: [] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(true);
    expect(result.resolvedLabel).toEqual({
      toxicity: 'Absent',
      category_id: null,
      risk_level: null,
      evidence_phrases: []
    });
  });

  it('should fail consensus if toxicity values mismatch', () => {
    const labels = [
      { toxicity: 'Present', category_id: 1, risk_level: 1, evidence_phrases: ['bad'] },
      { toxicity: 'Absent', category_id: null, risk_level: null, evidence_phrases: [] },
      { toxicity: 'Present', category_id: 1, risk_level: 2, evidence_phrases: ['worse'] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(false);
    expect(result.resolvedLabel).toBeNull();
  });

  it('should fail consensus if toxicity is "Present" but category_ids mismatch', () => {
    const labels = [
      { toxicity: 'Present', category_id: 1, risk_level: 1, evidence_phrases: ['bad'] },
      { toxicity: 'Present', category_id: 2, risk_level: 1, evidence_phrases: ['bad'] },
      { toxicity: 'Present', category_id: 1, risk_level: 2, evidence_phrases: ['worse'] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(false);
    expect(result.resolvedLabel).toBeNull();
  });

  it('should reach consensus for 3 matching "Present" labels, resolving risk level by majority and unioning evidence', () => {
    const labels = [
      { toxicity: 'Present', category_id: 1, risk_level: 2, evidence_phrases: ['bad word A'] },
      { toxicity: 'Present', category_id: 1, risk_level: 2, evidence_phrases: ['bad word B'] },
      { toxicity: 'Present', category_id: 1, risk_level: 3, evidence_phrases: ['bad word A', 'bad word C'] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(true);
    expect(result.resolvedLabel.toxicity).toBe('Present');
    expect(result.resolvedLabel.category_id).toBe(1);
    expect(result.resolvedLabel.risk_level).toBe(2); // majority of [2, 2, 3] is 2
    expect(result.resolvedLabel.evidence_phrases).toContain('bad word A');
    expect(result.resolvedLabel.evidence_phrases).toContain('bad word B');
    expect(result.resolvedLabel.evidence_phrases).toContain('bad word C');
    expect(result.resolvedLabel.evidence_phrases.length).toBe(3);
  });

  it('should handle no clear majority risk level by defaulting to the first label risk level', () => {
    const labels = [
      { toxicity: 'Present', category_id: 1, risk_level: 1, evidence_phrases: ['A'] },
      { toxicity: 'Present', category_id: 1, risk_level: 2, evidence_phrases: ['B'] },
      { toxicity: 'Present', category_id: 1, risk_level: 3, evidence_phrases: ['C'] }
    ];
    const result = solveConsensus(labels);
    expect(result.isConsensus).toBe(true);
    expect(result.resolvedLabel.risk_level).toBe(1); // falls back to first label's risk_level
  });
});
