const axios = require("axios");
const OtpModel = require("../models/otp.model");
const otpModel = require("../models/otp.model");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let otpStore = {};

// Send OTP via 2Factor API
exports.sendOtp = async (req, res) => {
  const { mobileNumber, isChangePassword } = req.body;

  if (!mobileNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile number is required" });
  }

  try {
    // Check for existing records in the database

    if (isChangePassword) {
      const user = await userModel.findOne({ mobileNumber });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User is not registered with this mobile number.",
        });
      }
    }
    const existingOtp = await OtpModel.findOne({ mobileNumber });

    if (existingOtp) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Check if 5 minutes have passed since the last OTP was sent
      if (now - existingOtp.expiresAt < fiveMinutes) {
        return res.status(400).json({
          success: false,
          message: "Please wait 5 minutes before requesting a new OTP.",
        });
      }
    }

    // Send OTP
    const response = await axios.get(
      `${process.env.SMS_BASE_URL}/${process.env.SMS_API_KEY}/SMS/${mobileNumber}/AUTOGEN`
    );

    if (response.data.Status === "Success") {
      const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

      // Create or update the OTP record in the database
      await OtpModel.updateOne(
        { mobileNumber },
        {
          sessionId: response.data.Details,
          expiresAt,
        },
        { upsert: true }
      );

      otpStore[mobileNumber] = {
        sessionId: response.data.Details,
        expiresAt,
      };

      res.json({
        success: true,
        message: "OTP sent successfully",
        sessionId: response.data.Details,
      });
    } else {
      res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// Verify OTP via 2Factor API
exports.verifyOtp = async (req, res) => {
  const { mobileNumber, otp, newPassword = "" } = req.body;

  if (!mobileNumber || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile number and OTP are required" });
  }

  try {
    // Get sessionId from in-memory store
    const otpData = otpStore[mobileNumber];
    const existingOtp = await OtpModel.findOne({ mobileNumber })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!existingOtp || Date.now() > existingOtp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    // Verify OTP
    const response = await axios.get(
      `${process.env.SMS_BASE_URL}/${process.env.SMS_API_KEY}/SMS/VERIFY/${existingOtp.sessionId}/${otp}`
    );

    if (response.data.Status === "Success") {
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updateOne(
          { mobileNumber },
          { password: hashedPassword }
        );
      }
      await otpModel.deleteMany({ mobileNumber });
      delete otpStore[mobileNumber];
      res.json({
        success: true,
        message: newPassword
          ? "Password updated successfully"
          : "OTP verified successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};
