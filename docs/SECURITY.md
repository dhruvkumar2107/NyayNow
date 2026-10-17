# SECURITY.md

## Hardenings
- SSRF/LFI fixed in verify-id
- OTP/logs gated to non-prod
- CORS restricted (ALLOWED_ORIGINS; dev-only *.vercel.app)
- AI audit metadata-only by default
- Payments signature+order+idempotency
- tokenVersion increment on reset
- Admin audit trail (AdminAuditLog)
- Access token delivery fail-closed in prod

