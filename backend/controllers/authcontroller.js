const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { User } = require('../models/user'); // Assuming you have a User model defined


// Signup function
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Received data:", req.body); // Log incoming data for debugging

    console.log("Received data:", req.body); // Log incoming data for debugging


    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newUser = new User({ name, email, password: hashedPassword }); // Store hashed password

        console.log("New user object:", newUser); // Log the new user object for debugging

        console.log("New user object:", newUser); // Log the new user object for debugging

        await newUser.save();
        res.status(201).json({ message: "User created successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) { // Compare hashed password

            return res.status(401).json({ error: "Invalid email or password." });
        }
        res.json({ message: "Login successful." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
