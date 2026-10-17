const express = require("express");
const path = require("path");
const User = require("../models/User");

const { generateMultimodalWithFallback } = require("../utils/aiUtils");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ---------------- GET LAWYERS (PAGINATED & FILTERED) ---------------- */
// Marketplace must only surface APPROVED advocates and must never expose
// credentials/PII intended for admin review only.
const MARKETPLACE_PUBLIC_FIELDS = [
    "_id", "name", "specialization", "experience", "location", "profileImage",
    "verified", "verificationStatus", "isFeatured", "listingTier",
    "consultationFee", "languages", "courts", "bio", "availability",
    "education", "isStudent", "stats", "isProfileComplete", "createdAt",
];

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search || "";
        const city = req.query.city || "";
        const state = req.query.state || "";
        const category = req.query.category || "";
        const language = req.query.language || "";
        const minExperience = parseInt(req.query.minExperience) || 0;

        // Only verified, approved advocates are publicly listed.
        const query = { role: "lawyer", verified: true, verificationStatus: "verified" };

        if (search) {
            const safeSearch = escapeRegex(search.trim());
            query.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { specialization: { $regex: safeSearch, $options: "i" } }
            ];
        }

        if (city) {
            query["location.city"] = { $regex: escapeRegex(city.trim()), $options: "i" };
        }

        if (state) {
            query["location.state"] = { $regex: escapeRegex(state.trim()), $options: "i" };
        }

        if (category) {
            query.specialization = { $regex: escapeRegex(category.trim()), $options: "i" };
        }

        // Filter by supported language (stored as an array of strings)
        if (language) {
            query.languages = { $regex: `^${escapeRegex(language.trim())}$`, $options: "i" };
        }

        // Minimum years of experience
        if (minExperience > 0) {
            query.experience = { $gte: minExperience };
        }

        const sortOptions = { isFeatured: -1, verified: -1, experience: -1, createdAt: -1 };

        if (req.query.all === "true") {
            const lawyers = await User.find(query)
                .sort(sortOptions)
                .limit(500)
                .select(MARKETPLACE_PUBLIC_FIELDS.join(" "));
            return res.json(lawyers);
        }

        const lawyers = await User.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .select(MARKETPLACE_PUBLIC_FIELDS.join(" "));
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
/**
 * SECURITY / INTEGRITY FIX
 * Previously this endpoint:
 *   1. Fetched ANY attacker-supplied URL (SSRF) or read ANY local path (LFI),
 *   2. Let a user self-approve by setting verified:true straight from an AI guess.
 * It is now restricted to images the platform itself hosts, and it NEVER grants
 * verification. It only extracts the Bar Council number and marks the profile
 * "pending" so a human administrator can review it.
 */
const ALLOWED_IMAGE_PREFIXES = ["/uploads/"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

function isSafeLocalUploadPath(imageUrl) {
  if (typeof imageUrl !== "string") return false;
  if (!imageUrl.startsWith("/uploads/")) return false;
  // Block traversal attempts like /uploads/../../etc/passwd
  const normalized = path.posix.normalize(imageUrl);
  if (!normalized.startsWith("/uploads/")) return false;
  if (normalized.includes("..")) return false;
  return true;
}

router.post("/verify-id", verifyToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Missing image URL" });
    }

    // Only allow reading images that are already stored in our own /uploads dir.
    // This blocks SSRF (arbitrary remote fetch) and path traversal (LFI).
    if (!isSafeLocalUploadPath(imageUrl)) {
      return res.status(400).json({
        error: "Unsupported image source. Please upload your document first (must be an /uploads/ file).",
      });
    }

    const relativePath = imageUrl.replace(/^\/+/, "");
    const fullPath = path.join(__dirname, "..", relativePath);
    // Final guard: ensure resolved path stays inside the uploads directory
    const uploadsRoot = path.join(__dirname, "..", "uploads");
    const resolved = path.resolve(fullPath);
    if (!resolved.startsWith(path.resolve(uploadsRoot) + path.sep)) {
      return res.status(400).json({ error: "Invalid image path" });
    }

    const fs = require("fs").promises;
    const imageBuffer = await fs.readFile(resolved);
    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "Image too large (max 8 MB)" });
    }

    const ocrPrompt =
      "Extract the Bar Council enrolment ID number from this ID card image and return JSON: {valid: boolean, idNumber: string}";

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

    // NEVER self-approve. Record the extracted number and queue for admin review.
    const update = { verificationStatus: "pending", verified: false };
    if (data.valid && data.idNumber && typeof data.idNumber === "string") {
      update.barCouncilId = data.idNumber.trim().slice(0, 50);
    }
    await User.findByIdAndUpdate(req.userId, update);

    res.json({
      valid: !!data.valid,
      idNumber: data.idNumber || "",
      verificationStatus: "pending",
      message:
        "Document received. Your profile is queued for administrator review — verification is granted only after a human approval.",
    });
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Verification process failed" });
  }
});

module.exports = router;
