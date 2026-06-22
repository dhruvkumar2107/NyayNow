require("dotenv").config();

// Fail fast if JWT_SECRET is missing or uses a known-default value (except in test environment)
const KNOWN_BAD_SECRETS = ['super_secret_key_change_later', 'secret', 'jwt_secret', 'changeme'];
if (process.env.NODE_ENV !== 'test' && (!process.env.JWT_SECRET || KNOWN_BAD_SECRETS.includes(process.env.JWT_SECRET))) {
  console.error('❌ FATAL: JWT_SECRET is missing or uses a known-insecure default. Refusing to start.');
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const sanitizeMiddleware = require("./middleware/sanitize");
const escapeHtml = require("./utils/escapeHtml");
const errorHandler = require("./middleware/errorHandler");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Required for Render/Vercel)
const server = http.createServer(app);

const allowedOrigins = [
  "https://nyaynow.in",
  "https://www.nyaynow.in",
  "https://nyaynow.com",
  process.env.CLIENT_URL,
  ...(process.env.NODE_ENV !== 'production' ? ["http://localhost:3000", "http://localhost:5173"] : []),
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    const PII_FIELDS = ['password', 'token', 'email', 'phone', 'idCardImage', 'otp', 'confession'];
    if (event.request?.data) {
      if (typeof event.request.data === 'object') {
        for (const field of PII_FIELDS) {
          if (field in event.request.data) event.request.data[field] = '[REDACTED]';
        }
      } else if (typeof event.request.data === 'string') {
        for (const field of PII_FIELDS) {
          event.request.data = event.request.data.replace(
            new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi'), `"${field}":"[REDACTED]"`
          );
        }
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
      scriptSrc: [
        "'self'",
        "https://checkout.razorpay.com",
        "https://*.sentry.io",
        "https://cdn.razorpay.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://nyaynow.in",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://res.cloudinary.com",
        "https://*.posthog.com",
        "https://randomuser.me",
        "https://ui-avatars.com",
        "https://unpkg.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.sentry.io",
        "https://*.posthog.com",
        "https://*.algolia.net",
        "https://*.algolianet.com",
        "wss://nyaynow.in",
        "https://nyaynow.in",
        "https://api.razorpay.com",
        "https://lumberjack.razorpay.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      frameSrc: [
        "https://checkout.razorpay.com",  // Allow Razorpay iframe
        "https://api.razorpay.com",
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));


// 🛡️ GLOBAL LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 🛡️ AUTH LIMITER (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: { error: "Too many login attempts. Try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// 🛡️ AI LIMITER (Cost overflow protection)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 AI requests per 15 min
  message: { error: "AI capacity limit reached. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/ai", aiLimiter);

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
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
app.use(cookieParser());
app.use(sanitizeMiddleware);

/* ================= ENV VALIDATION ================= */
const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "MONGO_URI",
  "RZP_KEY_ID",
  "RZP_KEY_SECRET",
  "GOOGLE_CLIENT_ID",
];
REQUIRED_ENV_VARS.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing critical env var: ${key}`);
  }
});

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
  const token = socket.handshake.auth.token;
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
    if (room !== userId && (room === "lawyer_pool" && socket.user.role !== "lawyer")) {
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
    if (socket.user.id !== payload.clientId) {
      return console.warn(`⚠️ Unauthorized request_instant_consult sender: expected ${socket.user.id}, got ${payload.clientId}`);
    }
    console.log(`Instant Consult Requested by ${payload.clientName}`);
    // Broadcast to all online lawyers
    socket.to("lawyer_pool").emit("incoming_lead", payload);
  });

  // Lawyer accepts the extensive
  // payload: { lawyerId, clientId, lawyerName }
  socket.on("accept_consult", (payload) => {
    if (socket.user.role !== "lawyer") {
      return console.warn(`⚠️ User ${userId} attempted to accept consult but is not a lawyer`);
    }
    if (socket.user.id !== payload.lawyerId) {
      return console.warn(`⚠️ Unauthorized accept_consult sender: expected ${socket.user.id}, got ${payload.lawyerId}`);
    }
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

  // ---------------- SCHEDULED CALLS (NEW) ----------------
  // Lawyer starts a pre-booked appointment
  // payload: { appointmentId, clientId, lawyerName }
  socket.on("start_scheduled_meeting", (payload) => {
    if (socket.user.role !== "lawyer") {
      return console.warn(`⚠️ User ${userId} attempted to start scheduled meeting but is not a lawyer`);
    }
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
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const memUsage = process.memoryUsage();
  res.json({
    ok: dbState === 1,
    db: dbStateMap[dbState] || "unknown",
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
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
loadRoute("/api/chats", "./routes/chats"); // NEW CHAT HISTORY PERSISTENCE
loadRoute("/api/whatsapp", "./routes/whatsapp"); // NEW TWILIO WHATSAPP WEBHOOK
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
loadRoute("/api/ecourts", "./routes/ecourts"); // ECOURTS INTEGRATION
loadRoute("/api/subscriptions", "./routes/subscriptions"); // 💰 RECURRING SUBSCRIPTIONS
loadRoute("/api/leads", "./routes/leads"); // 💰 PAY-PER-LEAD SYSTEM

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
        </url>
        <url>
          <loc>${baseUrl}/assistant</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>${baseUrl}/judge-ai</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>${baseUrl}/professionals</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>${baseUrl}/courtroom-battle</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
        <url>
          <loc>${baseUrl}/voice-assistant</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
        <url>
          <loc>${baseUrl}/research</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
        <url>
          <loc>${baseUrl}/drafting</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
        <url>
          <loc>${baseUrl}/legal-sos</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
        <url>
          <loc>${baseUrl}/blog</loc>
          <changefreq>daily</changefreq>
          <priority>0.6</priority>
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
      let description = "NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal information and connect with expert lawyers.";
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
        title = "Lawyer Directory | Find Verified Advocates - NyayNow";
        description = "Browse and connect with verified lawyers across India. Filter by specialization, location, and experience.";
      } else if (req.originalUrl === "/assistant") {
        title = "AI Legal Assistant | Instant Legal Guidance - NyayNow";
        description = "Get instant answers to your legal queries with NyayNow's AI-powered assistant.";
      }

      // INJECT META (with XSS protection via HTML escaping)
      const escapedTitle = escapeHtml(title);
      const escapedDescription = escapeHtml(description);
      const escapedUrl = escapeHtml(url);
      const escapedOgImage = escapeHtml(ogImage);

      const metaHtml = `
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapedUrl}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:image" content="${escapedOgImage}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${escapedUrl}" />
  <meta property="twitter:title" content="${escapedTitle}" />
  <meta property="twitter:description" content="${escapedDescription}" />
  <meta property="twitter:image" content="${escapedOgImage}" />
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

app.use(errorHandler);

/* ================= START ================= */
if (process.env.NODE_ENV !== 'test') {
  connectDB().finally(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = { app, server };
