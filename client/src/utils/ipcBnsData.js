import rawMap from "../data/ipc-bns-map.json";

export const IPC_BNS_MAP = rawMap;

export const IPC_BNS_META = {
  version: rawMap.version,
  generatedAt: rawMap.generatedAt,
  legalReview: rawMap.legalReview,
  reviewStatus: rawMap.reviewStatus,
  source: rawMap.source,
  disclaimer: rawMap.disclaimer,
};

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\bipc\b/g, "")
    .replace(/\bbns\b/g, "")
    .replace(/section/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export function getIpcBnsEntry(ipc) {
  const key = normalize(ipc);
  if (!key) return null;
  return (
    rawMap.items.find((item) => normalize(item.ipc) === key) || null
  );
}

export function getBnsEntryForIpc(ipc) {
  const entry = getIpcBnsEntry(ipc);
  return entry ? entry.bns : null;
}

export function searchIpcBns(query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return rawMap.items;
  return rawMap.items.filter((item) =>
    [item.ipc, item.ipcTitle, item.bns, item.bnsTitle, item.category]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
}

export const IPC_BNS_CATEGORIES = Array.from(
  new Set(rawMap.items.map((item) => item.category))
).sort();

export default rawMap;
