/**
 * Central Error Handling Middleware
 * Prevents stack trace leaks in production
 */
function errorHandler(err, req, res, next) {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    // Log error internally
    console.error("❌ SERVER ERROR:", err.stack || err.message || err);

    const statusCode = err.status || 500;
    const response = {
        error: err.message || "Internal Server Error"
    };

    if (isDev) {
        response.stack = err.stack;
        response.details = err.details || err.message;
    }

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
