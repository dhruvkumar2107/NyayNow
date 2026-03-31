const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateWithFallback, DEFAULT_SYSTEM_PROMPT: SYSTEM_PROMPT } = require("../utils/aiUtils");
const router = express.Router();
const multer = require("multer");
const pdf = require("pdf-parse");
const upload = multer({ storage: multer.memoryStorage() });
const verifyToken = require("../middleware/authMiddleware");
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const checkAiLimit = require("../middleware/checkAiLimit");

// Health check to verify AI config on server
router.get("/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    ai_configured: hasKey,
    key_prefix: hasKey ? process.env.GEMINI_API_KEY.substring(0, 4) + "****" : "missing"
  });
});

// Helper to safely parse JSON from Gemini's markdown response
function safeJsonParse(text, routeName) {
  try {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Isolate JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error(`❌ JSON Parse Error in ${routeName}. Raw text:`, text.substring(0, 500));
    throw new Error(`Failed to parse AI response in ${routeName}: ${err.message}`);
  }
}

/* ---------------- AI ASSISTANT (CHAT) ---------------- */
router.post("/assistant", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { question, history, language, location } = req.body;

    // Construct History Context
    const conversationHistory = history ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") : "";

    const prompt = `
      CURRENT DATE: ${new Date().toISOString()}
      RANDOM SEED: ${Math.random()}
      
      ACT AS THE NYAYNOW AI LEGAL ANALYSIS ENGINE.
      
      YOUR PERSONA:
      - You are a highly advanced legal intelligence system programmed with Indian Law (BNS 2024).
      - Your tone is **Analytical, Precise, and Neutral**.
      - You provide legal information by citing specific Sections, Articles, and Case Laws.
      - You clarify that you are a machine learning model, not a human lawyer.
      
      USER CONTEXT:
      Location: ${location || "India"}
      Language: ${language || "English"}
      
      PREVIOUS CHAT SUMMARY:
      ${conversationHistory ? conversationHistory.substring(0, 500) : "None"} ...
      
      CURRENT USER QUERY: "${question}"
      
      INSTRUCTIONS:
      1. **FACT-GATING**: Begin by summarizing the core legal facts of the user's situation.
      2. **IDENTIFY INTENT**: 
         - If technical (Login/Pricing), answer as "NyayNow Support".
         - If legal, proceed as a Senior Supreme Court Advocate.
      3. **LEGAL ANALYSIS (BNS 2024)**: Analyze under the latest Indian laws (BNS, BNSS, BSA). Cite specific Sections.
      4. **CROSS-REFERENCE**: Mention IPC equivalents for BNS sections helpfully.
      5. **STRATEGY**: Provide actionable next steps (FIR, Writ, Notice).
      6. **DISCLAIMER**: Remind the user this is information, not a substitute for a physical lawyer.
      
      REQUIRED OUTPUT FORMAT:
      [FACTS]
      (Briefly summarize the situation as you understand it)
      [/FACTS]

      [ANSWER]
      (Your detailed, structured legal response here)
      [/ANSWER]
      
      [QUESTIONS]
      (3 customized follow-up questions)
      [/QUESTIONS]
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const text = response.text();

    // console.log("🔍 Raw AI Response:", text); // Redacted for DPDP Act Compliance

    // ROBUST PARSING (REGEX)
    const answerMatch = text.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
    const answer = answerMatch ? answerMatch[1].trim() : text; // Fallback to full text if tags missing

    const questionsMatch = text.match(/\[QUESTIONS\]([\s\S]*?)\[\/QUESTIONS\]/);
    const questionsRaw = questionsMatch ? questionsMatch[1].trim() : "";
    const related_questions = questionsRaw.split('\n').map(q => q.trim()).filter(q => q.length > 5);

    const jsonResponse = {
      answer: answer,
      related_questions: related_questions,
      intent: "legal_advice",
      disclaimer: "NyayNow AI provides legal information grounded in BNS (2024) and Indian laws. This is not a substitute for professional legal advice from a registered lawyer."
    };

    res.json(jsonResponse);

  } catch (err) {
    console.error("❌ CRITICAL AI ERROR (/assistant):", err);

    // Check for specific Gemini errors
    let errorMessage = "Our legal AI is currently overwhelmed. Please try again in 10 seconds.";
    if (err.message.includes("400")) errorMessage = "Invalid request format.";
    if (err.message.includes("429")) errorMessage = "AI Rate limit exceeded. Please wait a moment.";

    // Return 200 so the UI displays the error message gracefully in the chat bubble instead of crashing
    res.status(200).json({
      answer: `**Resilient Fallback Mode**: ${errorMessage}\n\n*Technical Details: ${err.message}*`,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      related_questions: ["What happens when the API limit resets?", "Is my data safe?"],
      intent: "error"
    });
  }
});

/* ---------------- AGREEMENT ANALYSIS ---------------- */
/* ---------------- AGREEMENT ANALYSIS ---------------- */
router.post("/agreement", verifyTokenOptional, checkAiLimit, async (req, res) => {
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
    const analysisData = safeJsonParse(rawText, "Agreement Analysis");

    // PAYWALL LOGIC (Safe for guests)
    if (req.user && req.user.plan === 'free') {
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
    res.status(500).json({ error: "Failed to analyze agreement", details: err.message });
  }
});

/* ---------------- AGREEMENT PDF ANALYSIS ---------------- */
router.post("/analyze-agreement-pdf", verifyTokenOptional, checkAiLimit, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "PDF seems empty or unreadable." });
    }

    const truncatedText = text.substring(0, 15000);

    const prompt = `
      Analyze this legal agreement text extracted from a PDF:
      "${truncatedText}"
      
      Provide a specific JSON output with the following keys:
      - "accuracyScore": Number (0-100) representing legal robustness.
      - "riskLevel": String ("Low", "Medium", "High").
      - "missingClauses": Array of strings (important clauses missing).
      - "ambiguousClauses": Array of strings (clauses that are vague).
      - "jurisdictionContext": String (which laws apply).
      - "analysisText": String (Markdown formatted detailed analysis).
      
      IMPORTANT: Detect the language of the input text and provide the analysis IN THAT SAME LANGUAGE.
      Output ONLY valid JSON.
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const rawText = response.text();
    const analysisData = safeJsonParse(rawText, "Agreement PDF Analysis");

    if (req.user && req.user.plan === 'free') {
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
    console.error("Gemini PDF Agreement Error:", err.message);
    res.status(500).json({ error: "Failed to analyze PDF agreement", details: err.message });
  }
});

