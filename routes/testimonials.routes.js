const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  testimonialUpload,
  getTestimonials,
} = require("../controllers/testimonials.controller");
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
router.post("/upload", upload.single("image"), testimonialUpload);
router.get("", getTestimonials);
module.exports = router;
