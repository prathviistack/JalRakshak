const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc    List all users, filterable by role/district
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, district } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (district) filter.district = district;

  const users = await User.find(filter).select("-password");
  res.json({ success: true, count: users.length, users });
});

// @desc    Activate/deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = !!isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Verify an NGO account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyNGO = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "ngo") {
    res.status(404);
    throw new Error("NGO account not found");
  }
  user.verified = true;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = { getUsers, setUserActiveStatus, verifyNGO };