/* ---------------- CASE ANALYSIS (Legal Issue) ---------------- */
/* ---------------- CASE ANALYSIS (Legal Issue) ---------------- */
router.post("/case-analysis", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const prompt = `
      Analyze this legal issue description:
      "${text.substring(0, 5000)}"
      
      Provide:
      1. **Fact Summary**: What is the core dispute?
      2. **Statutory Standing**: List Relevant Acts (Prioritize BNS 2024, BNSS, BSA).
      3. **Remedy Strategy**: Suggested next steps.
      
      Return JSON with keys: 
      "summary" (string),
      "laws" (array of strings),
      "advice" (string),
      "disclaimer" (string - standard legal information warning).
      
      Strict JSON only.
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const rawText = response.text();
    const json = safeJsonParse(rawText, "Case Analysis");
    res.json(json);

  } catch (err) {
    console.error("Gemini Case Analysis Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case", details: err.message });
  }
});

/* ---------------- LEGAL NOTICE GENERATOR (LEGACY) ---------------- */
router.post("/legal-notice", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { noticeType, senderName, senderAddress, recipientName, recipientAddress, facts, complianceDays } = req.body;

    const prompt = `
      You are an automated legal drafting engine. Draft a formal "${noticeType}".
      Sender: ${senderName}, ${senderAddress}
      Recipient: ${recipientName}, ${recipientAddress}
      Facts: ${facts}
      Compliance: ${complianceDays} days.
      
      Format as Markdown. Include professional legal citations where applicable.
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    res.json({ notice: response.text() });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate notice", details: err.message });
  }
});

/* ---------------- LEGAL NOTICE GENERATOR (NEW) ---------------- */
/* ---------------- LEGAL NOTICE GENERATOR ---------------- */
router.post("/draft-notice", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { notice_details, language, type } = req.body;
    if (!notice_details) return res.status(400).json({ error: "Notice details required" });

    const lang = language || "English";
    const noticeType = type || "General Legal Notice";

    const prompt = `
      You are an automated legal drafting engine. Draft a formal "${noticeType}".
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
    if (err.message.includes("AI Service Unavailable") || err.message.includes("403 Forbidden") || err.message.includes("429")) {
      return res.json({ 
        draft: `### LEGAL NOTICE (FALLBACK MODE)\n\n> **NOTICE**: The NyayNow AI Engine is currently operating in fallback mode due to high demand or API quota limitations. This is a locally generated placeholder document.\n\n#### Subject: Legal Notice\n\n**To:**\nRecipient Address Here\n\n**From:**\nAdvocate Name / Firm\n\n**Dear Sir/Madam,**\n\nUnder instructions from my client, I hereby issue this formal legal notice regarding: ${req.body?.notice_details || "the aforementioned dispute"}.\n\n#### 1. Factual Matrix\nThe client asserts their rights and brings attention to the ongoing legal grievance.\n\n#### 2. Demands\nYou are hereby called upon to rectify the issue within the stipulated statutory period, failing which my client shall be constrained to initiate appropriate civil/criminal proceedings against you at your sole risk as to costs and consequences.\n\n***\n*Generated by NyayNow Resilient Fallback System.*` 
      });
    }
    res.status(500).json({ error: "Failed to draft notice", details: err.message });
  }
});

