const express = require("express");
const { startChat, getMyChats, getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", protect, startChat);
router.get("/all", protect, getMyChats);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);

module.exports = router;
