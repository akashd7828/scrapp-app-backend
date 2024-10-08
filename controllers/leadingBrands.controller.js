const express = require("express");
const leadingBrandsModel = require("../models/leadingBrands.model");
const cloudinary = require("cloudinary").v2;
const multer = require("multer"); // Add multer to handle file uploads
require("dotenv").config();

// Cloudinary config

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup multer for file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 5MB
});

exports.leadingBrandsUpload = async (req, res) => {
  // Handle missing file

  console.log("@@AKDDDD");
  if (!req.file) {
    return res.status(400).send({ message: "No image provided" });
  }

  try {
    // Upload the file buffer to Cloudinary with resizing (max width: 1000px)
    cloudinary.uploader
      .upload_stream(
        {
          folder: "uploads", // Specify folder in Cloudinary
          transformation: [
            { width: 500, crop: "limit" }, // Limit image width to 1000px
          ],
        },
        async (error, cloudinaryResponse) => {
          if (error) {
            console, log("@@error", error);
            return res
              .status(500)
              .json({ message: "Cloudinary upload failed", error });
          }

          // Save the Cloudinary URL and description to the database
          const newImage = new leadingBrandsModel({
            imageUrl: cloudinaryResponse.secure_url, // Using Cloudinary secure URL
          });

          try {
            await newImage.save(); // Save the new blog entry to MongoDB
            res.status(200).json({
              message: "Upload successful",
              imageUrl: cloudinaryResponse.secure_url,
            });
          } catch (dbError) {
            console.log("@@dberror", dbError);
            res
              .status(500)
              .json({ message: "Database save error", error: dbError });
          }
        }
      )
      .end(req.file.buffer); // Pass the file buffer to Cloudinary
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLeadingBrands = async (req, res) => {
  const data = await leadingBrandsModel.find();
  console.log("@@data", data);
  res.json(data);
};
