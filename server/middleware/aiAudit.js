const fs   = require('fs').promises;
const path = require('path');

const LOG_PATH     = path.join(__dirname, '../logs/ai_audit.log');
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

  // Legal queries and AI answers are sensitive personal data. By default we
  // audit only metadata (who/what/when/how long/how big), never the content.
  // AI request and response contents are never written to this audit log.

  res.json = function (data) {
    const entry = {
      timestamp:        new Date().toISOString(),
      endpoint:         req.path,
      method:           req.method,
      requestBodyBytes:  req.body ? Buffer.byteLength(JSON.stringify(req.body)) : 0,
      responseStatus:   res.statusCode,
      responseBodyBytes: data ? Buffer.byteLength(JSON.stringify(data)) : 0,
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
