const express = require("express");
const { getAlerts, createAlert } = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/alerts", getAlerts);
router.post("/alerts", protect, allowRoles(ROLES.NGO, ROLES.ADMIN), createAlert);

module.exports = router;
