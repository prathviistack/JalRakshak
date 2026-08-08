const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    request: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyRequest" }, // optional context
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
