const fs = require('fs').promises;
const path = require('path');

/**
 * AI Audit Middleware
 * Logs AI interactions to a local JSON file for quality auditing and grounding verification.
 */
const aiAudit = async (req, res, next) => {
    const originalJson = res.json;
    const startTime = Date.now();

    // Override res.json to capture the response
    res.json = function (data) {
        const duration = Date.now() - startTime;
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: req.user ? { id: req.user.id, email: req.user.email } : 'Anonymous',
            endpoint: req.originalUrl,
            method: req.method,
            requestBody: { ...req.body }, // Clone to avoid mutation
            responseStatus: res.statusCode,
            responseBody: data,
            durationMs: duration,
            groundingVerified: !!(data && (data.confidence_score || data.confidence_percentage || data.verified || data.status === "LIVE_GROUNDED_RESULT"))
        };

        // Redact sensitive info if needed (e.g., passwords, though AI routes shouldn't have them)
        if (logEntry.requestBody.password) logEntry.requestBody.password = '***';

        // Async logging without blocking the response
        const logPath = path.join(__dirname, '../logs/ai_audit.log');
        fs.appendFile(logPath, JSON.stringify(logEntry) + '\n').catch(err => {
            console.error("Failed to write AI audit log:", err.message);
        });

        return originalJson.call(this, data);
    };

    next();
};

module.exports = aiAudit;
