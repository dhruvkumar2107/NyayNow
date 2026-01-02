const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "#BharatiyaNyayaSanhita"
    count: { type: Number, default: 0 }, // e.g., 24000
    category: { type: String, default: "Legal" }
});

module.exports = mongoose.model("Topic", topicSchema);
