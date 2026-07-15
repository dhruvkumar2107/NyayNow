require("dotenv").config();

// Fail fast if JWT_SECRET is missing or uses a known-default value (except in test environment)
const KNOWN_BAD_SECRETS = ['super_secret_key_change_later', 'secret', 'jwt_secret', 'changeme'];
if (process.env.NODE_ENV === 'test' && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_only_secret_key_for_jest';
}
if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev_only_secret_key_fallback_for_local_development_nyaynow_9f8b4c2b9a7';
}
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
const csrfProtect = require("./middleware/csrf");

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
if (process.env.SENTRY_DSN) {
Sentry.init({
  dsn: process.env.SENTRY_DSN,
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
} // end if (SENTRY_DSN)

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


/* ================= RATE LIMIT CONSTANTS ================= */
const RATE_LIMIT = {
  GLOBAL_WINDOW_MS:   15 * 60 * 1000,  // 15 minutes
  GLOBAL_MAX:         300,
  AUTH_WINDOW_MS:     15 * 60 * 1000,  // 15 minutes
  AUTH_MAX:           35,              // 35 requests (more than enough for any legitimate user login/OTP flow)
  AI_WINDOW_MS:       15 * 60 * 1000,  // 15 minutes
  AI_MAX:             50,
};

// Per-user keyGenerator: uses authenticated user ID when available so shared
// IPs (offices, NAT) don't throttle each other unfairly.
function perUserKey(req) {
  const token = req.cookies?.token || (req.headers['authorization'] || '').replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.id) return `user_${decoded.id}`;
    } catch { /* fall through */ }
  }
  return req.ip || 'unknown';
}

// 🛡️ GLOBAL LIMITER
const limiter = rateLimit({
  windowMs: RATE_LIMIT.GLOBAL_WINDOW_MS,
  max:      RATE_LIMIT.GLOBAL_MAX,
  keyGenerator: perUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
});
app.use(limiter);

// 🛡️ AUTH LIMITER (Brute-force protection - applied selectively to protect session/refresh endpoints)
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max:      RATE_LIMIT.AUTH_MAX,
  message: { error: "Too many login/registration attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/send-otp", authLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// 🛡️ AI LIMITER (Cost overflow protection)
const aiLimiter = rateLimit({
  windowMs: RATE_LIMIT.AI_WINDOW_MS,
  max:      RATE_LIMIT.AI_MAX,
  keyGenerator: perUserKey,
  message: { error: "AI capacity limit reached. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
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
app.use(csrfProtect);

/* ================= REQUEST LOGGER ================= */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else if (process.env.NODE_ENV !== 'production') console.log(line);
  });
  next();
});

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

    // Drop obsolete phone unique index on otpentries if it exists
    try {
      const db = mongoose.connection.db;
      await db.collection("otpentries").dropIndex("phone_1");
      console.log("Cleaned up obsolete phone unique index on otpentries collection");
    } catch (indexErr) {
      // Index didn't exist or collection wasn't created yet; ignore
    }
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

// Valid chat room pattern: two sorted user IDs joined by "_"
// e.g. "64abc_64def" where 64abc < 64def lexicographically
function isValidChatRoom(room, userId) {
  const parts = room.split("_");
  if (parts.length !== 2) return false;
  return parts.includes(userId);
}

