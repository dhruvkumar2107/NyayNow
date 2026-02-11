const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["client", "lawyer", "admin"],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      default: null,
    },

    sex: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      // required: true, (Removed for Social Login support)
    },

    plan: {
      type: String,
      enum: ["free", "silver", "gold", "diamond"],
      default: "free",
    },

    aiUsage: {
      count: { type: Number, default: 0 },
      firstUsedAt: { type: Date, default: null },
    },

    specialization: String,
    experience: Number,

    location: {
      city: String,
      state: String, // Added for State Filtering
      lat: Number,
      lng: Number,
    },

    resume: String,

    // --- NEW PROFILE FIELDS ---
    bio: { type: String, default: "" }, // About Me
    headline: { type: String, default: "" }, // e.g. "Ex-High Court Judge | Family Law Expert"

    profileImage: { type: String, default: "" }, // URL from Uploads

    languages: { type: [String], default: ["English", "Hindi"] },

    courts: { type: [String], default: [] }, // Supreme Court, High Court, etc.

    education: [{
      degree: String,
      college: String,
      year: Number
    }],

    awards: [String], // "Best Lawyer 2024"

    socials: {
      linkedin: String,
      website: String,
      twitter: String
    },

    consultationFee: { type: Number, default: 0 }, // Per hour/session

    availability: {
      type: String,
      default: "Mon-Fri, 9am - 6pm"
    },

    isProfileComplete: { type: Boolean, default: false }, // For gamification/prompting
    // --------------------------

    stats: {
      profileViews: { type: Number, default: 0 },
      searchAppearances: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
      casesSolved: { type: Number, default: 0 },
      successRate: { type: Number, default: 95 }, // Percentage
      yearsExperience: { type: Number, default: 0 }
    },

    // Enterprise Profile 2.0
    videoIntro: { type: String, default: "" }, // Youtube/Vimeo URL
    awards: [{
      title: String,
      year: Number,
      issuer: String
    }],
    faqs: [{
      question: String,
      answer: String
    }],
    mediaMentions: [{
      outlet: String, // e.g. "Times of India"
      url: String
    }],

    // VERIFICATION SYSTEM
    barCouncilId: { type: String, default: "" }, // e.g. MAH/2345/2020
    idCardImage: { type: String, default: "" },  // URL of uploaded ID
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified"
    },
    rejectionReason: { type: String, default: "" },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
