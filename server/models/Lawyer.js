const mongoose = require("mongoose");

const LawyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true }, // years
    location: { type: String, required: true },
    fee: { type: Number, required: true },
    about: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lawyer", LawyerSchema);
