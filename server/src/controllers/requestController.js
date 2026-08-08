const asyncHandler = require("express-async-handler");
const EmergencyRequest = require("../models/EmergencyRequest");
const Notification = require("../models/Notification");
const { uploadBuffer } = require("../services/CloudinaryService");
const { ROLES, REQUEST_STATUS } = require("../constants");

// @desc    Create a new SOS / emergency request
// @route   POST /api/request/create
// @access  Private (Victim)
const createRequest = asyncHandler(async (req, res) => {
  const { type, urgency, description, numberOfPeople, district, address, lng, lat } = req.body;

  if (!type || !description || !district || lng === undefined || lat === undefined) {
    res.status(400);
    throw new Error("type, description, district, and coordinates (lng, lat) are required");
  }

  const request = await EmergencyRequest.create({
    victim: req.user._id,
    type,
    urgency,
    description,
    numberOfPeople,
    state: req.user.state || "Assam",
    district,
    address,
    location: { type: "Point", coordinates: [lng, lat] },
  });

  const io = req.app.get("io");
  if (io) io.emit("newEmergency", request);

  res.status(201).json({ success: true, request });
});

// @desc    Get all requests (filterable by status/district; victims see only their own)
// @route   GET /api/request/all
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  const { status, district, urgency, type } = req.query;
  const filter = {};

  if (req.user.role === ROLES.VICTIM) filter.victim = req.user._id;
  if (req.user.role === ROLES.VOLUNTEER && status === "assigned") filter.volunteer = req.user._id;

  if (status && status !== "assigned") filter.status = status;
  if (district) filter.district = district;
  if (urgency) filter.urgency = urgency;
  if (type) filter.type = type;

  const requests = await EmergencyRequest.find(filter)
    .populate("victim", "name phone")
    .populate("volunteer", "name phone")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, requests });
});

// @desc    Get nearby pending requests for volunteers
// @route   GET /api/request/nearby?lng=&lat=&maxDistance=
// @access  Private (Volunteer)
const getNearbyRequests = asyncHandler(async (req, res) => {
  const { lng, lat, maxDistance = 15000 } = req.query;

  if (lng === undefined || lat === undefined) {
    res.status(400);
    throw new Error("lng and lat query params are required");
  }

  const requests = await EmergencyRequest.find({
    status: REQUEST_STATUS.PENDING,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(maxDistance, 10),
      },
    },
  }).populate("victim", "name phone");

  res.json({ success: true, count: requests.length, requests });
});

// @desc    Update a request (accept / progress / status change)
// @route   PUT /api/request/update/:id
// @access  Private (Volunteer accepts; Victim/Admin can update other fields)
const updateRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const { status, ...rest } = req.body;

  if (status === REQUEST_STATUS.ACCEPTED) {
    if (req.user.role !== ROLES.VOLUNTEER) {
      res.status(403);
      throw new Error("Only volunteers can accept requests");
    }
    request.volunteer = req.user._id;
    request.acceptedAt = new Date();
  }

  if (status === REQUEST_STATUS.COMPLETED) {
    request.completedAt = new Date();
  }

  if (status) request.status = status;
  Object.assign(request, rest);

  const updated = await request.save();

  const io = req.app.get("io");
  if (io) {
    if (status === REQUEST_STATUS.ACCEPTED) io.emit("requestAccepted", updated);
    if (status === REQUEST_STATUS.COMPLETED) io.emit("requestCompleted", updated);
  }

  const notification = await Notification.create({
    user: updated.victim,
    title: "Request update",
    message: `Your ${updated.type} request is now "${updated.status}".`,
    type: "request",
    relatedId: updated._id,
  });

  if (io) io.to(updated.victim.toString()).emit("newNotification", notification);

  res.json({ success: true, request: updated });
});

// @desc    Delete / cancel a request
// @route   DELETE /api/request/delete/:id
// @access  Private (Victim who owns it, or Admin)
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const isOwner = request.victim.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== ROLES.ADMIN) {
    res.status(403);
    throw new Error("Not authorized to delete this request");
  }

  await request.deleteOne();
  res.json({ success: true, message: "Request deleted" });
});

// @desc    Attach photo/video evidence to an existing request
// @route   POST /api/request/:id/media
// @access  Private (Victim who owns the request)
const addRequestMedia = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (request.victim.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to add media to this request");
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const uploaded = await Promise.all(
    req.files.map((file) => uploadBuffer(file.buffer, { folder: "jalrakshak/requests" }))
  );

  request.media.push(...uploaded);
  await request.save();

  res.status(201).json({ success: true, media: request.media });
});

module.exports = {
  createRequest,
  getRequests,
  getNearbyRequests,
  updateRequest,
  deleteRequest,
  addRequestMedia,
};
