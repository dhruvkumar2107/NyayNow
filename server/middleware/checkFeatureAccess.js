/**
 * checkFeatureAccess(featureName)
 * 
 * Middleware factory — call it per route:
 *   router.post('/predict-outcome', verifyToken, checkFeatureAccess('predict-outcome'), ...)
 * 
 * - Checks the user's plan against the feature matrix
 * - Enforces monthly usage limits using per-feature counters
 * - Returns remaining usage count in response headers
 * - Returns structured 403 with upgrade info when blocked
 */

const User = require('../models/User');
const GuestUsage = require('../models/GuestUsage');
const { getLimit, normalizePlan, FEATURE_MATRIX } = require('../utils/featureMatrix');

const GUEST_LIMIT = 3;

function checkFeatureAccess(featureName) {
  return async (req, res, next) => {
    // Intercept res.json to automatically append usage metadata
    const originalJson = res.json;
    res.json = function (body) {
      if (body && typeof body === 'object' && req.featureUsage) {
        body.usage = req.featureUsage;
      }
      return originalJson.call(this, body);
    };

    try {
      // ── GUEST ──────────────────────────────────────────────────────────────
      if (!req.userId) {
        const limit = getLimit(featureName, 'free');
        if (limit === false) {
          return res.status(403).json({
            error: `Please sign in to use ${FEATURE_MATRIX[featureName]?.label || featureName}.`,
            code: 'LOGIN_REQUIRED',
            feature: featureName,
            requiresAuth: true,
            upgradeUrl: '/login'
          });
        }

        // Enforce Guest Daily Limit (3 queries/day)
        const ip = req.ip || "unknown";
        const now = new Date();
        const nextReset = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const usage = await GuestUsage.findOneAndUpdate(
          {
            ip,
            $or: [
              { resetAt: { $gt: now }, count: { $lt: GUEST_LIMIT } },
              { resetAt: { $lte: now } },
            ],
          },
          [
            {
              $set: {
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

        if (!usage) {
          return res.status(403).json({
            error: "Sign in for more free queries. Guests get 3 free queries per day.",
            code: "GUEST_LIMIT_REACHED",
            requiresAuth: true,
            limit: GUEST_LIMIT,
            remaining: 0
          });
        }

        const guestRemaining = GUEST_LIMIT - usage.count;
        res.setHeader('X-Feature-Remaining', guestRemaining);
        res.setHeader('X-Feature-Limit', GUEST_LIMIT);
        res.setHeader('X-Feature-Name', featureName);

        req.featureUsage = {
          feature: featureName,
          used: usage.count,
          limit: GUEST_LIMIT,
          remaining: guestRemaining,
          resetAt: usage.resetAt.toISOString()
        };

        return next();
      }

      // ── AUTHENTICATED ──────────────────────────────────────────────────────
      const user = await User.findById(req.userId).select('plan featureUsage credits');
      if (!user) return res.status(404).json({ error: 'User not found' });
      req.user = user;

      const tier = normalizePlan(user.plan);
      const limit = getLimit(featureName, user.plan);

      // ── BLOCKED (feature not in plan) ──────────────────────────────────────
      if (limit === false) {
        const feature = FEATURE_MATRIX[featureName];
        const requiredPlan = getRequiredPlan(featureName);
        return res.status(403).json({
          error: feature?.upgradeMessage || `Upgrade required to use this feature.`,
          code: 'PLAN_UPGRADE_REQUIRED',
          feature: featureName,
          featureLabel: feature?.label,
          currentPlan: tier,
          requiredPlan,
          upgradeUrl: '/pricing',
          remaining: 0,
          limit: 0
        });
      }

      // ── UNLIMITED (no tracking needed) ────────────────────────────────────
      if (limit === 'unlimited') {
        res.setHeader('X-Feature-Remaining', 'unlimited');
        res.setHeader('X-Feature-Limit', 'unlimited');
        res.setHeader('X-Feature-Name', featureName);
        
        req.featureUsage = {
          feature: featureName,
          used: 0,
          limit: 'unlimited',
          remaining: 'unlimited'
        };
        return next();
      }

      // ── MONTHLY LIMIT CHECK ───────────────────────────────────────────────
      const now = new Date();
      const featureUsage = user.featureUsage || new Map();
      const usage = featureUsage.get(featureName) || { count: 0, resetAt: getNextResetDate() };

      // Reset if monthly window expired
      const resetAt = new Date(usage.resetAt);
      let currentCount = resetAt > now ? usage.count : 0;

      if (currentCount >= limit) {
        const daysLeft = Math.ceil((resetAt - now) / (1000 * 60 * 60 * 24));
        return res.status(403).json({
          error: `You have used all ${limit} ${FEATURE_MATRIX[featureName]?.label || featureName} queries this month. Resets in ${daysLeft} day(s) or upgrade for more.`,
          code: 'MONTHLY_LIMIT_REACHED',
          feature: featureName,
          featureLabel: FEATURE_MATRIX[featureName]?.label,
          currentPlan: tier,
          used: currentCount,
          limit,
          remaining: 0,
          resetAt: resetAt.toISOString(),
          upgradeUrl: '/pricing'
        });
      }

      // ── INCREMENT USAGE ───────────────────────────────────────────────────
      const newCount = currentCount + 1;
      const newResetAt = resetAt > now ? resetAt : getNextResetDate();

      await User.findByIdAndUpdate(req.userId, {
        $set: {
          [`featureUsage.${featureName}`]: {
            count: newCount,
            resetAt: newResetAt
          }
        }
      });

      const remaining = limit - newCount;

      // Set headers so frontend can read remaining count
      res.setHeader('X-Feature-Remaining', remaining);
      res.setHeader('X-Feature-Limit', limit);
      res.setHeader('X-Feature-Name', featureName);
      res.setHeader('X-Feature-Used', newCount);
      res.setHeader('X-Feature-Reset', newResetAt.toISOString());

      // Attach to req so route handler can embed in response body too
      req.featureUsage = {
        feature: featureName,
        used: newCount,
        limit,
        remaining,
        resetAt: newResetAt.toISOString()
      };

      return next();

    } catch (err) {
      console.error(`Feature Access Check Error [${featureName}]:`, err.message);
      return res.status(500).json({ error: 'Server error checking feature access' });
    }
  };
}

/**
 * Find the minimum plan required for a feature
 */
function getRequiredPlan(featureName) {
  const feature = FEATURE_MATRIX[featureName];
  if (!feature) return 'pro';
  const { limits } = feature;
  if (limits.free !== false) return 'free';
  if (limits.pro !== false) return 'pro';
  if (limits.gold !== false) return 'gold';
  return 'firm';
}

/**
 * Get first day of next month as reset date
 */
function getNextResetDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = checkFeatureAccess;