/* ---------------- JUDGE AI (CASE PREDICTOR) ---------------- */
/* ---------------- JUDGE AI (CASE PREDICTOR) ---------------- */
router.post("/predict-outcome", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { caseTitle, caseDescription, caseType, oppositionDetails, assignedJudge } = req.body;
    console.log(`📑 /predict-outcome requested for: ${caseTitle || "Unnamed Case"}`);

    const prompt = `
      ACT AS THE NYAYNOW JUDICIAL PREDICTION ENGINE.
      Verify the user's case details:
      - Title: "${caseTitle}"
      - Type / Court: "${caseType}"
      - Description: "${caseDescription}"
      - Opposing Party: "${oppositionDetails}"
      - Assigned Justice: "${assignedJudge || 'Unassigned / Bench Not Formed'}"

      Based on the Bharatiya Nyaya Sanhita (BNS) 2023, BNSS, and applicable Civil/Criminal Codes, perform an elite judicial dissection:
      
      CRITICAL INSTRUCTION: If an 'Assigned Justice' or 'Court' is provided, mathematically factor their historical strictness/leniency into your "Win Probability" and tailor your "Strategic Moves" to that specific Judge/Court's established biases.

      1. **Fact Summarization**: Briefly state the core legal dispute.
      2. **Win Probability**: Give a realistic percentage (0-100%). Weigh the opposing party's known resources and the judge's presumed tendencies.
      3. **Strategic Risks**: 3 critical loopholes or weaknesses.
      4. **Strategic Moves**: 3 legal motions to file.
      5. **BNS Citations**: YOU MUST cite specific sections of the BNS or BNSS.
      6. **Relevant Precedent**: Cite 1 real Indian Supreme Court/High Court case.

      RETURN STRICT JSON ONLY:
      {
        "disclaimer": "This analysis is for legal intelligence only. Probability is estimated based on provided facts.",
        "case_id": "NYY-2024-XXXX",
        "fact_summary": "...",
        "win_probability": "75%",
        "risk_score": 8,
        "risk_level": "High/Medium/Low",
        "risk_analysis": ["Risk 1", "Risk 2", "Risk 3"],
        "strategy": ["Move 1", "Move 2", "Move 3"],
        "estimated_duration": "14-18 months",
        "relevant_precedent": "Case Name (Year)",
        "citations": ["Sec X BNS", "Sec Y BNSS"]
      }
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let text = response.text();

    // Remove markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Attempt to isolate the JSON object if there is surrounding text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    try {
      console.log("🧩 Parsing AI JSON...");
      const parsed = safeJsonParse(text, "Predict Outcome");
      res.json(parsed);
    } catch (parseErr) {
      console.error("⚠️ AI Parse Failure. Returning resilient fallback.");
      // RESILIENT FALLBACK: Return a valid JSON structure so UI doesn't crash
      res.json({
        case_id: "NYY-FALLBACK-" + Math.floor(Math.random() * 1000),
        win_probability: "65%",
        risk_level: "Medium",
        fact_summary: "AI analysis was partially interrupted. Standard legal protocols apply.",
        risk_analysis: ["Procedural complexity noted", "Documentation review required", "Jurisdictional verification"],
        strategy: ["Verify all facts independently", "Consult a registered advocate", "Prepare preliminary response"],
        relevant_precedent: "Standard Case Law applies",
        citations: ["Sec 1 BNS", "Sec 1 BNSS"],
        is_fallback: true
      });
    }

  } catch (err) {
    console.error("Judge AI Error:", err.message);
    res.status(500).json({ error: "Failed to predict outcome. Try again.", details: err.message });
  }
});

/* ---------------- CONTRACT DRAFTING (TurboAgreements) ---------------- */
router.post("/draft-contract", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { type, parties, terms } = req.body;

    const prompt = `
      You are an automated legal drafting engine.
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
    if (err.message.includes("AI Service Unavailable") || err.message.includes("403 Forbidden") || err.message.includes("429")) {
      return res.json({ 
        contract: `### DRAFT CONTRACT (FALLBACK MODE)\n\n> **NOTICE**: The NyayNow AI Engine is currently operating in fallback mode due to high demand or API quota limitations. This is a locally generated placeholder document.\n\n#### 1. Parties\n**Party A:** ${req.body?.parties?.Party_1 || "First Party"}\n\n**Party B:** ${req.body?.parties?.Party_2 || "Second Party"}\n\n#### 2. Terms & Consideration\nThe parties agree to the following terms:\n- **Duration:** ${req.body?.terms?.Duration || "As agreed"}\n- **Financial Consideration:** ${req.body?.terms?.Amount || "Standard Fee"}\n- **Jurisdiction:** ${req.body?.terms?.Location || "India"}\n\n#### 3. General Clauses\nThis is a standard template holding place for the full AI-generated legal text.\n\n***\n*Generated by NyayNow Resilient Fallback System.*` 
      });
    }
    res.status(500).json({ error: "Failed to draft contract" });
  }
});

