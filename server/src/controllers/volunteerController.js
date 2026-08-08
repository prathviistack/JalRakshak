const asyncHandler = require("express-async-handler");
const EmergencyRequest = require("../models/EmergencyRequest");
const Notification = require("../models/Notification");
const { REQUEST_STATUS } = require("../constants");

// @desc    Get this volunteer's assigned tasks
// @route   GET /api/volunteer/tasks
// @access  Private (Volunteer)
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await EmergencyRequest.find({ volunteer: req.user._id })
    .populate("victim", "name phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: tasks.length, tasks });
});

// @desc    Accept a request — alias of PUT /api/request/update/:id with status=accepted
// @route   PUT /api/volunteer/accept/:id
// @access  Private (Volunteer)
const acceptTask = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  if (request.status !== REQUEST_STATUS.PENDING) {
    res.status(400);
    throw new Error("This request has already been accepted or resolved");
  }

  request.volunteer = req.user._id;
  request.status = REQUEST_STATUS.ACCEPTED;
  request.acceptedAt = new Date();
  await request.save();

  const notification = await Notification.create({
    user: request.victim,
    title: "Volunteer assigned",
    message: `${req.user.name} has accepted your ${request.type} request and is on the way.`,
    type: "request",
    relatedId: request._id,
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("requestAccepted", request);
    io.to(request.victim.toString()).emit("newNotification", notification);
  }

  res.json({ success: true, request });
});

// @desc    Mark a task complete — alias of PUT /api/request/update/:id with status=completed
// @route   PUT /api/volunteer/complete/:id
// @access  Private (Volunteer who owns the task)
const completeTask = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }
  if (request.volunteer?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the assigned volunteer can complete this task");
  }

  request.status = REQUEST_STATUS.COMPLETED;
  request.completedAt = new Date();
  await request.save();

  const io = req.app.get("io");
  if (io) io.emit("requestCompleted", request);

  res.json({ success: true, request });
});

module.exports = { getTasks, acceptTask, completeTask };
