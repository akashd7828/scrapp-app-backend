const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, username, password, role, mobileNumber } = req.body;
  try {
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Validate for unique mobileNumber
    const existingUserByMobile = await User.findOne({ mobileNumber });
    if (existingUserByMobile) {
      return res.status(400).json({ message: "Mobile number already exists." });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      role,
      mobileNumber,
      username,
      password: hashedPassword,
    });
    res.status(201).json(user);
  } catch (error) {
    console.log("@@errror", error);
    res.status(400).json({ message: error.message });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "24h", // Short-lived access token
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d", // Long-lived refresh token
    }
  );
};

// Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).exec();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // Store refreshToken in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Secure cookie, accessible only by the server
      secure: process.env.NODE_ENV === "production", // Send over HTTPS only in production
      sameSite: "strict", // Mitigate CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).send({ user, accessToken, refreshToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token not provided" });
  }

  // Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const where = {
      role: "customer",
    };
    const users = await User.aggregate([
      {
        $match: where,
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);
    const totalPages = await User.countDocuments(where);
    res.status(200).send({ users, totalPages });
  } catch (error) {
    console.log("@@error", error);
    res.status(500).json({ message: "Failed to get users" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id, "-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile" });
  }
};
