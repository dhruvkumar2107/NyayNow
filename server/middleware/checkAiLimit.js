const User = require("../models/User");
const GuestUsage = require("../models/GuestUsage");

const GUEST_LIMIT = 3;
const FREE_LIMIT  = 5;

const checkAiLimit = async (req, res, next) => {
  try {
    // ── GUEST ─────────────────────────────────────────────────
    if (!req.userId) {
      const ip  = req.ip || "unknown";
      const now = new Date();

      // Atomic upsert: insert with count=1 if new, or fetch existing
      let usage = await GuestUsage.findOne({ ip });

      if (!usage) {
        usage = await GuestUsage.create({
          ip,
          count: 1,
          resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        return next();
      }

      if (now > usage.resetAt) {
        // Reset window atomically
        await GuestUsage.findOneAndUpdate(
          { ip },
          { count: 1, resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        );
        return next();
      }

      if (usage.count >= GUEST_LIMIT) {
        return res.status(403).json({
          error: "Sign in for more free queries. Guests get 3 free queries per day.",
          code: "GUEST_LIMIT_REACHED",
          requiresAuth: true,
        });
      }

      // Atomic increment only if still under limit
      const updated = await GuestUsage.findOneAndUpdate(
        { ip, count: { $lt: GUEST_LIMIT } },
        { $inc: { count: 1 } }
      );
      if (!updated) {
        return res.status(403).json({
          error: "Sign in for more free queries. Guests get 3 free queries per day.",
          code: "GUEST_LIMIT_REACHED",
          requiresAuth: true,
        });
      }
      return next();
    }

    // ── AUTHENTICATED ─────────────────────────────────────────
    const user = await User.findById(req.userId).select("plan credits aiUsage");
    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = user;

    // Unlimited plans — just track usage, never block
    const isUnlimited = ["pro", "firm", "silver", "gold", "diamond"].includes(
      user.plan?.toLowerCase()
    );
    if (isUnlimited) {
      await User.findByIdAndUpdate(req.userId, { $inc: { "aiUsage.count": 1 } });
      return next();
    }

    // Credit-based — atomic: decrement only if credits > 0
    if ((user.credits || 0) > 0) {
      const credited = await User.findOneAndUpdate(
        { _id: req.userId, credits: { $gt: 0 } },
        { $inc: { credits: -1, "aiUsage.count": 1 } }
      );
      if (credited) return next();
      // Race lost (another request spent the last credit); fall through to free quota
    }

    // Free quota — atomic: increment only if count < FREE_LIMIT
    const quotaUpdate = { $inc: { "aiUsage.count": 1 } };
    if (!user.aiUsage.firstUsedAt) {
      quotaUpdate.$set = { "aiUsage.firstUsedAt": new Date() };
    }
    const withQuota = await User.findOneAndUpdate(
      { _id: req.userId, "aiUsage.count": { $lt: FREE_LIMIT } },
      quotaUpdate
    );
    if (withQuota) return next();

    // Limit reached
    return res.status(403).json({
      error: "Free query limit reached. Upgrade to Pro or buy a credits pack!",
      code: "LIMIT_REACHED",
      credits: user.credits || 0,
      usage: user.aiUsage.count,
      upgradeUrl: "/pricing",
    });

  } catch (err) {
    console.error("AI Limit Check Error:", err.message);
    res.status(500).json({ error: "Server error checking limits" });
  }
};

module.exports = checkAiLimit;
