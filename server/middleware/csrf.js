/**
 * CSRF protection via custom request header.
 * Browsers cannot set arbitrary headers on cross-origin requests without
 * a CORS preflight that will be rejected for non-allowed origins, so
 * requiring this header blocks cross-site form-submission attacks.
 *
 * Server-to-server webhooks are excluded by path since they cannot
 * set browser-style CSRF headers.
 */
const CSRF_HEADER = 'x-csrf-protection';
const CSRF_VALUE  = '1';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Paths that are server-to-server webhooks — excluded from CSRF check
const WEBHOOK_PATHS = [
  '/api/payments/webhook',
  '/api/whatsapp',
];

function csrfProtect(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) return next();
  if (WEBHOOK_PATHS.some(p => req.originalUrl.startsWith(p))) return next();

  if (req.headers[CSRF_HEADER] !== CSRF_VALUE) {
    return res.status(403).json({ error: 'CSRF validation failed: missing x-csrf-protection header' });
  }
  next();
}

module.exports = csrfProtect;
