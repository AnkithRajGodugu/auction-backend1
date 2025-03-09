const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    trim: true,
    default: null, // Optional field for seller/bidder contact
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User; // Export directly as User, not as an object