const express = require("express");
const { signup, login } = require("../controllers/authcontroller");

const router = express.Router();

// Public routes for authentication
router.post("/signup", signup); // Register a new user
router.post("/login", login);   // Login an existing user

module.exports = router;