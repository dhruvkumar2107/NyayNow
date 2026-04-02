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
  "https://nyaynow.com",
  "https://nyaynow.in", // NEW
  "https://www.nyaynow.in", // NEW
  "https://ubiquitous-creponne-ef2464.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

/* ================= SENTRY INIT ================= */
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  beforeSend(event) {
    if (event.request && event.request.data) {
      if (typeof event.request.data === 'string') {
        event.request.data = event.request.data.replace(/"password":".*?"/g, '"password":"[REDACTED]"');
        event.request.data = event.request.data.replace(/"token":".*?"/g, '"token":"[REDACTED]"');
      }
    }
    return event;
  },
});

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://*.sentry.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.posthog.com"],
      connectSrc: ["'self'", "https://*.sentry.io", "https://*.posthog.com", "https://*.algolia.net", "https://*.algolianet.com", "wss://*.onrender.com", "https://*.onrender.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Changed to allow Google Login popups
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 300,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // 🛡️ AUTH LIMITER (Brute-force protection)
// const authLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 10, // 10 attempts per hour
//   message: { error: "Too many login attempts. Try again in an hour." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use("/api/auth", authLimiter);

// // 🛡️ AI LIMITER (Cost overflow protection)
// const aiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50, // 50 AI requests per 15 min
//   message: { error: "AI capacity limit reached. Please wait a moment." },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use("/api/ai", aiLimiter);

app.use(cors({
  origin: allowedOrigins,
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
  process.env.MONGO_URI || "mongodb://localhost:27017/nyaynow";

/* ================= DB ================= */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ MongoDB connected");
    console.log("📦 Database:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

/* ================= SOCKET.IO ================= */
const jwt = require("jsonwebtoken");

// JWT Handshake Middleware for Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token"));
    socket.user = decoded; // { id, role, email }
    next();
  });
});

io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log(`⚡ Secure Client connected: ${socket.id} (User: ${userId})`);

  // Join a personal room based on User ID
  socket.on("join_room", (room) => {
    // SECURITY: Users can only join their own room or a pool they have access to
    if (room !== userId && room !== "lawyer_pool") {
      console.warn(`⚠️ User ${userId} attempted to join unauthorized room: ${room}`);
      return;
    }
    socket.join(room);
  });

  // ---------------- LEGAL UBER (INSTANT CONSULT) ----------------
  // Lawyers join this pool to receive instant calls
  socket.on("join_lawyer_pool", () => {
    if (socket.user.role !== "lawyer") {
      return console.warn(`⚠️ Non-lawyer ${userId} tried to join lawyer pool`);
    }
    socket.join("lawyer_pool");
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
    console.log(`Consult started: ${meetingId}`);
  });

  // ---------------- SCHEDULED CALLS (NEW) ----------------
  // Lawyer starts a pre-booked appointment
  // payload: { appointmentId, clientId, lawyerName }
  socket.on("start_scheduled_meeting", (payload) => {
    console.log(`Scheduled meeting started for client: ${payload.clientId}`);
    // Notify Client
    io.to(payload.clientId).emit("scheduled_meeting_start", {
      meetingId: payload.appointmentId, // Use Appointment ID as room
      lawyerName: payload.lawyerName
    });
  });

  /* ---------------- SECURE CHAT (NEW) ---------------- */
  socket.on("send_message", async (payload) => {
    try {
      // Saving to DB is handled normally via API for reliability, 
      // but for strict socket-only apps we'd do it here. 
      // We'll trust the API route does the saving and emission, 
      // OR we can double-emit here if using pure sockets.
      // Current Plan: Use API for Save+Emit to ensure Auth.
      // So this socket event might be redundant if API handles it, 
      // BUT let's keep a 'typing' event which is ephemeral.
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("typing", (payload) => {
    // payload: { toUserId }
    socket.to(payload.toUserId).emit("user_typing", { fromUserId: socket.id }); // Simplified
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
loadRoute("/api/invoices", "./routes/invoices"); // NEW
loadRoute("/api/crm", "./routes/crm"); // NEW
loadRoute("/api/notifications", "./routes/notifications"); // NEW
loadRoute("/api/agreements", "./routes/agreements"); // NEW
loadRoute("/api/events", "./routes/events"); // NEW CALENDAR ROUTE
loadRoute("/api/admin", "./routes/admin"); // NEW ADMIN ANALYTICS
loadRoute("/api/contact", "./routes/contact"); // NEW CONTACT ROUTE
loadRoute("/api/docusign", "./routes/docusign"); // NEW DOCUSIGN ROUTE
loadRoute("/api/verification", "./routes/verification"); // REAL DIGILOCKER ROUTE
loadRoute("/api/confessions", "./routes/confessions"); // ANONYMOUS CONFESSION BOOTH
loadRoute("/api/ecourts", "./routes/ecourts"); // NEW ECOURTS INTEGRATION

// Custom Sentry Error Handler (Compatible with all versions)
app.use((err, req, res, next) => {
  console.error("❌ Global Error Caught at", req.originalUrl, ":", err);
  Sentry.captureException(err);

  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: "Internal Server Error",
    message: isDev ? err.message : "Something went wrong. Please try again later.",
    path: isDev ? req.originalUrl : undefined
  });
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

      const host = req.get('host');
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${baseUrl}/</loc>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>${baseUrl}/find-lawyers</loc>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>
        <url>
          <loc>${baseUrl}/about</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
        <url>
          <loc>${baseUrl}/pricing</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
        <url>
          <loc>${baseUrl}/contact</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
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

  app.get("*", async (req, res) => {
    if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/uploads")) {
      return res.status(404).json({ error: "Not Found" });
    }

    try {
      let indexPath = path.join(clientDist, "index.html");
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send("Index file not found");
      }

      let html = fs.readFileSync(indexPath, "utf8");

      // DEFAULT META
      let title = "NyayNow | AI Legal Intelligence";
      let description = "NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal advice and connect with expert lawyers.";
      let ogImage = "https://nyaynow.com/og-image.jpg";
      let url = `https://nyaynow.in${req.originalUrl}`;

      // DYNAMIC META BASED ON ROUTE
      if (req.originalUrl.startsWith("/lawyer/")) {
        const lawyerId = req.originalUrl.split("/")[2];
        try {
          const User = require("./models/User");
          const lawyer = await User.findById(lawyerId);
          if (lawyer) {
            title = `${lawyer.name} | Verified Lawyer on NyayNow`;
            description = `Consult with ${lawyer.name}, a legal expert specializing in ${lawyer.specialization || 'law'}. Book an appointment on NyayNow.`;
          }
        } catch (e) {
          // Fallback to default if DB fails or ID invalid
        }
      } else if (req.originalUrl === "/find-lawyers") {
        title = "Lawyer Marketplace | Find Top Legal Experts - NyayNow";
        description = "Browse and connect with verified lawyers across India. Filter by specialization, location, and experience.";
      } else if (req.originalUrl === "/assistant") {
        title = "AI Legal Assistant | Instant Legal Guidance - NyayNow";
        description = "Get instant answers to your legal queries with NyayNow's AI-powered assistant.";
      }

      // INJECT META
      const metaHtml = `
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${url}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${ogImage}" />
      `;

      // Replace the placeholder or the existing meta tags
      // We'll replace everything between <!-- META_START --> and <!-- META_END -->
      // And also replace the existing <title> for good measure if it exists outside
      html = html.replace(/<title>.*?<\/title>/g, ""); // Remove static title
      html = html.replace(/<!-- META_START -->[\s\S]*?<!-- META_END -->/, metaHtml);

      res.send(html);
    } catch (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Internal Server Error");
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
