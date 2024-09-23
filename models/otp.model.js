const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    mobileNumber: String,
    sessionId: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
