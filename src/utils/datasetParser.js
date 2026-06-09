/**
 * Validates and parses a JSON dataset containing conversations.
 * Scans conversation turns for potential PII (specifically Korean phone numbers).
 * 
 * Expected JSON schema:
 * Array of:
 * {
 *   "call_id": "string",
 *   "turns": [
 *     {
 *       "sequence_no": number,
 *       "speaker": "customer" | "agent",
 *       "text": "string"
 *     }
 *   ]
 * }
 * 
 * @param {string} jsonString - The raw JSON dataset content
 * @returns {Object} { isValid: boolean, data: Array, warnings: Array, errors: Array }
 */
export function parseDataset(jsonString) {
  const result = {
    isValid: true,
    data: [],
    warnings: [],
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
    result.errors.push('Dataset root must be a JSON array.');
    return result;
  }

  const phoneRegex = /010-?\d{3,4}-?\d{4}/g;
  const callIds = new Set();

  for (let i = 0; i < parsed.length; i++) {
    const record = parsed[i];
    const indexStr = `at index ${i}`;

    if (!record || typeof record !== 'object') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} is not a valid object.`);
      continue;
    }

    if (!record.call_id || typeof record.call_id !== 'string' || record.call_id.trim() === '') {
      result.isValid = false;
      result.errors.push(`Record ${indexStr} is missing a valid 'call_id'.`);
      continue;
    }

    const callId = record.call_id.trim();

    if (callIds.has(callId)) {
      result.isValid = false;
      result.errors.push(`Duplicate 'call_id' detected: '${callId}' ${indexStr}.`);
      continue;
    }
    callIds.add(callId);

    if (!Array.isArray(record.turns)) {
      result.isValid = false;
      result.errors.push(`Record '${callId}' ${indexStr} is missing a 'turns' array.`);
      continue;
    }

    const validatedTurns = [];
    const recordPIIWarnings = [];

    for (let j = 0; j < record.turns.length; j++) {
      const turn = record.turns[j];
      const turnIndexStr = `turn at index ${j} in record '${callId}'`;

      if (!turn || typeof turn !== 'object') {
        result.isValid = false;
        result.errors.push(`Invalid ${turnIndexStr}.`);
        continue;
      }

      if (typeof turn.sequence_no !== 'number') {
        result.isValid = false;
        result.errors.push(`Missing or invalid 'sequence_no' for ${turnIndexStr}.`);
        continue;
      }

      if (turn.speaker !== 'customer' && turn.speaker !== 'agent') {
        result.isValid = false;
        result.errors.push(`Speaker must be 'customer' or 'agent' for ${turnIndexStr}.`);
        continue;
      }

      if (typeof turn.text !== 'string') {
        result.isValid = false;
        result.errors.push(`Missing 'text' string for ${turnIndexStr}.`);
        continue;
      }

      // Clean/trim fields and push
      validatedTurns.push({
        sequence_no: turn.sequence_no,
        speaker: turn.speaker,
        text: turn.text
      });

      // Scan for phone number PII warning
      const matches = turn.text.match(phoneRegex);
      if (matches) {
        matches.forEach(phoneNum => {
          recordPIIWarnings.push({
            sequence_no: turn.sequence_no,
            speaker: turn.speaker,
            found: phoneNum
          });
        });
      }
    }

    // Sort turns chronologically by sequence_no
    validatedTurns.sort((a, b) => a.sequence_no - b.sequence_no);

    if (recordPIIWarnings.length > 0) {
      result.warnings.push({
        call_id: callId,
        pii: recordPIIWarnings
      });
    }

    result.data.push({
      call_id: callId,
      status: 'Round 1 Active',
      label_completion_count: 0,
      turns: validatedTurns
    });
  }

  // If any errors were found, mark the validation as invalid
  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
}
