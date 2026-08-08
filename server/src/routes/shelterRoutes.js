const express = require("express");
const { createShelter, getShelters, updateShelter } = require("../controllers/shelterController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/all", getShelters);
router.post("/", protect, allowRoles(ROLES.NGO, ROLES.ADMIN), createShelter);
router.put("/:id", protect, allowRoles(ROLES.NGO, ROLES.ADMIN), updateShelter);

module.exports = router;
