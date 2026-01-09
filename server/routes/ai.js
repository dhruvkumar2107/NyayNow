const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const checkAiLimit = require("../middleware/checkAiLimit");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* ---------------- AI ASSISTANT (CHAT) ---------------- */
// Apply Auth & Limit Check
// This tool call involves multiple non-contiguous edits. I will switch to multi_replace_file_content for efficiency in the next step or use regex logic if I can. 
// Actually, `replace_file_content` is single contiguous. I should use `multi_replace_file_content` or just do it one by one.
// There are ~6 routes. I'll use multi_replace.

try {
  const { question, history, language, location } = req.body;

  // Construct History Context
  const conversationHistory = history ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") : "";

  const prompt = `
      You are Nyay Sathi, an expert Indian legal assistant.
      User Location: ${location || "India"}
      Language: ${language || "English"}
      
      CONVERSATION HISTORY:
      ${conversationHistory}
      
      CURRENT QUERY: "${question}"
      
      AGENTIC BEHAVIOR INSTRUCTIONS:
      1. If the user's query is vague (e.g., "I want a divorce"), DO NOT give a generic essay. ASK clarifying questions first (e.g., "Mutual consent or contested?").
      2. If you have enough details, provide a structured legal answer.
      3. Respond in MarkDown.
      
      Format the output as JSON with keys: "answer" (markdown string), "related_questions" (array of strings), "intent" (string).
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  const jsonResponse = JSON.parse(cleaned);
  res.json(jsonResponse);
} catch (err) {
  console.error("Gemini Assistant Error:", err.message);
  res.status(500).json({
    answer: `AI Error: ${err.message}`,
    related_questions: [],
    intent: "error"
  });
}
});

/* ---------------- AGREEMENT ANALYSIS ---------------- */
router.post("/agreement", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Determine user plan from request (set by verifyToken)
    // If we want to hide data for free users, we can do it here or in frontend.
    // The requirement says: "FREE users see: Limited preview, Estimated accuracy score".
    // "SILVER unlocks: Full accuracy score, Clause-by-clause analysis".

    const prompt = `
      Analyze this legal agreement text:
      "${text.substring(0, 15000)}"
      
      Provide a specific JSON output with the following keys:
      - "accuracyScore": Number (0-100) representing legal robustness.
      - "riskLevel": String ("Low", "Medium", "High").
      - "missingClauses": Array of strings (important clauses missing).
      - "ambiguousClauses": Array of strings (clauses that are vague).
      - "jurisdictionContext": String (which laws apply, e.g., "Indian Contract Act, 1872").
      - "analysisText": String (Markdown formatted detailed analysis).
      
      IMPORTANT: Detect the language of the input text and provide the analysis IN THAT SAME LANGUAGE.
      Output ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const analysisData = JSON.parse(cleaned);

    // PAYWALL LOGIC: Free users get limited data
    if (req.user.plan === 'free') {
      analysisData.riskLevel = "🔒 Upgrade to Unlock";
      analysisData.missingClauses = ["🔒 Upgrade to view missing clauses"];
      analysisData.ambiguousClauses = ["🔒 Upgrade to view ambiguous clauses"];
      analysisData.accuracyScore = 0; // Or hidden
      analysisData.isLocked = true;
    } else {
      analysisData.isLocked = false;
    }

    res.json(analysisData);

  } catch (err) {
    console.error("Gemini Agreement Error:", err.message);
    res.status(500).json({ error: "Failed to analyze agreement" });
  }
});

