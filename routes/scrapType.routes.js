const express = require("express");
const {
  createScrapType,
  getScrapTypes,
  deleteScrapType,
  updateScrapType,
} = require("../controllers/scrapType.controller");

const router = express.Router();

router.post("", createScrapType);
router.get("", getScrapTypes);
router.delete("/:id", deleteScrapType);
router.put("/:id", updateScrapType);

module.exports = router;
