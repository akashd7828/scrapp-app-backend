const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const scrapTypeRoutes = require("./routes/scrapType.routes");
const orderRoutes = require("./routes/order.routes");
const otpRoutes = require("./routes/otp.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const blogRoutes = require("./routes/blog.routes");
const awardRoutes = require("./routes/awards.routes");
const leadingBrandsRoutes = require("./routes/leadingBrands.routes");
const testimonialRoutes = require("./routes/testimonials.routes");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // Allow all origins
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/v1/api/users", userRoutes);
app.use("/v1/api/scrap-types", scrapTypeRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/otp", otpRoutes);
app.use("/v1/api/dashboard", dashboardRoutes);
app.use("/v1/api/blog", blogRoutes);
app.use("/v1/api/leadingBrands", leadingBrandsRoutes);
app.use("/v1/api/awards", awardRoutes);
app.use("/v1/api/testimonial", testimonialRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
