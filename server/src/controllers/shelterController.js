const asyncHandler = require("express-async-handler");
const Shelter = require("../models/Shelter");

// @desc    Create a relief camp / shelter
// @route   POST /api/ngo/shelter
// @access  Private (NGO, Admin)
const createShelter = asyncHandler(async (req, res) => {
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

// @desc    List shelters (optionally filter by district)
// @route   GET /api/shelter/all
// @access  Public
const getShelters = asyncHandler(async (req, res) => {
  const { district } = req.query;
  const filter = { isActive: true };
  if (district) filter.district = district;

  const shelters = await Shelter.find(filter).populate("managedBy", "name organizationName");
  res.json({ success: true, count: shelters.length, shelters });
});

// @desc    Update shelter occupancy / details
// @route   PUT /api/shelter/:id
// @access  Private (NGO who owns it, Admin)
const updateShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    res.status(404);
    throw new Error("Shelter not found");
  }

  Object.assign(shelter, req.body);
  const updated = await shelter.save();
  res.json({ success: true, shelter: updated });
});

module.exports = { createShelter, getShelters, updateShelter };
