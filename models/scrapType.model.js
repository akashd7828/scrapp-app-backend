const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ScrapTypeSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(), // Use UUID as string ID
    },
    scrapType: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true },
    unit: {
      type: String,
      enum: ["kg", "unit"],
      required: true,
      default: "kg",
    },
    minWeight: { type: Number, required: false },
    note: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScrapType", ScrapTypeSchema);
