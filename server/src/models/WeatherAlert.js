const mongoose = require("mongoose");

const weatherAlertSchema = new mongoose.Schema(
  {
    state: { type: String, default: "Assam" },
    district: { type: String, required: true },
    severity: {
      type: String,
      enum: ["advisory", "watch", "warning", "severe"],
      required: true,
    },
    headline: { type: String, required: true },
    description: { type: String },
    source: { type: String, default: "manual" }, // "manual" or the weather API provider name
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

weatherAlertSchema.index({ district: 1, validUntil: 1 });

module.exports = mongoose.model("WeatherAlert", weatherAlertSchema);
