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
      const nextReset = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Single atomic upsert: create with count=1 if new window, or increment if under limit.
      // This eliminates the TOCTOU gap between findOne and subsequent writes.
      const usage = await GuestUsage.findOneAndUpdate(
        {
          ip,
          $or: [
            { resetAt: { $gt: now }, count: { $lt: GUEST_LIMIT } },
            { resetAt: { $lte: now } }, // window expired — will be reset below
          ],
        },
        [
          {
            $set: {
              // If window expired, reset to 1; otherwise increment
              count: {
                $cond: [{ $lte: ["$resetAt", now] }, 1, { $add: ["$count", 1] }]
              },
              resetAt: {
                $cond: [{ $lte: ["$resetAt", now] }, nextReset, "$resetAt"]
              },
              ip: ip,
            }
          }
        ],
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // If the document was not matched (limit already reached), usage will be null
      if (!usage) {
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
