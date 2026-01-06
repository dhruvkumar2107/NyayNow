require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
const compression = require("compression");

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(
  cors({
    origin: "*", // Allow all origins for Vercel deployment
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= ENV ================= */
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/nyaysathi";

/* ================= DB ================= */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    console.log("📦 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

/* ================= HEALTH ================= */
app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

/* ================= ROUTE LOADER ================= */
function loadRoute(url, file) {
  try {
    const route = require(file);
    app.use(url, route);
    console.log(`Mounted ${url}`);
  } catch (err) {
    console.error(`❌ FAILED ${url}:`, err.message);
  }
}

/* ================= ROUTES ================= */
loadRoute("/api/auth", "./routes/auth");
loadRoute("/api/ai", "./routes/ai");
loadRoute("/api/nearby", "./routes/nearby");
loadRoute("/api/lawyers", "./routes/lawyers");
loadRoute("/api/payments", "./routes/payments");
loadRoute("/api/uploads", "./routes/uploads");
loadRoute("/api/users", "./routes/users");
loadRoute("/api/cases", "./routes/cases");
loadRoute("/api/posts", "./routes/posts");
loadRoute("/api/topics", "./routes/topics");

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const clientDist = path.join(__dirname, "..", "client", "dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    if (!req.originalUrl.startsWith("/api")) {
      res.sendFile(path.join(clientDist, "index.html"));
    }
  });
}

/* ================= START ================= */
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
