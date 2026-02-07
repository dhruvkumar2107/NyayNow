const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
const multer = require("multer");
const pdf = require("pdf-parse");
const upload = multer({ storage: multer.memoryStorage() });
const verifyToken = require("../middleware/authMiddleware");
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const checkAiLimit = require("../middleware/checkAiLimit");

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing!");
} else {
  console.log("✅ GEMINI_API_KEY is present.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

// Helper for Model Fallback
// Helper for Model Fallback
async function generateWithFallback(prompt) {
  // USER REQUEST: STRICTLY GEMINI 2.5 FLASH ONLY
  const modelsToTry = [
    "gemini-2.5-flash"
  ];

  const errors = [];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are an elite Senior Legal Consultant and former Supreme Court Judge in India. 
            Your name is 'NyaySathi AI'.
            
            CORE DIRECTIVES:
            1. ACT STRICTLY as a legal expert. Do not answer non-legal questions (politely decline).
            2. USE "BHARATIYA NYAYA SANHITA (BNS)" and "BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS)" instead of IPC/CrPC where applicable, effectively immediately. Quote specific sections.
            3. BE PRECISE. Give probability of winning, estimated timeline, and step-by-step legal strategy.
            4. TONE: Professional, authoritative, yet accessible. 
            5. CONTEXT: Remember previous facts if provided in the conversation history.
            
            Structure your advice as:
            - 🔍 **Legal Analysis** (Cite BNS/Constitution)
            - ⚖️ **Verdict/Probability**
            - ♟️ **Strategic Calls** (Actionable steps)
            - ⚠️ **Risks**
            
            Do not provide generic "contact a lawyer" advice as the ONLY answer. Provide the legal groundwork first.`
      });
      const result = await model.generateContent(prompt);
      return result; // Success
    } catch (e) {
      console.error(`Model ${modelName} failed:`, e.message);
      errors.push(`${modelName}: ${e.message}`);
    }
  }

  // Throw explicit error for the catch block below
  throw new Error(errors.join(" | ") || "AI Service Unavailable");
}

/* ---------------- AI ASSISTANT (CHAT) ---------------- */
router.post("/assistant", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { question, history, language, location } = req.body;

    // Construct History Context
    const conversationHistory = history ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") : "";

    const prompt = `
      User Location: ${location || "India"}
      Language: ${language || "English"}
      
      CRITICAL INSTRUCTION:
      You must respond in the SAME language as the "Language" field above. 
      If Language is "Hindi", reply in Hindi (Devanagari). 
      
      CONVERSATION HISTORY:
      ${conversationHistory}
      
      CURRENT QUERY: "${question}"
      
      Directives:
      1. IGNORE generic "helpful assistant" behaviors. You are a Senior Legal Consultant.
      2. If the user's query is vague, ASK clarifying questions.
      3. CITATION: Use Bharatiya Nyaya Sanhita (BNS) and BNSS. 
      4. FORMAT: Use Markdown. Output MUST be valid JSON.
      
      Format the output as JSON with keys: "answer" (markdown string), "related_questions" (array of strings), "intent" (string).
    `;

    const result = await generateWithFallback(prompt);
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
      error: err.message,
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

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const rawText = response.text();

    let cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const analysisData = JSON.parse(cleaned);

    // PAYWALL LOGIC
    if (req.user.plan === 'free') {
      analysisData.riskLevel = "🔒 Upgrade to Unlock";
      analysisData.missingClauses = ["🔒 Upgrade to view missing clauses"];
      analysisData.ambiguousClauses = ["🔒 Upgrade to view ambiguous clauses"];
      analysisData.accuracyScore = 0;
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

    const result = await generateWithFallback(prompt);
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

    const result = await generateWithFallback(prompt);
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

    const result = await generateWithFallback(prompt);
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

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const contractText = response.text();

    res.json({ contract: contractText });

  } catch (err) {
    console.error("Gemini Drafting Error:", err.message);
    res.status(500).json({ error: "Failed to draft contract" });
  }
});

/* ---------------- JUDGE AI PRO (PDF ANALYSIS) ---------------- */
router.post("/analyze-case-file", verifyToken, checkAiLimit, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    // 1. Extract Text from PDF
    const pdfData = await pdf(req.file.buffer);
    const caseText = pdfData.text;

    if (!caseText || caseText.length < 50) {
      return res.status(400).json({ error: "PDF seems empty or unreadable." });
    }

    // 2. Truncate if too huge
    const truncatedText = caseText.substring(0, 100000);

    const prompt = `
      ACT AS A SENIOR HIGH COURT JUDGE & FORENSIC EXPERT.
      Analyze the provided Case File (Extracted Text).
      
      CASE TEXT:
      """
      ${truncatedText}
      """
      
      TASK:
      1. **Timeline**: Reconstruct a chronological timeline of events.
      2. **Contradictions**: Find logic gaps or contradictions in statements (e.g., "Page 2 says X, Page 10 says Y").
      3. **Legal Risks**: Identify the biggest weaknesses in this case.
      4. **Relevant Case Law**: Cite 2-3 specific Indian Supreme Court/High Court precedents that apply.
      5. **Win Probability**: Estimate percentage chance of winning.
      
      OUTPUT JSON STRICTLY:
      {
        "timeline": [{"date": "YYYY-MM-DD", "event": "Event description"}],
        "contradictions": ["Contradiction 1", "Contradiction 2"],
        "risks": ["Risk 1", "Risk 2"],
        "citations": ["Case Link/Name 1", "Case Link/Name 2"],
        "winProbability": 75,
        "summary": "Brief executive summary..."
      }
    `;

    // 3. AI Analysis
    const result = await generateWithFallback(prompt);
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
    console.error("Judge AI Pro Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case file. Ensure it is a valid PDF." });
  }
});

/* ---------------- DEVIL'S ADVOCATE (AI REBUTTAL) ---------------- */
router.post("/devils-advocate", verifyToken, checkAiLimit, async (req, res) => {
  try {
    const { argument } = req.body;
    if (!argument) return res.status(400).json({ error: "Argument required" });

    const prompt = `
      ACT AS A RUTHLESS SENIOR OPPOSING COUNSEL. 
      The user is the defense lawyer. They have just made this argument:
      "${argument}"

      YOUR GOAL: DESTROY THIS ARGUMENT.
      1. Find logical fallacies.
      2. Point out lack of evidence.
      3. Cite specific Indian Law sections that contradict them.
      4. Be sarcastic but professional (like a confident lawyer).

      OUTPUT JSON STRICTLY:
      {
        "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "counter_arguments": ["Counter 1", "Counter 2"],
        "sarcastic_rebuttal": "Your entire premise relies on..."
      }
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    res.json(JSON.parse(text));

  } catch (err) {
    console.error("Devil's Advocate Error:", err.message);
    res.status(500).json({ error: "The Devil is busy. Try again." });
  }
});

module.exports = router;
