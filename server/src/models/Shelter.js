const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // NGO/Admin

    state: { type: String, default: "Assam" },
    district: { type: String, required: true },
    address: { type: String, required: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },

    capacity: { type: Number, required: true, min: 1 },
    currentOccupancy: { type: Number, default: 0, min: 0 },

    facilities: [{ type: String }], // e.g. ["medical", "food", "water", "power"]
    contactPhone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

shelterSchema.index({ location: "2dsphere" });

shelterSchema.virtual("occupancyRate").get(function occupancyRate() {
  return this.capacity ? Math.round((this.currentOccupancy / this.capacity) * 100) : 0;
});
shelterSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Shelter", shelterSchema);