io.on("connection", (socket) => {
  const userId = socket.user.id;
  if (process.env.NODE_ENV !== 'production') {
    console.log(`⚡ Secure Client connected: ${socket.id} (User: ${userId})`);
  }

  // Join a personal or chat room
  socket.on("join_room", (room) => {
    if (typeof room !== 'string' || room.length > 200) return;

    if (room === "lawyer_pool") {
      if (socket.user.role !== "lawyer") {
        console.warn(`⚠️ User ${userId} attempted to join lawyer_pool without lawyer role`);
        return;
      }
    } else if (room === userId) {
      // Personal notification room — always allowed
    } else if (isValidChatRoom(room, userId)) {
      // Two-party chat room — allowed if user is one of the participants
    } else {
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

  socket.on("typing", (payload) => {
    // payload: { toUserId }
    socket.to(payload.toUserId).emit("user_typing", { fromUserId: socket.id }); // Simplified
  });

  socket.on("disconnect", () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Client disconnected: ${socket.id}`);
    }
  });
});

/* ================= SERVER IP (for Brevo IP whitelist setup) ================= */
app.get("/server-ip", async (req, res) => {
  // Restrict to admin users only
  const jwt = require("jsonwebtoken");
  const token = req.cookies?.token || (req.headers["authorization"] || "").replace("Bearer ", "");
  if (!token) return res.status(403).json({ error: "Forbidden" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  } catch {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const fetch = require("node-fetch");
    const r = await fetch("https://api.ipify.org?format=json");
    const data = await r.json();
    res.json({ serverPublicIP: data.ip, message: "Add this IP to Brevo authorized IPs" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ================= API DOCS ================= */
// Serve OpenAPI spec at /api/docs — importable in Swagger Editor or Postman
// Only enabled in non-production to avoid exposing internals publicly
if (process.env.NODE_ENV !== 'production') {
  app.get("/api/docs/openapi.json", (req, res) => {
    res.sendFile(path.join(__dirname, "docs", "openapi.json"));
  });
  console.log("📖 API docs available at http://localhost:" + (process.env.PORT || 4000) + "/api/docs/openapi.json");
}

/* ================= HEALTH ================= */

app.get("/healthz", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const memUsage = process.memoryUsage();
  const isHealthy = dbState === 1;
  const payload = {
    ok: isHealthy,
    status: isHealthy ? "healthy" : "degraded",
    db: dbStateMap[dbState] || "unknown",
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  };
  // Return 503 when degraded so Uptime Robot correctly triggers alerts
  res.status(isHealthy ? 200 : 503).json(payload);
});

/* ================= ROUTE LOADER ================= */
function loadRoute(url, file) {
  try {
    const route = require(file);
    app.use(url, route);
    if (process.env.NODE_ENV !== 'production') console.log(`Mounted ${url}`);
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
loadRoute("/api/translate", "./routes/translate"); // BHASHINI MULTILINGUAL TRANSLATION
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

      const staticPages = [
        { path: "/", freq: "daily", priority: "1.0" },
        { path: "/marketplace", freq: "daily", priority: "0.9" },
        { path: "/legal-sos", freq: "weekly", priority: "0.8" },
        { path: "/assistant", freq: "weekly", priority: "0.8" },
        { path: "/professionals", freq: "daily", priority: "0.8" },
        { path: "/judge-ai", freq: "weekly", priority: "0.8" },
        { path: "/blog", freq: "daily", priority: "0.8" },
        { path: "/research", freq: "weekly", priority: "0.7" },
        { path: "/drafting", freq: "weekly", priority: "0.7" },
        { path: "/courtroom-battle", freq: "weekly", priority: "0.7" },
        { path: "/nyaycourt-simulator", freq: "weekly", priority: "0.7" },
        { path: "/nyayvoice", freq: "weekly", priority: "0.7" },
        { path: "/judge-pro", freq: "weekly", priority: "0.7" },
        { path: "/moot-court", freq: "weekly", priority: "0.7" },
        { path: "/ecourts", freq: "weekly", priority: "0.7" },
        { path: "/case-studies", freq: "monthly", priority: "0.6" },
        { path: "/about", freq: "monthly", priority: "0.6" },
        { path: "/pricing", freq: "monthly", priority: "0.6" },
        { path: "/contact", freq: "monthly", priority: "0.6" },
        { path: "/career", freq: "monthly", priority: "0.6" },
        { path: "/help", freq: "monthly", priority: "0.6" },
        { path: "/rent-agreement", freq: "monthly", priority: "0.6" },
        { path: "/compliances", freq: "monthly", priority: "0.6" },
        { path: "/security-and-compliance", freq: "monthly", priority: "0.5" },
        { path: "/methodology", freq: "monthly", priority: "0.5" },
        { path: "/dpdp", freq: "monthly", priority: "0.5" },
        { path: "/privacy", freq: "monthly", priority: "0.5" },
        { path: "/terms", freq: "monthly", priority: "0.5" },
        { path: "/disclaimer", freq: "monthly", priority: "0.5" },
        { path: "/refund", freq: "monthly", priority: "0.5" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      staticPages.forEach(p => {
        xml += `
        <url>
          <loc>${baseUrl}${p.path}</loc>
          <changefreq>${p.freq}</changefreq>
          <priority>${p.priority}</priority>
        </url>`;
      });

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
      // Always use the canonical production domain — never derive protocol from req.protocol
      // which could be spoofed via X-Forwarded-Proto in misconfigured proxy setups.
      const CANONICAL_ORIGIN = "https://nyaynow.in";
      let url = `${CANONICAL_ORIGIN}${req.originalUrl}`;

      // DYNAMIC META BASED ON ROUTE
      if (req.originalUrl.startsWith("/lawyer/")) {
        const lawyerId = req.originalUrl.split("/")[2]?.split("?")[0];
        // Only query DB for valid-looking ObjectIds (24 hex chars) to prevent injection
        const isValidObjectId = /^[a-f\d]{24}$/i.test(lawyerId || "");
        try {
          const User = require("./models/User");
          const lawyer = isValidObjectId ? await User.findById(lawyerId) : null;
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

/* ================= GRACEFUL SHUTDOWN ================= */
function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (e) {
      console.error('Error closing MongoDB:', e.message);
    }
    process.exit(0);
  });
  // Force exit if graceful shutdown stalls
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

/* ================= START ================= */
if (process.env.NODE_ENV !== 'test') {
  connectDB().finally(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = { app, server };
