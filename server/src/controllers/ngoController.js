const asyncHandler = require("express-async-handler");
const Announcement = require("../models/Announcement");
const Resource = require("../models/Resource");
const Shelter = require("../models/Shelter");

// @desc    Post an announcement to a district (or state-wide)
// @route   POST /api/ngo/announcement
// @access  Private (NGO, Admin)
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, district, pinned } = req.body;

  if (!title || !body) {
    res.status(400);
    throw new Error("title and body are required");
  }

  const announcement = await Announcement.create({
    postedBy: req.user._id,
    title,
    body,
    state: req.user.state || "Assam",
    district,
    pinned,
  });

  const io = req.app.get("io");
  if (io) io.emit("newAnnouncement", announcement);

  res.status(201).json({ success: true, announcement });
});

// @desc    List announcements (optionally filtered by district)
// @route   GET /api/ngo/announcement
// @access  Public
const getAnnouncements = asyncHandler(async (req, res) => {
  const { district } = req.query;
  const filter = district ? { $or: [{ district }, { district: { $exists: false } }] } : {};

  const announcements = await Announcement.find(filter)
    .populate("postedBy", "name organizationName")
    .sort({ pinned: -1, createdAt: -1 })
    .limit(50);

  res.json({ success: true, announcements });
});

// @desc    Create a resource entry — alias of POST /api/resource for spec parity
// @route   POST /api/ngo/resource
// @access  Private (NGO)
const createResourceAlias = asyncHandler(async (req, res) => {
  const { name, category, quantity, unit, district, shelter } = req.body;
  if (!name || !category || quantity === undefined || !district) {
    res.status(400);
    throw new Error("name, category, quantity, and district are required");
  }
  const resource = await Resource.create({
    providedBy: req.user._id,
    shelter,
    name,
    category,
    quantity,
    unit,
    state: req.user.state || "Assam",
    district,
  });
  res.status(201).json({ success: true, resource });
});

// @desc    List this NGO's resources — alias of GET /api/resource/all for spec parity
// @route   GET /api/ngo/resources
// @access  Private (NGO)
const getOwnResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ providedBy: req.user._id });
  res.json({ success: true, count: resources.length, resources });
});

// @desc    Create a shelter — alias of POST /api/shelter for spec parity
// @route   POST /api/ngo/shelter
// @access  Private (NGO)
const createShelterAlias = asyncHandler(async (req, res) => {
  const { name, district, address, capacity, lng, lat, facilities, contactPhone } = req.body;
  if (!name || !district || !address || !capacity || lng === undefined || lat === undefined) {
    res.status(400);
    throw new Error("name, district, address, capacity, and coordinates are required");
  }
  const shelter = await Shelter.create({
    name,
    managedBy: req.user._id,
    state: req.user.state || "Assam",
    district,
    address,
    capacity,
    location: { type: "Point", coordinates: [lng, lat] },
    facilities,
    contactPhone,
  });
  res.status(201).json({ success: true, shelter });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  createResourceAlias,
  getOwnResources,
  createShelterAlias,
};
