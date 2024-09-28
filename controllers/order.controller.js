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
    const where = {
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    };
    const orders = await Order.aggregate([
      {
        $match: where,
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
        // Projection stage: include/exclude specific fields
        $project: {
          // Include specific fields from the 'Order' collection
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          address: 1,
          pickupDate: 1,

          // Include specific fields from the 'users' lookup
          "users.username": 1,
          "users.email": 1,
          "users.mobileNumber": 1,

          // Include the 'scrapTypes' (as a full object from the lookup)
          scrapTypes: "$scraptypesArray",
          scrapWeight: 1,
          // Include specific fields if needed from 'scrapTypes'
          // "scraptypesArray.type": 1,

          // Or you can project everything from 'scraptypesArray' by default
        },
      },
    ]);

    const totalPages = await Order.countDocuments(where);
    return res.status(200).send({ items: orders, totalPages });
  } catch (err) {
    console.log("@@err", err);
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
