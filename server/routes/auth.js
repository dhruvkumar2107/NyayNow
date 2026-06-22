const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library"); // NEW
const User = require("../models/User");

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

      // 4. Create new user (Role IS provided)
      user = await User.create({
        name,
        email,
        role: role, // Now strictly required for creation
        plan: "free",
        googleId,
      });
    } else {
      // 5. Link googleId if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // 5. Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      token: jwtToken,
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


    // Construct dynamic query to avoid matching everything with empty object
    const criteria = [{ email }];
    if (phone) criteria.push({ phone });

    const exists = await User.findOne({
      $or: criteria,
    });

    if (exists) {
      return res.status(400).json({
        message: "Email or Phone already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedPlan = plan ? plan.toLowerCase() : "free";

    // DEFAULT VERIFIED STATUS
    // Lawyers/Students need verification
    // IF verificationStatus is passed as 'verified' (from DigiLocker flow), we respect it.
    let isVerified = true;
    if (role === "lawyer") {
      isVerified = req.body.verificationStatus === "verified";
    }

    const user = await User.create({
      role,
      name,
      email,
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


    const token = jwt.sign(
      { id: user._id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

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

    res.json({ token, user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= OTP AUTH ================= */
const OtpEntry = require("../models/OtpEntry");
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const mtalkzOtp = require("../utils/mtalkzOtp");

/**
 * Normalize phone: strip spaces, remove +91 / 91 prefix if present,
 * then prepend 91 for a clean MSISDN.
 */
function normalizePhone(raw) {
  let p = raw.replace(/[\s\-()]/g, "");
  if (p.startsWith("+91")) p = p.slice(3);
  else if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  if (p.length === 10) p = "91" + p;
  return p;
}

router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: "Phone number must be a string" });
    }

    const normalizedPhone = normalizePhone(phone);

    const result = await mtalkzOtp.generateOTP(normalizedPhone);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }

    // Store a placeholder OTP and the sessionId for later verification
    const crypto = require("crypto");
    const placeholderOtp = crypto.randomInt(100000, 999999).toString();

    await OtpEntry.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        otp: placeholderOtp,
        sessionId: result.sessionId || null,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
      { upsert: true, new: true }
    );

    console.log(`[OTP LOG] ${normalizedPhone} → [SENT] sessionId=${result.sessionId}`);

    res.json({ success: true, message: "OTP sent via SMS" });
  } catch (err) {
    console.error("[send-otp] error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || typeof phone !== 'string' || !otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: "Phone and OTP must be strings" });
    }

    const normalizedPhone = normalizePhone(phone);

    const entry = await OtpEntry.findOne({ phone: normalizedPhone });
    if (!entry) {
      return res.status(400).json({ success: false, message: "OTP not found or already used" });
    }
    if (new Date() > entry.expiresAt) {
      await OtpEntry.deleteOne({ phone: normalizedPhone });
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Verify: use mTalkz sessionId if available, otherwise fall back to local comparison
    let verified = false;
    if (entry.sessionId) {
      const result = await mtalkzOtp.verifyOTP(entry.sessionId, otp);
      verified = result.success;
    } else {
      verified = entry.otp === otp;
    }

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await OtpEntry.deleteOne({ phone: normalizedPhone });

    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      user = await User.create({
        role: "client",
        name: `User ${normalizedPhone.slice(-4)}`,
        email: `${normalizedPhone}@mobile.user`,
        phone: normalizedPhone,
        password: await bcrypt.hash(Date.now().toString(), 10),
        plan: "free",
        verified: false,
      });

      console.log("OTP USER CREATED:", user._id);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      phone: user.phone,
      verified: user.verified
    };

    res.json({ success: true, token, user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: "Email and password must be strings" });
    }
    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      phone: user.phone
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    next(err);
  }
});

/* ================= PASSWORD RESET ================= */
// Simple Nodemailer Setup (Mock for now if creds missing)
const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Nodemailer credentials missing. Reset token printed to server log.");
    console.log(`[RESET LINK] ${email} -> ${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;

  await transporter.sendMail({
    from: "NyayNow Support <support@nyaynow.com>",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 15 mins.</p>`
  });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// [DELETED] Backdoor reset routes removed for production hardening.


// [DELETED] Debug login route removed for production hardening.


// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json({ message: "Logged out successfully" });
});

// Update Profile handled by /api/users/me in users.js
module.exports = router;
