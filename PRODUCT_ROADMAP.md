# PRODUCT_ROADMAP.md

## Short Term (0-30 days)
- Add mongodb-memory-server for DB tests; implement regression tests listed in TEST_REPORT.md
- Harden CI (MongoDB service, Playwright, lint/typecheck)
- Add origin allowlist validation at startup/logging
- Expand admin audit UI/log querying

## Mid Term (1-3 months)
- Strengthen webhook idempotency with DB unique constraints on paymentId where applicable
- Rate limit lawyer verification endpoints; file type allowlist
- Feature flags for AI audit/body logging
- Improve marketplace search (location/practice area)

## Long Term (3-12 months)
- Move pricing to single source of truth; deprecate legacy silver/gold/diamond vs new pro/gold/firm conflicts
- DPA/log retention policy; structured audit export
- Consent/PII minimization in AI audit logs

