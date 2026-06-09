import { describe, it, expect } from 'vitest';
import { parseDataset } from '../src/utils/datasetParser';

describe('Dataset JSON Ingestion Parser Unit Tests', () => {
  it('should parse a valid dataset successfully without errors or warnings', () => {
    const validJson = JSON.stringify([
      {
        call_id: 'call_0001',
        turns: [
          { sequence_no: 1, speaker: 'customer', text: 'Hello, I need help.' },
          { sequence_no: 2, speaker: 'agent', text: 'Sure, how can I assist you?' }
        ]
      }
    ]);

    const result = parseDataset(validJson);
    expect(result.isValid).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].call_id).toBe('call_0001');
    expect(result.data[0].turns.length).toBe(2);
    expect(result.warnings.length).toBe(0);
    expect(result.errors.length).toBe(0);
  });

  it('should sort turns chronologically by sequence_no', () => {
    const mixedTurnsJson = JSON.stringify([
      {
        call_id: 'call_0001',
        turns: [
          { sequence_no: 2, speaker: 'agent', text: 'Second turn text.' },
          { sequence_no: 1, speaker: 'customer', text: 'First turn text.' }
        ]
      }
    ]);

    const result = parseDataset(mixedTurnsJson);
    expect(result.isValid).toBe(true);
    expect(result.data[0].turns[0].sequence_no).toBe(1);
    expect(result.data[0].turns[1].sequence_no).toBe(2);
  });

  it('should identify errors for missing call_id or invalid structure', () => {
    const invalidJson = JSON.stringify([
      {
        // missing call_id
        turns: [{ sequence_no: 1, speaker: 'customer', text: 'Hi' }]
      }
    ]);

    const result = parseDataset(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("missing a valid 'call_id'");
  });

  it('should fail validation on duplicate call_ids', () => {
    const duplicateJson = JSON.stringify([
      {
        call_id: 'call_0001',
        turns: [{ sequence_no: 1, speaker: 'customer', text: 'Hi' }]
      },
      {
        call_id: 'call_0001',
        turns: [{ sequence_no: 1, speaker: 'customer', text: 'Hello' }]
      }
    ]);

    const result = parseDataset(duplicateJson);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Duplicate 'call_id' detected");
  });

  it('should detect hyphenated phone numbers and generate PII warnings', () => {
    const piiJson = JSON.stringify([
      {
        call_id: 'call_0002',
        turns: [
          { sequence_no: 1, speaker: 'customer', text: 'My number is 010-4321-8765.' }
        ]
      }
    ]);

    const result = parseDataset(piiJson);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].call_id).toBe('call_0002');
    expect(result.warnings[0].pii[0].found).toBe('010-4321-8765');
  });

  it('should detect unhyphenated phone numbers and generate PII warnings', () => {
    const piiJson = JSON.stringify([
      {
        call_id: 'call_0003',
        turns: [
          { sequence_no: 1, speaker: 'customer', text: 'Call me on 01012345678, thanks.' }
        ]
      }
    ]);

    const result = parseDataset(piiJson);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].pii[0].found).toBe('01012345678');
  });
});