/* ---------------- JUDGE AI PRO (PDF ANALYSIS) ---------------- */
router.post("/analyze-case-file", verifyTokenOptional, checkAiLimit, upload.single("file"), async (req, res) => {
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
      ACT AS THE NYAYNOW FORENSIC CASE ANALYSIS ENGINE.
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
    res.json(safeJsonParse(text, "Case File Analysis"));

  } catch (err) {
    console.error("Judge AI Pro Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case file. Ensure it is a valid PDF." });
  }
});

/* ---------------- DEVIL'S ADVOCATE (AI REBUTTAL) ---------------- */
router.post("/devils-advocate", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { argument } = req.body;
    if (!argument) return res.status(400).json({ error: "Argument required" });

    const prompt = `
      ACT AS THE NYAYNOW ADVERSARIAL ANALYSIS ENGINE (Devil's Advocate Mode). 
      The user is the defense lawyer. They have just made this argument:
      "${argument}"

      YOUR GOAL: SYSTEMATICALLY DISMANTLE THIS ARGUMENT.
      1. **Cite Counter-Laws**: YOU MUST cite specific Indian Law sections (BNS 2024, etc.) that contradict their premise.
      2. **Expose Fallacies**: Find logical gaps or lack of evidence.
      3. **Tone**: Be ruthlessly professional, similar to a high-stakes Prosecutor.

      OUTPUT JSON STRICTLY:
      {
        "disclaimer": "This is an adversarial simulation to test your argument strength.",
        "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "counter_arguments": ["Counter-law Section X", "Counter-argument Y"],
        "prosecutorial_rebuttal": "Your entire premise fails because..."
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

/* ---------------- MOOT COURT (AI JUDGE) ---------------- */
router.post("/moot-court", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { transcript, caseContext } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript required." });

    const prompt = `
      ACT AS THE NYAYNOW MOOT COURT EVALUATION ENGINE.
      
      CONTEXT:
      The user is a law student arguing a case in a Moot Court.
      Case Context: "${caseContext || "General Legal Argument"}"
      
      STUDENT ARGUMENT:
      "${transcript}"
      
      TASK:
      Analyze the argument for:
      1. **Legal Accuracy**: Are they citing real BNS/Indian codes correctly? (Critical)
      2. **Logic & Flow**: Is the argument coherent?
      3. **Persuasion**: How convincing is it?
      
      OUTPUT JSON STRICTLY:
      {
        "score": 85, 
        "feedback": ["Great use of Section X.", "Missing citation for Y."],
        "judge_remarks": "Counsel, your point is noted, but...",
        "citation_accuracy": "High/Medium/Low",
        "disclaimer": "This feedback is for training purposes."
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
    console.error("Moot Court Error:", err.message);
    res.status(500).json({ error: "The Court is adjourned. Try again." });
  }
});

/* ---------------- LEGAL RESEARCH (SEMANTIC SEARCH) ---------------- */
router.post("/legal-research", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { query, source, dateRange } = req.body;
    if (!query) return res.status(400).json({ error: "Query required." });

    const prompt = `
      ACT AS A LEGAL RESEARCHER FOR THE SUPREME COURT OF INDIA.
      
      USER QUERY: "${query}"
      RESEARCH SCOPE: ${source || "All Indian Courts"}
      DATE RANGE FILTER: ${dateRange || "All Time"}
      
      TASK:
      1. Identify core legal issues related to the query within the specified scope.
      2. Find 3-5 RELEVANT cases (Prioritize BNS 2024 context if applicable).
      3. For each case, provide:
         - Case Name & Citation
         - Ratio Decidendi
         - Relevance to the specified scope and date range.
      
      OUTPUT JSON STRICTLY:
      {
        "disclaimer": "Legal research is for information purposes. Verify citations with the official gazette.",
        "summary": "...",
        "cases": [
          { "name": "...", "citation": "...", "ratio": "...", "relevance": "..." }
        ]
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
    console.error("Legal Research Error:", err.message);
    res.status(500).json({ error: "Research failed. Try again." });
  }
});

/* ---------------- CAREER MENTOR (VIRTUAL INTERNSHIP) ---------------- */
router.post("/career-mentor", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { taskType, userSubmission } = req.body;
    if (!userSubmission) return res.status(400).json({ error: "Submission required." });

    const prompt = `
      ACT AS THE NYAYNOW CAREER DEVELOPMENT ENGINE.
      You are grading a virtual internship task submitted by a law student.
      
      Task: "${taskType}"
      Student Submission: "${userSubmission}"
      
      Provide a strict Grading JSON:
      {
        "grade": "A/B/C/D",
        "score": 85,
        "feedback": ["Constructive point 1", "Constructive point 2"],
        "correction": "How a pro would have done it..."
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
    console.error("Career Mentor Error:", err.message);
    res.status(500).json({ error: "Grading failed. Try again." });
  }
});

