const express = require("express");
const { getSummary, getResponseTime } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/summary", protect, allowRoles(ROLES.ADMIN, ROLES.NGO), getSummary);
router.get("/response-time", protect, allowRoles(ROLES.ADMIN, ROLES.NGO), getResponseTime);

module.exports = router;
