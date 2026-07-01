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
      select: false,
      // required: true, (Removed for Social Login support)
    },

    plan: {
      type: String,
      enum: ["free", "silver", "gold", "diamond", "pro", "firm"],
      default: "free",
    },

    credits: {
      type: Number,
      default: 5,
    },

    aiUsage: {
      count: { type: Number, default: 0 },
      firstUsedAt: { type: Date, default: null },
    },

    // ─── PER-FEATURE MONTHLY USAGE (Paywall) ─────────────────────────────
    // Keyed by feature name e.g. 'assistant', 'legal-research', etc.
    featureUsage: {
      type: Map,
      of: new mongoose.Schema({
        count: { type: Number, default: 0 },
        resetAt: { type: Date, default: null }
      }, { _id: false }),
      default: {}
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

    profileImage: { type: String, default: "" }, // URL from Uploads

    languages: { type: [String], default: ["English", "Hindi"] },

    courts: { type: [String], default: [] }, // Supreme Court, High Court, etc.

    education: [{
      degree: String,
      college: String,
      year: Number
    }],

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
      yearsExperience: { type: Number, default: 0 }
    },

    listingTier: {
      type: String,
      enum: ["free", "standard", "premium"],
      default: "free"
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    listingEndDate: { type: Date, default: null },

    // ─── SUBSCRIPTION TRACKING ───────────────────────────────
    subscriptionId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled", "past_due"],
      default: "inactive"
    },
    subscriptionEndDate: { type: Date, default: null },
    lastPaymentId: { type: String, default: null },

    // ─── REFERRAL SYSTEM ─────────────────────────────────────
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralCount: { type: Number, default: 0 },

    // VERIFICATION SYSTEM
    barCouncilId: { type: String, default: "" }, // e.g. MAH/2345/2020
    idCardImage: { type: String, default: "" },  // URL of uploaded ID
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified"
    },
    rejectionReason: { type: String, default: "" },

    // STUDENT FIELDS
    isStudent: { type: Boolean, default: false },
    studentRollNumber: { type: String, default: "" },

    verified: {
      type: Boolean,
      default: false,
    },

    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
      },
      privacy: {
        profileVisible: { type: Boolean, default: true },
        showStatus: { type: Boolean, default: true }
      },
      theme: { type: String, default: 'Dark' }
    },

    // Token version — increment on logout to invalidate all refresh tokens
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("role")) {
    try {
      const AuditLog = require("./AuditLog");
      let oldRole = null;
      if (!this.isNew) {
        const doc = await mongoose.model("User").findById(this._id).select("role");
        if (doc) oldRole = doc.role;
      }
      await AuditLog.create({
        userId: this._id,
        action: this.isNew ? "role_created" : "role_changed",
        oldRole,
        newRole: this.role,
        timestamp: new Date()
      });
      console.log(`🔒 Audit Log: Role updated for ${this._id} from ${oldRole} to ${this.role}`);
    } catch (err) {
      console.error("❌ Failed to create role change audit log:", err.message);
    }
  }
  next();
});


const { syncLawyer, deleteRecord } = require("../utils/algolia");

// userSchema.post("save", function (doc) {
//   if (doc.role === "lawyer") {
//     syncLawyer(doc);
//   }
// });

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const userId = doc._id;

    // 1. Delete associated Lawyers in Algolia
    if (doc.role === "lawyer") {
      const { deleteRecord } = require("../utils/algolia");
      deleteRecord("lawyers", userId.toString());
    }

    // 2. Cascade Delete all related collections
    const Case = mongoose.model("Case");
    const Invoice = mongoose.model("Invoice");
    const Message = mongoose.model("Message");
    const Connection = mongoose.model("Connection");
    const Appointment = mongoose.model("Appointment");

    try {
      await Promise.all([
        Case.deleteMany({ $or: [{ client: userId }, { lawyer: userId }] }),
        Invoice.deleteMany({ $or: [{ clientId: userId }, { lawyerId: userId }] }),
        Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }),
        Connection.deleteMany({ $or: [{ clientId: userId }, { lawyerId: userId }] }),
        Appointment.deleteMany({ $or: [{ clientId: userId }, { lawyerId: userId }] })
      ]);
      console.log(`🗑️ Deep Delete completed for User: ${userId}`);
    } catch (err) {
      console.error(`❌ Cascade Delete Error for ${userId}:`, err.message);
    }
  }
});

// ─── INDEXES ─────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, verificationStatus: 1 });
userSchema.index({ 'location.lat': 1, 'location.lng': 1 });
userSchema.index({ plan: 1 });
userSchema.index({ isFeatured: -1, listingTier: 1 });
userSchema.index({ referralCode: 1 }, { sparse: true });
userSchema.index({ subscriptionStatus: 1, subscriptionEndDate: 1 });

module.exports = mongoose.model("User", userSchema);
