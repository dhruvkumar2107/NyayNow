// server/tests/matters.test.js
// Pure unit tests (no DB): matter access matrix, mass-assignment whitelists,
// statement provenance, audit cap, and the deterministic claim-verification
// pipeline states.
const Matter = require("../models/Matter");
const {
  matterAccess,
  pickMatterCreateFields,
  pickIntakeFields,
  STATEMENT_KINDS,
} = Matter;
const { verifyClaims, STATES } = require("../services/claimVerifier");
const { searchSources, SYNTHETIC_FIXTURES } = require("../services/sourceProvider");

const CLIENT = "64a0000000000000000000c1";
const LAWYER = "64a0000000000000000000a1";
const OTHER_LAWYER = "64a0000000000000000000a2";
const GRANTED = "64a0000000000000000000a3";
const STRANGER = "64a0000000000000000000a4";
const ADMIN = "64a0000000000000000000ff";

const baseMatter = () => ({
  _id: "64b0000000000000000000m1",
  client: CLIENT,
  lawyer: LAWYER,
  access: [{ user: GRANTED, role: "viewer" }],
});

describe("matterAccess (object-level authorization)", () => {
  it("allows the owning client", () => {
    expect(matterAccess(baseMatter(), CLIENT, "client")).toEqual({ allowed: true, via: "client" });
  });

  it("allows only the assigned professional, not any other lawyer", () => {
    expect(matterAccess(baseMatter(), LAWYER, "lawyer")).toEqual({ allowed: true, via: "lawyer" });
    expect(matterAccess(baseMatter(), OTHER_LAWYER, "lawyer")).toEqual({ allowed: false, via: null });
  });

  it("allows an explicitly granted viewer", () => {
    expect(matterAccess(baseMatter(), GRANTED, "lawyer")).toEqual({ allowed: true, via: "grant" });
  });

  it("denies unrelated users regardless of role", () => {
    expect(matterAccess(baseMatter(), STRANGER, "client")).toEqual({ allowed: false, via: null });
    expect(matterAccess(baseMatter(), STRANGER, "lawyer")).toEqual({ allowed: false, via: null });
  });

  it("does not let a client access another client's matter", () => {
    expect(matterAccess(baseMatter(), STRANGER, "client").allowed).toBe(false);
  });

  it("allows admin", () => {
    expect(matterAccess(baseMatter(), ADMIN, "admin")).toEqual({ allowed: true, via: "admin" });
  });

  it("denies missing matter or missing user", () => {
    expect(matterAccess(null, CLIENT, "client")).toEqual({ allowed: false, via: null });
    expect(matterAccess(baseMatter(), null, "client")).toEqual({ allowed: false, via: null });
  });

  it("treats ObjectIds and strings as equal identities", () => {
    const withOid = { ...baseMatter(), client: { toString: () => CLIENT } };
    expect(matterAccess(withOid, CLIENT, "client").allowed).toBe(true);
  });
});

describe("mass-assignment whitelists", () => {
  it("matter create accepts only title/matterType/jurisdiction/keyDates", () => {
    const picked = pickMatterCreateFields({
      title: "Landlord dispute",
      matterType: "property",
      jurisdiction: "IN-MH",
      keyDates: [{ label: "Notice", date: "2026-01-01" }],
      client: STRANGER,
      lawyer: LAWYER,
      access: [{ user: STRANGER, role: "owner" }],
      intake: { status: "confirmed" },
      statements: [{ kind: "lawyer-conclusion", text: "forged", confirmed: true }],
      auditEvents: [],
      __proto__: { polluted: true },
    });
    expect(picked).toEqual({
      title: "Landlord dispute",
      matterType: "property",
      jurisdiction: "IN-MH",
      keyDates: [{ label: "Notice", date: "2026-01-01" }],
    });
    expect(picked).not.toHaveProperty("client");
    expect(picked).not.toHaveProperty("lawyer");
    expect(picked).not.toHaveProperty("access");
    expect(picked).not.toHaveProperty("intake");
    expect(picked).not.toHaveProperty("statements");
  });

  it("intake update accepts only the same safe fields", () => {
    const picked = pickIntakeFields({
      title: "Updated title",
      jurisdiction: "IN-DL",
      status: "confirmed",
      confirmedAt: "2026-01-01",
      lawyer: LAWYER,
    });
    expect(picked).toEqual({ title: "Updated title", jurisdiction: "IN-DL" });
  });

  it("tolerates undefined body", () => {
    expect(pickMatterCreateFields(undefined)).toEqual({});
    expect(pickIntakeFields(null)).toEqual({});
  });
});

