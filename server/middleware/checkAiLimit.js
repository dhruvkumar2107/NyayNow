const User = require("../models/User");

// Guest IP tracking (in-memory, resets on restart — acceptable for guests)
const GUEST_LIMIT = 3;
const guestUsage = new Map();

const checkAiLimit = async (req, res, next) => {
  try {
    // ── GUEST (unauthenticated) ──────────────────────────────
    if (!req.userId) {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
      const usage = guestUsage.get(ip) || { count: 0, resetAt: Date.now() + 24 * 60 * 60 * 1000 };

      // Reset daily
      if (Date.now() > usage.resetAt) {
        usage.count = 0;
        usage.resetAt = Date.now() + 24 * 60 * 60 * 1000;
      }

      if (usage.count >= GUEST_LIMIT) {
        return res.status(403).json({
          error: "Sign in for more free queries. Guests get 3 free queries per day.",
          code: "GUEST_LIMIT_REACHED",
          requiresAuth: true
        });
      }

      usage.count += 1;
      guestUsage.set(ip, usage);
      return next();
    }

    // ── AUTHENTICATED USER ───────────────────────────────────
    const user = await User.findById(req.userId).select("plan credits aiUsage");
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user; // Attach user to request

    // Unlimited plans
    const isUnlimited = ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan?.toLowerCase());
    if (isUnlimited) {
      // Use atomic $inc — no full document save needed
      await User.findByIdAndUpdate(req.userId, { $inc: { "aiUsage.count": 1 } });
      return next();
    }

    // Credit-based
    if (user.credits && user.credits > 0) {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { credits: -1, "aiUsage.count": 1 }
      });
      return next();
    }

    // Free quota (5 queries lifetime for free users)
    if (user.aiUsage.count < 5) {
      const updateOp = { $inc: { "aiUsage.count": 1 } };
      if (user.aiUsage.count === 0 && !user.aiUsage.firstUsedAt) {
        updateOp.$set = { "aiUsage.firstUsedAt": new Date() };
      }
      await User.findByIdAndUpdate(req.userId, updateOp);
      return next();
    }

    // Limit reached
    return res.status(403).json({
      error: "Free query limit reached. Upgrade to Pro or buy a credits pack!",
      code: "LIMIT_REACHED",
      credits: user.credits || 0,
      usage: user.aiUsage.count,
      upgradeUrl: "/pricing"
    });

  } catch (err) {
    console.error("AI Limit Check Error:", err.message);
    res.status(500).json({ error: "Server error checking limits" });
  }
};

module.exports = checkAiLimit;
