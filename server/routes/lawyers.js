const express = require("express");
const User = require("../models/User");

const { generateMultimodalWithFallback } = require("../utils/aiUtils");
const verifyToken = require("../middleware/authMiddleware");
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

        // Sorting is by listing subscription (isFeatured), verification status and date joined.
        const sortOptions = { isFeatured: -1, verified: -1, createdAt: -1 };

        if (req.query.all === "true") {
            const lawyers = await User.find(query)
                .sort(sortOptions)
                .select("-password -otp");
            return res.json(lawyers);
        }

        const pipeline = [
            { $match: query },
            { $sort: sortOptions },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { password: 0, otp: 0 } } // Clean up
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
router.post("/verify-id", verifyToken, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: "Missing image URL" });

        // 1. Fetch Image
        let imageBuffer;
        // ... (fetch logic remains same) ...
        if (imageUrl.startsWith("http")) {
            const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
            imageBuffer = Buffer.from(response.data);
        } else {
            const fs = require("fs");
            const path = require("path");
            const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
            const fullPath = path.join(__dirname, "..", relativePath);
            imageBuffer = fs.readFileSync(fullPath);
        }

        const ocrPrompt = "Verify if this is a valid Bar Council ID. Extract the ID number and return JSON: {valid: boolean, idNumber: string}";

        const result = await generateMultimodalWithFallback([
            ocrPrompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const responseText = await result.response.text();
        let text = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }

        const data = JSON.parse(text);

        // 4. Update ONLY the logged-in user
        if (data.valid) {
            await User.findByIdAndUpdate(req.userId, {
                verified: true,
                barCouncilId: data.idNumber || ""
            });
        }

        res.json(data);

    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Verification process failed" });
    }
});

module.exports = router;
