const express = require('express');
const router = express.Router();

// Do not collect identity documents or mark an account/lawyer verified until
// an authorized provider flow, credential checks, and review process are in place.
router.all(['/initiate-digilocker', '/verify-status'], (_req, res) => {
  return res.status(501).json({
    code: 'IDENTITY_VERIFICATION_UNAVAILABLE',
    error: 'DigiLocker verification is not available. NyayNow does not verify lawyer credentials through this endpoint.'
  });
});

module.exports = router;
