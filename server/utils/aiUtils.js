const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing_key");

const DEFAULT_SYSTEM_PROMPT = `You are 'NyayNow', an AI Legal Analysis Engine designed to provide legal information and structured intelligence in India.

YOUR MISSION: To provide objective, data-driven legal information while strictly avoiding the "Unauthorized Practice of Law" (UPL). You facilitate legal research and understanding, but you do not act as an attorney or provide legal representations.

LEGAL GROUNDING (2024 STANDARDS):
- Primary Law: **Bharatiya Nyaya Sanhita (BNS)**, **BNSS**, and **BSA** (replacing IPC, CrPC, and IEA).
- Always prioritize BNS 2024 over IPC 1860 unless the user specifically asks about an older case.
- Grounded in the **Constitution of India**.

ELITE RULES OF ENGAGEMENT:
1. **FACT-GATING**: Before providing an analysis, you MUST extract and summarize the "Legal Facts" from the user's query.
2. **CITATION-ONLY RULE**: You are FORBIDDEN from making a legal claim without a specific Section or Article citation (e.g., "Under Section 103 of BNS...").
3. **HALLUCINATION BLOCK**: If you are unsure of the specific section or law, you MUST state "A specific section reference is required here. Please consult a qualified legal professional for case-specific advice." rather than guessing.
4. **BNS vs IPC CROSS-REF**: When citing a new BNS section, briefly mention its IPC equivalent for clarity (e.g., "Section 103 BNS (Formerly Sec 302 IPC)").
5. **NEUTRALITY**: Avoid definitive judicial declarations like "You will win". Instead use "Statutory analysis suggests...".

TONE: Objective, Analytical, Precise, and Informational.`;

/**
 * Centrally managed AI generation with fallback logic.
 * @param {string} prompt - The user query or structured prompt.
 * @param {string} systemInstruction - Optional custom system instructions.
 * @param {boolean} requireGrounding - Enable Google Search Grounding for real-time live data.
 * @returns {Promise<any>} - The Gemini result object.
 */
async function generateWithFallback(prompt, systemInstruction = DEFAULT_SYSTEM_PROMPT, requireGrounding = false) {
    const modelsToTry = [
        "gemini-flash-latest", // Discovered alias
        "gemini-2.5-flash",    // Discovered bleeding edge
        "gemini-2.0-flash",    // Discovered bleeding edge
        "gemini-pro-latest"    // Discovered alias
    ];

    const errors = [];
    console.log(`🔍 generateWithFallback called. Prompt Length: ${prompt?.length || 0}. Instruction Length: ${systemInstruction?.length || 0}`);
    console.log(`🔍 Prompt Prefix: ${prompt?.substring(0, 100) || "none"}...`);

    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 Attempting GenAI with ${modelName}... (Grounding: ${requireGrounding})`);
            const modelConfig = {
                model: modelName,
                systemInstruction: systemInstruction
            };
            
            if (requireGrounding) {
                modelConfig.tools = [{ googleSearch: {} }];
            }
            
            const model = genAI.getGenerativeModel(modelConfig);

            const chatResult = await model.generateContent(prompt);
            const response = await chatResult.response;

            // Safety Check: Ensure we have candidates and a valid response
            if (response && response.candidates && response.candidates.length > 0) {
                // Peek at the text to ensure it doesn't throw
                try {
                    const text = response.text();
                    if (text) {
                        console.log(`✅ Success with ${modelName}`);
                        return chatResult;
                    }
                } catch (pe) {
                    console.error(`⚠️ Peek Error with ${modelName}:`, pe.message);
                }
            }
            throw new Error("Empty response or blocked by safety filters.");
        } catch (err) {
            console.error(`❌ Error with ${modelName}:`, err.message);
            errors.push(`${modelName}: ${err.message}`);

            // If it's the last model, throw consolidated error
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                throw new Error(`AI Service Unavailable: ${errors.join(" | ")}`);
            }
        }
    }
}

/**
 * Centrally managed AI generation for Vision/Multimodal.
 * @param {Array} parts - Array containing text and inlineData for images.
 * @returns {Promise<any>}
 */
async function generateMultimodalWithFallback(parts) {
    const modelsToTry = [
        "gemini-2.5-pro",
        "gemini-2.0-flash"
    ];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(parts);
            if (result && result.response) return result;
        } catch (err) {
            console.error(`Multimodal Error with ${modelName}:`, err.message);
            if (modelName === modelsToTry[modelsToTry.length - 1]) throw err;
        }
    }
}

module.exports = {
    generateWithFallback,
    generateMultimodalWithFallback,
    DEFAULT_SYSTEM_PROMPT
};
