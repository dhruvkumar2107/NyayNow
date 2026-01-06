require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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
  origin: "*",
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
loadRoute("/api/ai", "./routes/ai");
loadRoute("/api/nearby", "./routes/nearby");
loadRoute("/api/lawyers", "./routes/lawyers");
loadRoute("/api/payments", "./routes/payments");
loadRoute("/api/uploads", "./routes/uploads");
loadRoute("/api/users", "./routes/users");
loadRoute("/api/cases", "./routes/cases");
loadRoute("/api/posts", "./routes/posts");
loadRoute("/api/topics", "./routes/topics");
loadRoute("/api/messages", "./routes/messages"); // Ensure messages route is loaded

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
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
