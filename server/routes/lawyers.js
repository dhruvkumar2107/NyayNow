const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ---------------- GET LAWYERS (PAGINATED & FILTERED) ---------------- */
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const city = req.query.city || "";
        const category = req.query.category || "";

        const query = { role: "lawyer" };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { specialization: { $regex: search, $options: "i" } }
            ];
        }

        if (city) {
            query["location.city"] = { $regex: city, $options: "i" };
        }

        if (category) {
            query.specialization = { $regex: category, $options: "i" };
        }

        const planPriority = { diamond: 3, gold: 2, silver: 1 };

        // 1. Fetch filtered count
        const total = await User.countDocuments(query);

        // 2. Fetch paginated data
        // Note: Sorting by plan priority requires a different approach in MongoDB if 'plan' is a string. 
        // For simplicity/performance in MVP, we sort by creation date or generic sort, 
        // OR we can implement a custom sort if the dataset is small enough after filter.
        // Ideally, we'd add a numeric 'planLevel' field to the schema for efficient sorting.
        // For now, let's just sort by verification status and then date.

        let lawyers = await User.find(query)
            .select("-password")
            .sort({ verified: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Client-side sort for the specific page (Sorting 10 items is cheap)
        lawyers = lawyers.sort((a, b) => (planPriority[b.plan] || 0) - (planPriority[a.plan] || 0));

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
