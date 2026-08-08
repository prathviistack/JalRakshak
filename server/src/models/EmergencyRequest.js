const mongoose = require("mongoose");
const {
  REQUEST_STATUS,
  REQUEST_URGENCY,
  REQUEST_TYPE,
} = require("../constants");

const emergencyRequestSchema = new mongoose.Schema(
  {
    victim: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    type: {
      type: String,
      enum: Object.values(REQUEST_TYPE),
      required: true,
    },
    urgency: {
      type: String,
      enum: Object.values(REQUEST_URGENCY),
      default: REQUEST_URGENCY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },

    description: { type: String, required: true, maxlength: 1000 },
    numberOfPeople: { type: Number, default: 1, min: 1 },

    state: { type: String, default: "Assam" },
    district: { type: String, required: true },
    address: { type: String },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    media: [{ url: String, publicId: String, type: String }],

    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

emergencyRequestSchema.index({ location: "2dsphere" });
emergencyRequestSchema.index({ status: 1, district: 1 });

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);
