const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

const app = express();
const PORT = process.env.PORT || 5000;


// Load environment variables
dotenv.config({ path: "./backend/.env" });
if (dotenv.error) {
    console.error("Error loading .env file:", dotenv.error);
    process.exit(1);
}

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors( ));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// File Upload Setup (Temporary for Vercel)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created uploads directory at:", uploadsDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });
app.use("/uploads", express.static(uploadsDir));

// Razorpay Setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Error: Razorpay credentials are not defined.");
    process.exit(1);
}

// Routes
const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authroutes");
app.use("/api", authRoutes);
app.use("/api", productRoutes(upload));

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
    console.error("Error: MONGO_URL is not defined.");
    process.exit(1);
}
mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });
    
    
// Export for Vercel
module.exports = app;