const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

// Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info from token to req object
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Authorization Middleware (only admins)
const authorizeAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      $or: [{ _id: req?.user?._id }, { username: req?.body?.username }],
    });
    // Find user by ID
    if (user?.role !== "admin") {
      return res.status(401).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch (err) {
    console.log("@@err", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const authorizeUser = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      $or: [{ _id: req?.user?._id }, { username: req.body.username }],
    });
    if (!user || user?.role !== "customer") {
      return res.status(401).json({ message: "Access denied. User only." });
    }
    next();
  } catch (err) {
    console.log("@@err", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authenticateJWT, authorizeAdmin, authorizeUser };
