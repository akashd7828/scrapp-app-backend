const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(), // Use UUID as string ID
    },
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    mobileNumber: { type: String, required: false, trim: true, unique: true },
    username: { type: String, required: false, trim: true, unique: true },
    email: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
