const express = require("express");
const {
  createOrder,
  getOrders,
  getAllOrders,
  deleteOrder,
} = require("../controllers/order.controller");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
