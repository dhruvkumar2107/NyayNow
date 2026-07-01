/**
 * NyayNow Feature Matrix — Single Source of Truth
 * Controls which plan gets what feature and how many uses per month.
 * 
 * limits: { saathi: N|'unlimited'|false, pro: ..., gold: ..., firm: ... }
 * false   = feature is completely blocked for that plan
 * Number  = monthly usage limit
 * 'unlimited' = no limit
 */

const FEATURE_MATRIX = {
  // ── AI ASSISTANT ─────────────────────────────────────────────────────────
  'assistant': {
    label: 'AI Legal Assistant',
    upgradeMessage: 'Upgrade to Nyay Pro for unlimited legal AI queries.',
    limits: { free: 10, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── LEGAL RESEARCH ────────────────────────────────────────────────────────
  'legal-research': {
    label: 'Precedent Research',
    upgradeMessage: 'Upgrade to Nyay Pro for 30 searches/month or Gold for unlimited.',
    limits: { free: 3, pro: 30, gold: 'unlimited', firm: 'unlimited' }
  },

  // ── DOCUMENT DRAFTING ─────────────────────────────────────────────────────
  'draft-notice': {
    label: 'Document Drafting',
    upgradeMessage: 'Upgrade to Nyay Pro for 10 drafts/month or Gold for unlimited.',
    limits: { free: 1, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },

  'draft-contract': {
    label: 'Contract Drafting',
    upgradeMessage: 'Upgrade to Nyay Pro to draft contracts and agreements.',
    limits: { free: false, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },

  'agreement': {
    label: 'Agreement Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to generate legal agreements.',
    limits: { free: false, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },

  // ── PDF ANALYSIS ──────────────────────────────────────────────────────────
  'analyze-case-file': {
    label: 'Case PDF Analysis',
    upgradeMessage: 'Upgrade to Nyay Pro for 5 PDF analyses/month or Gold for 25.',
    limits: { free: false, pro: 5, gold: 25, firm: 'unlimited' }
  },

  'analyze-agreement-pdf': {
    label: 'Agreement PDF Analysis',
    upgradeMessage: 'Upgrade to Nyay Pro to analyse agreement documents.',
    limits: { free: false, pro: 5, gold: 25, firm: 'unlimited' }
  },

  // ── JUDGE AI ──────────────────────────────────────────────────────────────
  'predict-outcome': {
    label: 'Judge AI — Outcome Predictor',
    upgradeMessage: 'Upgrade to Nyay Pro for 3 predictions/month or Gold for unlimited.',
    limits: { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited' }
  },

  // ── CASE ANALYSIS ─────────────────────────────────────────────────────────
  'case-analysis': {
    label: 'AI Case Analysis',
    upgradeMessage: 'Upgrade to Nyay Pro to use AI case analysis.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── FIRAC CASE DETAIL ─────────────────────────────────────────────────────
  'case-detail': {
    label: 'FIRAC Case Profile',
    upgradeMessage: 'Sign up for free to access case profiles.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── CASE CHAT ─────────────────────────────────────────────────────────────
  'chat-case': {
    label: 'AI Case Chat',
    upgradeMessage: 'Sign up for free to use AI case chat.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── LEGAL NOTICE ─────────────────────────────────────────────────────────
  'legal-notice': {
    label: 'Legal Notice Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to generate legal notices.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── FIR GENERATOR ─────────────────────────────────────────────────────────
  'fir-generator': {
    label: 'FIR Draft Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to draft FIR complaints.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── DEVIL'S ADVOCATE ─────────────────────────────────────────────────────
  'devils-advocate': {
    label: "Devil's Advocate Mode",
    upgradeMessage: "Upgrade to Nyay Pro to use Devil's Advocate mode.",
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── MOOT COURT ────────────────────────────────────────────────────────────
  'moot-court': {
    label: 'Moot Court / AI Judge',
    upgradeMessage: 'Upgrade to Nyay Gold to access the Moot Court simulator.',
    limits: { free: false, pro: false, gold: 'unlimited', firm: 'unlimited' }
  },

  // ── COURTROOM BATTLE ─────────────────────────────────────────────────────
  'courtroom-battle': {
    label: 'Courtroom Battle Simulator',
    upgradeMessage: 'Upgrade to Nyay Pro for 3 simulations/month or Gold for unlimited.',
    limits: { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited' }
  },

  // ── JUDGE PROFILE ────────────────────────────────────────────────────────
  'judge-profile': {
    label: 'Judge Profile Analyser',
    upgradeMessage: 'Upgrade to Nyay Pro to analyse judge profiles.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── CAREER MENTOR ─────────────────────────────────────────────────────────
  'career-mentor': {
    label: 'Legal Career Mentor',
    upgradeMessage: 'Sign up for free to access career mentoring.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },

  // ── LEGAL SOS ─────────────────────────────────────────────────────────────
  // Always free — never blocked
  'legal-sos': {
    label: 'Legal SOS',
    upgradeMessage: null,
    limits: { free: 'unlimited', pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
};

/**
 * Normalize a user's plan string to one of our 4 tier keys.
 */
function normalizePlan(plan) {
  const p = (plan || 'free').toLowerCase();
  if (['pro'].includes(p)) return 'pro';
  if (['gold', 'silver', 'diamond'].includes(p)) return 'gold';
  if (['firm'].includes(p)) return 'firm';
  return 'free';
}

/**
 * Get the limit for a feature+plan combination.
 * Returns: false | 'unlimited' | Number
 */
function getLimit(feature, plan) {
  const entry = FEATURE_MATRIX[feature];
  if (!entry) return 'unlimited'; // Unknown feature → allow
  const tier = normalizePlan(plan);
  return entry.limits[tier] ?? 'unlimited';
}

module.exports = { FEATURE_MATRIX, normalizePlan, getLimit };
