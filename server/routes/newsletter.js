const express = require("express");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post("/subscribe", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return res.status(400).json({
      error: "Please enter a valid email address.",
      code: "INVALID_EMAIL",
    });
  }

  try {
    const existing = await NewsletterSubscriber.findOne({ email }).select("_id active").lean();

    if (existing) {
      if (!existing.active) {
        await NewsletterSubscriber.updateOne(
          { _id: existing._id },
          { $set: { active: true, consentedAt: new Date(), source: "website_footer" } }
        );
      }

      return res.json({
        message: "You're already subscribed to NyayNow updates.",
        alreadySubscribed: true,
      });
    }

    await NewsletterSubscriber.create({ email, source: "website_footer" });

    return res.status(201).json({
      message: "You're subscribed. Watch your inbox for NyayNow updates.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.json({
        message: "You're already subscribed to NyayNow updates.",
        alreadySubscribed: true,
      });
    }

    console.error("Newsletter subscribe error:", error.message);
    return res.status(500).json({
      error: "Could not save your subscription right now. Please try again later.",
    });
  }
});

module.exports = router;
