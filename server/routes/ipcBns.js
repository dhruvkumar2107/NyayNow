const express = require("express");
const router = express.Router();
const {
  IPC_BNS_MAP,
  IPC_BNS_META,
  getIpcBnsEntry,
  searchIpcBns,
} = require("../utils/ipcBnsData");

/**
 * @desc    IPC-to-BNS reference map (public, read-only, seed data pending counsel review)
 * @route   GET /api/ipc-bns
 * @query   q       free-text search across IPC/BNS section numbers and titles
 * @query   category optional category filter
 * @query   limit    optional max results (default 100, max 500)
 */
router.get("/", (req, res) => {
  try {
    const { q = "", category = "", limit } = req.query;

    let items = searchIpcBns(q);

    if (category) {
      const target = String(category).toLowerCase();
      items = items.filter(
        (item) => String(item.category).toLowerCase() === target
      );
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const total = items.length;
    items = items.slice(0, parsedLimit);

    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json({
      meta: IPC_BNS_META,
      total,
      count: items.length,
      items,
    });
  } catch (err) {
    console.error("IPC-BNS API error:", err);
    res.status(500).json({ error: "Failed to load IPC-to-BNS reference data." });
  }
});

/**
 * @desc    Look up a single IPC section's BNS alignment
 * @route   GET /api/ipc-bns/:ipc
 */
router.get("/:ipc", (req, res) => {
  const entry = getIpcBnsEntry(req.params.ipc);
  if (!entry) {
    return res.status(404).json({
      error: `No IPC-to-BNS mapping found for section ${req.params.ipc}.`,
      meta: IPC_BNS_META,
    });
  }
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json({ meta: IPC_BNS_META, item: entry });
});

/**
 * @desc    Categories present in the reference map
 * @route   GET /api/ipc-bns/meta/categories
 */
router.get("/meta/categories", (req, res) => {
  const categories = Array.from(
    new Set(IPC_BNS_MAP.items.map((item) => item.category))
  ).sort();
  res.set("Cache-Control", "public, max-age=3600");
  res.json({ meta: IPC_BNS_META, categories });
});

module.exports = router;