/* ---------------- CASE ANALYSIS (Legal Issue) ---------------- */
router.post("/case-analysis", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const prompt = `
      Analyze this legal issue description:
      "${text.substring(0, 5000)}"
      
      Provide:
      1. Summary of the legal standing.
      2. List of Relevant Laws/Acts (IPC, Contract Act, etc).
      3. Suggested Action (Next steps).
      
      Return JSON with keys: 
      "summary" (string),
      "laws" (array of strings),
      "advice" (string).
      
      Strict JSON only.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      const json = JSON.parse(cleaned);
      res.json(json);
    } catch (e) {
      res.json({
        summary: "Could not parse analysis.",
        laws: [],
        advice: "Please try again with a clearer description."
      });
    }

  } catch (err) {
    console.error("Gemini Case Analysis Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case" });
  }
});

/* ---------------- LEGAL NOTICE GENERATOR ---------------- */
router.post("/draft-notice", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { notice_details, language, type } = req.body;
    if (!notice_details) return res.status(400).json({ error: "Notice details required" });

    const lang = language || "English";
    const noticeType = type || "General Legal Notice";

    const prompt = `
      You are a senior advocate in India. Draft a formal "${noticeType}".
      Language: ${lang}
      
      Details:
      "${notice_details}"
      
      Format:
      - Ref No / Date
      - Registered AD / Speed Post
      - To [Recipient Name/Address Placeholder]
      - Subject
      - "Under instructions from my client..."
      - Legal Facts & Grievances
      - Demands (Pay within X days / Stop action)
      - Consequences of failure (Legal action warning)
      - Advocate Signature Placeholder
      
      Output ONLY the draft text in Markdown. Do not wrap in JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ draft: response.text() });

  } catch (err) {
    console.error("Gemini Notice Error:", err.message);
    res.status(500).json({ error: "Failed to draft notice" });
  }
});



/* ---------------- JUDGE AI (CASE PREDICTOR) ---------------- */
router.post("/predict-outcome", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { caseTitle, caseDescription, caseType, oppositionDetails } = req.body;

    const prompt = `
      ACT AS A SENIOR JUDGE OF THE SUPREME COURT OF INDIA.
      Verify the user's case details:
      - Title: "${caseTitle}"
      - Type: "${caseType}"
      - Description: "${caseDescription}"
      - Opposition: "${oppositionDetails}"

      Based on the Indian Penal Code (IPC), CrPC, or Civil Procedure Code as applicable, perform a DEEP DISSECTION:
      
      1. **Win Probability**: Give a realistic percentage (0-100%) based on the strength of facts.
      2. **Major Risks**: What are the 3 biggest loopholes the opposition will use?
      3. **Strategic Moves**: What are the top 3 legal motions to file immediately?
      4. **Estimated Timeline**: How long will this take in a Tier-1 Indian city court?
      5. **Precedent**: Cite 1 relevant real case law.

      RETURN STRICT JSON ONLY:
      {
        "win_probability": "75%",
        "risk_analysis": ["Risk 1", "Risk 2", "Risk 3"],
        "strategy": ["Move 1", "Move 2", "Move 3"],
        "estimated_duration": "14-18 months",
        "relevant_precedent": "State vs. XYZ (2018)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    res.json(JSON.parse(text));

  } catch (err) {
    console.error("Judge AI Error:", err.message);
    res.status(500).json({ error: "Failed to predict outcome. Try again." });
  }
});



/* ---------------- CONTRACT DRAFTING (TurboAgreements) ---------------- */
router.post("/draft-contract", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { type, parties, terms } = req.body;

    // Construct Prompt
    const prompt = `
      You are an expert indian legal drafter.
      Draft a legally binding **${type}** under Indian Law.
      
      **PARTIES**:
      ${JSON.stringify(parties, null, 2)}
      
      **TERMS/DETAILS**:
      ${JSON.stringify(terms, null, 2)}
      
      **INSTRUCTIONS**:
      1. Use professional legal language (Whereas, Therefore, In Witness Whereof).
      2. Include standard jurisdiction clauses (India).
      3. Format as clean Markdown (use ## for headers, ** for bold).
      4. Do NOT include any intro/outro text. Start directly with the title.
      
      Output ONLY the Markdown contract.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const contractText = response.text();

    res.json({ contract: contractText });

  } catch (err) {
    console.error("Gemini Drafting Error:", err.message);
    res.status(500).json({ error: "Failed to draft contract" });
  }
});

module.exports = router;
