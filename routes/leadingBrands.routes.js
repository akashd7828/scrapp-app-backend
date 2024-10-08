const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  leadingBrandsUpload,
  getLeadingBrands,
} = require("../controllers/leadingBrands.controller");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Route to get dashboard stats
router.post("/upload", upload.single("image"), leadingBrandsUpload);
router.get("", getLeadingBrands);
module.exports = router;
