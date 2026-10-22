const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      default: "website_footer",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    consentedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.NewsletterSubscriber
  || mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
