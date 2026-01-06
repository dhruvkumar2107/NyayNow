const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/* ---------------- AI ASSISTANT (CHAT) ---------------- */
const fs = require('fs');

router.post("/assistant", async (req, res) => {
  fs.appendFileSync('ai_debug.log', `In Request: ${JSON.stringify(req.body)}\n`);
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

    // Parse JSON from the AI response (it might be wrapped in md code blocks)
    // Log the raw text for debugging
    fs.appendFileSync('ai_debug.log', `RAW AI RESPONSE:\n${text}\n----------------\n`);

    // Robust JSON extraction
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const jsonResponse = JSON.parse(cleaned);

    res.json(jsonResponse);
  } catch (err) {
    fs.appendFileSync('ai_debug.log', `ERROR: ${err.message}\n${err.stack}\n`);
    console.error("Gemini Assistant Error:", err.message);
    res.status(500).json({
      answer: `AI Error: ${err.message}`,
      related_questions: [],
      intent: "error"
    });
  }
});

/* ---------------- AGREEMENT ANALYSIS ---------------- */
// Matched to Agreements.jsx call: /api/ai/agreement
router.post("/agreement", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const prompt = `
      Analyze this legal agreement text:
      "${text.substring(0, 10000)}"
      
      Provide a comprehensive professional legal analysis in Markdown format.
      Include sections for:
      - Key Observations
      - Potential Risks
      - Notable Clauses
      - Actionable Advice
      
      Do NOT return JSON. Return only the Markdown text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    res.json({ analysis });
  } catch (err) {
    console.error("Gemini Agreement Error:", err.message);
    res.status(500).json({ error: "Failed to analyze agreement" });
  }
});

/* ---------------- CASE ANALYSIS (Legal Issue) ---------------- */
// Matched to Analyze.jsx call: /api/ai/case-analysis
router.post("/case-analysis", async (req, res) => {
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

/* ---------------- FIR GENERATOR ---------------- */
router.post("/draft-fir", async (req, res) => {
  try {
    const { incident_details, language, location } = req.body;
    if (!incident_details) return res.status(400).json({ error: "Incident details required" });

    const lang = language || "English";
    const loc = location || "India";

    const prompt = `
      You are an expert police complaint drafter in India.
      Location: ${loc}
      Language: ${lang}
      
      Draft a formal FIR (First Information Report) complaint based on these details:
      "${incident_details}"
      
      Structure:
      1. To the SHO (Station House Officer)
      2. Subject Line
      3. Complainant Details (Leave placeholders [Name], [Address])
      4. Incident Validation (Date, Time, Place)
      5. Body (Professional, chronological account)
      6. Prayer/Request for Action
      7. Signature Placeholder
      
      Output ONLY the draft text in Markdown. Do not wrap in JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ draft: response.text() });

  } catch (err) {
    console.error("Gemini FIR Error:", err.message);
    res.status(500).json({ error: "Failed to draft FIR" });
  }
});

/* ---------------- LEGAL NOTICE GENERATOR ---------------- */
router.post("/draft-notice", async (req, res) => {
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


module.exports = router;
