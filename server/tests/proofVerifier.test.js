const { verifyCitation, signReceipt, verifyReceiptSignature } = require('../services/proofVerifier');

const source = {
  _id: 'source-1',
  licenceStatus: 'public_official',
  validFrom: new Date('2024-07-01T00:00:00Z'),
  validTo: null,
};
const passage = { docId: 'source-1', text: 'Section 1 applies to this Act.' };

describe('proof citation verifier', () => {
  test('accepts exact source text valid on the requested date', () => {
    const result = verifyCitation({ source, passage, quote: 'Section 1 applies to this Act.', asOfDate: '2025-01-01' });
    expect(result.pass).toBe(true);
  });

  test('rejects unsupported quotes, unapproved sources, and dates before validity', () => {
    expect(verifyCitation({ source, passage, quote: 'Different words', asOfDate: '2025-01-01' }).pass).toBe(false);
    expect(verifyCitation({ source: { ...source, licenceStatus: 'pending' }, passage, quote: 'Section 1 applies to this Act.', asOfDate: '2025-01-01' }).pass).toBe(false);
    expect(verifyCitation({ source, passage, quote: 'Section 1 applies to this Act.', asOfDate: '2020-01-01' }).pass).toBe(false);
  });

  test('signatures cover receipt payload and reject tampering', () => {
    const receipt = { answerId: 'a1', citations: [], asOfDate: '2025-01-01', corpusVersion: 'c1', modelVersion: 'm1', verifierResult: 'pass', verifierChecks: [], createdAt: '2025-01-02' };
    receipt.signature = signReceipt(receipt, 'test-secret');
    expect(verifyReceiptSignature(receipt, 'test-secret')).toBe(true);
    expect(verifyReceiptSignature({ ...receipt, answerId: 'changed' }, 'test-secret')).toBe(false);
  });
});
