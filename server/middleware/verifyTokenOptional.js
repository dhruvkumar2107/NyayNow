const jwt = require("jsonwebtoken");

const verifyTokenOptional = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        req.userId = null;
        req.userRole = "guest";
        return next();
    }

    // Remove "Bearer " prefix if present
    const bearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    jwt.verify(bearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Invalid token -> Treat as guest
            req.userId = null;
            req.userRole = "guest";
        } else {
            req.userId = decoded.id;
            req.userRole = decoded.role;
            req.userPlan = decoded.plan;
        }
        next();
    });
};

module.exports = verifyTokenOptional;