/* ---------------- JUDGE PROFILE GENERATOR ---------------- */
router.post("/judge-profile", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { name, court } = req.body;
    if (!name) return res.status(400).json({ error: "Judge name is required" });

    const prompt = `
      ACT AS THE NYAYNOW JUDICIAL ANALYTICS ENGINE.
      Generate a professional judicial profile for:
      Name: "${name}"
      Court: "${court || "High Court/Supreme Court of India"}"

      If the judge is real/famous, use known facts (style, famous cases).
      If the name is generic/unknown, generate a *realistic* but fictional profile suitable for a senior Indian judge to demonstrate the tool's capability.

      OUTPUT JSON STRICTLY:
      {
        "name": "${name}",
        "court": "${court || "High Court of India"}",
        "adjective": "Strict Constructionist / Pro-Labor / Etc",
        "appointed": "Year (e.g. 2015)",
        "total_judgments": 850 (Number),
        "biases": [
           {"topic": "Criminal Bail", "tendency": "Strict/Lenient", "color": "red/green"},
           {"topic": "Commercial Disputes", "tendency": "Pro-Arbitration", "color": "green"}
        ],
        "favorite_citations": ["Case Law 1", "Case Law 2"],
        "keywords": ["Natural Justice", "Maintainability", "Prima Facie"]
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
    console.error("Judge Profile Error:", err.message);
    res.status(500).json({ error: "Failed to profile judge." });
  }
});

/* ---------------- LEGAL SOS (EMERGENCY TRIAGE) ---------------- */
router.post("/legal-sos", verifyTokenOptional, async (req, res) => {
  try {
    const { situation, emergencyType, language } = req.body;
    if (!situation) return res.status(400).json({ error: "Situation description required" });

    const prompt = `
      ACT AS THE NYAYNOW EMERGENCY TRIAGE ENGINE.

      EMERGENCY TYPE: "${emergencyType}"
      LANGUAGE FOR RESPONSE: ${language || "English"}
      DESCRIPTION: "${situation}"

      DESCRIPTION: "${situation}"

      CRITICAL SAFETY SCRIPT:
      1. **IDENTIFY THREAT**: If the user is being physically threatened or is currently being arrested, your first sentence must be a calm, immediate instruction (e.g., "Remain calm. You have the right to remain silent under Article 20(3).").
      2. **FACT SUMMARY**: Briefly re-state the emergency facts.
      3. **URGENCY**: Assign "Critical", "High", or "Medium".
      4. **RIGHTS (BNS 2023/CONSTITUTION)**: List 4-6 FUNDAMENTAL RIGHTS. Include:
         - title: Name of right.
         - description: Clear explanation.
         - article: Specific Article/Section (Cite BNS/BNSS/Constitution).
      5. **IMMEDIATE_ACTIONS**: 4-5 numbered, tactical steps.
      6. **DISCLAIMER**: Mandatory warning that this is an emergency tool, not a lawyer.

      OUTPUT STRICT JSON:
      {
        "disclaimer": "EMERGENCY AID ONLY. Contact local emergency services or a verified lawyer immediately.",
        "classified_as": "...",
        "urgency": "Critical|High|Medium",
        "fact_summary": "...",
        "rights": [
          { "title": "...", "description": "...", "article": "..." }
        ],
        "applicable_sections": ["Sec 41 BNSS", "Sec 103 BNS"],
        "immediate_actions": ["Action 1", "Action 2"]
      }
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let text = response.text();
    res.json(safeJsonParse(text, "Legal SOS"));
  } catch (err) {
    console.error("Legal SOS Error:", err.message);
    res.status(500).json({ error: "Emergency analysis failed. Please try again." });
  }
});

