// server/services/claimVerifier.js
//
// Legal Evidence and Citation Verification Pipeline — deterministic checks.
//
// RESEARCH PROTOTYPE. Every check here is deterministic (string/metadata
// logic). There is no model-assisted assessment in this module; if one is
// added later it must be labelled modelAssisted and must never be presented
// as independent proof.
//
// Response states — precise meanings (no generic "verified" badge):
//   source-linked         A located source passage exists and lexically
//                         supports the claim. This is NOT a determination that
//                         the claim is legally correct or still good law.
//   support-uncertain     A source was referenced but a deterministic check
//                         failed or warned (quote/jurisdiction/date/metadata/
//                         synthetic/lexical overlap).
//   source-unavailable    The referenced source is missing, marked unavailable,
//                         or no source is configured/attached.
//   facts-required        A factual claim lacks confirmed material facts
//                         (intake not confirmed or no confirmed linked statement).
//   lawyer-review-required A contradiction was detected, or the claim is a
//                         legal conclusion without a lawyer-reviewed backing.
//
// Abstention policy: when facts-required or source-unavailable applies the
// pipeline explains what is missing and does not assert a legal conclusion.

const STATES = {
  SOURCE_LINKED: "source-linked",
  SUPPORT_UNCERTAIN: "support-uncertain",
  SOURCE_UNAVAILABLE: "source-unavailable",
  FACTS_REQUIRED: "facts-required",
  LAWYER_REVIEW_REQUIRED: "lawyer-review-required",
};

const STATE_DEFINITIONS = {
  "source-linked":
    "A located source passage exists and appears to support the claim. Not a determination of legal correctness.",
  "support-uncertain":
    "A source was referenced but one or more deterministic checks failed or raised warnings.",
  "source-unavailable":
    "The referenced source is missing, unavailable, or no source provider is configured.",
  "facts-required":
    "Material facts for this claim are not yet confirmed in the matter intake.",
  "lawyer-review-required":
    "Conflicting material was found, or this is a legal conclusion that has not been reviewed by an authorised professional.",
};

const CHECK_KIND = "deterministic";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  const n = normalize(s);
  return n ? new Set(n.split(" ")) : new Set();
}

// Weak deterministic support proxy: fraction of claim tokens present in the passage.
function lexicalOverlap(claimText, passage) {
  const ct = [...tokens(claimText)];
  if (!ct.length) return 0;
  const pt = tokens(passage);
  if (!pt.size) return 0;
  const hit = ct.filter((t) => pt.has(t)).length;
  return hit / ct.length;
}

const OVERLAP_THRESHOLD = 0.6;

