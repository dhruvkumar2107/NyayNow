const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const ProofReceipt = require('../models/ProofReceipt');
const { verifyReceiptSignature } = require('../services/proofVerifier');

const router = express.Router();

router.get('/public-metrics', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ available: false, asOf: new Date().toISOString(), metrics: null });
  }

  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [registeredUsers, activePaidUsers, lawyersRegistered, chats, receiptCount] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ subscriptionStatus: 'active' }),
      User.countDocuments({ role: 'lawyer' }),
      ChatHistory.find({ updatedAt: { $gte: monthStart } }).select('user messages.role messages.timestamp updatedAt').lean(),
      ProofReceipt.countDocuments({ verifierResult: 'pass' }),
    ]);
    const queriesThisWeek = chats.reduce((sum, chat) => sum + (chat.messages || []).filter(message => message.role === 'user' && new Date(message.timestamp || chat.updatedAt) >= weekStart).length, 0);
    const activeUsers30d = new Set(chats.map(chat => String(chat.user))).size;
    return res.json({
      available: true,
      asOf: now.toISOString(),
      metrics: { registeredUsers, activeUsers30d, queriesThisWeek, paidAccounts: activePaidUsers, lawyerAccounts: lawyersRegistered, passMarkedProofRecords: receiptCount },
      notes: { passMarkedProofRecords: 'Count of stored records whose verifier result field is pass; signatures are not rechecked for this aggregate. It does not measure citation entailment or answer accuracy.' },
    });
  } catch (error) {
    return res.status(503).json({ available: false, asOf: new Date().toISOString(), metrics: null });
  }
});

router.get('/proof/:id', async (req, res) => {
  if (process.env.PROOF_RECEIPTS_ENABLED !== 'true' || !process.env.PROOF_RECEIPT_HMAC_SECRET) {
    return res.status(503).json({ status: 'in_development', message: 'Public proof receipts are not enabled.' });
  }
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Proof store unavailable.' });
  try {
    const receipt = await ProofReceipt.findById(req.params.id).select('+signature').lean();
    if (!receipt) return res.status(404).json({ error: 'Proof receipt not found.' });
    const signatureValid = verifyReceiptSignature(receipt, process.env.PROOF_RECEIPT_HMAC_SECRET);
    return res.status(signatureValid && receipt.verifierResult === 'pass' ? 200 : 409).json({
      id: String(receipt._id), answerId: receipt.answerId, citations: receipt.citations,
      asOfDate: receipt.asOfDate, corpusVersion: receipt.corpusVersion, modelVersion: receipt.modelVersion,
      verifierResult: signatureValid ? receipt.verifierResult : 'invalid_signature', verifierChecks: receipt.verifierChecks,
      signatureAlgorithm: receipt.signatureAlgorithm, createdAt: receipt.createdAt,
    });
  } catch (_error) {
    return res.status(400).json({ error: 'Invalid proof receipt identifier.' });
  }
});

module.exports = router;
