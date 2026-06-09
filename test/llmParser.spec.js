import { describe, it, expect } from 'vitest';
import { parseLLMPredictions } from '../src/utils/llmParser';

describe('LLM Prediction Ingestion Parser Unit Tests', () => {
  it('should parse valid predictions successfully', () => {
    const validJson = JSON.stringify([
      {
        call_id: 'call_0001',
        model_id: 'gpt4',
        toxicity: 'Present',
        category_id: 3,
        risk_level: 2,
        reasoning: 'Contains hostile language towards staff.'
      },
      {
        call_id: 'call_0001',
        model_id: 'gemini15',
        toxicity: 'Absent',
        category_id: null,
        risk_level: null,
        reasoning: 'Normal inquiry.'
      }
    ]);

    const result = parseLLMPredictions(validJson);
    expect(result.isValid).toBe(true);
    expect(result.data.length).toBe(1); // Grouped by call_id
    expect(result.data[0].call_id).toBe('call_0001');
    expect(result.data[0].model_verdicts.gpt4).toBeDefined();
    expect(result.data[0].model_verdicts.gpt4.toxicity).toBe('Present');
    expect(result.data[0].model_verdicts.gpt4.category_id).toBe(3);
    expect(result.data[0].model_verdicts.gpt4.risk_level).toBe(2);
    expect(result.data[0].model_verdicts.gpt4.reasoning).toBe('Contains hostile language towards staff.');
    expect(result.data[0].model_verdicts.gemini15).toBeDefined();
    expect(result.data[0].model_verdicts.gemini15.toxicity).toBe('Absent');
  });

  it('should reject invalid model_id', () => {
    const invalidJson = JSON.stringify([
      {
        call_id: 'call_0001',
        model_id: 'llama3', // Invalid model
        toxicity: 'Present',
        category_id: 3,
        risk_level: 2,
        reasoning: 'Reason'
      }
    ]);

    const result = parseLLMPredictions(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("invalid or missing 'model_id'");
  });

  it('should reject invalid toxicity value', () => {
    const invalidJson = JSON.stringify([
      {
        call_id: 'call_0001',
        model_id: 'gpt4',
        toxicity: 'Yes', // Invalid toxicity
        category_id: 3,
        risk_level: 2,
        reasoning: 'Reason'
      }
    ]);

    const result = parseLLMPredictions(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("invalid or missing 'toxicity'");
  });

  it('should reject invalid category_id or risk_level type', () => {
    const invalidJson = JSON.stringify([
      {
        call_id: 'call_0001',
        model_id: 'gpt4',
        toxicity: 'Present',
        category_id: 'three', // Should be number
        risk_level: 2,
        reasoning: 'Reason'
      }
    ]);

    const result = parseLLMPredictions(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("invalid 'category_id'");
  });
});
