const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  refreshToken,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
