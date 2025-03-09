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


dotenv.config({ path: "./backend/.env" });
if (dotenv.error) {
    console.error("Error loading .env file:", dotenv.error);
    process.exit(1);
}


app.use(morgan("dev"));
app.use(bodyParser.json()); 
app.use(cors());
app.use(express.static(path.join(__dirname, "../bid"))); 

const PORT = process.env.PORT || 5000;


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


const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("Error: JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Error: Razorpay credentials are not defined in the environment variables.");
    process.exit(1);
}


const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authroutes");
app.use("/api", authRoutes); 
app.use("/api", productRoutes(upload)); 


app.post("/api/create-order", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        console.log("Razorpay order created:", order.id); 
        res.json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating Razorpay order:", error.message);
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
});


app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});


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
        process.exit(1); 
    });


app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../bid", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});