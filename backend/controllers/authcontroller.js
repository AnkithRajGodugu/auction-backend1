const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

// Secret key for signing JWT (store in .env in production)
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; // Use a strong secret in production

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Received signup data:", req.body);

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error during signup." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Received login data:", req.body);

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login." });
    }
};