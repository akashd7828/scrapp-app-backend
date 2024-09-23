const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getProfile,
  refreshAccessToken,
} = require("../controllers/user.controller");
const {
  authorizeAdmin,
  authorizeUser,
  authenticateJWT,
} = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authorizeUser, loginUser);
router.get("/refresh-token", refreshAccessToken);
router.post("/admin/login", authorizeAdmin, loginUser);
router.get("/all", authenticateJWT, authorizeAdmin, getAllUsers);
router.get("/profile", authenticateJWT, authorizeUser, getProfile);
module.exports = router;