function checkClaim(claim, ctx) {
  const { sourcesById, statementsById, reviewedStatementIds, conflicts, intake } = ctx;
  const checks = [];
  const add = (id, status, detail) =>
    checks.push({ id, status, detail, kind: CHECK_KIND });

  const isFactual = claim.type === "factual";
  const isConclusion = claim.type === "legal-conclusion";

  // ── Factual claims: material-facts check ──────────────────────────────
  if (isFactual) {
    const linked = (claim.statementIds || []).filter((id) => statementsById[String(id)]);
    if (!linked.length) {
      add("material-facts", "fail", "No linked matter statement supports this factual claim.");
      return stateFor(claim, checks, STATES.FACTS_REQUIRED, ctx);
    }
    const unconfirmed = linked.filter((id) => !statementsById[String(id)].confirmed);
    if (unconfirmed.length) {
      add(
        "material-facts",
        "warn",
        `${unconfirmed.length} linked statement(s) are not confirmed by the client.`
      );
      return stateFor(claim, checks, STATES.FACTS_REQUIRED, ctx);
    }
    add("material-facts", "pass", "Linked statements exist and are confirmed.");
    if (intake.status !== "confirmed") {
      add(
        "intake-sufficiency",
        "fail",
        `Matter intake is '${intake.status || "draft"}', not confirmed; material facts are not locked.`
      );
      return stateFor(claim, checks, STATES.FACTS_REQUIRED, ctx);
    }
    add("intake-sufficiency", "pass", "Matter intake is confirmed.");
  }

  // ── Legal conclusion policy ───────────────────────────────────────────
  if (isConclusion) {
    const reviewed = (claim.statementIds || []).some((id) => reviewedStatementIds.has(String(id)));
    if (!reviewed) {
      add(
        "lawyer-conclusion-backing",
        "fail",
        "Legal conclusion is not backed by a lawyer-conclusion statement on this matter.",
      );
      return stateFor(claim, checks, STATES.LAWYER_REVIEW_REQUIRED, ctx);
    }
    add("lawyer-conclusion-backing", "pass", "Backed by a lawyer-reviewed conclusion statement.");
  }

  // ── Contradictions ────────────────────────────────────────────────────
  const conflictIds = claim.conflictsWith || conflicts[String(claim.id)] || [];
  if (conflictIds.length) {
    add(
      "contradiction",
      "fail",
      `Claim conflicts with ${conflictIds.length} other claim(s) in the same answer.`,
    );
    return stateFor(claim, checks, STATES.LAWYER_REVIEW_REQUIRED, ctx);
  }
  add("contradiction", "pass", "No declared conflict with other claims.");

  // ── Source availability ───────────────────────────────────────────────
  const source = claim.sourceId ? sourcesById[String(claim.sourceId)] : null;
  if (!claim.sourceId) {
    add("source-availability", "fail", "No source linked to this claim.");
    return stateFor(claim, checks, STATES.SOURCE_UNAVAILABLE, ctx);
  }
  if (!source) {
    add("source-availability", "fail", "Linked source id does not exist on this matter.");
    return stateFor(claim, checks, STATES.SOURCE_UNAVAILABLE, ctx);
  }
  if (source.availability === "unavailable") {
    add("source-availability", "fail", "Source is marked unavailable.");
    return stateFor(claim, checks, STATES.SOURCE_UNAVAILABLE, ctx);
  }
  add("source-availability", "pass", "Linked source exists and is not marked unavailable.");

  // ── Synthetic fixtures never count as verified law ────────────────────
  if (source.synthetic) {
    add("synthetic-source", "fail", "Source is a development fixture (fictional), not real law.");
    return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
  }

  // ── Passage existence / support ───────────────────────────────────────
  if (claim.quote) {
    const inPassage = normalize(source.passage).includes(normalize(claim.quote));
    if (!inPassage) {
      add("passage-exists", "fail", "Quoted text was not found in the linked passage.");
      return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
    }
    add("passage-exists", "pass", "Quote found in linked passage.");
  } else {
    const overlap = lexicalOverlap(claim.text, source.passage);
    if (overlap < OVERLAP_THRESHOLD) {
      add(
        "lexical-support",
        "warn",
        `Weak lexical overlap (${(overlap * 100).toFixed(0)}%) between claim and passage; no explicit quote provided.`,
      );
      return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
    }
    add(
      "lexical-support",
      "pass",
      `Lexical overlap ${(overlap * 100).toFixed(0)}% (deterministic, weak check).`,
    );
  }

  // ── Metadata completeness ─────────────────────────────────────────────
  const missingMeta = [];
  if (!source.url && !source.sourceId) missingMeta.push("source identifier/url");
  if (!source.jurisdiction) missingMeta.push("jurisdiction");
  if (!source.date) missingMeta.push("date");
  if (missingMeta.length) {
    add("metadata-complete", "warn", `Missing metadata: ${missingMeta.join(", ")}.`);
    return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
  }
  add("metadata-complete", "pass", "Source identifier, jurisdiction and date present.");

  // ── Jurisdiction mismatch ─────────────────────────────────────────────
  if (
    claim.jurisdiction &&
    source.jurisdiction &&
    normalize(claim.jurisdiction) !== normalize(source.jurisdiction)
  ) {
    add(
      "jurisdiction-match",
      "fail",
      `Claim jurisdiction (${claim.jurisdiction}) differs from source jurisdiction (${source.jurisdiction}).`,
    );
    return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
  }
  add("jurisdiction-match", "pass", "Jurisdictions align or were not both specified.");

  // ── Date uncertainty ──────────────────────────────────────────────────
  if (claim.asOf && source.date) {
    const claimYear = new Date(claim.asOf).getFullYear();
    const sourceYear = new Date(source.date).getFullYear();
    if (!Number.isNaN(claimYear) && !Number.isNaN(sourceYear) && sourceYear > claimYear) {
      add(
        "date-currency",
        "warn",
        `Source is dated ${sourceYear}, after the relevant date ${claimYear}; applicability is uncertain.`,
      );
      return stateFor(claim, checks, STATES.SUPPORT_UNCERTAIN, ctx);
    }
  }
  add("date-currency", "pass", "No date inconsistency detected.");

  // Explicitly no outcome prediction, no confidence percentages: state only.
  return stateFor(claim, checks, STATES.SOURCE_LINKED, ctx);
}

