const User = require("../models/User");

const checkAiLimit = async (req, res, next) => {
    try {
        // Allow Guests
        if (!req.userId) {
            return next();
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user; // Attach user to request

        // Unlimited Plans (Pro/Firm/Silver/Gold/Diamond)
        const isUnlimited = ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan?.toLowerCase());

        if (isUnlimited) {
            user.aiUsage.count += 1;
            await user.save();
            return next();
        }

        // Credit-based allowance
        if (user.credits && user.credits > 0) {
            user.credits -= 1;
            user.aiUsage.count += 1;
            await user.save();
            return next();
        }

        // Free Quota Check (Initial 5 queries)
        if (user.aiUsage.count < 5) {
            if (user.aiUsage.count === 0 && !user.aiUsage.firstUsedAt) {
                user.aiUsage.firstUsedAt = new Date();
            }
            user.aiUsage.count += 1;
            await user.save();
            return next();
        }

        // Block if limits reached
        return res.status(403).json({
            error: "Free query limit reached. Please purchase a credits pack or upgrade to Pro!",
            code: "LIMIT_REACHED",
            credits: user.credits || 0,
            usage: user.aiUsage.count
        });
    } catch (err) {
        console.error("AI Limit Check Error:", err);
        res.status(500).json({ error: "Server error checking limits" });
    }
};

module.exports = checkAiLimit;
