const express = require("express");
const awardsModel = require("../models/awards.model");
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

exports.awardsUpload = async (req, res) => {
  const { description, title } = req.body;

  // Handle missing file
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
            { width: 1000, crop: "limit" }, // Limit image width to 1000px
          ],
        },
        async (error, cloudinaryResponse) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Cloudinary upload failed", error });
          }

          // Save the Cloudinary URL and description to the database
          const newImage = new awardsModel({
            imageUrl: cloudinaryResponse.secure_url, // Using Cloudinary secure URL
            description: description,
            title,
          });

          try {
            await newImage.save(); // Save the new blog entry to MongoDB
            res.status(200).json({
              message: "Upload successful",
              imageUrl: cloudinaryResponse.secure_url,
              description,
            });
          } catch (dbError) {
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

exports.getAwards = async (req, res) => {
  const data = await awardsModel.find();
  res.json(data);
};

exports.deleteAward = async (req, res) => {
  try {
    const blog = await awardsModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "testimonial not found" });
    }

    // Delete the image from Cloudinary
    const publicId = blog.imageUrl.split("/").slice(-1)[0].split(".")[0]; // Extract public ID from the URL
    await cloudinary.uploader.destroy(`uploads/${publicId}`);

    // Delete the blog from MongoDB
    await awardsModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ message: "testimonial and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting testimonial", error });
  }
};

// Function to update a blog and replace its image if necessary
exports.updateAward = async (req, res) => {
  const { description, title } = req.body;

  try {
    const blog = await awardsModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // If there's a new image, delete the old one and upload the new image to Cloudinary
    if (req.file) {
      const oldPublicId = blog.imageUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`uploads/${oldPublicId}`);

      const newImage = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "uploads",
              transformation: [{ width: 1000, crop: "limit" }],
            },
            (error, cloudinaryResponse) => {
              if (error) return reject(error);
              resolve(cloudinaryResponse.secure_url);
            }
          )
          .end(req.file.buffer);
      });

      blog.imageUrl = newImage; // Update image URL in the blog entry
    }

    // Update the other fields
    blog.description = description || blog.description;
    blog.title = title || blog.title;

    await blog.save(); // Save the updated blog

    res.status(200).json({ message: "award data updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating award data", error });
  }
};
