const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ---------------- GET LAWYERS (PAGINATED & FILTERED) ---------------- */
/* ---------------- GET LAWYERS (PAGINATED & FILTERED) ---------------- */
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const city = req.query.city || "";
        const state = req.query.state || ""; // NEW
        const category = req.query.category || "";

        // Debug Log
        console.log(`🔎 SEARCH: "${search}", CITY: "${city}", STATE: "${state}", CAT: "${category}"`);

        const query = { role: "lawyer" };

        // SEARCH: Name or Specialization
        if (search) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { specialization: { $regex: search.trim(), $options: "i" } }
            ];
        }

        // FILTER: City
        if (city) {
            query["location.city"] = { $regex: city.trim(), $options: "i" };
        }

        // FILTER: State
        if (state) {
            query["location.state"] = { $regex: state.trim(), $options: "i" };
        }

        // FILTER: Category (Specialization)
        if (category) {
            query.specialization = { $regex: category, $options: "i" };
        }

        // PLAN PRIORITY (Diamond > Gold > Silver > Free)
        // Since 'plan' is a string, we can't sort by it directly in Mongo without an aggregate or helper field.
        // For MVP Excellence: We will fetch slightly more records and sort in memory, 
        // OR better: use aggregate to add a sort weight.

        // Let's use Aggregate for "Excellent" Sorting
        const pipeline = [
            { $match: query },
            {
                $addFields: {
                    planWeight: {
                        $switch: {
                            branches: [
                                { case: { $eq: [{ $toLower: "$plan" }, "diamond"] }, then: 3 },
                                { case: { $eq: [{ $toLower: "$plan" }, "gold"] }, then: 2 },
                                { case: { $eq: [{ $toLower: "$plan" }, "silver"] }, then: 1 }
                            ],
                            default: 0
                        }
                    }
                }
            },
            { $sort: { planWeight: -1, verified: -1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { password: 0, planWeight: 0, otp: 0 } } // Clean up
        ];

        const lawyers = await User.aggregate(pipeline);
        const total = await User.countDocuments(query);

        res.json({
            lawyers,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalLawyers: total
        });
    } catch (err) {
        console.error("Error fetching lawyers:", err.message);
        res.status(500).json({ error: "Failed to fetch lawyers" });
    }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

/* ---------------- VERIFY ID (OCR) ---------------- */
router.post("/verify-id", async (req, res) => {
    try {
        const { userId, imageUrl } = req.body;
        if (!userId || !imageUrl) return res.status(400).json({ error: "Missing data" });

        // 1. Fetch Image
        let imageBuffer;
        if (imageUrl.startsWith("http")) {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            imageBuffer = Buffer.from(response.data);
        } else {
            // Local file (fallback)
            const fs = require("fs");
            const path = require("path");
            try {
                // Remove leading slash if present for local path join
                const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
                const fullPath = path.join(__dirname, "..", relativePath);
                imageBuffer = fs.readFileSync(fullPath);
            } catch (e) {
                console.error("Local file read error:", e);
                return res.status(400).json({ error: "Could not read image file" });
            }
        }

        // 2. Prepare Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "This is an image of a Lawyer's Bar Council ID Card. Analyze it. 1. Is this a valid Indian Bar Council ID? 2. Extract the Name. 3. Return JSON: { valid: boolean, name: string, reason: string }";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg", // Assuming JPEG/PNG
                },
            },
        ]);

        const responseText = await result.response.text();
        console.log("Raw Gemini OCR Response:", responseText);

        // 3. Parse JSON
        let text = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }

        const data = JSON.parse(text);

        // 4. Update User
        if (data.valid) {
            await User.findByIdAndUpdate(userId, { verified: true });
        }

        res.json(data);

    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Verification process failed" });
    }
});

module.exports = router;
