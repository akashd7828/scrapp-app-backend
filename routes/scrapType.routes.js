const express = require("express");
const {
  createScrapType,
  getScrapTypes,
} = require("../controllers/scrapType.controller");
const {
  authorizeAdmin,
  authenticateJWT,
} = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("", createScrapType);
router.get("", getScrapTypes);

module.exports = router;
