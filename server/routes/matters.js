// server/routes/matters.js
// NyayNow Matter Intelligence API. Every handler enforces object-level
// authorization server-side via matterAccess(); the client cannot grant
// itself access by hiding or showing UI elements.
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verifyToken = require("../middleware/authMiddleware");
const Matter = require("../models/Matter");
const {
  matterAccess,
  pickMatterCreateFields,
  pickIntakeFields,
  STATEMENT_KINDS,
} = Matter;
const { verifyClaims } = require("../services/claimVerifier");
const { searchSources } = require("../services/sourceProvider");

function audit(matter, req, action, detail) {
  matter.recordEvent({
    actor: req.userId,
    actorRole: req.userRole || "",
    action,
    detail,
  });
}

async function loadMatter(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid matter id" });
    return null;
  }
  const matter = await Matter.findById(req.params.id);
  if (!matter) {
    res.status(404).json({ error: "Matter not found" });
    return null;
  }
  const access = matterAccess(matter, req.userId, req.userRole);
  if (!access.allowed) {
    res.status(403).json({ error: "You do not have access to this matter" });
    return null;
  }
  return matter;
}

// ── CREATE (client owns; no privileged fields accepted) ────────────────────
router.post("/", verifyToken, async (req, res) => {
  try {
    const fields = pickMatterCreateFields(req.body);
    if (!fields.title || typeof fields.title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }
    const matter = new Matter({ ...fields, client: req.userId });
    audit(matter, req, "matter.created", fields.title);
    await matter.save();
    res.status(201).json(matter);
  } catch (err) {
    console.error("Create matter error:", err.message);
    res.status(500).json({ error: "Failed to create matter" });
  }
});

// ── LIST (scoped: client sees own; lawyer sees assigned only; admin all) ───
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.userRole === "client") query = { client: req.userId };
    else if (req.userRole === "lawyer") query = { lawyer: req.userId };
    else if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const matters = await Matter.find(query)
      .select("-auditEvents -drafts.body -evidence.extractedPassages")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(matters);
  } catch (err) {
    console.error("List matters error:", err.message);
    res.status(500).json({ error: "Failed to fetch matters" });
  }
});

// ── GET ONE ────────────────────────────────────────────────────────────────
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    res.json(matter);
  } catch (err) {
    console.error("Get matter error:", err.message);
    res.status(500).json({ error: "Failed to fetch matter" });
  }
});

// ── INTAKE (client submits / confirms; whitelist only) ─────────────────────
router.post("/:id/intake", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    if (String(matter.client) !== String(req.userId)) {
      return res.status(403).json({ error: "Only the client can change intake" });
    }
    Object.assign(matter, pickIntakeFields(req.body));

    const action = req.body.action;
    if (action === "submit") {
      matter.intake.status = "submitted";
      matter.intake.submittedAt = new Date();
      const missing = [];
      if (!matter.jurisdiction) missing.push("jurisdiction");
      if (!matter.statements.some((s) => s.kind === "allegation" && s.confirmed)) {
        missing.push("confirmed facts");
      }
      matter.intake.missingFields = missing;
      audit(matter, req, "intake.submitted", `missing: ${missing.join(", ") || "none"}`);
    } else if (action === "confirm") {
      matter.intake.status = "confirmed";
      matter.intake.confirmedAt = new Date();
      audit(matter, req, "intake.confirmed", "");
    }
    await matter.save();
    res.json(matter);
  } catch (err) {
    console.error("Intake error:", err.message);
    res.status(500).json({ error: "Failed to update intake" });
  }
});

// ── STATEMENTS (kind is immutable; only confirmed flips) ───────────────────
router.post("/:id/statements", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const { kind, text, evidenceRef, sourceRef } = req.body || {};
    if (!STATEMENT_KINDS.includes(kind)) {
      return res.status(400).json({ error: `kind must be one of: ${STATEMENT_KINDS.join(", ")}` });
    }
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }
    if (kind === "document-extract" && !evidenceRef) {
      return res.status(400).json({ error: "document-extract requires evidenceRef" });
    }
    const st = { kind, text, by: req.userId };
    if (evidenceRef && mongoose.isValidObjectId(evidenceRef)) st.evidenceRef = evidenceRef;
    if (sourceRef) st.sourceRef = String(sourceRef);
    // Only the client can pre-confirm their own allegation; other kinds are
    // never marked confirmed automatically.
    if (kind === "allegation" && String(matter.client) === String(req.userId)) {
      st.confirmed = req.body.confirmed === true;
      if (st.confirmed) st.confirmedBy = req.userId, st.confirmedAt = new Date();
    }
    matter.statements.push(st);
    audit(matter, req, "statement.added", `kind=${kind}`);
    await matter.save();
    res.status(201).json(matter.statements[matter.statements.length - 1]);
  } catch (err) {
    console.error("Add statement error:", err.message);
    res.status(500).json({ error: "Failed to add statement" });
  }
});

