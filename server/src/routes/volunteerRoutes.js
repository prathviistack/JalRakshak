const express = require("express");
const { getTasks, acceptTask, completeTask } = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/tasks", protect, allowRoles(ROLES.VOLUNTEER), getTasks);
router.put("/accept/:id", protect, allowRoles(ROLES.VOLUNTEER), acceptTask);
router.put("/complete/:id", protect, allowRoles(ROLES.VOLUNTEER), completeTask);

module.exports = router;
