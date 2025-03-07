const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');

const app = express();

// Load environment variables
dotEnv.config({ path: "./backend/.env" });
if (dotEnv.error) {
    console.error("Error loading .env file:", dotEnv.error);
    process.exit(1);
}

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" })); // Specify frontend URL
const PORT = process.env.PORT || 5000;

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../bid")));

// Multer setup for file uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log("Created uploads directory at:", uploadsDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token provided." });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach user data (e.g., id, email) to request
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

// Routes
const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authroutes");
app.use("/api", productRoutes(upload));
app.use("/api", authRoutes);

// Protected Route Example
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

if (!process.env.MONGO_URL) {
    console.error("Error: MONGO_URL is not defined in the environment variables.");
    process.exit(1);
}
console.log("MongoDB URI:", process.env.MONGO_URL);

mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../bid", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});