/* ---------------- FIR GENERATOR (EMERGENCY DRAFT) ---------------- */
router.post("/fir-generator", verifyTokenOptional, async (req, res) => {
  try {
    const { situation, emergencyType, language, complaintDetails, rights } = req.body;
    if (!situation) return res.status(400).json({ error: "Situation required" });

    const { name, date, place, against } = complaintDetails || {};

    const prompt = `
      ACT AS THE NYAYNOW LEGAL DRAFTING ENGINE.
      Draft a formal First Information Report (FIR) in ${language || "English"}.

      COMPLAINANT DETAILS:
      - Name: ${name || "[Complainant Name]"}
      - Date of Incident: ${date || "[Date of Incident]"}
      - Place of Incident: ${place || "[Place of Incident]"}
      - Accused / Against: ${against || "[Accused Person/Entity]"}

      SITUATION DESCRIPTION:
      "${situation}"

      EMERGENCY TYPE: ${emergencyType}
      APPLICABLE SECTIONS: ${rights?.applicable_sections?.join(", ") || "As applicable under BNS/IPC"}

      DRAFT THE FIR with the following exact structure:
      1. FIR No. and Date (use today's date: ${new Date().toLocaleDateString('en-IN')})
      2. Police Station: [Name of Police Station]
      3. Under Sections: (list the applicable BNS/IPC sections)
      4. NAME OF COMPLAINANT:
      5. ADDRESS OF COMPLAINANT:
      6. NAME OF ACCUSED (if known):
      7. DATE/TIME OF INCIDENT:
      8. PLACE OF INCIDENT:
      9. BRIEF FACTS OF THE CASE: (3-5 paragraphs describing the incident in formal police language)
      10. RELIEF SOUGHT: (What action the complainant wants)
      11. DECLARATION: "I hereby declare that the above information is true to the best of my knowledge..."
      12. SIGNATURE / THUMB IMPRESSION: ____________________
      13. DATE OF FILING:

      Write in formal, legally accepted FIR language. Use "the complainant" and third person. Include the applicable law sections properly. Do NOT add any notes or disclaimers around the FIR — output ONLY the FIR text.
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    const draft = response.text();
    res.json({
      draft,
      disclaimer: "This is a draft FIR generated by AI based on your facts. It must be reviewed by a human lawyer before formal submission."
    });
  } catch (err) {
    console.error("FIR Generator Error:", err.message);
    res.status(500).json({ error: "FIR generation failed. Please try again." });
  }
});

/* ═══════════════════════════════════════════════════════════════
   NYAYCOURT — AI MULTI-AGENT COURTROOM BATTLE SIMULATOR
   The most powerful AI feature: 3 AI personas argue the user's
   real case against each other. Full trial in 60 seconds.
   ═══════════════════════════════════════════════════════════════ */
router.post("/courtroom-battle", verifyTokenOptional, async (req, res) => {
  try {
    const { caseTitle, caseDescription, caseType, plaintiffSide, defenseSide } = req.body;
    if (!caseDescription) return res.status(400).json({ error: "Case description required" });

    // ── AI Personas ─────────────────────────────────────────────────────────
    const PLAINTIFF_PERSONA = `You are NyayNow AI Analysis Engine (Prosecution), a senior legal analysis agent known for aggressive, evidence-based prosecution. You represent the PLAINTIFF/PROSECUTION side. You cite specific Indian laws (BNS, IPC, BNSS, CPC) and real case precedents. You are sharp, persuasive, and relentless. Courtroom diction only.`;
    const DEFENSE_PERSONA = `You are NyayNow AI Analysis Engine (Defense), a legendary defense analysis agent known for dismantling prosecution arguments with surgical precision. You expertly exploit legal loopholes and protect constitutional rights. You cite specific Indian laws and case laws. You are brilliant, calm, and devastating in your rebuttals. Courtroom diction only.`;
    const JUDGE_PERSONA = `You are NyayNow AI Analysis Engine (Simulation Judge), a no-nonsense simulation judge with years of data-driven experience. You are neutral, deeply learned, and cut through weak arguments instantly. You ask piercing questions and give crisp judicial observations. You cite specific constitutional provisions. Courtroom diction only.`;

    const caseContext = `
      CASE TITLE: "${caseTitle || "The Instant Case"}"
      CASE TYPE: ${caseType || "General Civil/Criminal Matter"}
      PLAINTIFF SIDE: ${plaintiffSide || "As described in facts"}
      DEFENSE SIDE: ${defenseSide || "As described in facts"}
      FACTS OF THE CASE: "${caseDescription}"
    `;

    async function callAgent(persona, role, instruction, priorTranscript) {
      const prompt = `
        ${caseContext}

        PRIOR COURTROOM TRANSCRIPT:
        ${priorTranscript || "Court is now in session."}

        YOUR ROLE TODAY: ${role}
        YOUR TASK: ${instruction}

        STRICT RULES:
        1. Stay in character as a courtroom professional.
        2. Cite at least 1-2 specific Indian law sections or case laws.
        3. Be DRAMATIC and INCISIVE — this is a real courtroom.
        4. Keep response to 120-200 words — concise but powerful.
        5. Start with your title (e.g. "My Lord," or "Your Honor," or "Learned Counsel,")
        6. End with a 1-line punch statement.
        7. Return ONLY the courtroom speech. No meta-commentary.
      `;
      const result = await generateWithFallback(prompt, persona);
      const response = await result.response;
      return response.text().trim();
    }

    // ── Run 5 rounds sequentially ────────────────────────────────────────────
    let transcript = "";
    const rounds = [];

    // Round 1: Plaintiff Opening
    const r1 = await callAgent(
      PLAINTIFF_PERSONA,
      "PLAINTIFF'S COUNSEL — OPENING ARGUMENT",
      "Deliver a powerful opening argument establishing the facts and the legal basis of your case. State the relief sought.",
      transcript
    );
    rounds.push({ speaker: "plaintiff", name: "Adv. Vikram Anand", type: "Opening Argument", speech: r1, sections: extractSections(r1) });
    transcript += `\n\nPLAINTIFF'S COUNSEL (Opening Argument):\n${r1}`;

    // Round 2: Defense Rebuttal
    const r2 = await callAgent(
      DEFENSE_PERSONA,
      "DEFENSE COUNSEL — REBUTTAL",
      "Rebut the plaintiff's opening argument. Expose its weaknesses, challenge the legal positions, and lay the groundwork for your defense.",
      transcript
    );
    rounds.push({ speaker: "defense", name: "Adv. Priya Rathore", type: "Rebuttal", speech: r2, sections: extractSections(r2) });
    transcript += `\n\nDEFENSE COUNSEL (Rebuttal):\n${r2}`;

    // Round 3: Judge's Observation
    const r3 = await callAgent(
      JUDGE_PERSONA,
      "PRESIDING JUDGE — JUDICIAL OBSERVATION & QUESTION",
      "Interrupt proceedings. Ask a sharp, penetrating question to the plaintiff's counsel that challenges the weakest point of their argument. Cite a relevant constitutional provision or procedural law.",
      transcript
    );
    rounds.push({ speaker: "judge", name: "Hon. Justice R.K. Krishnamurthy", type: "Judicial Observation", speech: r3, sections: extractSections(r3) });
    transcript += `\n\nHON. JUDGE (Judicial Observation):\n${r3}`;

    // Round 4: Plaintiff Response to Judge
    const r4 = await callAgent(
      PLAINTIFF_PERSONA,
      "PLAINTIFF'S COUNSEL — RESPONSE TO COURT",
      "Respond to the Judge's observation. Answer the Judge's question directly and turn the court's attention back to the strength of your case with a compelling precedent.",
      transcript
    );
    rounds.push({ speaker: "plaintiff", name: "Adv. Vikram Anand", type: "Response to Court", speech: r4, sections: extractSections(r4) });
    transcript += `\n\nPLAINTIFF'S COUNSEL (Response to Court):\n${r4}`;

    // Round 5: Defense Closing
    const r5 = await callAgent(
      DEFENSE_PERSONA,
      "DEFENSE COUNSEL — CLOSING ARGUMENT",
      "Deliver the closing argument. Systematically dismantle all of the plaintiff's arguments, invoke the accused's constitutional rights, and make a compelling plea to the Court.",
      transcript
    );
    rounds.push({ speaker: "defense", name: "Adv. Priya Rathore", type: "Closing Argument", speech: r5, sections: extractSections(r5) });
    transcript += `\n\nDEFENSE COUNSEL (Closing Argument):\n${r5}`;

    // Final: AI Judge Verdict
    const verdictPrompt = `
      ${JUDGE_PERSONA}

      ${caseContext}

      FULL COURTROOM TRANSCRIPT:
      ${transcript}

      YOUR TASK: Deliver the FINAL JUDGMENT. Based on the arguments presented:
      1. Summarize which side argued more convincingly and why.
      2. Apply the applicable law sections.
      3. Give a final ruling: "In favor of Plaintiff" or "In favor of Defense"
      4. Assign win_probability_plaintiff (0-100) based on argument strength.
      5. Name 1-2 key precedents that guided your decision.
      6. Give the final order in 1-2 sentences (what must happen next).

      RETURN STRICT JSON ONLY:
      {
        "ruling": "In favor of Plaintiff" or "In favor of Defense",
        "win_probability_plaintiff": 65,
        "win_probability_defense": 35,
        "judge_summary": "After careful analysis of both sides...",
        "key_precedents": ["Case Name v. State (Year)", "Case Name 2"],
        "deciding_factor": "The plaintiff's reliance on Section X was the turning point...",
        "final_order": "The defendant is directed to..."
      }
    `;

    const verdictResult = await generateWithFallback(verdictPrompt, JUDGE_PERSONA);
    const response = await verdictResult.response;
    let verdictText = response.text();
    const verdict = safeJsonParse(verdictText, "Courtroom Battle Verdict");

    res.json({
      case_title: caseTitle || "The Instant Case",
      case_type: caseType || "Legal Matter",
      rounds,
      verdict,
    });

  } catch (err) {
    console.error("NyayCourt Error:", err.message);
    res.status(500).json({ error: "Court session failed. Please try again." });
  }
});

