const express = require("express");
const {
  createOrder,
  getAllOrders,
  deleteOrder,
  getUserOrders,
  approveOrder,
  declineOrder,
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
router.patch("/:id/approve", approveOrder);
router.patch("/:id/decline", declineOrder);

module.exports = router;
