const asyncHandler = require("express-async-handler");
const EmergencyRequest = require("../models/EmergencyRequest");
const Shelter = require("../models/Shelter");

// @desc    Platform-wide summary stats
// @route   GET /api/analytics/summary
// @access  Private (Admin, NGO)
const getSummary = asyncHandler(async (req, res) => {
  const [requestsByStatus, requestsByDistrict, shelterOccupancy] = await Promise.all([
    EmergencyRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    EmergencyRequest.aggregate([{ $group: { _id: "$district", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Shelter.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: "$capacity" },
          totalOccupancy: { $sum: "$currentOccupancy" },
          camps: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    requestsByStatus,
    requestsByDistrict,
    shelterSummary: shelterOccupancy[0] || { totalCapacity: 0, totalOccupancy: 0, camps: 0 },
  });
});

// @desc    Average volunteer response time (accept - create), in minutes
// @route   GET /api/analytics/response-time
// @access  Private (Admin, NGO)
const getResponseTime = asyncHandler(async (req, res) => {
  const result = await EmergencyRequest.aggregate([
    { $match: { acceptedAt: { $ne: null } } },
    {
      $project: {
        district: 1,
        responseMinutes: { $divide: [{ $subtract: ["$acceptedAt", "$createdAt"] }, 60000] },
      },
    },
    { $group: { _id: "$district", avgResponseMinutes: { $avg: "$responseMinutes" } } },
  ]);

  res.json({ success: true, responseTimeByDistrict: result });
});

module.exports = { getSummary, getResponseTime };
