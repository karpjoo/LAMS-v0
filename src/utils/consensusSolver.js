/**
 * Evaluates whether a consensus is reached among 3 evaluator labels.
 * Consensus is reached if all 3 labels have matching toxicity values ('Present' or 'Absent'),
 * and if toxicity is 'Present', all 3 labels also have matching category_id values.
 *
 * @param {Array} labels - Array of 3 label objects
 * @returns {Object} Result containing isConsensus (boolean) and resolvedLabel (object or null)
 */
export function solveConsensus(labels) {
  if (!labels || labels.length < 3) {
    return { isConsensus: false, resolvedLabel: null };
  }

  const l1 = labels[0];
  const l2 = labels[1];
  const l3 = labels[2];

  // 1. Check if toxicity matches
  const t1 = l1.toxicity;
  const t2 = l2.toxicity;
  const t3 = l3.toxicity;

  if (t1 !== t2 || t2 !== t3) {
    return { isConsensus: false, resolvedLabel: null };
  }

  // If toxicity is Absent, they agree on Absent
  if (t1 === 'Absent') {
    return {
      isConsensus: true,
      resolvedLabel: {
        toxicity: 'Absent',
        category_id: null,
        risk_level: null,
        evidence_phrases: []
      }
    };
  }

  // 2. If toxicity is Present, category_id must also match
  const c1 = l1.category_id;
  const c2 = l2.category_id;
  const c3 = l3.category_id;

  if (c1 !== c2 || c2 !== c3) {
    return { isConsensus: false, resolvedLabel: null };
  }

  // Category matches! Let's resolve risk_level and evidence_phrases
  // Risk Level: majority rule (e.g. if 2 are equal, use that; if all different, default to l1.risk_level)
  const riskLevels = [l1.risk_level, l2.risk_level, l3.risk_level];
  const freq = {};
  let maxFreq = 0;
  let majorityRisk = l1.risk_level;

  riskLevels.forEach(rl => {
    if (rl !== null && rl !== undefined) {
      freq[rl] = (freq[rl] || 0) + 1;
      if (freq[rl] > maxFreq) {
        maxFreq = freq[rl];
        majorityRisk = rl;
      }
    }
  });

  // Evidence Phrases: union of non-empty phrases across all 3
  const evidenceSet = new Set();
  labels.forEach(l => {
    if (l.evidence_phrases && Array.isArray(l.evidence_phrases)) {
      l.evidence_phrases.forEach(phrase => {
        if (phrase && phrase.trim()) {
          evidenceSet.add(phrase.trim());
        }
      });
    }
  });

  return {
    isConsensus: true,
    resolvedLabel: {
      toxicity: 'Present',
      category_id: c1,
      risk_level: majorityRisk,
      evidence_phrases: Array.from(evidenceSet)
    }
  };
}
