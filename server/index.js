require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Required for Render/Vercel)
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://nyaysathi-8new.vercel.app",
  "https://nyaysathi.com",
  "https://ubiquitous-creponne-ef2464.netlify.app", // User's Netlify site
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow ANY origin by reflecting it back
      callback(null, true);
    },
  }
});

const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

/* ================= SENTRY INIT ================= */
Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // User needs to provide this
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid breaking scripts/images during dev
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));

// Attach IO to request for using in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

/* ================= SOCKET.IO ================= */
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Join a personal room based on User ID/Email (sent from client)
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // ---------------- LEGAL UBER (INSTANT CONSULT) ----------------
  // Lawyers join this pool to receive instant calls
  socket.on("join_lawyer_pool", () => {
    socket.join("lawyer_pool");
    console.log(`Lawyer ${socket.id} joined instant pool`);
  });

  // Client requests a lawyer
  // payload: { clientId, clientName, category }
  socket.on("request_instant_consult", (payload) => {
    console.log(`Instant Consult Requested by ${payload.clientName}`);
    // Broadcast to all online lawyers
    socket.to("lawyer_pool").emit("incoming_lead", payload);
  });

  // Lawyer accepts the extensive
  // payload: { lawyerId, clientId, lawyerName }
  socket.on("accept_consult", (payload) => {
    const meetingId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Notify Lawyer (Success)
    socket.emit("consult_start", { meetingId, role: "lawyer" });

    // Notify Client (Accepted)
    // We assume Client joined their own personal room "clientId"
    io.to(payload.clientId).emit("consult_start", {
      meetingId,
      role: "client",
      lawyerName: payload.lawyerName
    });

    console.log(`Consult started: ${meetingId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

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
loadRoute("/api/messages", "./routes/messages");
loadRoute("/api/ai", "./routes/ai");
loadRoute("/api/nearby", "./routes/nearby");
loadRoute("/api/lawyers", "./routes/lawyers");
loadRoute("/api/payments", "./routes/payments");
loadRoute("/api/uploads", "./routes/uploads");
loadRoute("/api/users", "./routes/users");
loadRoute("/api/cases", "./routes/cases");
loadRoute("/api/posts", "./routes/posts");
loadRoute("/api/topics", "./routes/topics");
loadRoute("/api/appointments", "./routes/appointments"); // NEW
loadRoute("/api/connections", "./routes/connections"); // FIXED: Missing Route

// Custom Sentry Error Handler (Compatible with all versions)
app.use((err, req, res, next) => {
  console.error("❌ Sentry Caught Error:", err);
  Sentry.captureException(err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const clientDist = path.join(__dirname, "..", "client", "dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // SEO SITEMAP
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const User = require("./models/User");
      const lawyers = await User.find({ role: "lawyer" });

      const baseUrl = "https://nyaysathi.com"; // Replace with actual domain

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}/</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>${baseUrl}/marketplace</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;

      lawyers.forEach(lawyer => {
        xml += `
        <url>
          <loc>${baseUrl}/lawyer/${lawyer._id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>`;
      });

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("*", (req, res) => {
    if (!req.originalUrl.startsWith("/api")) {
      res.sendFile(path.join(clientDist, "index.html"));
    }
  });
}

/* ================= START ================= */
if (process.env.NODE_ENV !== 'test') {
  connectDB().finally(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = { app, server };
