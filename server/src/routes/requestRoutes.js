const express = require("express");
const {
  createRequest,
  getRequests,
  getNearbyRequests,
  updateRequest,
  deleteRequest,
  addRequestMedia,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { validateCreateRequest } = require("../validators/requestValidators");
const { ROLES } = require("../constants");

const router = express.Router();

router.post("/create", protect, allowRoles(ROLES.VICTIM), validateCreateRequest, createRequest);
router.get("/all", protect, getRequests);
router.get("/nearby", protect, allowRoles(ROLES.VOLUNTEER), getNearbyRequests);
router.put("/update/:id", protect, updateRequest);
router.delete("/delete/:id", protect, deleteRequest);
router.post("/:id/media", protect, allowRoles(ROLES.VICTIM), upload.array("files", 5), addRequestMedia);

module.exports = router;
