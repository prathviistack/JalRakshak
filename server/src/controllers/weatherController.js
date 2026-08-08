const asyncHandler = require("express-async-handler");
const WeatherAlert = require("../models/WeatherAlert");

// @desc    List active weather alerts, optionally by district
// @route   GET /api/weather/alerts
// @access  Public
const getAlerts = asyncHandler(async (req, res) => {
  const { district } = req.query;
  const filter = { $or: [{ validUntil: null }, { validUntil: { $gte: new Date() } }] };
  if (district) filter.district = district;

  const alerts = await WeatherAlert.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, alerts });
});

// @desc    Manually create a weather alert (e.g. from an NGO/admin who has ground info,
//          or from the scheduled job in jobs/weatherAlertJob.js)
// @route   POST /api/weather/alerts
// @access  Private (Admin, NGO)
const createAlert = asyncHandler(async (req, res) => {
  const { district, severity, headline, description, validUntil } = req.body;

  if (!district || !severity || !headline) {
    res.status(400);
    throw new Error("district, severity, and headline are required");
  }

  const alert = await WeatherAlert.create({
    state: req.user.state || "Assam",
    district,
    severity,
    headline,
    description,
    source: "manual",
    validUntil,
  });

  const io = req.app.get("io");
  if (io) io.emit("weatherAlert", alert);

  res.status(201).json({ success: true, alert });
});

module.exports = { getAlerts, createAlert };
