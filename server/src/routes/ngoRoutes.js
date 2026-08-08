const express = require("express");
const {
  createAnnouncement,
  getAnnouncements,
  createResourceAlias,
  getOwnResources,
  createShelterAlias,
} = require("../controllers/ngoController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/announcement", getAnnouncements);
router.post("/announcement", protect, allowRoles(ROLES.NGO, ROLES.ADMIN), createAnnouncement);

router.post("/resource", protect, allowRoles(ROLES.NGO), createResourceAlias);
router.get("/resources", protect, allowRoles(ROLES.NGO), getOwnResources);
router.post("/shelter", protect, allowRoles(ROLES.NGO), createShelterAlias);

module.exports = router;
