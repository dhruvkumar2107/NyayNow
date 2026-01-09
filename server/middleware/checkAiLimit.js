const User = require("../models/User");

const checkAiLimit = async (req, res, next) => {
    try {
        // Allow Guests (Limit handled by Frontend/RateLimiter)
        if (!req.userId) {
            return next();
        }

        const user = await User.findById(req.userId);
        if (!user) {
            // If token was valid but user deleted? Treat as guest or error. 
            // Erroring is safer for now to avoid confusion.
            return res.status(404).json({ error: "User not found" });
        }

        // Pass through for paid users
        if (user.plan && user.plan !== "free") {
            return next();
        }

        // Free User Logic
        const LIMIT = 3;
        const TIME_LIMIT_HOURS = 6;

        // Check if locked
        if (user.aiUsage.count >= LIMIT) {
            return res.status(403).json({
                error: "AI Limit Reached. Please upgrade to continue.",
                code: "LIMIT_REACHED"
            });
        }

        if (user.aiUsage.firstUsedAt) {
            const now = new Date();
            const firstUsed = new Date(user.aiUsage.firstUsedAt);
            const diffHours = (now - firstUsed) / (1000 * 60 * 60);

            if (diffHours >= TIME_LIMIT_HOURS) {
                return res.status(403).json({
                    error: "Trial period expired (6 hours). Please upgrade.",
                    code: "TRIAL_EXPIRED"
                });
            }
        }

        // If allowed, we need to track this usage. 
        // We'll attach a function to req that the route handler can call to increment count.
        // OR better, we increment here? 
        // If we increment here, even failed AI calls might count. 
        // But for simplicity and security, let's increment here.
        // Wait, if it fails, we shouldn't count. 
        // Let's increment NOW. If the AI service fails, it's a consumed token anyway in most systems.

        if (user.aiUsage.count === 0 && !user.aiUsage.firstUsedAt) {
            user.aiUsage.firstUsedAt = new Date();
        }
        user.aiUsage.count += 1;
        await user.save();

        next();
    } catch (err) {
        console.error("AI Limit Check Error:", err);
        res.status(500).json({ error: "Server error checking limits" });
    }
};

module.exports = checkAiLimit;