describe("statement provenance categories", () => {
  it("keeps exactly the five provenance kinds", () => {
    expect(STATEMENT_KINDS).toEqual([
      "allegation",
      "document-extract",
      "source-text",
      "ai-inference",
      "lawyer-conclusion",
    ]);
  });

  it("enforces the kind enum in the schema", () => {
    const m = new Matter({
      title: "T",
      client: CLIENT,
      statements: [{ kind: "allegation", text: "x" }],
    });
    m.statements.push({ kind: "totally-fake-kind", text: "y" });
    const err = m.validateSync();
    expect(err).toBeTruthy();
    expect(String(err.errors["statements.1.kind"])).toMatch(/is not a valid enum value/);
  });
});

describe("audit trail", () => {
  it("records events with actor, role, action and detail", () => {
    const m = new Matter({ title: "T", client: CLIENT });
    m.recordEvent({ actor: CLIENT, actorRole: "client", action: "matter.created", detail: "T" });
    expect(m.auditEvents).toHaveLength(1);
    expect(String(m.auditEvents[0].actor)).toBe(CLIENT);
    expect(m.auditEvents[0].actorRole).toBe("client");
    expect(m.auditEvents[0].action).toBe("matter.created");
    expect(m.auditEvents[0].detail).toBe("T");
  });

  it("caps the audit trail at 200 events", () => {
    const m = new Matter({ title: "T", client: CLIENT });
    for (let i = 0; i < 205; i++) {
      m.recordEvent({ actor: CLIENT, actorRole: "client", action: `e${i}`, detail: "" });
    }
    expect(m.auditEvents).toHaveLength(200);
    expect(m.auditEvents[0].action).toBe("e5");
    expect(m.auditEvents[199].action).toBe("e204");
  });
});

// ── Claim verification pipeline ─────────────────────────────────────────────

const REAL_SOURCE = {
  _id: "r1",
  sourceId: "SRC-1",
  title: "Demo Housing Tribunal Rules",
  url: "https://example.invalid/r1",
  jurisdiction: "IN-MH",
  court: "Demo Tribunal",
  date: "2020-06-01",
  passage:
    "A tenant shall receive written notice to vacate before any eviction proceeding may be filed before the tribunal.",
  availability: "available",
  synthetic: false,
};

const claim = (over = {}) => ({
  id: "c1",
  text: "A tenant shall receive written notice to vacate before any eviction proceeding",
  type: "legal",
  sourceId: "r1",
  jurisdiction: "IN-MH",
  asOf: "2024-01-01",
  ...over,
});

function run(claims, extra = {}) {
  return verifyClaims({
    claims,
    sources: extra.sources || [REAL_SOURCE],
    statements: extra.statements || [],
    intake: extra.intake || { status: "confirmed" },
  });
}

