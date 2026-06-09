/**
 * Validates and parses a JSON dataset containing LLM predictions.
 * 
 * Expected JSON schema:
 * Array of:
 * {
 *   "call_id": "string",
 *   "model_id": "gpt4" | "gemini15" | "claude3",
 *   "toxicity": "Present" | "Absent",
 *   "category_id": number | null,
 *   "risk_level": number | null,
 *   "reasoning": "string",
 *   "evidence_phrases"?: string[]
 * }
 * 
 * Grouped for database storage under `/conversations/{call_id}/llm_results/verdict`:
 * {
 *   "call_id": "string",
 *   "model_verdicts": {
 *     "gpt4": { toxicity, category_id, risk_level, evidence_phrases, reasoning },
 *     "gemini15": { ... },
 *     "claude3": { ... }
 *   }
 * }
 * 
 * @param {string} jsonString - The raw JSON dataset content
 * @returns {Object} { isValid: boolean, data: Array, errors: Array }
 */
export function parseLLMPredictions(jsonString) {
  const result = {
    isValid: true,
    data: [],
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

  if (!Array.isArray(parsed)) {
    result.isValid = false;
    result.errors.push('LLM predictions root must be a JSON array.');
    return result;
  }

  const validModels = ['gpt4', 'gemini15', 'claude3'];
  const validToxicities = ['Present', 'Absent'];
  const grouped = {};

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const indexStr = `at index ${i}`;

    if (!item || typeof item !== 'object') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} is not a valid object.`);
      continue;
    }

    if (!item.call_id || typeof item.call_id !== 'string' || item.call_id.trim() === '') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} is missing a valid 'call_id'.`);
      continue;
    }

    const callId = item.call_id.trim();

    if (!item.model_id || typeof item.model_id !== 'string' || !validModels.includes(item.model_id)) {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid or missing 'model_id'. Must be one of: ${validModels.join(', ')}.`);
      continue;
    }

    if (!item.toxicity || typeof item.toxicity !== 'string' || !validToxicities.includes(item.toxicity)) {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid or missing 'toxicity'. Must be 'Present' or 'Absent'.`);
      continue;
    }

    // Check category_id
    if (item.category_id !== undefined && item.category_id !== null && typeof item.category_id !== 'number') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid 'category_id'. Must be a number or null.`);
      continue;
    }

    // Check risk_level
    if (item.risk_level !== undefined && item.risk_level !== null && typeof item.risk_level !== 'number') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid 'risk_level'. Must be a number or null.`);
      continue;
    }

    // Check reasoning
    if (item.reasoning !== undefined && item.reasoning !== null && typeof item.reasoning !== 'string') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid 'reasoning'. Must be a string.`);
      continue;
    }

    // Check evidence_phrases if provided
    if (item.evidence_phrases !== undefined && item.evidence_phrases !== null && !Array.isArray(item.evidence_phrases)) {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} (call_id: '${callId}') has an invalid 'evidence_phrases'. Must be an array of strings.`);
      continue;
    }

    // Initialize group if not present
    if (!grouped[callId]) {
      grouped[callId] = {
        call_id: callId,
        model_verdicts: {}
      };
    }

    // Set model verdict details
    grouped[callId].model_verdicts[item.model_id] = {
      toxicity: item.toxicity,
      category_id: item.category_id !== undefined ? item.category_id : null,
      risk_level: item.risk_level !== undefined ? item.risk_level : null,
      reasoning: item.reasoning || '',
      evidence_phrases: item.evidence_phrases || []
    };
  }

  if (result.errors.length > 0) {
    result.isValid = false;
  } else {
    result.data = Object.values(grouped);
  }

  return result;
}
