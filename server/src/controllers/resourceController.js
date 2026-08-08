const asyncHandler = require("express-async-handler");
const Resource = require("../models/Resource");

// @desc    Add a resource entry
// @route   POST /api/resource/
// @access  Private (NGO, Admin)
const createResource = asyncHandler(async (req, res) => {
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

// @desc    List resources (filterable)
// @route   GET /api/resource/all
// @access  Private
const getResources = asyncHandler(async (req, res) => {
  const { district, category, status } = req.query;
  const filter = {};
  if (district) filter.district = district;
  if (category) filter.category = category;
  if (status) filter.status = status;

  const resources = await Resource.find(filter).populate("providedBy", "name organizationName");
  res.json({ success: true, count: resources.length, resources });
});

module.exports = { createResource, getResources };