describe("claimVerifier — source-linked happy path", () => {
  it("marks a source-linked claim when quote, metadata, jurisdiction and dates align", () => {
    const out = run([claim({ quote: "written notice to vacate before any eviction proceeding" })]);
    expect(out.modelAssisted).toBe(false);
    expect(out.results[0].state).toBe(STATES.SOURCE_LINKED);
    expect(out.results[0].modelAssisted).toBe(false);
    expect(out.results[0].definition).toMatch(/Not a determination of legal correctness/);
  });

  it("marks source-linked on strong lexical overlap when no quote is provided", () => {
    const out = run([claim()]);
    expect(out.results[0].state).toBe(STATES.SOURCE_LINKED);
    expect(out.results[0].checks.find((c) => c.id === "lexical-support").status).toBe("pass");
  });

  it("summarises counts across states", () => {
    const out = run([claim(), claim({ id: "c2", sourceId: "missing" })]);
    expect(out.summary[STATES.SOURCE_LINKED]).toBe(1);
    expect(out.summary[STATES.SOURCE_UNAVAILABLE]).toBe(1);
    expect(out.abstentions).toHaveLength(1);
    expect(out.abstentions[0].state).toBe(STATES.SOURCE_UNAVAILABLE);
  });
});

describe("claimVerifier — source-unavailable", () => {
  it("source-unavailable when no source is linked", () => {
    const out = run([claim({ sourceId: undefined })]);
    expect(out.results[0].state).toBe(STATES.SOURCE_UNAVAILABLE);
    expect(out.abstentions[0].state).toBe(STATES.SOURCE_UNAVAILABLE);
  });

  it("source-unavailable when the linked source does not exist on the matter", () => {
    const out = run([claim({ sourceId: "nope" })]);
    expect(out.results[0].state).toBe(STATES.SOURCE_UNAVAILABLE);
  });

  it("source-unavailable when the source is marked unavailable", () => {
    const out = run([claim()], {
      sources: [{ ...REAL_SOURCE, availability: "unavailable" }],
    });
    expect(out.results[0].state).toBe(STATES.SOURCE_UNAVAILABLE);
  });
});

describe("claimVerifier — support-uncertain", () => {
  it("quote not found in passage → support-uncertain", () => {
    const out = run([claim({ quote: "completely unrelated words about taxes" })]);
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "passage-exists").status).toBe("fail");
  });

  it("jurisdiction mismatch → support-uncertain", () => {
    const out = run([claim({ jurisdiction: "IN-DL", quote: "written notice to vacate" })]);
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "jurisdiction-match").status).toBe("fail");
  });

  it("source dated after the relevant date → support-uncertain (date-currency warn)", () => {
    const out = run([claim({ asOf: "2019-01-01", quote: "written notice to vacate" })]);
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "date-currency").status).toBe("warn");
  });

  it("missing jurisdiction metadata → support-uncertain", () => {
    const out = run([claim({ quote: "written notice to vacate" })], {
      sources: [{ ...REAL_SOURCE, jurisdiction: "" }],
    });
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "metadata-complete").status).toBe("warn");
  });

  it("synthetic fixture source can never yield source-linked", () => {
    const out = run([claim({ quote: "written notice to vacate" })], {
      sources: [{ ...REAL_SOURCE, synthetic: true }],
    });
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "synthetic-source").status).toBe("fail");
  });

  it("weak lexical overlap (unrelated claim text) → support-uncertain", () => {
    const out = run([claim({ text: "Quantum blockchain patent royalty dispute" })]);
    expect(out.results[0].state).toBe(STATES.SUPPORT_UNCERTAIN);
    expect(out.results[0].checks.find((c) => c.id === "lexical-support").status).toBe("warn");
  });
});