router.post("/:id/statements/:sid/confirm", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    if (String(matter.client) !== String(req.userId)) {
      return res.status(403).json({ error: "Only the client can confirm facts" });
    }
    const st = matter.statements.id(req.params.sid);
    if (!st) return res.status(404).json({ error: "Statement not found" });
    st.confirmed = true;
    st.confirmedBy = req.userId;
    st.confirmedAt = new Date();
    audit(matter, req, "statement.confirmed", st.kind);
    await matter.save();
    res.json(st);
  } catch (err) {
    console.error("Confirm statement error:", err.message);
    res.status(500).json({ error: "Failed to confirm statement" });
  }
});

// ── EVIDENCE (records a reference produced by POST /api/uploads) ───────────
router.post("/:id/evidence", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const { filename, path, description } = req.body || {};
    if (!filename || !path) {
      return res.status(400).json({ error: "filename and path are required (upload first via /api/uploads)" });
    }
    if (typeof path !== "string" || path.length > 2000) {
      return res.status(400).json({ error: "Invalid file reference" });
    }
    matter.evidence.push({
      uploadedBy: req.userId,
      filename: String(filename).slice(0, 300),
      path,
      description: String(description || "").slice(0, 1000),
      extractionStatus: "not-started",
    });
    audit(matter, req, "evidence.added", String(filename).slice(0, 100));
    await matter.save();
    res.status(201).json(matter.evidence[matter.evidence.length - 1]);
  } catch (err) {
    console.error("Add evidence error:", err.message);
    res.status(500).json({ error: "Failed to add evidence" });
  }
});

// ── RESEARCH: search (provider; honest about unconfigured state) ───────────
router.post("/:id/research/search", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const result = await searchSources({
      query: req.body?.query,
      jurisdiction: req.body?.jurisdiction || matter.jurisdiction,
    });
    res.json(result);
  } catch (err) {
    console.error("Research search error:", err.message);
    res.status(500).json({ error: "Source search failed" });
  }
});

// ── RESEARCH: attach a source + exact passage to the matter ────────────────
router.post("/:id/research", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const { title, sourceId, url, jurisdiction, court, date, passage, synthetic } = req.body || {};
    if (!title || !passage) {
      return res.status(400).json({ error: "title and passage are required" });
    }
    const entry = {
      title: String(title).slice(0, 500),
      sourceId: String(sourceId || "").slice(0, 200),
      url: String(url || "").slice(0, 1000),
      jurisdiction: String(jurisdiction || "").slice(0, 120),
      court: String(court || "").slice(0, 200),
      passage: String(passage).slice(0, 6000),
      availability: req.body.availability === "unavailable" ? "unavailable" : "available",
      synthetic: synthetic === true,
      addedBy: req.userId,
    };
    if (date && !Number.isNaN(Date.parse(date))) entry.date = new Date(date);
    matter.research.push(entry);
    audit(matter, req, "research.attached", `${entry.title} (${entry.synthetic ? "synthetic" : "external"})`);
    await matter.save();
    res.status(201).json(matter.research[matter.research.length - 1]);
  } catch (err) {
    console.error("Attach research error:", err.message);
    res.status(500).json({ error: "Failed to attach source" });
  }
});

// ── DRAFTS (versioned save) ────────────────────────────────────────────────
router.post("/:id/drafts", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const { name, body, placeholders, assertions } = req.body || {};
    if (!name || typeof body !== "string") {
      return res.status(400).json({ error: "name and body are required" });
    }
    const existing = matter.drafts.filter((d) => d.name === name);
    const version = existing.length ? Math.max(...existing.map((d) => d.version || 1)) + 1 : 1;
    matter.drafts.push({
      name: String(name).slice(0, 300),
      body: body.slice(0, 60000),
      placeholders: Array.isArray(placeholders) ? placeholders.slice(0, 100).map(String) : [],
      assertions: Array.isArray(assertions)
        ? assertions.slice(0, 100).map((a) => ({
            text: String(a?.text || "").slice(0, 2000),
            kind: a?.kind === "legal" ? "legal" : "factual",
            statementRefs: (a?.statementRefs || []).filter(mongoose.isValidObjectId).slice(0, 50),
            researchRefs: (a?.researchRefs || []).filter(mongoose.isValidObjectId).slice(0, 50),
          }))
        : [],
      version,
      savedBy: req.userId,
      savedAt: new Date(),
    });
    audit(matter, req, "draft.saved", `${name} v${version}`);
    await matter.save();
    res.status(201).json(matter.drafts[matter.drafts.length - 1]);
  } catch (err) {
    console.error("Save draft error:", err.message);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

// ── REVIEW REQUEST (only when a lawyer is assigned) ────────────────────────
router.post("/:id/review-requests", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    if (!matter.lawyer) {
      return res.status(400).json({
        error: "No authorised professional is assigned to this matter yet",
        code: "NO_LAWYER_ASSIGNED",
      });
    }
    const { draftRef, note } = req.body || {};
    if (draftRef && !matter.drafts.id(draftRef)) {
      return res.status(400).json({ error: "draftRef does not exist on this matter" });
    }
    matter.reviewRequests.push({
      draftRef: draftRef || undefined,
      note: String(note || "").slice(0, 2000),
      requestedBy: req.userId,
    });
    audit(matter, req, "review.requested", draftRef ? `draft ${draftRef}` : "matter");
    await matter.save();
    res.status(201).json(matter.reviewRequests[matter.reviewRequests.length - 1]);
  } catch (err) {
    console.error("Review request error:", err.message);
    res.status(500).json({ error: "Failed to request review" });
  }
});

