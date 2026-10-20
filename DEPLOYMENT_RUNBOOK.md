# DEPLOYMENT_RUNBOOK.md

## Required Environment Variables
- Core: NODE_ENV, JWT_SECRET, MONGO_URI, CLIENT_URL, PORT/SERVER_PORT`n- Payments: RZP_KEY_ID, RZP_KEY_SECRET`n- Auth/Email: GOOGLE_CLIENT_ID, EMAIL_USER, EMAIL_PASS (or BREVO_*), SMTP_* as used
- AI: GEMINI_API_KEY, AI service vars
- Security: ALLOWED_ORIGINS (comma-separated), DEMO_USER_ENABLED (default false), AI_AUDIT_LOG_BODIES (default false)
- Rate limiting/other as documented

## Pre-deploy Checklist
- [ ] Set NODE_ENV=production and unique strong JWT_SECRET`n- [ ] Configure ALLOWED_ORIGINS with explicit production origins (no *.vercel.app wildcard)
- [ ] Set DEMO_USER_ENABLED=false`n- [ ] Ensure AI_AUDIT_LOG_BODIES=false unless explicitly needed
- [ ] External services creds set; fail-fast behavior verified
- [ ] Run lint/typecheck/tests if present
- [ ] Verify /healthz responds

## Notes
- Admin access token delivery fail-closed in production if email creds missing.