describe("claimVerifier — facts-required", () => {
  const statements = [
    { _id: "s1", kind: "allegation", text: "Landlord locked me out", confirmed: true },
    { _id: "s2", kind: "allegation", text: "Rent was paid in cash", confirmed: false },
    { _id: "s3", kind: "lawyer-conclusion", text: "Notice defect is arguable", confirmed: true },
  ];

  it("factual claim with no linked statement → facts-required + abstention", () => {
    const out = run([claim({ id: "f1", type: "factual", statementIds: [] })], { statements });
    expect(out.results[0].state).toBe(STATES.FACTS_REQUIRED);
    expect(out.abstentions.find((a) => a.claimId === "f1").state).toBe(STATES.FACTS_REQUIRED);
  });

  it("factual claim linked only to unconfirmed statements → facts-required", () => {
    const out = run([claim({ id: "f1", type: "factual", statementIds: ["s2"] })], { statements });
    expect(out.results[0].state).toBe(STATES.FACTS_REQUIRED);
  });

  it("unconfirmed intake blocks factual claims even with confirmed statement", () => {
    const out = run([claim({ id: "f1", type: "factual", statementIds: ["s1"] })], {
      statements,
      intake: { status: "draft" },
    });
    expect(out.results[0].state).toBe(STATES.FACTS_REQUIRED);
  });

  it("confirmed factual claim with confirmed statement proceeds to source checks", () => {
    const out = run(
      [claim({ id: "f1", type: "factual", statementIds: ["s1"], quote: "written notice to vacate" })],
      { statements }
    );
    expect(out.results[0].state).toBe(STATES.SOURCE_LINKED);
  });
});

describe("claimVerifier — lawyer-review-required", () => {
  const statements = [
    { _id: "s3", kind: "lawyer-conclusion", text: "Notice defect is arguable", confirmed: true },
    { _id: "s1", kind: "allegation", text: "Lockout happened", confirmed: true },
  ];

  it("legal conclusion without lawyer-conclusion backing → lawyer-review-required", () => {
    const out = run([claim({ id: "l1", type: "legal-conclusion", statementIds: ["s1"] })], {
      statements,
    });
    expect(out.results[0].state).toBe(STATES.LAWYER_REVIEW_REQUIRED);
  });

  it("legal conclusion backed by lawyer-conclusion proceeds to source checks", () => {
    const out = run(
      [
        claim({
          id: "l1",
          type: "legal-conclusion",
          statementIds: ["s3"],
          quote: "written notice to vacate",
        }),
      ],
      { statements }
    );
    expect(out.results[0].state).toBe(STATES.SOURCE_LINKED);
  });

  it("mutually conflicting claims → lawyer-review-required", () => {
    const out = run([
      claim({ id: "c1", conflictsWith: ["c2"], quote: "written notice to vacate" }),
      claim({ id: "c2", conflictsWith: ["c1"], quote: "written notice to vacate" }),
    ]);
    expect(out.results[0].state).toBe(STATES.LAWYER_REVIEW_REQUIRED);
    expect(out.results[1].state).toBe(STATES.LAWYER_REVIEW_REQUIRED);
  });
});

describe("sourceProvider — honest unconfigured state", () => {
  const OLD = process.env.LEGAL_SOURCE_PROVIDER;
  afterEach(() => {
    if (OLD === undefined) delete process.env.LEGAL_SOURCE_PROVIDER;
    else process.env.LEGAL_SOURCE_PROVIDER = OLD;
  });

  it("returns available:false with no sources when no provider is configured", async () => {
    delete process.env.LEGAL_SOURCE_PROVIDER;
    const res = await searchSources({ query: "eviction notice" });
    expect(res.available).toBe(false);
    expect(res.sources).toEqual([]);
    expect(res.notice).toMatch(/No legal source provider is configured/);
  });

  it("fixture mode is env-gated, non-production, and every fixture is synthetic", async () => {
    process.env.LEGAL_SOURCE_PROVIDER = "fixture";
    const res = await searchSources({ query: "notice" });
    expect(res.available).toBe(true);
    expect(res.notice).toMatch(/fictional|fixtures/i);
    expect(res.sources.length).toBeGreaterThan(0);
    for (const s of res.sources) {
      expect(s.synthetic).toBe(true);
      expect(s.title).toMatch(/SYNTHETIC|FICTIONAL/);
    }
    expect(SYNTHETIC_FIXTURES.every((s) => s.synthetic)).toBe(true);
  });
});
