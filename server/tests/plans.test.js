const {
  SUBSCRIPTION_PLANS,
  PLAN_PRICES_PAISE,
  LISTING_CONFIG,
  CREDIT_PACKS,
  normalizePlanId,
} = require("../config/plans");

describe("plan catalogue (single source of truth)", () => {
  it("defines canonical recurring tiers with monthly + yearly paise amounts", () => {
    for (const tier of ["pro", "gold", "firm"]) {
      expect(SUBSCRIPTION_PLANS[tier]).toBeDefined();
      expect(SUBSCRIPTION_PLANS[tier].amount.monthly).toBeGreaterThan(0);
      expect(SUBSCRIPTION_PLANS[tier].amount.yearly).toBeGreaterThan(0);
    }
  });

  it("maps legacy aliases to the same price as their canonical tier", () => {
    expect(PLAN_PRICES_PAISE.silver).toBe(PLAN_PRICES_PAISE.pro);
    expect(PLAN_PRICES_PAISE.diamond).toBe(PLAN_PRICES_PAISE.firm);
  });

  it("keeps one-time plan prices aligned with subscription monthly prices", () => {
    // (env overrides may change these; the alias consistency above is the invariant)
    expect(PLAN_PRICES_PAISE.pro).toBe(SUBSCRIPTION_PLANS.pro.amount.monthly);
    expect(PLAN_PRICES_PAISE.gold).toBe(SUBSCRIPTION_PLANS.gold.amount.monthly);
    expect(PLAN_PRICES_PAISE.firm).toBe(SUBSCRIPTION_PLANS.firm.amount.monthly);
  });

  it("exposes listing and credit catalogues", () => {
    expect(LISTING_CONFIG.standard.amount).toBe(199900);
    expect(LISTING_CONFIG.premium.amount).toBe(499900);
    expect(CREDIT_PACKS.starter.credits).toBe(20);
  });

  it("normalizes legacy and canonical plan ids consistently", () => {
    expect(normalizePlanId("silver")).toBe("pro");
    expect(normalizePlanId("diamond")).toBe("firm");
    expect(normalizePlanId("GOLD")).toBe("gold");
    expect(normalizePlanId("pro")).toBe("pro");
    expect(normalizePlanId("firm")).toBe("firm");
    expect(normalizePlanId(undefined)).toBe("free");
    expect(normalizePlanId("nonsense")).toBe("free");
  });
});
