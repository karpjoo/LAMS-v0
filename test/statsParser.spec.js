import { describe, it, expect } from 'vitest';
import { parseStatistics } from '../src/utils/statsParser';

describe('Statistics JSON Ingestion Parser Unit Tests', () => {
  it('should parse valid statistics JSON successfully', () => {
    const validJson = JSON.stringify({
      kappa_statistics: {
        fleiss_kappa: {
          model_agreement: 0.75,
          evaluator_agreement: 0.82
        },
        model_accuracy: {
          gpt4: 0.87,
          gemini15: 0.79,
          claude3: 0.84
        }
      }
    });

    const result = parseStatistics(validJson);
    expect(result.isValid).toBe(true);
    expect(result.data).not.toBeNull();
    expect(result.data.kappa_statistics.fleiss_kappa.model_agreement).toBe(0.75);
    expect(result.data.kappa_statistics.model_accuracy.gpt4).toBe(0.87);
    expect(result.errors.length).toBe(0);
  });

  it('should reject missing kappa_statistics object', () => {
    const invalidJson = JSON.stringify({
      some_other_data: {}
    });

    const result = parseStatistics(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Missing 'kappa_statistics'");
  });

  it('should reject non-numeric metric fields', () => {
    const invalidJson = JSON.stringify({
      kappa_statistics: {
        fleiss_kappa: {
          model_agreement: 'high', // Should be number
          evaluator_agreement: 0.82
        },
        model_accuracy: {
          gpt4: 0.87,
          gemini15: 0.79,
          claude3: 0.84
        }
      }
    });

    const result = parseStatistics(invalidJson);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("'model_agreement' under 'fleiss_kappa' must be a number");
  });
});
