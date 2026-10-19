const fs = require("fs");
const path = require("path");

/**
 * IPC-to-BNS reference map loader (server side).
 * Canonical seed lives at <repo>/data/ipc-bns-map.json, with a bundled
 * fallback copy at <repo>/client/src/data/ipc-bns-map.json so the API keeps
 * working in split deployments (Vercel client / Render server).
 */
const CANDIDATE_PATHS = [
  path.join(__dirname, "..", "..", "data", "ipc-bns-map.json"),
  path.join(__dirname, "..", "..", "client", "src", "data", "ipc-bns-map.json"),
];

const EMPTY_MAP = {
  version: null,
  generatedAt: null,
  legalReview: true,
  reviewStatus: "unavailable",
  direction: "IPC-to-BNS",
  source: {},
  disclaimer: "IPC-to-BNS reference data is currently unavailable.",
  items: [],
};

function loadMap() {
  for (const candidate of CANDIDATE_PATHS) {
    try {
      if (fs.existsSync(candidate)) {
        return JSON.parse(fs.readFileSync(candidate, "utf8"));
      }
    } catch (err) {
      console.error(`ipcBnsData: failed to read ${candidate}:`, err.message);
    }
  }
  return EMPTY_MAP;
}

const MAP = loadMap();

const normalize = (value) =>
  String(value == null ? "" : value)
    .toLowerCase()
    .replace(/\bipc\b/g, "")
    .replace(/\bbns\b/g, "")
    .replace(/section/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

function getIpcBnsEntry(ipc) {
  const key = normalize(ipc);
  if (!key) return null;
  return MAP.items.find((item) => normalize(item.ipc) === key) || null;
}

function searchIpcBns(query) {
  const q = String(query == null ? "" : query).trim().toLowerCase();
  if (!q) return MAP.items;
  return MAP.items.filter((item) =>
    [item.ipc, item.ipcTitle, item.bns, item.bnsTitle, item.category]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
}

module.exports = {
  IPC_BNS_MAP: MAP,
  IPC_BNS_META: {
    version: MAP.version,
    generatedAt: MAP.generatedAt,
    legalReview: MAP.legalReview,
    reviewStatus: MAP.reviewStatus,
    direction: MAP.direction,
    source: MAP.source,
    disclaimer: MAP.disclaimer,
  },
  getIpcBnsEntry,
  searchIpcBns,
};
