const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { ROLES } = require("../constants");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, state, district, organizationName } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: Object.values(ROLES).includes(role) ? role : ROLES.VICTIM,
    state: state || "Assam",
    district,
    organizationName,
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact an administrator.");
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

// @desc    Logout user (client discards tokens; endpoint provided for symmetry / future blacklist)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "state", "district", "skills", "isAvailable", "organizationName"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  const updated = await req.user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc    Exchange a valid refresh token for a new access token
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token in body)
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Refresh token invalid or expired, please log in again");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Account not found or deactivated");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  res.json({ success: true, accessToken, refreshToken: newRefreshToken });
});

module.exports = { registerUser, loginUser, logoutUser, getProfile, updateProfile, refreshToken };
