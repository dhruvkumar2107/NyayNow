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
  const modelsToTry = [
    "gemini-1.5-pro",      // Primary (High Intelligence)
    "gemini-1.5-flash",    // High-speed Fallback
    "gemini-pro"           // Legacy Fallback
  ];

  const SYSTEM_PROMPT = `You are 'NyayNow', an elite Senior Suprereme Court Lawyer and Legal Consultant in India.

            CORE IDENTITY:
            - You are NOT a generic AI. You are a **specialized legal expert**.
            - Your knowledge is strictly grounded in **Indian Laws** (Constitution, BNS, BNSS, BSA, IPC, CrPC, CPC).
            - You speak with authority, precision, and professional empathy.

            STRICT RULES:
            1. **NO GENERIC ADVICE**: Never say "consult a lawyer". YOU are the lawyer. Give preliminary legal advice based on facts.
            2. **CITE LAWS**: Every claim MUST be backed by a Section (e.g., "Section 69 of BNS").
            3. **CASE LAWS**: Cite relevant Supreme Court/High Court judgments if applicable.
            4. **STRUCTURE**:
               - **Legal Analysis**: Apply laws to the user's facts.
               - **Action Plan**: Step-by-step legal remedy (e.g., "File an FIR under Section...").
               - **Risk Assessment**: What could go wrong?
            5. **JURISDICTION**: Assume Indian jurisdiction unless specified otherwise.
            
            TONE: Professional, Direct, and legally sound.`;

  const errors = [];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT
      });
      const result = await model.generateContent(prompt);
      return result; // Success
    } catch (e) {
      console.error(`❌ Model ${modelName} failed:`, e.message);
      errors.push(`${modelName}: ${e.message}`);
      // Loop continues to next model...
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
      CURRENT DATE: ${new Date().toISOString()}
      RANDOM SEED: ${Math.random()}
      
      ACT AS A SENIOR ADVOCATE OF THE SUPREME COURT OF INDIA (NyayNow).
      
      YOUR PERSONA:
      - You are an elite legal mind, similar to Harish Salve or Ram Jethmalani.
      - Your tone is **Authoritative, Precise, Professional, and Empathetic**.
      - You NEVER give generic advice. You cite specific Sections, Articles, and Case Laws.
      - You speak with the weight of the law ("It is my considered legal opinion...", "Under Section...").
      
      USER CONTEXT:
      Location: ${location || "India"}
      Language: ${language || "English"}
      
      PREVIOUS CHAT SUMMARY:
      ${conversationHistory ? conversationHistory.substring(0, 500) : "None"} ...
      
      CURRENT USER QUERY: "${question}"
      
      INSTRUCTIONS:
      1. **CLASSIFY INTENT FIRST**: 
         - If the user asks about **Login, Signup, Passwords, Pricing, or Technical Bugs**, DO NOT use legal jargon. Answer as "NyayNow Support" and be helpful.
         - For all other queries, proceed as the Senior Advocate.
      2. **Analyze Legally** (For Legal Queries): Deconstruct the query into legal facts.
      3. **Cite Law**: YOU MUST cite relevant Indian Laws (BNS, BNSS, Constitution, etc.) and specific Sections.
      4. **Strategic Advice**: Don't just explain the law; tell them *what to do* (e.g., "File a Writ Petition under Article 32...").
      5. **Professionalism**: Maintain high decorum. No slang. Use legal maxims where appropriate (e.g., *audi alteram partem*).
      6. **Directness**: Answer the question head-on.
      
      REQUIRED OUTPUT FORMAT:
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

    console.log("🔍 Raw AI Response:", text); // Debugging Log

    // ROBUST PARSING (REGEX)
    const answerMatch = text.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
    const answer = answerMatch ? answerMatch[1].trim() : text; // Fallback to full text if tags missing

    const questionsMatch = text.match(/\[QUESTIONS\]([\s\S]*?)\[\/QUESTIONS\]/);
    const questionsRaw = questionsMatch ? questionsMatch[1].trim() : "";
    const related_questions = questionsRaw.split('\n').map(q => q.trim()).filter(q => q.length > 5);

    const jsonResponse = {
      answer: answer,
      related_questions: related_questions,
      intent: "legal_advice"
    };

    res.json(jsonResponse);

  } catch (err) {
    console.error("❌ CRITICAL AI ERROR (/assistant):", err);

    // Check for specific Gemini errors
    let errorMessage = "Our legal AI is currently overwhelmed. Please try again in 10 seconds.";
    if (err.message.includes("400")) errorMessage = "Invalid request format.";
    if (err.message.includes("429")) errorMessage = "AI Rate limit exceeded. Please wait a moment.";

    res.status(500).json({
      answer: `**System Error**: ${errorMessage}\n\n*Technical Details: ${err.message}*`,
      error: err.message,
      related_questions: [],
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
/* ---------------- CASE ANALYSIS (Legal Issue) ---------------- */
router.post("/case-analysis", verifyTokenOptional, checkAiLimit, async (req, res) => {
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
/* ---------------- LEGAL NOTICE GENERATOR ---------------- */
router.post("/draft-notice", verifyTokenOptional, checkAiLimit, async (req, res) => {
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
/* ---------------- JUDGE AI (CASE PREDICTOR) ---------------- */
router.post("/predict-outcome", verifyTokenOptional, checkAiLimit, async (req, res) => {
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
        "case_id": "IND-SC-2024-XXXX", (Generate a realistic case reference ID)
        "win_probability": "75%",
        "risk_score": 8, (1-10 scale, 10 is verified risky)
        "risk_level": "High/Medium/Low",
        "risk_analysis": ["Risk 1", "Risk 2", "Risk 3"],
        "strategy": ["Move 1", "Move 2", "Move 3"],
        "estimated_duration": "14-18 months",
        "relevant_precedent": "State vs. XYZ (2018)",
        "precedent_count": 12 (Number of similar past cases found in your database)
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

/* ---------------- MOOT COURT (AI JUDGE) ---------------- */
router.post("/moot-court", verifyTokenOptional, checkAiLimit, async (req, res) => {
  try {
    const { transcript, caseContext } = req.body;
    if (!transcript) return res.status(400).json({ error: "Transcript required." });

    const prompt = `
      ACT AS A SUPREME COURT JUDGE AND LEGAL MENTOR.
      
      CONTEXT:
      The user is a law student arguing a case in a Moot Court.
      Case Context: "${caseContext || "General Legal Argument"}"
      
      STUDENT ARGUMENT:
      "${transcript}"
      
      TASK:
      Analyze the argument for:
      1. **Legal Accuracy**: Are they citing real laws correctly?
      2. **Logic & Flow**: Is the argument coherent?
      3. **Persuasion**: How convincing is it?
      
      OUTPUT JSON STRICTLY:
      {
        "score": 85, (0-100)
        "feedback": ["Point 1: Good citation of Article 21.", "Point 2: Weak connection between facts and law."],
        "judge_remarks": "Counsel, your point on Article 21 is noted, but you failed to address the exception in...",
        "emotional_tone": "Confident/Nervous/Aggressive"
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
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query required." });

    const prompt = `
      ACT AS A LEGAL RESEARCHER FOR THE SUPREME COURT OF INDIA.
      
      USER QUERY: "${query}"
      
      TASK:
      1. Identify the core legal issues.
      2. Find 3-5 RELEVANT Indian Supreme Court/High Court judgments.
      3. For each case, provide:
         - Case Name & Citation
         - Ratio Decidendi (The core legal principle)
         - Relevance to the user's query.
      
      OUTPUT JSON STRICTLY:
      {
        "summary": "The query involves...",
        "cases": [
          {
            "name": "Kesavananda Bharati v. State of Kerala",
            "citation": "(1973) 4 SCC 225",
            "ratio": "The Basic Structure of the Constitution cannot be amended.",
            "relevance": "Directly applies to your constitutional question."
          }
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
      ACT AS A SENIOR PARTNER AT A TOP LAW FIRM.
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
      ACT AS A LEGAL HISTORIAN AND ANALYST.
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
      ACT AS AN ELITE CRISIS LEGAL ADVISOR OF INDIA. A person is in a LEGAL EMERGENCY right now.

      EMERGENCY TYPE: "${emergencyType}"
      LANGUAGE FOR RESPONSE: ${language || "English"}
      DESCRIPTION: "${situation}"

      CRITICAL TASK:
      1. CLASSIFY the exact legal emergency in one short phrase (e.g. "Unlawful Arrest", "Cheating Under BNS").
      2. URGENCY: Assign "Critical", "High", or "Medium" urgency.
      3. RIGHTS: List 4-6 FUNDAMENTAL RIGHTS the person has RIGHT NOW. For each right:
         - title: Short name of the right
         - description: 1-2 sentence plain-language explanation (in ${language || "English"})
         - article: The specific Article/Section that guarantees it (e.g. "Article 22, Constitution of India")
      4. APPLICABLE_SECTIONS: List 3-5 relevant BNS/IPC/BNSS/CrPC sections as an array of strings.
      5. IMMEDIATE_ACTIONS: 4-5 step-by-step actions the person should take RIGHT NOW (numbered, plain language).

      OUTPUT STRICT JSON:
      {
        "classified_as": "...",
        "urgency": "Critical|High|Medium",
        "rights": [
          { "title": "...", "description": "...", "article": "..." }
        ],
        "applicable_sections": ["Section 41 CrPC", "Section 315 BNS"],
        "immediate_actions": ["Action 1", "Action 2"]
      }
    `;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const s = text.indexOf('{');
    const e = text.lastIndexOf('}');
    if (s !== -1 && e !== -1) text = text.substring(s, e + 1);
    res.json(JSON.parse(text));
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
      ACT AS A SENIOR POLICE OFFICER AND LEGAL DRAFTER IN INDIA.
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
    res.json({ draft });
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
    const PLAINTIFF_PERSONA = `You are Adv. Vikram Anand, a senior Supreme Court advocate known for aggressive, evidence-based prosecution. You represent the PLAINTIFF/PROSECUTION side. You cite specific Indian laws (BNS, IPC, BNSS, CPC) and real case precedents. You are sharp, persuasive, and relentless. Courtroom diction only.`;
    const DEFENSE_PERSONA = `You are Adv. Priya Rathore, a legendary defense lawyer known for dismantling prosecution arguments with surgical precision. You expertly exploit legal loopholes and protect constitutional rights. You cite specific Indian laws and case laws. You are brilliant, calm, and devastating in your rebuttals. Courtroom diction only.`;
    const JUDGE_PERSONA = `You are Hon. Justice Ramesh Krishnamurthy, a no-nonsense Supreme Court judge with 30 years of experience. You are neutral, deeply learned, and cut through weak arguments instantly. You ask piercing questions and give crisp judicial observations. You cite specific constitutional provisions. Courtroom diction only.`;

    const caseContext = `
      CASE TITLE: "${caseTitle || "The Instant Case"}"
      CASE TYPE: ${caseType || "General Civil/Criminal Matter"}
      PLAINTIFF SIDE: ${plaintiffSide || "As described in facts"}
      DEFENSE SIDE: ${defenseSide || "As described in facts"}
      FACTS OF THE CASE: "${caseDescription}"
    `;

    async function callAgent(persona, role, instruction, priorTranscript) {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: persona,
      });
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
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
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

    const verdictModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const verdictResult = await verdictModel.generateContent(verdictPrompt);
    let verdictText = verdictResult.response.text().trim();
    verdictText = verdictText.replace(/```json/g, "").replace(/```/g, "").trim();
    const vs = verdictText.indexOf('{');
    const ve = verdictText.lastIndexOf('}');
    const verdict = JSON.parse(verdictText.substring(vs, ve + 1));

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

module.exports = router;

