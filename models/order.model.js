const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OrderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(), // Use UUID as string ID
    },
    userId: { type: String, required: true, ref: "User" },
    scrapTypes: [{ type: String, ref: "ScrapType", required: true }],
    scrapWeight: { type: String, required: false },
    description: { type: String, required: false },
    mobileNumber: { type: String, required: false },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED"],
      default: "PENDING",
    },
    pickupDate: { type: Date, required: false },
    address: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
