const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

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
    } = req.body;

    console.log("REGISTER BODY:", req.body);

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

    const normalizedPlan = plan ? plan.toLowerCase() : "silver";

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
    });

    console.log("USER SAVED:", user._id);

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
const OTP_STORE = new Map();

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  OTP_STORE.set(phone, otp);

  console.log(`[OTP] ${phone} → ${otp}`);

  res.json({ message: "OTP sent", mockOtp: otp });
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (OTP_STORE.get(phone) !== otp) {
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
        plan: "silver",
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
    const { email, password } = req.body;

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

module.exports = router;
