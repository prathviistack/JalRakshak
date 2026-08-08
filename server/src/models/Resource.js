const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    providedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // NGO
    shelter: { type: mongoose.Schema.Types.ObjectId, ref: "Shelter" },

    name: { type: String, required: true }, // e.g. "Drinking water (5L cans)"
    category: {
      type: String,
      enum: ["food", "water", "medical", "clothing", "shelter_material", "other"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "units" }, // kg, litres, packets, units

    state: { type: String, default: "Assam" },
    district: { type: String, required: true },

    status: {
      type: String,
      enum: ["available", "allocated", "depleted"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
