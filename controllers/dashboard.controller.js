const Scrap = require("../models/scrapType.model");
const Order = require("../models/order.model");

exports.dashboardStats = async (req, res) => {
  try {
    // Fetch total scrap types
    const totalScrapTypes = await Scrap.countDocuments();

    // Calculate total weight of all scrap types
    const totalWeightResult = await Scrap.aggregate([
      { $group: { _id: null, totalWeight: { $sum: "$weight" } } },
    ]);
    const totalWeight = totalWeightResult[0]?.totalWeight || 0;

    // Find the scrap type with the highest weight
    const topScrap = await Scrap.findOne().sort({ scrapWeight: -1 }).limit(1);
    const topCollectedScrap = topScrap ? topScrap.name : "N/A";

    // Get the last 5 recently added scrap types
    const recentScraps = await Order.aggregate([
      {
        $lookup: {
          from: "scraptypes",
          localField: "scrapTypes",
          foreignField: "_id",
          as: "scrapTypes",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Count pending requests
    const pendingRequests = await Order.countDocuments({ status: "pending" });

    // Return the stats
    res.json({
      totalScrapTypes,
      totalWeight,
      topCollectedScrap,
      recentScraps,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching dashboard stats" });
  }
};
