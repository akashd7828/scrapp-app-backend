const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true }, // URL of the uploaded image
    blogUrl: { type: String, required: false }, // URL of the blog
    description: { type: String, required: true }, // Blog description
    title: { type: String, required: false }, // Blog description
    createdAt: { type: Date, default: Date.now },

    // Timestamp when the blog is created
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blogs", BlogSchema);
