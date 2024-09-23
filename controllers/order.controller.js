const Order = require("../models/order.model");

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req?.query;

    const orders = await Order.aggregate([
      {
        $match: {
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: "users" },
    ]);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get orders" });
  }
};

exports.getUserOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req?.query;
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
          userId: req.user._id,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      // { $skip: (page - 1) * Number(limit) },
      // { $limit: Number(limit) },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: "$users" },
      {
        $lookup: {
          from: "scraptypes",
          localField: "scrapTypes",
          foreignField: "_id",
          as: "scraptypesArray",
        },
      },
      {
        $project: {
          scrapTypes: {
            $map: {
              input: "$scraptypesArray",
              as: "type",
              in: "$$type.scrapType", // Extract only the scrapType field
            },
          },
          address: 1,
          weight: 1,
          createdAt: 1,
          pickupDate: 1,
          status: 1,
          description: 1,
          scrapWeight: 1,
          mobileNumber: 1,
        },
      },
    ]);

    return res.json(orders);
  } catch (err) {
    console.log("@@error", err);
    return res.status(500).json({ message: "Failed to get orders" });
  }
};

// Soft Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.deleteOne({ _id: id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order deleted successfully (soft delete)",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete order" });
  }
};
