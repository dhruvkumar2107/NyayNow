const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateWithFallback, DEFAULT_SYSTEM_PROMPT: SYSTEM_PROMPT } = require("../utils/aiUtils");
const aiAudit = require("../middleware/aiAudit");
const axios = require("axios");

const router = express.Router();
router.use(aiAudit); // Apply auditing to all AI routes
const multer = require("multer");
const pdf = require("pdf-parse");
const upload = multer({ storage: multer.memoryStorage() });
const verifyToken = require("../middleware/authMiddleware");
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const checkFeatureAccess = require("../middleware/checkFeatureAccess");

// Helper to sanitize user input to prevent prompt injection
function sanitizeUserInput(text) {
  if (typeof text !== 'string') return '';
  return text
    // Strip our own structural tags (XML-style)
    .replace(/\[\/?(FACTS|ANSWER|QUESTIONS|MARKER|USER_QUERY|SYSTEM_INSTRUCTION)\]/gi, "")
    .replace(/<\/?(USER_QUERY|SYSTEM_INSTRUCTION|CASE_CONTEXT|NOTICE_DETAILS|PROMPT|AGREEMENT_TEXT|CASE_FACTS)>/gi, "")
    // Block common jailbreak / role-override patterns
    .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi, "[filtered]")
    .replace(/you\s+are\s+now\s+(a\s+)?(?!NyayNow)/gi, "[filtered] ")
    .replace(/act\s+as\s+(an?\s+)?(?!(advocate|lawyer|judge|researcher|legal))/gi, "[filtered] ")
    .replace(/system\s*:\s*/gi, "[filtered]: ")
    .replace(/\bDAN\b|\bjailbreak\b|\bDO\s+ANYTHING\s+NOW\b/gi, "[filtered]")
    // Strip null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

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
router.post("/assistant", verifyTokenOptional, checkFeatureAccess("assistant"), async (req, res) => {
  try {
    const { question, history, language, location, caseContext } = req.body;

    // Construct History Context
    const conversationHistory = history ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") : "";

    // 1. Fetch live legal context from Indian Kanoon if Key is configured (RAG)
    let ikContext = "";
    if (process.env.INDIANKANOON_API_KEY && question && question.length > 10) {
      try {
        console.log("📡 Indian Kanoon: Fetching matching contexts for Assistant:", question.substring(0, 50));
        const ikResponse = await axios.get(`https://api.indiankanoon.org/search?formInput=${encodeURIComponent(question)}&pagenum=1`, {
          headers: {
            'Authorization': `Token ${process.env.INDIANKANOON_API_KEY}`
          }
        });

        if (ikResponse.data && Array.isArray(ikResponse.data.results) && ikResponse.data.results.length > 0) {
          ikContext = ikResponse.data.results.slice(0, 2).map(r => 
            `Title: ${r.title.replace(/<[^>]*>/g, "")}\nCourt/Source: ${r.docSource || "Indian Court"}\nFactual Snippet: ${r.headline ? r.headline.replace(/<[^>]*>/g, "").trim() : "N/A"}\nLink: https://indiankanoon.org/doc/${r.tid}`
          ).join("\n\n");
          console.log("✅ Indian Kanoon: Injected context into Assistant.");
        }
      } catch (ikErr) {
        console.error("❌ Indian Kanoon API Error in Assistant:", ikErr.message);
      }
    }

    const prompt = `
      CURRENT DATE: ${new Date().toISOString()}
      RANDOM SEED: ${Math.random()}
      
      ACT AS THE NYAYNOW AI LEGAL ANALYSIS ENGINE.
      
      YOUR PERSONA:
      - You are a highly advanced legal intelligence system programmed with Indian Law (BNS 2024).
      - Your tone is **Analytical, Precise, and Neutral**.
      - You provide legal information by citing specific Sections, Articles, and Case Laws.
      - You clarify that you are a machine learning model, not a human lawyer.
      
      CRITICAL INSTRUCTION: You HAVE access to Google Search Grounding. You MUST search the live internet to find REAL judgments, law books, SCC/Manupatra citations, and current legal precedents. 
      For EVERY legal response, you MUST:
      1. Reference specific sections from statutory law books (e.g., Bharatiya Nyaya Sanhita (BNS 2024), BNSS, BSA, Indian Penal Code (IPC), CPC, or CrPC).
      2. Reference at least 1-2 real relevant judgments/case laws from the Supreme Court of India or Indian High Courts.
      3. For any case cited, explicitly return the official citation (SCC/AIR/SCR/Manupatra) alongside the Indian Kanoon Link so the user can read the real judgment.
      4. DO NOT hallucinate case laws.
      
      ${ikContext ? `
      LIVE DATABASE CONTEXT FROM INDIAN KANOON FOR THIS QUERY:
      <KANOON_DB_RECORDS>
      ${ikContext}
      </KANOON_DB_RECORDS>
      Incorporate these actual case facts and document references into your legal analysis.
      ` : ""}
      
      USER CONTEXT:
      Location: ${location || "India"}
      Language: ${language || "English"}
      Active Case Context: ${caseContext ? JSON.stringify(caseContext) : "No active case context provided."}
      
      PREVIOUS CHAT SUMMARY:
      ${conversationHistory ? conversationHistory.substring(0, 500) : "None"} ...
      
      CURRENT USER QUERY:
      <USER_QUERY>
      ${sanitizeUserInput(question)}
      </USER_QUERY>
      
      INSTRUCTIONS:
      1. **FACT-GATING**: Begin by summarizing the core legal facts of the user's situation.
      2. **IDENTIFY INTENT**: 
         - If technical (Login/Pricing), answer as "NyayNow Support".
         - If legal, proceed as a Senior Supreme Court Advocate.
      3. **LEGAL ANALYSIS & REFERENCE**: Analyze under the latest Indian laws (BNS, BNSS, BSA). Cite specific Sections. Always reference real judgments and citations with Indian Kanoon links.
      4. **CROSS-REFERENCE**: Mention IPC equivalents for BNS sections helpfully.
      5. **STRATEGY**: Provide actionable next steps (FIR, Writ, Notice).
      6. **DISCLAIMER**: Remind the user this is information, not a substitute for a physical lawyer.
      7. **LANGUAGE**: You MUST output the entire response (FACTS, ANSWER, QUESTIONS, disclaimers) in the requested language: ${language || "English"}.
      
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

    // 💡 LIVE GROUNDING ENABLED: requireGrounding = true
    const result = await generateWithFallback(prompt, undefined, true);
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
      intent: "legal_information",
      disclaimer: "NyayNow AI provides legal information grounded in BNS (2024) and Indian laws. This is not a substitute for professional legal advice from a registered lawyer."
    };

    res.json(jsonResponse);

  } catch (err) {
    console.error("❌ CRITICAL AI ERROR (/assistant):", err);

    res.status(500).json({ error: "AI Service Unavailable", details: err.message });
  }
});

/* ---------------- AGREEMENT ANALYSIS ---------------- */
/* ---------------- AGREEMENT ANALYSIS ---------------- */
router.post("/agreement", verifyTokenOptional, checkFeatureAccess("agreement"), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const prompt = `
      Analyze this legal agreement text:
      <AGREEMENT_TEXT>
      ${sanitizeUserInput(text.substring(0, 15000))}
      </AGREEMENT_TEXT>
      
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

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    const rawText = response.text();
    const analysisData = safeJsonParse(rawText, "Agreement Analysis");

    // PAYWALL LOGIC (Safe for guests and free users)
    if (!req.user || req.user.plan === 'free') {
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
router.post("/analyze-agreement-pdf", verifyTokenOptional, checkFeatureAccess("analyze-agreement-pdf"), upload.single("file"), async (req, res) => {
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
      <AGREEMENT_TEXT>
      ${sanitizeUserInput(truncatedText)}
      </AGREEMENT_TEXT>
      
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

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    const rawText = response.text();
    const analysisData = safeJsonParse(rawText, "Agreement PDF Analysis");

    if (!req.user || req.user.plan === 'free') {
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
router.post("/case-analysis", verifyTokenOptional, checkFeatureAccess("case-analysis"), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const prompt = `
      ACT AS A LEGAL INTELLIGENCE AGENT (INDIA).
      
      TASK: Analyze the following legal issue and provide a strategic analysis.
      
      LEGAL STANDARDS:
      - Use BNS 2023/2024 and BNSS 2023/2024 for all modern criminal issues.
      - Cite at least 2 relevant Supreme Court precedents from the last 5 years. For any case cited, explicitly return the Indian Kanoon Link alongside the SCC/Manupatra citation so the user can read the real judgement for free.
      
      ISSUE:
      "${text.substring(0, 5000)}"
      
      OUTPUT STRUCTURE (JSON ONLY):
      {
        "analysis": "Professional legal analysis",
        "applicable_laws": ["Section X of BNS", "Article Y"],
        "precedents": ["Case Name (Year) - Ratio Decidendi"],
        "strategy": "Step-by-step litigation/defense strategy",
        "confidence_score": 92,
        "source_verification": "Grounded in SCC/Manupatra Live Data"
      }
    `;

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    const rawText = response.text();
    const json = safeJsonParse(rawText, "Case Analysis");
    res.json(json);

  } catch (err) {
    console.error("Gemini Case Analysis Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case", details: err.message });
  }
});


/* ---------------- LEGAL NOTICE GENERATOR ---------------- */
router.post("/draft-notice", verifyTokenOptional, checkFeatureAccess("draft-notice"), async (req, res) => {
  try {
    const { notice_details, language, type, senderName, recipientName, facts, amount, complianceDays } = req.body;
    
    // Support both old and new form structures
    const details = notice_details || facts || "No details provided";
    const lang = language || "English";
    const noticeType = type || req.body.noticeType || "General Legal Notice";

    const prompt = `
      ACT AS A SENIOR SUPREME COURT ADVOCATE (INDIA).
      Draft a formal "${noticeType}" based on the following facts.
      
      LAW STANDARDS: Use BNS 2024, BNSS 2024, and relevant Civil Procedure if applicable.
      LANGUAGE: ${lang}
      
      FACTS/DETAILS:
      "${details}"
      
      SENDER: ${senderName || "[Sender Name]"}
      RECIPIENT: ${recipientName || "[Recipient Name]"}
      DEMAND AMOUNT: ₹${amount || "0"}
      COMPLIANCE PERIOD: ${complianceDays || "15"} Days
      
      FORMAT:
      - Ref No / Date
      - Registered AD / Speed Post
      - To [Recipient Name/Address Placeholder]
      - Subject: Legal Notice regarding ${noticeType}
      - Body: Professional legal draft starting with "Under instructions from my client..."
      - Legal Sections: Cite specific BNS/BNSS/IPC/CPC sections.
      - Consequences of failure (Legal action warning)
      - Advocate Signature Placeholder
      
      Output ONLY the draft text in Markdown.
    `;

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    const text = response.text();
    
    // Return both 'notice' (for new UI) and 'draft' (for legacy)
    res.json({ notice: text, draft: text });

  } catch (err) {
    console.error("Gemini Notice Error:", err.message);
    res.status(500).json({ error: "Failed to draft notice", details: err.message });
  }
});

/* ---------------- JUDGE AI (CASE PREDICTOR) ---------------- */
router.post("/predict-outcome", verifyToken, checkFeatureAccess("predict-outcome"), async (req, res) => {
  try {
    const { caseTitle, caseDescription, caseType, oppositionDetails, assignedJudge } = req.body;
    console.log(`📑 /predict-outcome requested for: ${caseTitle || "Unnamed Case"}`);

    const user = req.user; // checkFeatureAccess already fetches and attaches this
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isPremium = ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan?.toLowerCase());
    if (!isPremium) {
      return res.status(403).json({
        error: "Case outcome prediction is a paid premium feature. Please upgrade to Pro/Firm!",
        code: "PREMIUM_REQUIRED"
      });
    }

    // 1. Query Indian Kanoon database for similar cases to ground the prediction
    let ikPrecedentsContext = "";
    let precedentCount = 0;
    if (process.env.INDIANKANOON_API_KEY && (caseDescription || caseTitle)) {
      try {
        const searchQuery = `${caseTitle || ""} ${caseDescription || ""}`.substring(0, 100).trim();
        console.log("📡 Indian Kanoon: Fetching precedents for Judge AI outcome prediction:", searchQuery);
        const ikResponse = await axios.get(`https://api.indiankanoon.org/search?formInput=${encodeURIComponent(searchQuery)}&pagenum=1`, {
          headers: {
            'Authorization': `Token ${process.env.INDIANKANOON_API_KEY}`
          }
        });

        if (ikResponse.data && Array.isArray(ikResponse.data.results) && ikResponse.data.results.length > 0) {
          const results = ikResponse.data.results;
          precedentCount = results.length;
          ikPrecedentsContext = results.slice(0, 3).map(r => 
            `Title: ${r.title.replace(/<[^>]*>/g, "")}\nSource: ${r.docSource || "Indian Kanoon"}\nExcerpt: ${r.headline ? r.headline.replace(/<[^>]*>/g, "").trim() : "N/A"}\nLink: https://indiankanoon.org/doc/${r.tid}`
          ).join("\n\n");
          console.log(`✅ Indian Kanoon: Injected ${results.slice(0,3).length} real precedents into Judge AI.`);
        }
      } catch (ikErr) {
        console.error("❌ Indian Kanoon API Error in Judge AI:", ikErr.message);
      }
    }

    const prompt = `
      ACT AS A JUDICIAL PREDICTOR (INDIA).
      
      TASK: Predict the outcome of the following case based on real-time court data, statutes, and precedents.
      
      GROUNDING RULES:
      - Search for similar cases in Supreme/High Courts (2020-2024).
      - Explicitly return the Indian Kanoon Link alongside any SCC citation to support prediction based on previous similar cases.
      - Apply BNS 2024 if applicable. Cite specific sections.
      
      ${ikPrecedentsContext ? `
      OFFICIAL INDIAN KANOON PRECEDENTS FOUND FOR THIS SITUATION:
      <KANOON_DATABASE_RECORDS>
      ${ikPrecedentsContext}
      </KANOON_DATABASE_RECORDS>
      Analyze the outcome of this case based on the holdings of the real precedents above.
      ` : ""}
      
      CASE TITLE: "${caseTitle}"
      CASE DETAILS: "${caseDescription}"
      ASSIGNED JUDGE: ${assignedJudge || "Not Specified"}
      
      REQUIRED OUTPUT STRUCTURE (JSON ONLY):
      {
        "case_id": "REF-XXXX",
        "win_probability": 75,
        "risk_level": "Medium",
        "precedent_count": ${precedentCount || 12},
        "strategy": ["Step 1...", "Step 2..."],
        "risk_analysis": ["Risk 1...", "Risk 2..."],
        "relevant_precedent": "State vs. X (2023) - Ratio...",
        "confidence_percentage": 88
      }
    `;

    // 💡 LIVE GROUNDING ENABLED: requireGrounding = true
    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    let text = response.text();

    const parsed = safeJsonParse(text, "Predict Outcome");
    
    // Ensure case_id is present
    if (!parsed.case_id || parsed.case_id === "REF-XXXX") {
        parsed.case_id = `NYAY-${Math.floor(Math.random() * 100000)}`;
    }

    // Save prediction history
    const CasePrediction = require("../models/CasePrediction");
    const predictionRecord = new CasePrediction({
      user: req.userId,
      caseTitle: caseTitle || "Unnamed Case",
      caseDescription: caseDescription || "",
      winProbability: parsed.win_probability || 0,
      riskLevel: parsed.risk_level || "Low",
      precedentCount: parsed.precedent_count || 0,
      strategy: parsed.strategy || [],
      riskAnalysis: parsed.risk_analysis || [],
      relevantPrecedent: parsed.relevant_precedent || "",
      confidencePercentage: parsed.confidence_percentage || 0
    });
    await predictionRecord.save();

    res.json(parsed);

  } catch (err) {
    console.error("Judge AI Error:", err.message);
    res.status(500).json({ error: "Failed to predict outcome. Try again.", details: err.message });
  }
});

// GET /api/ai/prediction-history
router.get("/prediction-history", verifyToken, async (req, res) => {
  try {
    const CasePrediction = require("../models/CasePrediction");
    const history = await CasePrediction.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Fetch Prediction History Error:", err);
    res.status(500).json({ error: "Failed to fetch prediction history" });
  }
});

/* ---------------- CONTRACT DRAFTING (TurboAgreements v2) ---------------- */

// Deep, specialized system prompts per document category
function getDraftingSystemPrompt(type, fields, state, language) {
  const lang = language === 'Hindi' ? 'Hindi (Devanagari script)' : 'formal Indian English';
  const jurisdiction = state ? `${state}, India` : 'India';

  const baseInstruction = `
You are India's most precise AI legal drafting engine, trained on the full corpus of Indian contract law, Transfer of Property Act 1882, Indian Contract Act 1872, Specific Relief Act, Registration Act, Labour Laws, Family Laws, and the new BNS 2024 criminal code.

CRITICAL RULES:
1. Draft in ${lang}.
2. Jurisdiction: ${jurisdiction}. Reference the correct state's Stamp Act duty rates where applicable.
3. Use ONLY proper legal terminology (Whereas, Now Therefore, In Witness Whereof, etc.).
4. Include all mandatory legal clauses: effective date, termination, dispute resolution (Arbitration under Arbitration and Conciliation Act 1996), governing law (Indian law), notices clause, entire agreement clause.
5. Format in clean professional Markdown:
   - # for the Document Title (centered, ALL CAPS)
   - ## for major section headings
   - **Bold** for defined terms and party names
   - Numbered lists for clauses (1., 1.1, 1.2, etc.)
   - Horizontal rules (---) to separate major sections
6. End with a proper SIGNATURE BLOCK with spaces for: Name, Signature, Date, Witness 1, Witness 2, Notary (if applicable).
7. Do NOT add any preamble, explanation, or markdown code fences. Output ONLY the formatted legal document.
`;

  // Category-specific deep instructions
  const categoryPrompts = {
    // PROPERTY
    'Rental / Lease Agreement (Residential)': `
Draft a Residential Rental Agreement compliant with the Model Tenancy Act 2021 and relevant state Rent Control Act.
Include: Description of Premises with full address, Monthly Rent amount, Security Deposit (typically 2-3 months), Payment Due Date, Maintenance responsibilities split, Permitted Use, Lock-in Period, Notice Period (minimum 30 days), Subletting prohibition, Pet policy, Alteration/renovation restrictions, List of fixtures provided, Utility responsibility, Entry/inspection rights of landlord, Eviction process per law, Stamp duty notice.`,

    'Rental / Lease Agreement (Commercial)': `
Draft a Commercial Lease Agreement under Transfer of Property Act 1882.
Include: Detailed property description, Carpet area / Built-up area distinction, Monthly rent and annual escalation % (CAM charges if applicable), Security deposit (6-12 months), Fit-out period (rent-free period), Permitted business activity, Signage rights, Parking allocation, CAM charges structure, Restoration obligation at exit, Force Majeure clause, Assignment/Subletting with landlord consent clause, Lock-in clause with penalty, Exit ramp provisions.`,

    'Leave & License Agreement': `
Draft a Leave and License Agreement (NOT a lease) under Section 52 of the Indian Easements Act 1882.
This is critical: explicitly state this is a Leave and License and NOT a lease to prevent tenancy rights.
Include: Licensor grants revocable license only, No tenancy rights created, Monthly license fee (not rent), Refundable security deposit, Specific permitted use, Duration not exceeding 11 months (to avoid registration), Licensor's absolute right to revoke, Licensee's obligation to vacate on termination.`,

    'Sale Deed': `
Draft a Sale Deed for immovable property under Transfer of Property Act 1882 and Registration Act 1908.
Include: Full property description with Survey/Plot number, boundaries (North/South/East/West), Schedule of Property in detail, Sale consideration amount (in figures AND words), Payment schedule and mode, Receipts of advance payment, Encumbrance certificate confirmation, Title guarantee clause, Vacant possession delivery, List of original title documents to be handed over, Seller's indemnity against prior claims, Buyer's right to register, Stamp duty and registration charges responsibility, Completion of sale formalities.`,

    'Agreement to Sell': `
Draft an Agreement to Sell (agreement for sale, not actual conveyance) under Section 54 of Transfer of Property Act.
Include: Description of property, Agreed sale price, Earnest money/advance paid, Balance payment schedule, Timeline for execution of final Sale Deed, Conditions precedent (clear title, NOCs, approvals), Default and forfeiture clauses for both parties, Time is of essence clause, Penalty for delay, Right to specific performance under Specific Relief Act 1963.`,

    'Gift Deed': `
Draft a Gift Deed under Section 122 of Transfer of Property Act 1882. Gift must be made voluntarily without consideration.
Include: Donor and donee relationship declaration, Description of gifted property, Statement that gift is voluntary and without consideration, Declaration of love and affection (family gifts) or charitable purpose, Acceptance by donee, Delivery of possession, Donor's power to revoke (if any, as gifts are generally irrevocable), Tax implications note (no capital gains between relatives under Income Tax Act).`,

    'Mortgage Deed': `
Draft a Simple Mortgage Deed under Section 58 of Transfer of Property Act 1882.
Include: Mortgagor and mortgagee details, Principal loan amount, Rate of interest (per annum), Repayment schedule (EMIs if applicable), Description of mortgaged property, Mortgagor's right to redeem, Mortgagee's right to sell on default (foreclosure), Covenant of title, Insurance obligation, Covenant not to encumber further.`,

    // BUSINESS
    'Non-Disclosure Agreement (NDA)': `
Draft a bilateral/mutual NDA under Indian Contract Act 1872.
Include: Definition of Confidential Information (very specific), Exclusions from confidentiality (public domain, independently developed, received from third party), Permitted disclosures (legal compulsion, with consent), Obligations of receiving party, Non-solicitation clause, Non-circumvention clause, Duration of confidentiality obligation (post-termination), Return/destruction of materials, Remedies for breach (injunctive relief under Section 39 Specific Relief Act), Liquidated damages clause, Dispute resolution via arbitration.`,

    'Partnership Deed': `
Draft a Partnership Deed under Indian Partnership Act 1932.
Include: Name and nature of the firm, Principal place of business, Duration of partnership, Capital contribution by each partner, Profit/loss sharing ratio, Interest on capital, Partner drawings/salary, Banking operations, Decision-making and voting rights, Admission/retirement/expulsion of partners, Death/insolvency of a partner, Goodwill valuation on dissolution, Non-compete during partnership, Accounts and audit, Dissolution and winding up procedure per Partnership Act.`,

    'Memorandum of Understanding (MOU)': `
Draft a non-binding MOU (or optionally binding in specific clauses).
Include: Statement of intent and purpose, Scope of collaboration, Roles and responsibilities of each party, Exclusivity (if any), Confidentiality provisions, Financial contributions (if any), Timeline and milestones, Dispute resolution (mediation first), Term and termination, Clear disclaimer that MOU does not create binding contract (or specify which clauses are binding), Governing law.`,

    'Shareholders Agreement': `
Draft a comprehensive Shareholders Agreement for a private limited company under Companies Act 2013.
Include: Share capital structure, Pre-emption rights (ROFR - Right of First Refusal), Anti-dilution provisions, Tag-along rights (minority protection), Drag-along rights (majority exit), Founder lock-up period, Board composition and voting, Reserved matters (decisions requiring unanimous consent), Dividend policy, Information rights, Representations and warranties of each shareholder, Exit provisions (IPO, M&A, buyback), Non-compete post-exit, Governing law.`,

    'Founders Agreement': `
Draft a Founders Agreement for a startup.
Include: Equity split and vesting schedule (typically 4-year vesting with 1-year cliff), Roles and responsibilities of each founder, IP assignment (all IP contributed/created belongs to company), Salary/compensation during bootstrapping phase, Decision-making (CEO authority vs. unanimous decisions), Founder departure (good leaver vs. bad leaver definitions), Non-compete during company tenure, Non-solicitation of co-founders and employees, Dissolution if startup fails.`,

    'Service Level Agreement (SLA)': `
Draft a Service Level Agreement under Indian Contract Act 1872.
Include: Scope of services (detailed technical specifications), Service levels (uptime %, response times, resolution times), Measurement methodology, Credits/penalties for SLA breach, Exclusions (force majeure, customer-caused issues), Escalation matrix, Reporting and monitoring, Change management process, Security and data protection (aligned with IT Act 2000), Limitation of liability cap, Termination for persistent breach.`,

    // EMPLOYMENT
    'Employment Contract': `
Draft an Employment Agreement compliant with Indian Labour Laws including Industrial Employment (Standing Orders) Act, Payment of Wages Act, Minimum Wages Act, Payment of Gratuity Act 1972, and Employees Provident Fund Act.
Include: Job title, designation, department, Reporting structure, Place of posting, Date of joining, CTC breakdown (basic, HRA, DA, allowances, PF employer contribution), Probation period (typically 3-6 months), Working hours per Factories Act/Shops Act, Leave policy (EL/PL/CL/SL per state rules), Confidentiality and IP assignment, Non-compete and non-solicitation (reasonable scope and duration), Termination (notice period both ways), ESOP/RSU (if applicable), Governing law and jurisdiction.`,

    'Appointment Letter': `
Draft a formal Appointment Letter (shorter than full contract) for an employee.
Include: Congratulatory opening, Designation and department, Date of joining, Location, Reporting manager, CTC and key components, Probation period and confirmation process, Reference to company's Employment Contract / HR policies for full terms, Acceptance signature section.`,

    'Termination Letter': `
Draft a Termination of Employment letter compliant with Industrial Disputes Act 1947.
Include: Date of termination (with statutory notice period fulfilled or PILON - Payment in lieu of notice), Reason for termination (clearly stated — misconduct / redundancy / performance / end of contract), Full and final settlement timeline (dues, gratuity if applicable, PF transfer), Return of company property, Non-disparagement clause, Reference letter offer, Confidentiality reminder post-termination.`,

    // FAMILY & PERSONAL
    'Will / Testament': `
Draft a legally valid Will under Indian Succession Act 1925 (for Hindus, also consider Hindu Succession Act 1956).
Include: Full name, address, age of testator, Declaration of sound mind and free will, Revocation of all previous wills, Specific bequests (property item by item with full description to each beneficiary), Residuary estate clause (for assets not specifically mentioned), Executor/Executrix appointment with powers, Guardian appointment for minor children (if applicable), Witness attestation by two independent adult witnesses (who are NOT beneficiaries), Date and place of execution.`,

    'Divorce Settlement (Mutual Consent)': `
Draft a Divorce Settlement Agreement for mutual consent divorce under Section 13B Hindu Marriage Act 1955 or Section 10A Indian Divorce Act 1869.
Include: Declaration of mutual consent, Statement of separation period (minimum 1 year), Division of matrimonial assets (property, bank accounts, investments), Alimony / maintenance amount and duration, Children's custody arrangement (primary/shared/visitation schedule), Child support amount and payment mechanism, Education and medical expenses for children, Handover of personal belongings, Non-harassment clause, No criminal complaints against each other, Agreement to appear before court for second motion.`,

    'Maintenance Agreement': `
Draft a Maintenance Agreement under Section 125 CrPC (now BNSS Section 144) or Section 24/25 Hindu Marriage Act.
Include: Amount of monthly maintenance, Payment date and mode, Duration of maintenance (temporary/permanent), Education and medical expenses, Provision for revision of maintenance (cost of living escalation), Events triggering stop of maintenance (remarriage, cohabitation), Mode of dispute resolution for revisions.`,

    // LEGAL NOTICES
    'Legal Notice (General)': `
Draft a formal Legal Notice under Indian Law.
Include: Sender's full name and address, Recipient's full name and address, Date, Subject line, Detailed statement of facts (chronological), Specific legal right violated or duty breached, Specific demand / relief sought, Time given to comply (typically 15-30 days), Consequences of non-compliance (legal proceedings), Sent via: Registered Post AD + Email, Advocate's name and bar enrollment number (if applicable).`,

    'Legal Notice — Cheque Bounce (NI Act 138)': `
Draft a Demand Notice under Section 138 of the Negotiable Instruments Act 1881 (mandatory prerequisite to criminal complaint).
CRITICAL: This notice MUST be sent within 30 days of receiving bank's dishonour memo.
Include: Cheque details (number, date, amount, bank), Date of presentation to bank, Date of dishonour, Reason for dishonour as per bank memo, Demand for payment of cheque amount plus interest within 15 days from receipt of notice, Clear statement that failure will result in criminal complaint under Section 138 NI Act (punishment: 2 years + fine up to 2x cheque amount), Mode of service (Registered Post AD + WhatsApp documented).`,

    'Legal Notice — Recovery of Money': `
Draft a Money Recovery Notice under Order XXXVII Code of Civil Procedure (Summary Suit provisions).
Include: Principal amount, Period of debt, Interest claimed (at agreed rate or 18% per annum as per commercial practice), Detailed transaction history, Previous attempts to recover (calls, emails), Demand for payment within 15 days, Threat of summary suit (recoverable within 30-60 days under Order XXXVII CPC) or SARFAESI proceedings if secured debt.`,

    'Legal Notice — Eviction': `
Draft an Eviction Notice to a tenant.
Include: Reference to rental agreement (date, property), Ground for eviction (expiry of term / non-payment / nuisance / subletting without consent / personal use of landlord), Amount of unpaid rent (if applicable), Time to vacate (15-30 days as per agreement or state Rent Control Act), Warning that overstaying will result in eviction suit and claim for mesne profits (double rent), Demand to return keys and restore property.`,

    'FIR Draft': `
Draft a First Information Report (FIR) complaint addressed to the Station House Officer (SHO) of the relevant police station.
Include: Complainant's full details, Date/Time/Place of the offense, Full narration of incident (who, what, when, where, how — chronologically), Names of accused (if known) / description if unknown, List of witnesses, Nature of offense and applicable BNS 2024 / IPC sections (list all relevant sections), Supporting evidence available (CCTV, screenshots, documents), Prayer: Register FIR and investigate, Signature and date.`,

    'Affidavit (General)': `
Draft a General Affidavit to be sworn before a Notary or First Class Magistrate.
Include: Deponent's full name, age, address, occupation, Relationship to case/matter, Numbered paragraphs of sworn facts, Statement that contents are true to best of knowledge and belief, Consequences of false affidavit (Section 191-193 BNS 2024 / IPC perjury), Deponent signature, Jurat (sworn before Notary/Magistrate, date, seal space).`,

    'Power of Attorney (General)': `
Draft a General Power of Attorney under Power of Attorney Act 1882.
Include: Principal and Agent (Attorney) full details, Scope of authority (very broad — all financial, legal, property matters), Duration (revocable at will or specific term), Authority to sign, receive, execute, bank, litigate, sell property, Sub-delegation rights, Indemnity to third parties acting in good faith, Revocation procedure, Attestation by two witnesses, Notarization.`,

    'Power of Attorney (Special/Limited)': `
Draft a Special Power of Attorney for a SPECIFIC, LIMITED purpose.
Include: Single specific task authorized (e.g., sell property at X address only, appear in court case Y only, operate specific bank account), Duration (expires upon completion of task), All other powers explicitly EXCLUDED, No sub-delegation right, Revocation upon task completion.`,

    // FINANCE
    'Loan Agreement': `
Draft a Loan Agreement under Indian Contract Act 1872.
Include: Principal amount (in figures and words), Purpose of loan, Disbursement schedule, Interest rate (per annum, compounded/simple), EMI schedule with amortization table format, Prepayment terms and charges, Default interest rate, Security / collateral provided, Events of default (missed payments, insolvency, fraud), Lender's remedies on default, Prohibition on further encumbrance, Representations of borrower (financial health, no existing defaults).`,

    'Promissory Note': `
Draft a Promissory Note under Section 4 of Negotiable Instruments Act 1881.
ESSENTIAL: Must be unconditional promise to pay.
Include: Date and place of execution, Promise to pay fixed sum, To whom payable (specific person or bearer), Interest rate, Date of repayment or on demand, Stamp duty compliance note (promissory notes require stamp duty), Maker's signature.`,

    // TECHNOLOGY & IP
    'Software Development Agreement': `
Draft a Software Development Agreement under Indian Contract Act 1872 and IT Act 2000.
Include: Scope of work (technical specifications as Schedule A), Project timeline with milestones, Payment terms (milestone-based), IP ownership (all developed code belongs to client upon full payment), Source code escrow (if applicable), Bug fix warranty period (typically 6-12 months post-delivery), Limitation of liability, Source code delivery obligation, Change request procedure, Acceptance testing process, Data security obligations (aligned with DPDP Act 2023).`,

    'Privacy Policy (DPDP Compliant)': `
Draft a Privacy Policy compliant with India's Digital Personal Data Protection Act 2023 (DPDP Act).
Include: Data Fiduciary identification, Categories of personal data collected, Purpose limitation (specific lawful purpose), Legal basis for processing (consent, legitimate interest), Data Principal's rights (access, correction, erasure, grievance), Children's data processing restrictions, Data retention periods, Cross-border data transfers, Security measures, Grievance Officer details (mandatory under DPDP), Contact details, Last updated date.`,

    'Freelance Service Agreement': `
Draft a Freelance/Consultant Service Agreement.
Include: Independent contractor status (NOT employee — explicitly stated to avoid PF/ESI applicability), Services description, Deliverables and timeline, Payment terms (milestone-based or retainer), Expense reimbursement policy, IP assignment (work product belongs to client), Confidentiality, Non-solicitation (no poaching of client's employees), Non-compete (limited scope and duration — reasonable under Indian Contract Act), Termination with 7-14 days notice, Governing law and arbitration.`,
  };

  // Get the specific prompt for this document type, or use a smart generic
  const specificPrompt = categoryPrompts[type] || `
Draft a comprehensive and legally valid **${type}** under Indian law.
Ensure all standard clauses are included: parties, recitals, definitions, main obligations, term, termination, confidentiality (if applicable), dispute resolution (arbitration under Arbitration and Conciliation Act 1996), governing law (Indian law and ${jurisdiction} courts), and signature block.
Make it legally thorough with all necessary sub-clauses and schedules.`;

  return baseInstruction + '\n\nDOCUMENT-SPECIFIC REQUIREMENTS:\n' + specificPrompt;
}

router.post("/draft-contract", verifyTokenOptional, checkFeatureAccess("draft-contract"), async (req, res) => {
  try {
    const { type, fields, state, language } = req.body;

    // Build a structured fields summary for the AI
    const fieldsSummary = fields && typeof fields === 'object'
      ? Object.entries(fields)
          .filter(([, v]) => v && String(v).trim())
          .map(([k, v]) => `- ${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${v}`)
          .join('\n')
      : String(fields || '');

    const systemPrompt = getDraftingSystemPrompt(type, fields, state, language);

    const prompt = `${systemPrompt}

---
DOCUMENT TYPE: ${type}
STATE/JURISDICTION: ${state || 'India (General)'}
OUTPUT LANGUAGE: ${language || 'English'}
DATE OF DRAFTING: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

SPECIFIC DETAILS PROVIDED BY USER:
${fieldsSummary}

Now draft the complete, professional, legally valid document. Start directly with the document title. Do not add any explanatory text before or after.`;

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    const contractText = response.text();

    res.json({ contract: contractText });

  } catch (err) {
    console.error("Gemini Drafting Error:", err.message);
    res.status(500).json({ error: "Failed to draft contract. Please try again." });
  }
});


/* ---------------- JUDGE AI PRO (PDF ANALYSIS) ---------------- */
router.post("/analyze-case-file", verifyTokenOptional, checkFeatureAccess("analyze-case-file"), upload.single("file"), async (req, res) => {
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
      4. **Relevant Case Law**: Cite 2-3 specific Indian Supreme Court/High Court precedents that apply. Explicitly return the Indian Kanoon Link alongside the SCC citation.
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
    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    let text = response.text();
    res.json(safeJsonParse(text, "Case File Analysis"));

  } catch (err) {
    console.error("Judge AI Pro Error:", err.message);
    res.status(500).json({ error: "Failed to analyze case file. Ensure it is a valid PDF." });
  }
});

/* ---------------- DEVIL'S ADVOCATE (AI REBUTTAL) ---------------- */
router.post("/devils-advocate", verifyTokenOptional, checkFeatureAccess("devils-advocate"), async (req, res) => {
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

    const result = await generateWithFallback(prompt, undefined, true);
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
router.post("/moot-court", verifyTokenOptional, checkFeatureAccess("moot-court"), async (req, res) => {
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

    const result = await generateWithFallback(prompt, undefined, true);
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
router.post("/legal-research", verifyTokenOptional, checkFeatureAccess("legal-research"), async (req, res) => {
  try {
    const { query, source, dateRange } = req.body;
    if (!query) return res.status(400).json({ error: "Query required." });

    // 1. If Indian Kanoon API Key is configured, attempt direct database search
    if (process.env.INDIANKANOON_API_KEY) {
      try {
        console.log("📡 Indian Kanoon: Fetching search results for:", query);
        const ikResponse = await axios.get(`https://api.indiankanoon.org/search?formInput=${encodeURIComponent(query)}&pagenum=1`, {
          headers: {
            'Authorization': `Token ${process.env.INDIANKANOON_API_KEY}`
          }
        });

        if (ikResponse.data && Array.isArray(ikResponse.data.results) && ikResponse.data.results.length > 0) {
          const results = ikResponse.data.results;
          const mappedCases = results.slice(0, 5).map(r => ({
            name: r.title.replace(/<[^>]*>/g, ""), // Clean any residual HTML tags
            citation: `${r.docSource || "Indian Kanoon"} (ID: ${r.tid})`,
            ratio: r.headline ? r.headline.replace(/<[^>]*>/g, "").trim() : "Review judgment text for decision holding.",
            relevance: 95
          }));

          return res.json({
            disclaimer: "Grounded directly in Indian Kanoon database records.",
            summary: `Retrieved ${mappedCases.length} relevant legal records directly from the Indian Kanoon index.`,
            confidence_score: 100,
            cases: mappedCases
          });
        }
        console.log("⚠️ Indian Kanoon: No direct database hits. Falling back to Gemini search.");
      } catch (ikErr) {
        console.error("❌ Indian Kanoon API Error:", ikErr.message, "- Falling back to Grounded AI.");
      }
    }

    // 2. Fallback to Google Search Grounding with Gemini if API is not set or failed
    const prompt = `
      ACT AS A LEGAL RESEARCHER FOR THE SUPREME COURT OF INDIA.
      
      USER QUERY: "${query}"
      RESEARCH SCOPE: ${source || "All Indian Courts"}
      DATE RANGE FILTER: ${dateRange || "All Time"}
      
      TASK:
      1. Identify core legal issues related to the query within the specified scope.
      2. Find 3-5 RELEVANT cases (Prioritize BNS 2024 context if applicable).
      3. For each case, provide:
         - Case Name & Citation (Explicitly include the Indian Kanoon Link alongside the SCC citation)
         - Ratio Decidendi
         - Relevance to the specified scope and date range.
      
      CRITICAL INSTRUCTION: DO NOT hallucinate. Do not create fake case names, simulated facts, or fictitious citations. 
      Every case returned MUST be a real historical precedent from the Supreme Court or High Courts of India.
      If you cannot find exact real cases matching the query, return an empty array for "cases" and explain this in the "summary" instead of generating mock judgments.
      
      OUTPUT JSON STRICTLY:
      {
        "disclaimer": "Legal research is based on live index of Indian case laws. Verify citations using official records.",
        "summary": "...",
        "confidence_score": 95,
        "cases": [
          { "name": "...", "citation": "...", "ratio": "...", "relevance": "..." }
        ]
      }
    `;

    // 💡 LIVE GROUNDING ENABLED: requireGrounding = true
    const result = await generateWithFallback(prompt, undefined, true);
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
router.post("/career-mentor", verifyTokenOptional, checkFeatureAccess("career-mentor"), async (req, res) => {
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

    const result = await generateWithFallback(prompt, undefined, true);
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
router.post("/judge-profile", verifyTokenOptional, checkFeatureAccess("judge-profile"), async (req, res) => {
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

    const result = await generateWithFallback(prompt, undefined, true);
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

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    let text = response.text();
    res.json(safeJsonParse(text, "Legal SOS"));
  } catch (err) {
    console.error("Legal SOS Error:", err.message);
    res.status(500).json({ error: "Emergency analysis failed. Please try again." });
  }
});

/* ---------------- FIR GENERATOR (EMERGENCY DRAFT) ---------------- */
router.post("/fir-generator", verifyTokenOptional, checkFeatureAccess("fir-generator"), async (req, res) => {
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

    const result = await generateWithFallback(prompt, undefined, true);
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
router.post("/courtroom-battle", verifyTokenOptional, checkFeatureAccess("courtroom-battle"), async (req, res) => {
  try {
    const { caseTitle, caseDescription, caseType, plaintiffSide, defenseSide } = req.body;
    if (!caseDescription) return res.status(400).json({ error: "Case description required" });

    // ── AI Personas ─────────────────────────────────────────────────────────
    const PLAINTIFF_PERSONA = `You are NyayNow AI Analysis Engine (Prosecution), a senior legal analysis agent known for aggressive, evidence-based prosecution. You represent the PLAINTIFF/PROSECUTION side. You cite specific Indian laws (BNS, IPC, BNSS, CPC) and real case precedents. You are sharp, persuasive, and relentless. Courtroom diction only.`;
    const DEFENSE_PERSONA = `You are NyayNow AI Analysis Engine (Defense), a legendary defense analysis agent known for dismantling prosecution arguments with surgical precision. You expertly exploit legal loopholes and protect constitutional rights. You cite specific Indian laws and case laws. You are brilliant, calm, and devastating in your rebuttals. Courtroom diction only.`;
    const JUDGE_PERSONA = `You are NyayNow AI Analysis Engine (Simulation Judge), a no-nonsense simulation judge with years of data-driven experience. You are neutral, deeply learned, and cut through weak arguments instantly. You ask piercing questions and give crisp judicial observations. You cite specific constitutional provisions. Courtroom diction only.`;

    const caseContext = `
      <CASE_CONTEXT>
      CASE TITLE: "${sanitizeUserInput(caseTitle || "The Instant Case")}"
      CASE TYPE: ${sanitizeUserInput(caseType || "General Civil/Criminal Matter")}
      PLAINTIFF SIDE: ${sanitizeUserInput(plaintiffSide || "As described in facts")}
      DEFENSE SIDE: ${sanitizeUserInput(defenseSide || "As described in facts")}
      FACTS OF THE CASE:
      <CASE_FACTS>
      ${sanitizeUserInput(caseDescription)}
      </CASE_FACTS>
      </CASE_CONTEXT>
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
      const result = await generateWithFallback(prompt, persona, true);
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

    const verdictResult = await generateWithFallback(verdictPrompt, JUDGE_PERSONA, true);
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

/* ────────────────────────────────────────────────────────
   INSTANT LEGAL NOTICE GENERATOR
   POST /api/ai/legal-notice
──────────────────────────────────────────────────────── */
router.post("/legal-notice", verifyToken, checkFeatureAccess("legal-notice"), async (req, res) => {
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
<NOTICE_DETAILS>
- Notice Type: ${sanitizeUserInput(noticeType)}
- Date: ${today}
- Sender (Advocate/Client): ${sanitizeUserInput(senderName)}
- Sender Address: ${sanitizeUserInput(senderAddress || "To be filled")}
- Bar Council ID: ${sanitizeUserInput(senderBarCouncil || "N/A")}
- Recipient: ${sanitizeUserInput(recipientName)}
- Recipient Address: ${sanitizeUserInput(recipientAddress || "To be filled")}
- Facts of the Matter: ${sanitizeUserInput(facts)}
${amount ? `- Amount in Dispute: ₹${sanitizeUserInput(String(amount))}` : ""}
- Compliance Period: ${complianceDays || 15} days
${additionalClauses ? `- Additional Clauses: ${sanitizeUserInput(additionalClauses)}` : ""}
</NOTICE_DETAILS>

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

    const result = await generateWithFallback(prompt, undefined, true);
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

/* ---------------- CASEBASE.LEXOPS.AI FEATURE REPLICATION ---------------- */

// Generate full case detail & FIRAC analysis
router.post("/case-detail", verifyTokenOptional, checkFeatureAccess("case-detail"), async (req, res) => {
  try {
    const { caseName, citation } = req.body;
    if (!caseName) return res.status(400).json({ error: "Case name is required." });

    let rawJudgmentText = "";
    let isIKSource = false;

    // Try parsing document ID from citation to retrieve from Indian Kanoon directly
    if (citation && process.env.INDIANKANOON_API_KEY) {
      const match = citation.match(/ID:\s*(\d+)/i);
      if (match) {
        const docId = match[1];
        try {
          console.log(`📡 Indian Kanoon: Fetching full text for document ID: ${docId}`);
          const ikDocResponse = await axios.get(`https://api.indiankanoon.org/doc/${docId}/`, {
            headers: {
              'Authorization': `Token ${process.env.INDIANKANOON_API_KEY}`
            }
          });
          if (ikDocResponse.data && ikDocResponse.data.doc) {
            // Strip HTML tags from the retrieved document text
            rawJudgmentText = ikDocResponse.data.doc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 15000);
            isIKSource = true;
            console.log("✅ Indian Kanoon: Full text successfully retrieved.");
          }
        } catch (docErr) {
          console.error("❌ Indian Kanoon Document Fetch Error:", docErr.message);
        }
      }
    }

    let prompt = "";
    if (isIKSource && rawJudgmentText) {
      // Prompt with full text context
      prompt = `
        ACT AS THE NYAYNOW CASE PRECENDENT ANALYTICS COMPILER.
        
        We have retrieved the official judgment text of this case from Indian Kanoon:
        Case Name: "${caseName}"
        Citation: "${citation}"
        
        JUDGMENT SOURCE CONTEXT:
        <JUDGMENT_TEXT>
        ${rawJudgmentText}
        </JUDGMENT_TEXT>
        
        TASK:
        1. Summarize the facts, issue, rule, analysis, and conclusion based STRICTLY on the real judgment text provided.
        2. Create a clean executive summary and judicial transcript.
        
        Provide the output strictly in the following JSON format:
        {
          "court": "e.g. Supreme Court of India or High Court of Delhi",
          "bench": "Names of judges on the bench",
          "date": "Date of judgment (e.g. August 24, 2017)",
          "citation": "Official citation",
          "caseName": "Official Case Name",
          "summary": "Short executive summary of the case",
          "firac": {
            "facts": "Detailed facts of the dispute, parties involved, and how the case reached this court.",
            "issue": "The primary legal questions and issues the court had to decide.",
            "rule": "Statutory rules, acts, constitutional provisions (e.g. Article 21, Section 300 IPC) and precedents applied.",
            "analysis": "The detailed judicial reasoning, arguments of both sides, and how the court interpreted the rules.",
            "conclusion": "The final holding, order, relief granted, and dissenting opinions if any."
          },
          "fullText": "A detailed legal transcript of the major judgment holdings and concluding court order in professional judicial language."
        }
        
        Output ONLY valid JSON. No markdown wrappers, no backticks, no text before or after the JSON.
      `;
    } else {
      // Grounding search fallback prompt
      prompt = `
        ACT AS THE NYAYNOW CASEBASE ANALYTICS COMPILER.
        
        Generate a highly detailed, professional legal profile and FIRAC analysis for this Indian court case:
        Case Name: "${caseName}"
        Citation: "${citation || "Supreme Court of India / High Court"}"
        
        CRITICAL INSTRUCTION: You MUST use Google Search Grounding to pull actual factual records, legal questions, applied rules, judicial reasoning, and concluding orders of this specific judgment. 
        DO NOT fabricate facts or holdings. Pull real details from the official case record.
        For the "fullText", provide a professional legal summary representing the official judgment recital.
        
        Provide the output strictly in the following JSON format:
        {
          "court": "e.g. Supreme Court of India or High Court of Delhi",
          "bench": "Names of judges on the bench",
          "date": "Date of judgment (e.g. August 24, 2017)",
          "citation": "Official citation",
          "caseName": "Official Case Name",
          "summary": "Short executive summary of the case",
          "firac": {
            "facts": "Detailed facts of the dispute, parties involved, and how the case reached this court.",
            "issue": "The primary legal questions and issues the court had to decide.",
            "rule": "Statutory rules, acts, constitutional provisions (e.g. Article 21, Section 300 IPC) and precedents applied.",
            "analysis": "The detailed judicial reasoning, arguments of both sides, and how the court interpreted the rules.",
            "conclusion": "The final holding, order, relief granted, and dissenting opinions if any."
          },
          "fullText": "A detailed legal transcript of the major judgment holdings and concluding court order in professional judicial language."
        }
        
        Output ONLY valid JSON. No markdown wrappers, no backticks, no text before or after the JSON.
      `;
    }

    const result = await generateWithFallback(prompt, undefined, true);
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
    console.error("Case Detail Error:", err.message);
    res.status(500).json({ error: "Failed to retrieve case details. Try again." });
  }
});

// Chat with the Case context
router.post("/chat-case", verifyTokenOptional, checkFeatureAccess("chat-case"), async (req, res) => {
  try {
    const { caseName, fullText, message, history } = req.body;
    if (!caseName || !message) return res.status(400).json({ error: "Case name and message required." });

    const chatHistory = history ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n") : "";

    const prompt = `
      ACT AS A LEGAL COMPLIANCE & CASE CLERK AGENT.
      You are an expert on the case: "${caseName}".
      
      Here is the case detail/judgment text context:
      <CASE_CONTEXT>
      ${fullText ? fullText.substring(0, 10000) : "Precedent judgment information"}
      </CASE_CONTEXT>
      
      PREVIOUS DISCUSSIONS:
      ${chatHistory}
      
      USER MESSAGE:
      "${message}"
      
      TASK: Answer the user's question regarding this case judgment. Cite specific parts of the judgment or FIRAC context. Do not hallucinate holdings. Keep your answer professional, concise, and informative.
    `;

    const result = await generateWithFallback(prompt, undefined, true);
    const response = await result.response;
    res.json({ answer: response.text() });
  } catch (err) {
    console.error("Chat Case Error:", err.message);
    res.status(500).json({ error: "Case chat failed." });
  }
});

module.exports = router;

