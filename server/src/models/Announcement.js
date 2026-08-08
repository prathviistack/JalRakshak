const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // NGO or Admin
    title: { type: String, required: true },
    body: { type: String, required: true, maxlength: 2000 },
    state: { type: String, default: "Assam" },
    district: { type: String }, // omit to broadcast state-wide
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
