const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  blogUpload,
  getBlogs,
  deleteBlog,
  updateBlog,
} = require("../controllers/blog.controller");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
router.post("/upload", upload.single("image"), blogUpload);
router.get("", getBlogs);
router.delete("/:id", deleteBlog); // Route for deleting a blog
router.put("/:id", upload.single("image"), updateBlog); // Route for updating a blog

module.exports = router;
