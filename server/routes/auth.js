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
      { expiresIn: "7d" }
    );

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
router.post("/register", async (req, res) => {
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
      // VERIFICATION FIELDS
      isStudent,
      studentRollNumber,
      barCouncilId,
      idCardImage
    } = req.body;


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
      // NEW FIELDS
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
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= OTP AUTH ================= */
// TTL-based OTP store — entries auto-expire after 10 minutes
const OTP_STORE = new Map(); // phone -> { otp, expiresAt }
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Cleanup stale OTP entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of OTP_STORE.entries()) {
    if (now > entry.expiresAt) {
      OTP_STORE.delete(phone);
    }
  }
}, 5 * 60 * 1000);

const { sendSMS } = require("../utils/sms");

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  OTP_STORE.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS });

  // Send via Twilio
  // If keys are missing, it will log mock SMS to console automatically
  await sendSMS(phone, `Your NyayNow verification code is: ${otp}. Valid for 10 minutes.`);

  console.log(`[OTP LOG] ${phone} → [SENT]`);

  res.json({ message: "OTP sent via SMS" });
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const entry = OTP_STORE.get(phone);
    if (!entry) {
      return res.status(400).json({ message: "OTP not found or already used" });
    }
    if (Date.now() > entry.expiresAt) {
      OTP_STORE.delete(phone);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    if (entry.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    OTP_STORE.delete(phone);

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        role: "client",
        name: `User ${phone.slice(-4)}`,
        email: `${phone}@mobile.user`,
        phone,
        password: await bcrypt.hash(Date.now().toString(), 10),
        plan: "free",
        verified: false,
      });

      console.log("OTP USER CREATED:", user._id);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
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
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= PASSWORD RESET ================= */
// Simple Nodemailer Setup (Mock for now if creds missing)
const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "support@nyaynow.com", // Add to .env
      pass: process.env.EMAIL_PASS || "your_app_password"
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

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // In production, use real email service.
    // console.log("Reset Link:", `http://localhost:5173/reset-password/${token}`);

    try {
      await sendResetEmail(email, token);
      res.json({ message: "Reset link sent to email" });
    } catch (e) {
      console.log("Email failed:", e.message);
      res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// [DELETED] Backdoor reset routes removed for production hardening.


// [DELETED] Debug login route removed for production hardening.


// Update Profile handled by /api/users/me in users.js
module.exports = router;
