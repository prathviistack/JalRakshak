const express = require("express");
const { getUsers, setUserActiveStatus, verifyNGO } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.use(protect, allowRoles(ROLES.ADMIN));

router.get("/users", getUsers);
router.put("/users/:id/status", setUserActiveStatus);
router.put("/users/:id/verify", verifyNGO);

module.exports = router;
