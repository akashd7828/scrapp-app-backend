const express = require("express");
const {
  createOrder,
  getAllOrders,
  deleteOrder,
  getUserOrders,
} = require("../controllers/order.controller");
const {
  authorizeAdmin,
  authenticateJWT,
  authorizeUser,
} = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("", authenticateJWT, authorizeUser, createOrder);

router.get("/all", authenticateJWT, authorizeAdmin, getAllOrders);
router.delete("/:id", authenticateJWT, authorizeUser, deleteOrder);
router.get("/:userId", authenticateJWT, authorizeUser, getUserOrders);

module.exports = router;