// Helper to extract cited law sections from speech text
function extractSections(text) {
  const matches = text.match(/(?:Section|Article|Order|Rule)\s+[\w\s,\/]+(?:of\s+the\s+[\w\s]+)?/gi) || [];
  return [...new Set(matches)].slice(0, 3);
}

/* ────────────────────────────────────────────────────────
   INSTANT LEGAL NOTICE GENERATOR
   POST /api/ai/legal-notice
──────────────────────────────────────────────────────── */
router.post("/legal-notice", verifyToken, async (req, res) => {
  try {
    const {
      noticeType,        // e.g. "Demand Notice", "Eviction Notice", "Cheque Bounce"
      senderName,        // Lawyer/Client name
      senderAddress,
      senderBarCouncil,  // Lawyer's Bar Council ID
      recipientName,
      recipientAddress,
      facts,             // Brief of the matter
      amount,            // If monetary demand
      complianceDays,    // Days to comply (default 15)
      additionalClauses
    } = req.body;

    if (!noticeType || !senderName || !recipientName || !facts) {
      return res.status(400).json({ error: "Missing required fields: noticeType, senderName, recipientName, facts" });
    }

    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    const prompt = `You are an automated legal drafting engine.

Generate a complete, professional, court-ready Legal Notice with the following structure and details:

NOTICE DETAILS:
- Notice Type: ${noticeType}
- Date: ${today}
- Sender (Advocate/Client): ${senderName}
- Sender Address: ${senderAddress || "To be filled"}
- Bar Council ID: ${senderBarCouncil || "N/A"}
- Recipient: ${recipientName}
- Recipient Address: ${recipientAddress || "To be filled"}
- Facts of the Matter: ${facts}
${amount ? `- Amount in Dispute: ₹${amount}` : ""}
- Compliance Period: ${complianceDays || 15} days
${additionalClauses ? `- Additional Clauses: ${additionalClauses}` : ""}

FORMAT THE NOTICE EXACTLY AS FOLLOWS:

LEGAL NOTICE
(Under [Relevant Act/Section])

Date: ${today}

To,
[Recipient Name]
[Recipient Address]

Subject: Legal Notice for [One Line Subject]

Sir/Madam,

Under instructions from and on behalf of my client, [Sender Name], I hereby serve upon you the following Legal Notice:

1. FACTS AND BACKGROUND:
   [3-5 detailed paragraphs describing the factual background with dates, events, and context]

2. CAUSE OF ACTION:
   [Cite specific Indian laws — IPC/BNS sections, CrPC/BNSS, CPC, specific Acts — that apply]

3. LEGAL VIOLATIONS:
   [Enumerate each legal violation with relevant section numbers]

4. DEMAND/PRAYER:
   [Clear demand — payment, action, cessation — with specific amount if applicable]

5. CONSEQUENCES OF NON-COMPLIANCE:
   [Legal consequences if ignored — civil suit, criminal complaint, etc.]

TAKE NOTICE that if you fail to comply with the above demands within ${complianceDays || 15} days of receipt of this notice, my client shall be constrained to initiate appropriate legal proceedings before the competent court/forum, including but not limited to filing a civil suit for recovery/injunction and/or a criminal complaint, without any further notice to you, at your risk, cost and consequences.

This notice is WITHOUT PREJUDICE to the rights and remedies available to my client.

Yours faithfully,

[SIGNATURE SLOT]
${senderName}
${senderBarCouncil ? `Bar Council Enrolment No.: ${senderBarCouncil}` : "Advocate"}
${senderAddress || ""}
Date: ${today}

Note: The above is a formal legal notice prepared ${senderBarCouncil ? "by a registered Advocate" : "on behalf of the sender"}.

Generate this notice with complete professional legal language, proper recitals, and cite the most relevant Indian law sections (BNS 2023, BNSS 2023, CPC 1908, or relevant specific Acts). Make it court-ready and enforceable.`;

    const result = await generateWithFallback(prompt);
    const noticeText = result.response.text();

    res.json({ notice: noticeText, date: today, type: noticeType });
  } catch (err) {
    console.error("Legal Notice Generation Error:", err);
    res.status(500).json({ error: "Failed to generate legal notice. Please try again." });
  }
});

// STABILITY FIX: Ensure extractSections handles empty input
function extractSections(text) {
  if (!text) return [];
  const matches = text.match(/(?:Section|Article|Order|Rule)\s+[\w\s,\/]+(?:of\s+the\s+[\w\s]+)?/gi) || [];
  return [...new Set(matches)].slice(0, 3);
}

module.exports = router;


