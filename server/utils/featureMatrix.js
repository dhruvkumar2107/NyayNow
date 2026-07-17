/**
 * NyayNow Feature Matrix — Single Source of Truth
 * Controls which plan gets what feature and how many uses per month.
 * Can be edited dynamically by the Admin dashboard.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/featureMatrix.json');

const DEFAULT_MATRIX = {
  'assistant': {
    label: 'AI Legal Assistant',
    upgradeMessage: 'Upgrade to Nyay Pro for unlimited legal AI queries.',
    limits: { free: 10, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'legal-research': {
    label: 'Precedent Research',
    upgradeMessage: 'Upgrade to Nyay Pro for 30 searches/month or Gold for unlimited.',
    limits: { free: 3, pro: 30, gold: 'unlimited', firm: 'unlimited' }
  },
  'draft-notice': {
    label: 'Document Drafting',
    upgradeMessage: 'Upgrade to Nyay Pro for 10 drafts/month or Gold for unlimited.',
    limits: { free: 1, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },
  'draft-contract': {
    label: 'Contract Drafting',
    upgradeMessage: 'Upgrade to Nyay Pro for 10 drafts/month or Gold for unlimited.',
    limits: { free: 1, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },
  'agreement': {
    label: 'Agreement Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to generate legal agreements.',
    limits: { free: false, pro: 10, gold: 'unlimited', firm: 'unlimited' }
  },
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
  'predict-outcome': {
    label: 'Judge AI — Outcome Predictor',
    upgradeMessage: 'Upgrade to Nyay Pro for 3 predictions/month or Gold for unlimited.',
    limits: { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited' }
  },
  'case-analysis': {
    label: 'AI Case Analysis',
    upgradeMessage: 'Upgrade to Nyay Pro to use AI case analysis.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'case-detail': {
    label: 'FIRAC Case Profile',
    upgradeMessage: 'Sign up for free to access case profiles.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'chat-case': {
    label: 'AI Case Chat',
    upgradeMessage: 'Sign up for free to use AI case chat.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'legal-notice': {
    label: 'Legal Notice Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to generate legal notices.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'fir-generator': {
    label: 'FIR Draft Generator',
    upgradeMessage: 'Upgrade to Nyay Pro to draft FIR complaints.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'devils-advocate': {
    label: "Devil's Advocate Mode",
    upgradeMessage: "Upgrade to Nyay Pro to use Devil's Advocate mode.",
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'moot-court': {
    label: 'Moot Court / AI Judge',
    upgradeMessage: 'Upgrade to Nyay Gold to access the Moot Court simulator.',
    limits: { free: false, pro: false, gold: 'unlimited', firm: 'unlimited' }
  },
  'courtroom-battle': {
    label: 'Courtroom Battle Simulator',
    upgradeMessage: 'Upgrade to Nyay Pro for 3 simulations/month or Gold for unlimited.',
    limits: { free: false, pro: 3, gold: 'unlimited', firm: 'unlimited' }
  },
  'judge-profile': {
    label: 'Judge Profile Analyser',
    upgradeMessage: 'Upgrade to Nyay Pro to analyse judge profiles.',
    limits: { free: false, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'career-mentor': {
    label: 'Legal Career Mentor',
    upgradeMessage: 'Sign up for free to access career mentoring.',
    limits: { free: 5, pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  },
  'legal-sos': {
    label: 'Legal SOS',
    upgradeMessage: null,
    limits: { free: 'unlimited', pro: 'unlimited', gold: 'unlimited', firm: 'unlimited' }
  }
};

function getFeatureMatrix() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading feature matrix config file:", err);
  }
  return DEFAULT_MATRIX;
}

function saveFeatureMatrix(matrix) {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(matrix, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving feature matrix config file:", err);
    return false;
  }
}

function normalizePlan(plan) {
  const p = (plan || 'free').toLowerCase();
  if (['pro'].includes(p)) return 'pro';
  if (['gold', 'silver', 'diamond'].includes(p)) return 'gold';
  if (['firm'].includes(p)) return 'firm';
  return 'free';
}

function getLimit(feature, plan) {
  const matrix = getFeatureMatrix();
  const entry = matrix[feature];
  if (!entry) return 'unlimited';
  const tier = normalizePlan(plan);
  return entry.limits[tier] ?? 'unlimited';
}

module.exports = {
  FEATURE_MATRIX: DEFAULT_MATRIX, // For legacy compatibility imports if needed
  getFeatureMatrix,
  saveFeatureMatrix,
  normalizePlan,
  getLimit
};
