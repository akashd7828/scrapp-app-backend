const mongoose = require("mongoose");

const LeadingBrands = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true }, // URL of the uploaded image
    // Timestamp when the blog is created
  },
  { timestamps: true }
);

module.exports = mongoose.model("leadingBrands", LeadingBrands);
