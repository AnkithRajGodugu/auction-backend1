const express = require('express');
const { signup, login } = require('../controllers/authcontroller');
const router = express.Router();

// Signup route
router.post('/api/signup', signup);

// Login route
router.post('/api/login', login);

module.exports = router;
