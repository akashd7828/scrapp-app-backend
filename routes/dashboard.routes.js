const { dashboardStats } = require("../controllers/dashboard.controller");
const express = require("express");
const router = express.Router();

// Route to get dashboard stats
router.get("/dashboard-stats", dashboardStats);

module.exports = router;
