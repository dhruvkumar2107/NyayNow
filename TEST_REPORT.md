# TEST_REPORT.md

## Summary
- Playwright: 18/18 public-route smoke passed (tests/comprehensive.spec.js, ~37s)
- Jest (unit): proofVerifier.test.js 3/3 passed
- Jest (integration/api): DB-dependent (MongoDB required). Skipped in this env due to no mongod/memory-server.

## Commands Run
- 
px jest --maxWorkers=1 --no-coverage --forceExit tests/proofVerifier.test.js → 3/3 passed
- 
px playwright test (Chromium, public routes) → 18/18 passed

## Coverage Gaps (to fill with Mongo)
- Payments idempotency (duplicate paymentId)
- Subscriptions verify-* (signature/order fetch/notes.userId)
- Users PUT /me allowlist/blocking
- Reset password tokenVersion increment
- OTP non-exposure in production
- Admin audit trail
- CORS/aiAudit gating

