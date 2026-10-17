const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    const bearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    jwt.verify(bearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (decoded.purpose === 'reset') {
            return res.status(401).json({ error: "Invalid token type" });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userPlan = decoded.plan;
        req.user = {
            id: decoded.id,
            role: decoded.role,
            plan: decoded.plan
        };
        next();
    });
};

module.exports = verifyToken;
