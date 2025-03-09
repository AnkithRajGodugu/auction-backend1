const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjusted import to match your user.js export

// Ensure JWT_SECRET is loaded from environment variables
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    process.exit(1); // Exit process if SECRET_KEY is missing
}

exports.signup = async (req, res) => {
    const { name, email, password, contactNumber } = req.body;
    console.log("Received signup data:", req.body); // Debug incoming request

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash password with error handling
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashError) {
            console.error("Error hashing password:", hashError);
            return res.status(500).json({ error: "Failed to process password" });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            contactNumber: contactNumber || null, // Optional field
        });

        // Save user to database
        await newUser.save();
        console.log("User created:", { id: newUser._id, email: newUser.email }); // Debug successful creation

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Return success response
        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                contactNumber: newUser.contactNumber,
            },
        });
    } catch (err) {
        console.error("Signup error:", err.message, err.stack); // Include stack trace for debugging
        res.status(500).json({ error: "Server error during signup", details: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Received login data:", req.body); // Debug incoming request

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Return success response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber,
            },
        });
    } catch (err) {
        console.error("Login error:", err.message, err.stack); // Include stack trace for debugging
        res.status(500).json({ error: "Server error during login", details: err.message });
    }
};