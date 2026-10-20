/**
 * NyayNow plan catalogue — SINGLE SOURCE OF TRUTH for plan pricing.
 *
 * Historically two catalogues drifted apart:
 *   - `paymentService.PLAN_PRICES_PAISE` used legacy names silver/gold/diamond
 *   - `routes/subscriptions.PLAN_CONFIG` used pro/gold/firm with different prices
 *
 * This module consolidates them. Canonical tiers are `pro | gold | firm`.
 * Legacy one-time plan names are mapped to a canonical tier via
 * `LEGACY_PLAN_ALIASES`, so `silver -> pro` and `diamond -> firm`.
 *
 * NOTE: changing any `amount` (paise) here changes what customers are charged.
 * Treat edits as a billing change and review before deploy.
 */

// Canonical recurring subscription tiers (paise).
const SUBSCRIPTION_PLANS = {
  pro: {
    name: "Nyay Pro",
    amount: { monthly: 29900, yearly: 249900 }, // ₹299/mo | ₹2499/yr
    period: "monthly",
    interval: 1,
    description: "AI-assisted information, document workflows, and search features subject to current availability",
    features: ["AI query access subject to fair use", "Precedent search subject to source availability", "Document drafting tools", "Case PDF tools", "NyayVoice access subject to availability", "Outcome prediction: in development, not included"]
  },
  gold: {
    name: "Nyay Gold",
    amount: { monthly: 79900, yearly: 699900 }, // ₹799/mo | ₹6999/yr
    period: "monthly",
    interval: 1,
    description: "Everything in Pro with expanded workflow access, subject to current availability",
    features: ["AI query access subject to fair use", "Precedent search subject to source availability", "Document drafting tools", "Case PDF tools", "Outcome prediction: in development, not included"]
  },
  firm: {
    name: "Nyay Firm",
    amount: { monthly: 299900, yearly: 2499900 }, // ₹2999/mo | ₹24999/yr
    period: "monthly",
    interval: 1,
    description: "Everything in Gold; firm-specific services require separate confirmation",
    features: ["Everything in Gold", "Team seats: in development", "Contract heatmap: in development", "Public API: not currently offered", "White-label: not currently offered", "Dedicated support: by separate agreement"]
  }
};

// Legacy plan-name -> canonical tier. `gold` is already canonical.
const LEGACY_PLAN_ALIASES = {
  silver: "pro",
  gold: "gold",
  diamond: "firm"
};

const CANONICAL_PLANS = ["free", "pro", "gold", "firm"];

// Lawyer listing upgrade prices (paise).
const LISTING_CONFIG = {
  standard: {
    name: "Pro Lawyer Listing",
    amount: 199900, // ₹1999/month
    description: "Priority listing, verified badge, unlimited leads"
  },
  premium: {
    name: "Elite Lawyer Listing",
    amount: 499900, // ₹4999/month
    description: "Featured homepage + category top + analytics"
  }
};

// AI credit packs (paise).
const CREDIT_PACKS = {
  starter:  { credits: 20,  amountPaise: 9900,  label: "20 Queries" },
  standard: { credits: 100, amountPaise: 39900, label: "100 Queries" },
  pro:      { credits: 500, amountPaise: 149900, label: "500 Queries" }
};

function paise(envName, fallback) {
  const v = Number(process.env[envName]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// Server-authoritative one-time plan → amount map (paise). Never trust
// client-supplied amounts. Canonical tiers use their monthly price; legacy
// aliases resolve to the same tier so an old client cannot pay a stale price.
const PLAN_PRICES_PAISE = {
  pro:   paise("RZP_AMOUNT_PRO",  paise("RZP_AMOUNT_SILVER", SUBSCRIPTION_PLANS.pro.amount.monthly)),
  gold:  paise("RZP_AMOUNT_GOLD", SUBSCRIPTION_PLANS.gold.amount.monthly),
  firm:  paise("RZP_AMOUNT_FIRM", paise("RZP_AMOUNT_DIAMOND", SUBSCRIPTION_PLANS.firm.amount.monthly)),
  silver:  paise("RZP_AMOUNT_PRO",  paise("RZP_AMOUNT_SILVER", SUBSCRIPTION_PLANS.pro.amount.monthly)),  // legacy alias
  diamond: paise("RZP_AMOUNT_FIRM", paise("RZP_AMOUNT_DIAMOND", SUBSCRIPTION_PLANS.firm.amount.monthly)), // legacy alias
  credits_1:  9900,
  credits_20: 19900
};

/**
 * Resolve a raw plan string to a canonical tier.
 * @returns {"free"|"pro"|"gold"|"firm"}
 */
function normalizePlanId(plan) {
  const p = (plan || "free").toLowerCase();
  if (LEGACY_PLAN_ALIASES[p]) return LEGACY_PLAN_ALIASES[p];
  if (CANONICAL_PLANS.includes(p)) return p;
  return "free";
}

module.exports = {
  SUBSCRIPTION_PLANS,
  LEGACY_PLAN_ALIASES,
  CANONICAL_PLANS,
  PLAN_PRICES_PAISE,
  LISTING_CONFIG,
  CREDIT_PACKS,
  normalizePlanId
};
