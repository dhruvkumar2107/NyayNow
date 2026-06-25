const fs   = require('fs').promises;
const path = require('path');

const LOG_PATH     = path.join(__dirname, '../logs/ai_audit.log');
const MAX_BODY_LEN = 500;   // chars — cap logged request/response size
const PII_FIELDS   = new Set(['password', 'otp', 'email', 'phone', 'confession', 'idCardImage', 'token']);

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = PII_FIELDS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}

function truncate(val) {
  const s = typeof val === 'string' ? val : JSON.stringify(val);
  return s && s.length > MAX_BODY_LEN ? s.slice(0, MAX_BODY_LEN) + '…' : s;
}

// Ensure log directory exists once at startup
let _logDirReady = false;
async function ensureLogDir() {
  if (_logDirReady) return;
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  _logDirReady = true;
}

const aiAudit = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  const startTime    = Date.now();

  res.json = function (data) {
    const entry = {
      timestamp:        new Date().toISOString(),
      userId:           req.user?.id ?? 'anonymous',
      endpoint:         req.originalUrl,
      method:           req.method,
      requestBody:      truncate(redact(req.body)),
      responseStatus:   res.statusCode,
      responseBody:     truncate(data),
      durationMs:       Date.now() - startTime,
    };

    ensureLogDir()
      .then(() => fs.appendFile(LOG_PATH, JSON.stringify(entry) + '\n'))
      .catch(err => console.error("AI audit log failed:", err.message));

    return originalJson(data);
  };

  next();
};

module.exports = aiAudit;
