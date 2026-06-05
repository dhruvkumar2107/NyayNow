/**
 * Plan Restrictions Utility
 * 
 * Logic to check if a user has access to a specific feature based on their plan.
 * Plans: "free", "silver" (Pro), "gold" (Premium), "diamond"
 */

export const PLAN_LEVELS = {
  free: 0,
  silver: 1,
  pro: 1,
  gold: 2,
  firm: 2,
  diamond: 3
};

export const FEATURE_LIMITS = {
  // Basic Features (Level 0)
  BASIC_QA: { level: 'free', limit: 5 },
  MARKETPLACE_ACCESS: { level: 'free' },
  BASIC_TEMPLATES: { level: 'free' },
  
  // Pro Features (Level 1)
  UNLIMITED_AI_CHAT: { level: 'pro' },
  DOCUMENT_DRAFTING: { level: 'pro', limit: 10 },
  LEGAL_RESEARCH: { level: 'pro' },
  FIR_GENERATOR: { level: 'pro' },
  NYAY_VOICE: { level: 'pro' },
  
  // Firm Features (Level 2)
  LAWYER_CONSULTATION: { level: 'firm', limit: 1 },
  AGREEMENT_REVIEW: { level: 'firm' },
  NYAY_COURT: { level: 'firm' },
  DEVILS_ADVOCATE: { level: 'firm' },
  VIDEO_CALLS: { level: 'firm' }
};

export const hasAccess = (userPlan, featureName, usageCount = 0) => {
  const userLevel = PLAN_LEVELS[userPlan?.toLowerCase()] || 0;
  const feature = FEATURE_LIMITS[featureName];
  
  if (!feature) return true; // Default to accessible if not defined
  
  const requiredLevel = PLAN_LEVELS[feature.level] || 0;

  // TRIAL LOGIC: Allow 1st use for free users
  if (userLevel < requiredLevel && usageCount < 1) {
    return true; // Trial available
  }
  
  return userLevel >= requiredLevel;
};

export const getRemainingLimit = (userPlan, featureName, currentUsage = 0) => {
  const feature = FEATURE_LIMITS[featureName];
  if (!feature || !feature.limit) return Infinity;
  
  // If user has a higher plan than required, they might get unlimited (logic depends on business rule)
  // For now, it's a hard limit based on the feature definition
  return Math.max(0, feature.limit - currentUsage);
};
