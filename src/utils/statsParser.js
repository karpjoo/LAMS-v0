/**
 * Validates and parses a JSON containing dashboard agreement statistics.
 * 
 * Expected JSON schema:
 * {
 *   "kappa_statistics": {
 *     "fleiss_kappa": {
 *       "model_agreement": number,
 *       "evaluator_agreement": number
 *     },
 *     "model_accuracy": {
 *       "gpt4": number,
 *       "gemini15": number,
 *       "claude3": number
 *     }
 *   }
 * }
 * 
 * @param {string} jsonString - The raw JSON statistics content
 * @returns {Object} { isValid: boolean, data: Object, errors: Array }
 */
export function parseStatistics(jsonString) {
  const result = {
    isValid: true,
    data: null,
    errors: []
  };

  if (!jsonString || typeof jsonString !== 'string') {
    result.isValid = false;
    result.errors.push('Empty or invalid file content.');
    return result;
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    result.isValid = false;
    result.errors.push(`JSON syntax error: ${err.message}`);
    return result;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    result.isValid = false;
    result.errors.push('Statistics root must be a JSON object.');
    return result;
  }

  if (!parsed.kappa_statistics || typeof parsed.kappa_statistics !== 'object') {
    result.isValid = false;
    result.errors.push("Missing 'kappa_statistics' object.");
    return result;
  }

  const { kappa_statistics } = parsed;

  // Validate fleiss_kappa
  if (!kappa_statistics.fleiss_kappa || typeof kappa_statistics.fleiss_kappa !== 'object') {
    result.isValid = false;
    result.errors.push("Missing 'fleiss_kappa' object under 'kappa_statistics'.");
  } else {
    const { model_agreement, evaluator_agreement } = kappa_statistics.fleiss_kappa;
    if (typeof model_agreement !== 'number') {
      result.isValid = false;
      result.errors.push("'model_agreement' under 'fleiss_kappa' must be a number.");
    }
    if (typeof evaluator_agreement !== 'number') {
      result.isValid = false;
      result.errors.push("'evaluator_agreement' under 'fleiss_kappa' must be a number.");
    }
  }

  // Validate model_accuracy
  if (!kappa_statistics.model_accuracy || typeof kappa_statistics.model_accuracy !== 'object') {
    result.isValid = false;
    result.errors.push("Missing 'model_accuracy' object under 'kappa_statistics'.");
  } else {
    const { gpt4, gemini15, claude3 } = kappa_statistics.model_accuracy;
    if (typeof gpt4 !== 'number') {
      result.isValid = false;
      result.errors.push("'gpt4' under 'model_accuracy' must be a number.");
    }
    if (typeof gemini15 !== 'number') {
      result.isValid = false;
      result.errors.push("'gemini15' under 'model_accuracy' must be a number.");
    }
    if (typeof claude3 !== 'number') {
      result.isValid = false;
      result.errors.push("'claude3' under 'model_accuracy' must be a number.");
    }
  }

  if (result.errors.length > 0) {
    result.isValid = false;
  } else {
    result.data = parsed;
  }

  return result;
}
