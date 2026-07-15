const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { validate, rules } = require("../middleware/validate");
const { issueTokens, isLoginLocked, recordLoginFailure, resetLoginAttempts } = require("../services/authService");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
if (!process.env.GOOGLE_CLIENT_ID) console.warn("⚠️ GOOGLE_CLIENT_ID is missing in .env");

/* ================= GOOGLE LOGIN ================= */
// [DELETED] Backdoor seed route removed for production hardening.


router.post("/google", async (req, res) => {
  try {
    const { token, role } = req.body; // Role is optional, defaults to client if new user

    // 1. Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // console.log("Google Payload:", payload); // Debugging

    const { email, name, sub: googleId, picture } = payload;

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // 3. If Role is NOT provided, it means they are coming from Login page for the first time.
      // We must ask them to select a role.
      if (!role) {
        return res.status(202).json({
          requiresSignup: true,
          email,
          name,
          picture,
          googleId // Send back so frontend can re-submit with role
        });
      }

      // Only "client" and "lawyer" are valid self-service roles
      const ALLOWED_ROLES = ["client", "lawyer"];
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'client' or 'lawyer'." });
      }

      // 4. Create new user (Role IS provided)
      user = await User.create({
        name,
        email,
        role,
        plan: "free",
        googleId,
        verified: role !== "lawyer", // lawyers need admin approval
        verificationStatus: role !== "lawyer" ? "verified" : "pending",
      });
    } else {
      // 5. Link googleId if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (user.role === "lawyer" && !user.verified) {
      return res.status(403).json({ message: "Your lawyer account is pending verification. Please wait until the administrator approves your credentials." });
    }

    // 5. Issue tokens
    issueTokens(res, user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res, next) => {
  try {
    const {
      role,
      name,
      email,
      password,
      emailToken,   // Required: short-lived token from /api/auth/verify-email
      plan,
      specialization,
      experience,
      location,
      phone,
      isStudent,
      studentRollNumber,
      barCouncilId,
      idCardImage
    } = req.body;

    if (
      (role && typeof role !== 'string') ||
      (name && typeof name !== 'string') ||
      (email && typeof email !== 'string') ||
      (password && typeof password !== 'string') ||
      (phone && typeof phone !== 'string')
    ) {
      return res.status(400).json({ message: "Invalid input types" });
    }

    // Only "client" and "lawyer" are valid self-service roles
    const REGISTER_ALLOWED_ROLES = ["client", "lawyer"];
    if (!role || !REGISTER_ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'client' or 'lawyer'." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Validate email verification token (issued by /api/auth/verify-email)
    if (!emailToken || typeof emailToken !== 'string') {
      return res.status(400).json({ message: "Email verification required. Please verify your email with OTP before registering." });
    }
    try {
      const decoded = jwt.verify(emailToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'email_verified' || decoded.email !== normalizedEmail) {
        return res.status(400).json({ message: "Email verification token does not match the provided email." });
      }
    } catch {
      return res.status(400).json({ message: "Email verification token is invalid or expired. Please re-verify your email." });
    }

    // Construct dynamic query to avoid matching everything with empty object
    const criteria = [{ email: normalizedEmail }];
    if (phone) criteria.push({ phone });

    const exists = await User.findOne({
      $or: criteria,
    });

    if (exists) {
      return res.status(400).json({
        message: "Email or Phone already registered",
      });
    }

    if (role === "lawyer") {
      if (!isStudent && !barCouncilId) {
        return res.status(400).json({ message: "Bar Council ID (BCI enrollment number) is required for lawyers." });
      }
      if (!isStudent) {
        const bciRegex = /^[A-Za-z]{2,3}\/\d+\/\d{4}$/;
        if (!bciRegex.test(barCouncilId.trim())) {
          return res.status(400).json({ message: "Invalid Bar Council ID format. Expected format: STATE/NUMBER/YEAR (e.g. MAH/1234/2024)" });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedPlan = plan ? plan.toLowerCase() : "free";

    // Lawyers always start unverified and go through admin approval.
    // Never trust client-supplied verificationStatus.
    const isVerified = role !== "lawyer";

    const user = await User.create({
      role,
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      plan: normalizedPlan,
      specialization,
      experience,
      location,
      isStudent: !!isStudent,
      studentRollNumber: studentRollNumber || "",
      barCouncilId: barCouncilId || "",
      idCardImage: idCardImage || "",
      verified: isVerified,
      verificationStatus: isVerified ? "verified" : "pending"
    });


    issueTokens(res, user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      phone: user.phone,
      verified: user.verified,
      verificationStatus: user.verificationStatus
    };

    res.json({ user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= OTP AUTH ================= */
const OtpEntry = require("../models/OtpEntry");
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const mail = require("../utils/mail");

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: "Email must be a string" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Per-email cooldown: max one OTP every 60 seconds
    const existing = await OtpEntry.findOne({ email: normalizedEmail });
    if (existing) {
      const elapsed = Date.now() - existing.updatedAt.getTime();
      if (elapsed < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - elapsed) / 1000);
        return res.status(429).json({ success: false, message: `Please wait ${secondsLeft}s before requesting a new OTP` });
      }
    }

    // Generate random 6-digit OTP
    const crypto = require("crypto");
    const otp = crypto.randomInt(100000, 999999).toString();

    // Send OTP via Brevo
    const result = await mail.sendVerificationEmail(normalizedEmail, otp);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }

    // Store in DB
    await OtpEntry.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP LOG] ${normalizedEmail} → [SENT] OTP: ${otp}`);
    }

    const isMockOrFallback = result.mock || result.fallback || process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: "OTP sent via Email",
      ...(isMockOrFallback ? { debugOtp: otp } : {})
    });
  } catch (err) {
    console.error("[send-otp] error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

/* ================= VERIFY EMAIL (for registration) ================= */
// Different from /verify-otp (which logs in the user).
// Returns a short-lived emailToken that the /register endpoint requires.
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: "Email and OTP must be strings" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const entry = await OtpEntry.findOne({ email: normalizedEmail });
    if (!entry) return res.status(400).json({ success: false, message: "OTP not found or already used" });
    if (new Date() > entry.expiresAt) {
      await OtpEntry.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }
    if (entry.attempts >= 5) {
      await OtpEntry.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: "Too many failed attempts" });
    }
    if (entry.otp !== otp) {
      await OtpEntry.findOneAndUpdate({ email: normalizedEmail }, { $inc: { attempts: 1 } });
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Consume the OTP
    await OtpEntry.deleteOne({ email: normalizedEmail });

    // Issue a short-lived "email verified" token — NOT a session token
    const emailToken = jwt.sign(
      { email: normalizedEmail, purpose: 'email_verified' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, emailToken });
  } catch (err) {
    console.error("[verify-email] error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: "Email and OTP must be strings" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const entry = await OtpEntry.findOne({ email: normalizedEmail });
    if (!entry) {
      return res.status(400).json({ success: false, message: "OTP not found or already used" });
    }
    if (new Date() > entry.expiresAt) {
      await OtpEntry.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const MAX_OTP_ATTEMPTS = 5;
    if (entry.attempts >= MAX_OTP_ATTEMPTS) {
      await OtpEntry.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    if (entry.otp !== otp) {
      const attemptsLeft = MAX_OTP_ATTEMPTS - entry.attempts - 1;
      await OtpEntry.findOneAndUpdate({ email: normalizedEmail }, { $inc: { attempts: 1 } });
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
      });
    }

    await OtpEntry.deleteOne({ email: normalizedEmail });

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        role: "client",
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: "",
        password: await bcrypt.hash(Date.now().toString(), 10),
        plan: "free",
        verified: true, // Verified since email is verified
      });

      if (process.env.NODE_ENV !== 'production') console.log("OTP USER CREATED:", user._id);
    }

    if (user.role === "lawyer" && !user.verified) {
      return res.status(403).json({ success: false, message: "Your lawyer account is pending verification. Please wait until the administrator approves your credentials." });
    }

    issueTokens(res, user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      phone: user.phone,
      verified: user.verified
    };

    res.json({ success: true, user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= LOGIN ================= */
router.post("/login",
  validate({ email: rules.email(), password: rules.string(1) }),
  async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: "Email and password must be strings" });
    }
    email = email.trim().toLowerCase();
    password = password.trim();

    if (isLoginLocked(email)) {
      return res.status(429).json({ message: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes." });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      recordLoginFailure(email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      recordLoginFailure(email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    resetLoginAttempts(email);

    if (user.role === "lawyer" && !user.verified) {
      return res.status(403).json({ message: "Your lawyer account is pending verification. Please wait until the administrator approves your credentials." });
    }

    issueTokens(res, user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      phone: user.phone
    };

    res.json({ user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= PASSWORD RESET ================= */
const sendResetEmail = async (email, token) => {
  await mail.sendPasswordResetEmail(email, token);
};

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email must be a string" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If the account exists, a reset link was sent" });
    }

    const token = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: "15m" });

    try {
      await sendResetEmail(email, token);
    } catch (e) {
      console.log("Email failed:", e.message);
    }
    res.json({ message: "If the account exists, a reset link was sent" });

  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ message: "Token and newPassword must be strings" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.purpose || decoded.purpose !== 'reset') {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// [DELETED] Backdoor reset routes removed for production hardening.


// [DELETED] Debug login route removed for production hardening.


/* ================= REFRESH TOKEN ================= */
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== "refresh") return res.status(401).json({ message: "Invalid token type" });

    const user = await User.findById(decoded.id).select("role plan tokenVersion");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.tokenVersion !== (decoded.version ?? 0)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    issueTokens(res, user);
    res.json({ success: true });
  } catch (err) {
    res.clearCookie("token",        { httpOnly: true, secure: true, sameSite: "none" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none", path: "/api/auth/refresh" });
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const cookieBase = { httpOnly: true, secure: true, sameSite: "none" };
  // Revoke refresh token by incrementing tokenVersion
  try {
    const token = req.cookies?.token || (req.headers["authorization"] || "").replace("Bearer ", "");
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });
      }
    }
  } catch { /* token already expired – still clear cookies */ }

  res.clearCookie("token",        { ...cookieBase });
  res.clearCookie("refreshToken", { ...cookieBase, path: "/api/auth/refresh" });
  res.json({ message: "Logged out successfully" });
});

// Update Profile handled by /api/users/me in users.js
module.exports = router;
