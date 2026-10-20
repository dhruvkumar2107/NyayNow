# SECURITY_AUDIT.md

## Key Hardening
- SSRF/LFI fixed in lawyer ID verification (FIX-3)
- Secrets never logged; OTP/reset links gated to non-prod (FIX-2)
- CSRF header required on mutating methods; webhooks excluded
- CORS restricted (prod blocks *.vercel.app wildcard; ALLOWED_ORIGINS enforced) (FIX-8a)
- AI audit metadata-only by default (FIX-8b)
- Payments: signature verification + authoritative order fetch + userId binding + idempotency (FIX-4,4b)
- Sessions revoked on password reset (tokenVersion++) (FIX-5)
- Profile updates allowlisted (no privilege escalation) (FIX-6)
- Admin actions audit-trailed; access token delivery fail-closed in production (FIX-10)
- Input validation/sanitization present; fail-fast for JWT_SECRET

