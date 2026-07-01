const express = require("express");
const router = express.Router();
const { generateWithFallback } = require("../utils/aiUtils");
const axios = require("axios");

/**
 * @desc Translate text across Indian regional languages using Bhashini (with Gemini fallback)
 * @route POST /api/translate
 */
router.post("/", async (req, res) => {
    try {
        const { text, sourceLanguage = "English", targetLanguage = "Hindi" } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text to translate is required." });
        }

        // ── BHASHINI API INTEGRATION (IF CONFIGURED) ─────────────────────────
        const bhashiniKey = process.env.BHASHINI_API_KEY;
        const bhashiniUserId = process.env.BHASHINI_USER_ID;
        const bhashiniAppId = process.env.BHASHINI_APP_ID;

        if (bhashiniKey && bhashiniUserId && bhashiniAppId) {
            console.log("🔄 Calling MeitY Bhashini API...");
            try {
                // Map language names to ISO 639-1 language codes for Bhashini API
                const langCodes = {
                    "English": "en", "Hindi": "hi", "Tamil": "ta", "Telugu": "te",
                    "Kannada": "kn", "Marathi": "mr", "Bengali": "bn", "Gujarati": "gu",
                    "Malayalam": "ml", "Punjabi": "pa", "Odia": "or", "Urdu": "ur"
                };

                const srcCode = langCodes[sourceLanguage] || "en";
                const tgtCode = langCodes[targetLanguage] || "hi";

                // Bhashini Pipeline Service Request
                const payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "translation",
                            "config": {
                                "language": {
                                    "sourceLanguage": srcCode,
                                    "targetLanguage": tgtCode
                                }
                            }
                        }
                    ],
                    "inputData": {
                        "input": [
                            { "source": text }
                        ]
                    }
                };

                const bhashiniRes = await axios.post("https://dhruva.gov.in/services/inference/pipeline", payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "apiKey": bhashiniKey,
                        "userId": bhashiniUserId,
                        "appId": bhashiniAppId
                    },
                    timeout: 5000
                });

                const translated = bhashiniRes.data?.pipelineResponse?.[0]?.output?.[0]?.target;
                if (translated) {
                    return res.json({
                        translatedText: translated,
                        sourceLanguage,
                        targetLanguage,
                        provider: "Bhashini (Govt. India)"
                    });
                }
            } catch (err) {
                console.warn("⚠️ Bhashini API request failed. Falling back to Gemini model: ", err.message);
            }
        }

        // ── GEMINI TRANSLATION FALLBACK ─────────────────────────────────────
        console.log("🔄 Running Gemini translator engine...");
        const prompt = `
            You are a senior bilingual Indian legal advisor. 
            Translate the following legal text accurately from ${sourceLanguage} to ${targetLanguage}.
            Maintain the exact legal weight, terms, and context (e.g. "FIR", "bail", "eviction Notice").
            
            TEXT TO TRANSLATE:
            "${text}"
            
            OUTPUT ONLY THE TRANSLATED TEXT. NO INTRODUCTION, NO OUTRO, NO EXPLANATION.
        `;

        const result = await generateWithFallback(prompt, undefined, false);
        const response = await result.response;
        const translatedText = response.text().trim();

        res.json({
            translatedText,
            sourceLanguage,
            targetLanguage,
            provider: "Gemini Translate Core"
        });

    } catch (err) {
        console.error("Translation Error:", err);
        res.status(500).json({ error: "Failed to translate text. Service temporarily offline." });
    }
});

module.exports = router;
