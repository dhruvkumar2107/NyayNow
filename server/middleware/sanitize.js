/**
 * NoSQL Injection Sanitization Middleware
 * Recursively removes any keys starting with '$' from req.body, req.query, and req.params
 */
function sanitizeObject(obj) {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitizeObject(obj[key]);
            }
        }
    }
}

function sanitize(req, res, next) {
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
}

module.exports = sanitize;
