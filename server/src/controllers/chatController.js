const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// @desc    Get or create a 1:1 chat, optionally scoped to an emergency request
// @route   POST /api/chat/start
// @access  Private
const startChat = asyncHandler(async (req, res) => {
  const { participantId, requestId } = req.body;

  if (!participantId) {
    res.status(400);
    throw new Error("participantId is required");
  }

  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, participantId], $size: 2 },
    ...(requestId ? { request: requestId } : {}),
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      request: requestId || undefined,
    });
  }

  res.status(201).json({ success: true, chat });
});

// @desc    List the current user's chats, most recent first
// @route   GET /api/chat/all
// @access  Private
const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate("participants", "name role avatarUrl")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  res.json({ success: true, chats });
});

// @desc    Get messages for a chat
// @route   GET /api/chat/:id/messages
// @access  Private (must be a participant)
const getMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat || !chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Not authorized to view this chat");
  }

  const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 }).populate("sender", "name role");
  res.json({ success: true, messages });
});

// @desc    Send a message in a chat
// @route   POST /api/chat/:id/messages
// @access  Private (must be a participant)
const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const chat = await Chat.findById(req.params.id);
  if (!chat || !chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Not authorized to message in this chat");
  }

  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    text: text.trim(),
    readBy: [req.user._id],
  });

  chat.lastMessage = text.trim();
  chat.lastMessageAt = new Date();
  await chat.save();

  const populated = await message.populate("sender", "name role");

  const io = req.app.get("io");
  if (io) {
    chat.participants.forEach((participantId) => {
      io.to(participantId.toString()).emit("newMessage", { chatId: chat._id.toString(), message: populated });
    });
  }

  res.status(201).json({ success: true, message: populated });
});

module.exports = { startChat, getMyChats, getMessages, sendMessage };
