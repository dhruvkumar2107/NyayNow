const jwt = require("jsonwebtoken");

const verifyTokenOptional = (req, res, next) => {
    const token = req.cookies?.token || req.headers["authorization"];

    if (!token || typeof token !== "string") {
        req.userId = null;
        req.userRole = "guest";
        req.user = null;
        return next();
    }

    try {
        const bearer = token.startsWith("Bearer ") ? token.slice(7) : token;

        jwt.verify(bearer, process.env.JWT_SECRET, (err, decoded) => {
            if (err || decoded.purpose === 'reset') {
                req.userId = null;
                req.userRole = "guest";
                req.user = null;
            } else {
                req.userId = decoded.id;
                req.userRole = decoded.role;
                req.userPlan = decoded.plan;
                req.user = {
                    id: decoded.id,
                    role: decoded.role,
                    plan: decoded.plan
                };
            }
            next();
        });
    } catch (err) {
        console.error("verifyTokenOptional Middleware Crash:", err);
        req.userId = null;
        req.userRole = "guest";
        next();
    }
};

module.exports = verifyTokenOptional;
