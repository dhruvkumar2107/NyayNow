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
      
      CRITICAL: You MUST include at least one "Police Station" and one "Court".

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

    // Helper to add coordinates if missing
    const addCoords = (items, centerLat, centerLon) => {
      const cLat = parseFloat(centerLat);
      const cLon = parseFloat(centerLon);

      return items.map(item => {
        if (item.lat && item.lon) return item;

        // Generate random offset within ~3-5km
        // 1 deg lat ~ 111km. 0.03 deg ~ 3.3km
        const rLat = (Math.random() - 0.5) * 0.06;
        const rLon = (Math.random() - 0.5) * 0.06;

        return {
          ...item,
          lat: cLat + rLat,
          lon: cLon + rLon
        };
      });
    };

    let locations = JSON.parse(cleaned);

    // Ensure AI results have coords relative to user
    if (lat && lon) {
      locations = addCoords(locations, lat, lon);
    }

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
        is_real: true, // Flag to distinguish
        lat: l.location?.lat,
        lon: l.location?.long
      }));

      // Combine: AI places (Courts/Police) + Real Lawyers
      // Filter AI "lawyers" out if we have real ones
      const aiNonLawyers = locations.filter(x => x.type !== 'lawyer' && x.type !== 'legal_aid');
      locations = [...aiNonLawyers, ...formattedLawyers];

      // Assign coords to lawyers if missing (using user location as center for demo)
      if (lat && lon) {
        locations = addCoords(locations, lat, lon);
      }

      // CRITICAL GUARANTEE: Check if we have at least one police station
      const hasPolice = locations.some(l => l.type && l.type.toLowerCase().includes('police'));
      if (!hasPolice) {
        let fallbackPolice = {
          name: "City Police Station (General)",
          rating: 4.2,
          address: "City Center",
          type: "police"
        };
        if (lat && lon) fallbackPolice = addCoords([fallbackPolice], lat, lon)[0];
        locations.push(fallbackPolice);
      }

    } catch (dbErr) {
      console.error("DB Fetch Error:", dbErr.message);
      fs.appendFileSync('nearby_debug.log', `DB ERROR: ${dbErr.message}\n`);
    }

    res.json(locations);
  } catch (err) {
    console.error("Gemini Nearby Error:", err.message);
    fs.appendFileSync('nearby_debug.log', `ERROR: ${err.message}\n----------------\n`);

    const { lat, lon } = req.query;

    // Fallback to real lawyers if AI fails
    try {
      const User = require("../models/User");
      const realLawyers = await User.find({ role: "lawyer" }).limit(5);
      const fallback = realLawyers.map(l => ({
        name: l.name,
        rating: 4.8,
        address: l.location?.city || "Bengaluru",
        type: "lawyer",
        lat: l.location?.lat,
        lon: l.location?.long
      }));

      // Always return at least one Court and one Police Station in fallback
      const staticServices = [
        { name: "District Court (Offline Fallback)", rating: 4.5, address: "City Center", type: "court" },
        { name: "City Police Station (HQ)", rating: 4.2, address: "Main Road", type: "police" }
      ];

      // helper to add random coords
      const addFallbackCoords = (items) => {
        if (!lat || !lon) return items; // Can't add if no center
        const cLat = parseFloat(lat);
        const cLon = parseFloat(lon);
        return items.map(item => {
          if (item.lat && item.lon) return item;
          return {
            ...item,
            lat: cLat + (Math.random() - 0.5) * 0.05,
            lon: cLon + (Math.random() - 0.5) * 0.05
          };
        });
      };

      const finalFallback = [...addFallbackCoords(fallback), ...addFallbackCoords(staticServices)];

      res.json(finalFallback);
    } catch (e) {
      const hardFallback = [
        { name: "District Court", rating: 4.5, address: "City Center", type: "court" },
        { name: "Central Police Station", rating: 4.0, address: "City Center", type: "police" }
      ];
      // Try to add coords even to hard fallback if possible
      if (lat && lon) {
        const cLat = parseFloat(lat);
        const cLon = parseFloat(lon);
        hardFallback.forEach(i => {
          i.lat = cLat + 0.01;
          i.lon = cLon + 0.01;
        });
      }
      res.json(hardFallback);
    }
  }
});

module.exports = router;

