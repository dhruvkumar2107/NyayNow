/**
 * Content-free AI response quality signals.
 *
 * These are deliberately AGGREGATE / BOOLEAN-ONLY metrics computed in memory and
 * attached to the AI audit metadata. They are NOT a claim of accuracy, and the
 * response text is never persisted — only these derived flags/counts are logged.
 *
 * Purpose: give operators a coarse, privacy-preserving view of how often AI
 * responses (a) carry the required disclaimer and (b) contain outcome-guarantee
 * language that must never appear in a legal-information product.
 *
 * This does NOT validate that citations are real or correct. Prompt instructions
 * and (where wired) source-proof records are the only mechanisms for that; see
 * docs/adr/ADR-0001-source-proof-records.md.
 */

const TEXT_FIELDS = [
  'response', 'answer', 'analysis', 'content', 'text', 'result',
  'draft', 'message', 'output', 'summary', 'explanation', 'notice',
];

const DISCLAIMER_RE =
  /not legal advice|consult a (qualified )?advocate|may be inaccurate|for general (legal )?information|informational purposes|require (advocate|lawyer) review/i;

const OUTCOME_CLAIM_RE =
  /guarantee[sd]?\b|\b100%\b|will win\b|assured outcome|definitely win|certain to win|zero hallucination/i;

const CITATION_RE =
  /\b(?:Section|Sec\.)\s*\d+|Article\s*\d+|\bBNS\b|\bBNSS\b|\bBSA\b|\bIPC\b|\bCrPC\b|\bCPC\b/i;

function collectText(data, depth = 0) {
  if (data == null || depth > 4) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map((item) => collectText(item, depth + 1)).join(' ');
  }
  if (typeof data === 'object') {
    const parts = [];
    for (const key of TEXT_FIELDS) {
      if (key in data) parts.push(collectText(data[key], depth + 1));
    }
    return parts.join(' ');
  }
  return '';
}

/**
 * @param {*} data  the response body passed to res.json()
 * @returns {{ chars:number, hasDisclaimer:boolean, citationLikeCount:number, hasOutcomeClaim:boolean }}
 */
function assessAiResponse(data) {
  const text = collectText(data);
  const citationMatches = text.match(
    new RegExp(CITATION_RE.source, 'gi')
  );

  return {
    chars: text.length,
    hasDisclaimer: DISCLAIMER_RE.test(text),
    citationLikeCount: citationMatches ? citationMatches.length : 0,
    hasOutcomeClaim: OUTCOME_CLAIM_RE.test(text),
  };
}

module.exports = { assessAiResponse };