// ── REVIEW DECISION (assigned lawyer only; reason required) ────────────────
router.post("/:id/review-requests/:rid/decision", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    if (!matter.lawyer || String(matter.lawyer) !== String(req.userId)) {
      return res.status(403).json({ error: "Only the assigned professional can record a review decision" });
    }
    const rr = matter.reviewRequests.id(req.params.rid);
    if (!rr) return res.status(404).json({ error: "Review request not found" });
    if (rr.status !== "pending") {
      return res.status(400).json({ error: "Review request already decided" });
    }
    const decision = req.body?.decision;
    if (!["accepted", "edited", "rejected"].includes(decision)) {
      return res.status(400).json({ error: "decision must be accepted, edited or rejected" });
    }
    const reason = String(req.body?.reason || "").slice(0, 2000);
    if (["edited", "rejected"].includes(decision) && !reason.trim()) {
      return res.status(400).json({ error: "A reason is required for edited/rejected decisions" });
    }
    rr.status = decision;
    rr.decidedBy = req.userId;
    rr.decidedAt = new Date();
    rr.reason = reason;
    audit(matter, req, `review.${decision}`, reason || "");
    await matter.save();
    res.json(rr);
  } catch (err) {
    console.error("Review decision error:", err.message);
    res.status(500).json({ error: "Failed to record decision" });
  }
});

// ── GRANT ACCESS (client owner grants a specific professional) ─────────────
router.post("/:id/access", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    if (String(matter.client) !== String(req.userId)) {
      return res.status(403).json({ error: "Only the client can manage access" });
    }
    const { lawyerId, role } = req.body || {};
    if (!mongoose.isValidObjectId(lawyerId)) {
      return res.status(400).json({ error: "lawyerId is required" });
    }
    const assign = role === "assign";
    if (assign) {
      matter.lawyer = lawyerId;
      audit(matter, req, "lawyer.assigned", String(lawyerId));
    } else {
      const existing = matter.access.find((a) => String(a.user) === String(lawyerId));
      if (existing) {
        existing.role = "viewer";
      } else {
        matter.access.push({ user: lawyerId, role: "viewer" });
      }
      audit(matter, req, "access.granted", String(lawyerId));
    }
    await matter.save();
    res.json({ lawyer: matter.lawyer, access: matter.access });
  } catch (err) {
    console.error("Grant access error:", err.message);
    res.status(500).json({ error: "Failed to grant access" });
  }
});

// ── VERIFY CLAIMS (deterministic pipeline against matter sources) ──────────
router.post("/:id/verify", verifyToken, async (req, res) => {
  try {
    const matter = await loadMatter(req, res);
    if (!matter) return;
    const claims = Array.isArray(req.body?.claims) ? req.body.claims.slice(0, 50) : [];
    if (!claims.length) {
      return res.status(400).json({ error: "claims array is required (max 50)" });
    }
    for (const c of claims) {
      if (!c || typeof c.text !== "string" || !["legal", "factual", "legal-conclusion"].includes(c.type)) {
        return res
          .status(400)
          .json({ error: "each claim needs text and type: legal | factual | legal-conclusion" });
      }
    }
    const outcome = verifyClaims({
      claims,
      sources: matter.research,
      statements: matter.statements,
      intake: matter.intake,
    });
    audit(
      matter,
      req,
      "claims.verified",
      Object.entries(outcome.summary)
        .filter(([, n]) => n)
        .map(([k, n]) => `${k}=${n}`)
        .join(" ")
    );
    await matter.save();
    res.json(outcome);
  } catch (err) {
    console.error("Verify claims error:", err.message);
    res.status(500).json({ error: "Claim verification failed" });
  }
});

module.exports = router;
