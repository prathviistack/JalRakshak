const express = require("express");
const { createResource, getResources } = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/all", getResources);
router.post("/", protect, allowRoles(ROLES.NGO, ROLES.ADMIN), createResource);

module.exports = router;
