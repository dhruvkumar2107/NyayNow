const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
console.log("🚀 STARTING AI STRESS TEST...");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
console.log("✅ .env LOADED. API KEY PRESENT:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are 'NyayNow', an AI Legal Analysis Engine designed to assist with legal information in India. 
            
            YOUR MISSION: To provide bulletproof, citation-backed legal intelligence while strictly avoiding the "Unauthorized Practice of Law".

            LEGAL GROUNDING (2024 STANDARDS):
            - Primary Law: **Bharatiya Nyaya Sanhita (BNS)**, **BNSS**, and **BSA** (replacing IPC, CrPC, and IEA).
            - Always prioritize BNS 2024 over IPC 1860.
            - Grounded in the **Constitution of India**.

            ELITE RULES OF ENGAGEMENT:
            1. **FACT-GATING**: Before providing an opinion, you MUST extract and summarize the "Legal Facts" from the user's query.
            2. **CITATION-ONLY RULE**: You are FORBIDDEN from making a legal claim without a specific Section or Article citation.
            3. **BNS vs IPC CROSS-REF**: When citing a new BNS section, briefly mention its IPC equivalent (e.g., "Section 103 BNS (Formerly Sec 302 IPC)").
            4. **DISCLAIMER**: Remind user this is information, not a substitute for a lawyer.`;

async function testScenario(name, promptBody) {
    console.log(`\n🔥 STRESS TEST: ${name}`);
    console.log("-".repeat(50));
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });
        const result = await model.generateContent(promptBody);
        const text = result.response.text();
        console.log("✅ RESPONSE RECEIVED:");
        console.log(text);

        // Basic Validations
        const hasFacts = text.includes("[FACTS]") || text.toLowerCase().includes("legal facts");
        const hasBNS = text.includes("BNS") || text.includes("Bharatiya Nyaya Sanhita");
        const hasCitation = /Section \d+/i.test(text) || /Article \d+/i.test(text);

        console.log("\n🧪 VALIDATION RESULTS:");
        console.log(`- Fact Gating: ${hasFacts ? "PASS" : "FAIL"}`);
        console.log(`- BNS Alignment: ${hasBNS ? "PASS" : "FAIL"}`);
        console.log(`- Citations Found: ${hasCitation ? "PASS" : "FAIL"}`);

    } catch (e) {
        console.error(`❌ TEST FAILED: ${e.message}`);
    }
}

async function runAllTests() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY in .env");
        return;
    }

    // SCENARIO 1: THEFT (TEST BNS 2024)
    await testScenario("THEFT & BNS MIGRATION", `
        "Someone stole my golden chain at the railway station yesterday. What can I do?"
        
        REQUIRED FORMAT:
        [FACTS]
        ...
        [/FACTS]
        [ANSWER]
        ...
        [/ANSWER]
    `);

    // SCENARIO 2: ARREST (TEST SOS GUARDRAILS)
    await testScenario("EMERGENCY SOS - ARREST", `
        "I am being arrested by two police officers in civilian clothes. I don't know why. HELP!"
        
        INSTRUCTIONS: Use the 'Elite Crisis Advisor' Persona.
    `);

    // SCENARIO 3: DEVIL'S ADVOCATE (RUTHLESSNESS)
    await testScenario("DEVIL'S ADVOCATE - REBUTTAL", `
        "My client hit the victim because of sudden provocation. It's self-defense."
        
        INSTRUCTIONS: Act as a Ruthless Prosecutor. Dismantle this using BNS Citations.
    `);
}

runAllTests();
