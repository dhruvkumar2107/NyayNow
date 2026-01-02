const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["client", "lawyer"],
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
      required: true,
    },

    plan: {
      type: String,
      enum: ["silver", "gold", "diamond"],
      default: "silver",
    },

    specialization: String,
    experience: Number,

    location: {
      city: String,
      lat: Number,
      lng: Number,
    },

    resume: String,

    stats: {
      profileViews: { type: Number, default: 0 },
      searchAppearances: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 }
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
