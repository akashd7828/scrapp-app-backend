const cloudinary = require("cloudinary").v2;
const blogModel = require("../models/blog.model");
const multer = require("multer");
require("dotenv").config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a new blog
exports.blogUpload = async (req, res) => {
  const { description, blogUrl, title } = req.body;

  if (!req.file) {
    return res.status(400).send({ message: "No image provided" });
  }

  try {
    // Upload the image to Cloudinary
    cloudinary.uploader
      .upload_stream(
        {
          folder: "uploads", // Folder in Cloudinary
          transformation: [{ width: 1000, crop: "limit" }],
        },
        async (error, cloudinaryResponse) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Cloudinary upload failed", error });
          }

          // Save blog entry to MongoDB
          const newBlog = new blogModel({
            imageUrl: cloudinaryResponse.secure_url,
            description,
            title,
            blogUrl,
          });

          try {
            await newBlog.save();
            res.status(200).json({
              message: "Upload successful",
              blog: newBlog,
            });
          } catch (dbError) {
            res
              .status(500)
              .json({ message: "Database save error", error: dbError });
          }
        }
      )
      .end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Function to get all blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
};

// Function to delete a blog and its image from Cloudinary
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete the image from Cloudinary
    const publicId = blog.imageUrl.split("/").slice(-1)[0].split(".")[0]; // Extract public ID from the URL
    await cloudinary.uploader.destroy(`uploads/${publicId}`);

    // Delete the blog from MongoDB
    await blogModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};

// Function to update a blog and replace its image if necessary
exports.updateBlog = async (req, res) => {
  const { description, blogUrl, title } = req.body;

  try {
    const blog = await blogModel.findById(req.params.id);

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
    blog.blogUrl = blogUrl || blog.blogUrl;

    await blog.save(); // Save the updated blog

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error });
  }
};
