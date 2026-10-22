# CHANGELOG.md

## [Unreleased] - 2026-10-17

### Fixed
- FIX-1: Gate demo user to non-production only
- FIX-2: Prevent OTP/reset link exposure in production logs/fallbacks
- FIX-3: Harden /verify-id (SSRF/LFI/path traversal; pending-only)
- FIX-4: Verify subscriptions with signature+authoritative order+notes.userId+amount; correct yearly duration (365d)
- FIX-4b: Payment idempotency (duplicate paymentId short-circuit)
- FIX-5: Register forces free plan; reset-password increments tokenVersion; new reset page; reset link default to localhost:3000
- FIX-6: Allowlist profile updates; self-only PUT /:id; public profile allowlist; honest stats/public metrics; add headline/awards
- FIX-7: Marketplace filters verified lawyers only; language/minExperience; public field allowlist
- FIX-8: CORS (ALLOWED_ORIGINS; dev-only *.vercel.app); AI audit metadata-only default
- FIX-9: Replace fake Legal SOS dispatch/SLA claims with honest panel + disclaimer; link to /find-lawyers
- FIX-10: Add AdminAuditLog; audit admin mutations; access token delivery fail-closed in production

### Changed
- EditProfile posts to /api/users/me
- Default reset link fallback to http://localhost:3000
- Marketplace sorting prioritizes featured/verified/experience

### Added
- server/models/AdminAuditLog.js
- client/src/app/reset-password/[token]/page.js

