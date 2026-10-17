# API_AND_DATABASE.md

## Notable Changes
- GET /api/lawyers/: filters ole:'lawyer', erified:true, erificationStatus:'verified'; supports language, minExperience; returns MARKETPLACE_PUBLIC_FIELDS only.
- PUT /api/users/me: allowlist updates only (includes headline,wards); blocks privilege fields. PUT /api/users/:id self-only.
- GET /api/users/public/:id: returns PUBLIC_PROFILE_FIELDS only.
- GET /api/users/stats/public: honest DB-derived metrics.
- POST /api/lawyers/verify-id: hardened (uploads-only, path guard, size cap; pending/never auto-approve).
- POST /api/subscriptions/verify-subscription|verify-listing|verify-credits: signature+authoritative order+notes.userId+amount check+idempotency.
- POST /api/auth/reset-password: increments 	okenVersion on success.
- POST /api/admin/verify-lawyer/:id, update-user-plan/:id, DELETE /user/:id: write AdminAuditLog entries.

## AdminAuditLog (New)
- Collection: dmin_audit_logs (Model AdminAuditLog); fields: actorId, action, targetType, targetId, details, ip, timestamp.
- Append-only; failures never throw.

