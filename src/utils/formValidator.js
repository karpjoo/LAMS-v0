/**
 * Checks if a toxicity evaluation form is complete and satisfies all domain invariants.
 * 
 * Invariant checks:
 * - If toxicity is 'Absent': validation passes, fields are ignored.
 * - If toxicity is 'Present':
 *   - category_id must be selected (number 1-7).
 *   - risk_level must be selected (number 1-3).
 *   - At least 1 non-empty evidence phrase must be present.
 * 
 * @param {Object} formData - Form data to validate
 * @param {string} formData.toxicity - 'Present' | 'Absent'
 * @param {number|null} formData.category_id - selected safety category ID
 * @param {number|null} formData.risk_level - selected risk level (1-3)
 * @param {Array<string>} formData.evidence_phrases - array of evidence text phrases
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
export function validateEvaluationForm({ toxicity, category_id, risk_level, evidence_phrases }) {
  const result = {
    isValid: true,
    errors: []
  };

  if (toxicity === 'Absent') {
    return result;
  }

  if (toxicity !== 'Present') {
    result.isValid = false;
    result.errors.push("Invalid toxicity value. Must be 'Present' or 'Absent'.");
    return result;
  }

  // Category validation
  if (category_id === null || category_id === undefined) {
    result.isValid = false;
    result.errors.push('Safety category is required when toxicity is Present.');
  } else if (typeof category_id !== 'number' || category_id < 1 || category_id > 7) {
    result.isValid = false;
    result.errors.push('Invalid safety category ID.');
  }

  // Risk validation
  if (risk_level === null || risk_level === undefined) {
    result.isValid = false;
    result.errors.push('Risk level is required when toxicity is Present.');
  } else if (typeof risk_level !== 'number' || risk_level < 1 || risk_level > 3) {
    result.isValid = false;
    result.errors.push('Invalid risk level.');
  }

  // Evidence validation
  const hasValidEvidence = Array.isArray(evidence_phrases) && 
    evidence_phrases.some(phrase => typeof phrase === 'string' && phrase.trim() !== '');
    
  if (!hasValidEvidence) {
    result.isValid = false;
    result.errors.push('At least one evidence phrase is required when toxicity is Present.');
  }

  return result;
}
