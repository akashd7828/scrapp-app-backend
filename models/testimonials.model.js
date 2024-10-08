const mongoose = require("mongoose");

const Testimonials = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true }, // URL of the uploaded image
    description: { type: String, required: true }, // Blog description
    title: { type: String, required: false }, // Blog description
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonials", Testimonials);
