// server/services/sourceProvider.js
//
// Legal source retrieval provider interface.
//
// IMPORTANT: No live legal-source provider (court database, statute API) is
// configured in this environment. searchSources() therefore returns an honest
// "unconfigured" result unless fixtures are explicitly enabled for development.
// Fixture results are fictional, flagged synthetic=true, and are NEVER real law.
//
// To integrate a real source later: set LEGAL_SOURCE_PROVIDER and implement the
// same return shape:
//   { provider, available, notice?, sources: [{ sourceId, title, url,
//     jurisdiction, court?, date?, text, synthetic:false }] }

const SYNTHETIC_FIXTURES = [
  {
    sourceId: "SYNTH-FIXTURE-1",
    title: "SYNTHETIC FIXTURE — Demo Dispute Resolution Act, 2040 (FICTIONAL, NOT LAW)",
    url: "",
    jurisdiction: "IN-DEMO",
    court: "Demo Authority",
    date: null,
    text:
      "SYNTHETIC TEST TEXT. This fixture describes a fictional demo procedure in which " +
      "a demo notice must be filed within 30 demo days. It is provided only to exercise " +
      "the verification pipeline in development and has no legal effect.",
    synthetic: true,
  },
  {
    sourceId: "SYNTH-FIXTURE-2",
    title: "SYNTHETIC FIXTURE — Demo Consumer Grievance Rules, 2041 (FICTIONAL, NOT LAW)",
    url: "",
    jurisdiction: "IN-DEMO",
    court: "Demo Authority",
    date: null,
    text:
      "SYNTHETIC TEST TEXT. These fictional demo rules describe a two-stage grievance " +
      "review used to test jurisdiction-mismatch and contradiction checks. Not real law.",
    synthetic: true,
  },
];

async function searchSources({ query, jurisdiction } = {}) {
  const provider = process.env.LEGAL_SOURCE_PROVIDER || "unconfigured";

  if (provider === "fixture" && process.env.NODE_ENV !== "production") {
    const q = String(query || "").toLowerCase();
    const hits = SYNTHETIC_FIXTURES.filter(
      (s) => !q || s.text.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    );
    return {
      provider: "fixture",
      available: true,
      notice:
        "Development fixtures only — fictional text, not legal sources. No live provider is configured.",
      sources: hits,
    };
  }

  return {
    provider,
    available: false,
    notice:
      "No legal source provider is configured. Source search is unavailable; existing matter sources can still be verified.",
    sources: [],
  };
}

module.exports = { searchSources, SYNTHETIC_FIXTURES };
