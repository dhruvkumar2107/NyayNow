const crypto = require('crypto');

function normalizeText(text) {
  return String(text || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

// This verifier establishes source identity, exact passage support and temporal
// validity only. It is not semantic entailment and must not be described as such.
function verifyCitation({ source, passage, quote, asOfDate }) {
  const checks = {
    sourceExists: Boolean(source?._id),
    passageBelongsToSource: Boolean(source?._id && passage?.docId && String(passage.docId) === String(source._id)),
    exactQuotePresent: Boolean(normalizeText(quote) && normalizeText(passage?.text).includes(normalizeText(quote))),
    sourceUsable: Boolean(source && ['approved', 'public_official'].includes(source.licenceStatus)),
    validOnDate: Boolean(source && asOfDate && (!source.validFrom || new Date(source.validFrom) <= new Date(asOfDate)) && (!source.validTo || new Date(asOfDate) <= new Date(source.validTo))),
  };
  return { pass: Object.values(checks).every(Boolean), checks };
}

function canonicalReceiptPayload(receipt) {
  return JSON.stringify({
    answerId: receipt.answerId,
    citations: receipt.citations,
    asOfDate: new Date(receipt.asOfDate).toISOString(),
    corpusVersion: receipt.corpusVersion,
    modelVersion: receipt.modelVersion,
    verifierResult: receipt.verifierResult,
    verifierChecks: receipt.verifierChecks,
    createdAt: new Date(receipt.createdAt).toISOString(),
  });
}

function signReceipt(receipt, secret) {
  if (!secret) throw new Error('PROOF_RECEIPT_HMAC_SECRET is required');
  return crypto.createHmac('sha256', secret).update(canonicalReceiptPayload(receipt)).digest('hex');
}

function verifyReceiptSignature(receipt, secret) {
  if (!secret || !receipt?.signature) return false;
  const expected = Buffer.from(signReceipt(receipt, secret), 'hex');
  const actual = Buffer.from(receipt.signature, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = { normalizeText, verifyCitation, signReceipt, verifyReceiptSignature, canonicalReceiptPayload };
