const { assessAiResponse } = require("../utils/aiQualitySignals");

describe("assessAiResponse (content-free AI quality signals)", () => {
  it("detects a disclaimer and counts citation-like references", () => {
    const out = assessAiResponse({
      response:
        "Under Section 138 of the Negotiable Instruments Act and BNS Section 316, you may act. This is general information, not legal advice — consult a qualified advocate.",
    });
    expect(out.hasDisclaimer).toBe(true);
    expect(out.citationLikeCount).toBeGreaterThanOrEqual(2);
    expect(out.hasOutcomeClaim).toBe(false);
  });

  it("flags outcome-guarantee language", () => {
    const out = assessAiResponse({ answer: "You are guaranteed to win this case with 100% certainty." });
    expect(out.hasOutcomeClaim).toBe(true);
    expect(out.hasDisclaimer).toBe(false);
  });

  it("flags a marketing-style zero-hallucination claim", () => {
    const out = assessAiResponse({ message: "We provide zero hallucination legal AI." });
    expect(out.hasOutcomeClaim).toBe(true);
  });

  it("walks nested objects and arrays without leaking content", () => {
    const out = assessAiResponse({
      result: { analysis: ["Article 21 applies.", "See BNSS provisions."] },
    });
    expect(out.citationLikeCount).toBeGreaterThanOrEqual(1);
    expect(out.chars).toBeGreaterThan(0);
    // Only aggregate fields are returned; no raw text field is exposed.
    expect(Object.keys(out).sort()).toEqual(
      ["chars", "citationLikeCount", "hasDisclaimer", "hasOutcomeClaim"].sort()
    );
  });

  it("handles non-string / empty payloads safely", () => {
    expect(assessAiResponse(null).chars).toBe(0);
    expect(assessAiResponse({}).chars).toBe(0);
    expect(assessAiResponse(42).chars).toBe(0);
  });
});
