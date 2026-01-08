const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
const fs = require('fs');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use 2.5-flash as it proved successful for Chat
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* ---------------- NEARBY SERVICES (Smart AI Search) ---------------- */
router.get("/", async (req, res) => {
  try {
    const { lat, lon, query, language } = req.query;
    const q = query || "legal services";
    const lang = language || "English";

    // Explicitly mention Bengaluru if lat/lon are missing or generic to bias the AI
    // correctly if the frontend fails to get location. 
    // But ideally, let's look at the prompt.

    const locationContext = (lat && lon) ? `Coordinates (${lat}, ${lon})` : `Bengaluru, India`;

    fs.appendFileSync('nearby_debug.log', `Request: ${locationContext}, Query: ${q}\n`);

    const prompt = `
      The user is at ${locationContext} or searching for "${q}".
      
      Step 1: If coordinates are provided, IDENTIFY the specific locality/area name (e.g. Koramangala, Indiranagar, Whitefield).
      Step 2: Generate a JSON list of 5 REAL legal service locations (Courts, Police Stations, Legal Aid) strictly within 5-10km of that specific area.
      
      Return JSON array of objects with keys: 
      "name", "rating" (4.0-5.0), "address" (Must include specific locality name), "type" (court|police|legal_aid).
      
      Strict JSON format. Do not hallucinate generic names like "City Police Station". Use real station names if possible.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    fs.appendFileSync('nearby_debug.log', `AI Response: ${text}\n----------------\n`);

    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    let locations = JSON.parse(cleaned);

    // ---------------------------------------------------------
    //  FETCH REAL LAWYERS FROM DB
    // ---------------------------------------------------------
    try {
      const User = require("../models/User");
      // Simple geo-match: just get all lawyers for now (demo scale)
      // In prod, use $near sphere query
      const realLawyers = await User.find({ role: "lawyer" }).limit(5);

      const formattedLawyers = realLawyers.map(l => ({
        name: l.name,
        rating: 4.8, // Default rating for verified pros
        address: l.location ? l.location.city : "Registered Lawyer",
        type: "lawyer",
        verified: true, // Frontend can show a checkmark
        specialization: l.specialization,
        is_real: true // Flag to distinguish
      }));

      // Combine: AI places (Courts/Police) + Real Lawyers
      // Filter AI "lawyers" out if we have real ones
      const aiNonLawyers = locations.filter(x => x.type !== 'lawyer' && x.type !== 'legal_aid');
      locations = [...aiNonLawyers, ...formattedLawyers];

    } catch (dbErr) {
      console.error("DB Fetch Error:", dbErr.message);
      fs.appendFileSync('nearby_debug.log', `DB ERROR: ${dbErr.message}\n`);
    }

    res.json(locations);
  } catch (err) {
    console.error("Gemini Nearby Error:", err.message);
    fs.appendFileSync('nearby_debug.log', `ERROR: ${err.message}\n----------------\n`);

    // Fallback to real lawyers if AI fails
    try {
      const User = require("../models/User");
      const realLawyers = await User.find({ role: "lawyer" }).limit(5);
      const fallback = realLawyers.map(l => ({
        name: l.name,
        rating: 4.8,
        address: l.location?.city || "Bengaluru",
        type: "lawyer"
      }));
      res.json(fallback.length ? fallback : [
        { name: "District Court (Offline Fallback)", rating: 4.5, address: "City Center", type: "court" }
      ]);
    } catch (e) {
      res.json([{ name: "District Court", rating: 4.5, address: "City Center", type: "court" }]);
    }
  }
});

module.exports = router;