function stateFor(claim, checks, state, ctx) {
  return {
    claimId: claim.id,
    type: claim.type,
    state,
    definition: STATE_DEFINITIONS[state],
    checks,
    modelAssisted: false,
  };
}

/**
 * verifyClaims({ claims, sources, statements, intake })
 *  claims:    [{ id, text, type: 'legal'|'factual'|'legal-conclusion',
 *                sourceId?, quote?, jurisdiction?, asOf?,
 *                statementIds?, conflictsWith? }]
 *  sources:   matter.research entries
 *  statements: matter.statements
 *  intake:    matter.intake
 */
function verifyClaims({ claims = [], sources = [], statements = [], intake = {} } = {}) {
  const sourcesById = {};
  for (const s of sources) if (s && s._id) sourcesById[String(s._id)] = s;
  const statementsById = {};
  const reviewedStatementIds = new Set();
  for (const st of statements) {
    if (st && st._id) {
      statementsById[String(st._id)] = st;
      if (st.kind === "lawyer-conclusion") reviewedStatementIds.add(String(st._id));
    }
  }

  // Mutual conflicts map: claimsWith declared conflicts both directions
  const conflicts = {};
  for (const c of claims) {
    for (const other of c.conflictsWith || []) {
      conflicts[String(other)] = [...(conflicts[String(other)] || []), String(c.id)];
      conflicts[String(c.id)] = conflicts[String(c.id)] || [];
      if (!conflicts[String(c.id)].includes(String(other))) {
        conflicts[String(c.id)].push(String(other));
      }
    }
  }

  const ctx = { sourcesById, statementsById, reviewedStatementIds, conflicts, intake: intake || {} };
  const results = claims.map((c) => checkClaim(c, ctx));

  const summary = {};
  for (const s of Object.values(STATES)) summary[s] = 0;
  for (const r of results) summary[r.state] += 1;

  const abstentions = results
    .filter((r) => r.state === STATES.FACTS_REQUIRED || r.state === STATES.SOURCE_UNAVAILABLE)
    .map((r) => ({
      claimId: r.claimId,
      state: r.state,
      explain:
        r.state === STATES.FACTS_REQUIRED
          ? "Missing or unconfirmed material facts. Confirm intake facts for this claim before relying on it."
          : "The cited source is unavailable, so no supported statement can be made for this claim.",
    }));

  return {
    modelAssisted: false,
    methodology: "deterministic checks only (availability, passage, metadata, jurisdiction, date, contradiction, material facts)",
    results,
    summary,
    abstentions,
    states: STATES,
    stateDefinitions: STATE_DEFINITIONS,
  };
}

module.exports = { verifyClaims, STATES, STATE_DEFINITIONS };
