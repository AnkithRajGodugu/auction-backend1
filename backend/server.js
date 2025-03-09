const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Corrected to dotenv (case-sensitive)
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

const app = express();

// Load environment variables
dotenv.config({ path: "./backend/.env" });
if (dotenv.error) {
    console.error("Error loading .env file:", dotenv.error);
    process.exit(1);
}

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Allow all origins; specify { origin: "http://localhost:3000" } if needed
app.use(express.static(path.join(__dirname, "../bid"))); // Serve frontend build

const PORT = process.env.PORT || 5000;

// Multer setup for file uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // recursive: true creates parent dirs if needed
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

// JWT Middleware
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("Error: JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach decoded user data (id, email) to req
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Razorpay Initialization
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Error: Razorpay credentials are not defined in the environment variables.");
    process.exit(1);
}

// Routes
const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authroutes");
app.use("/api", authRoutes); // Authentication routes (signup, login)
app.use("/api", productRoutes(upload)); // Product routes with multer

// Razorpay Order Creation Route
app.post("/api/create-order", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        console.log("Razorpay order created:", order.id); // Debug order creation
        res.json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating Razorpay order:", error.message);
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
});

// Protected Route Example
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
    console.error("Error: MONGO_URL is not defined in the environment variables.");
    process.exit(1);
}
console.log("MongoDB URI:", MONGO_URL);

mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit if connection fails
    });

// Fallback for SPA (Single Page Application)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../bid", "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});