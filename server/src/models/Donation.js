const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null for anonymous
    donorName: { type: String }, // used when donor is anonymous or not a registered user
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    purpose: { type: String }, // e.g. "shelter supplies", "medical aid"
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    transactionRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
