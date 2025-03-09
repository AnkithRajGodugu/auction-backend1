const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user"); 
const Razorpay = require("razorpay");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


console.log("Product model:", Product);


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("auctionInfo.currentBidder", "name"); // Populate bidder name
    res.json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "User not authenticated" });
    const products = await Product.find({ user: req.user.id }).populate("auctionInfo.currentBidder", "name");
    res.json(products);
  } catch (error) {
    console.error("Error in getUserProducts:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching user products", error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("auctionInfo.currentBidder", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error in getProductById:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    console.log("User from token:", req.user);

    if (!req.user?.id) return res.status(401).json({ message: "Authentication required" });

    const { name, description, price, startingDate, endingDate, sellerInfo } = req.body;
    const requiredFields = { name, description, price, startingDate, endingDate };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) return res.status(400).json({ message: `${key} is required` });
    }

    let parsedSellerInfo;
    try {
      parsedSellerInfo = sellerInfo ? JSON.parse(sellerInfo) : {};
      const sellerFields = ["username", "contactNumber", "email"];
      for (const field of sellerFields) {
        if (!parsedSellerInfo[field]) {
          return res.status(400).json({ message: `sellerInfo.${field} is required` });
        }
      }
    } catch (parseError) {
      console.error("Error parsing sellerInfo:", parseError);
      return res.status(400).json({ message: "Invalid sellerInfo format" });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price) || 0,
      startingDate: new Date(startingDate),
      endingDate: new Date(endingDate),
      sellerInfo: parsedSellerInfo,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      auctionInfo: { status: "Open", currentPrice: 0, currentBidder: null },
      user: req.user.id,
    };

    const product = new Product(productData);
    await product.save();
    console.log("Product created:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error.message, error.stack);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, description, price, startingDate, endingDate, sellerInfo } = req.body;
    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;
    if (price) updatedData.price = parseFloat(price) || 0;
    if (startingDate) updatedData.startingDate = new Date(startingDate);
    if (endingDate) updatedData.endingDate = new Date(endingDate);
    if (sellerInfo) updatedData.sellerInfo = JSON.parse(sellerInfo);
    if (req.file) updatedData.image = `/uploads/${req.file.filename}`;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updatedData,
      { new: true }
    ).populate("auctionInfo.currentBidder", "name");
    if (!product) return res.status(404).json({ message: "Product not found or not yours" });
    res.json(product);
  } catch (error) {
    console.error("Error in updateProduct:", error.message, error.stack);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!product) return res.status(404).json({ message: "Product not found or not yours" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error in deleteProduct:", error.message, error.stack);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// Place a bid on a product
const placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const productId = req.params.id;

    if (!bidAmount || isNaN(bidAmount)) {
      return res.status(400).json({ message: "Bid amount is required and must be a number" });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.auctionInfo) {
      product.auctionInfo = { status: "Open", currentPrice: 0, currentBidder: null };
    }

    // Normalize dates if they’re strings in an unexpected format
    if (typeof product.startingDate === "string") {
      const parsedStart = new Date(product.startingDate);
      if (isNaN(parsedStart.getTime())) {
        const [day, month, year] = product.startingDate.split("/");
        product.startingDate = new Date(`${year}-${month}-${day}`);
      } else {
        product.startingDate = parsedStart;
      }
      if (isNaN(product.startingDate.getTime())) {
        return res.status(400).json({ message: "Invalid startingDate format" });
      }
    }
    if (typeof product.endingDate === "string") {
      const parsedEnd = new Date(product.endingDate);
      if (isNaN(parsedEnd.getTime())) {
        const [day, month, year] = product.endingDate.split("/");
        product.endingDate = new Date(`${year}-${month}-${day}`);
      } else {
        product.endingDate = parsedEnd;
      }
      if (isNaN(product.endingDate.getTime())) {
        return res.status(400).json({ message: "Invalid endingDate format" });
      }
    }

    const now = new Date();
    const endDate = new Date(product.endingDate);
    if (endDate <= now) {
      product.auctionInfo.status = "Closed";
      await product.save();
      return res.status(400).json({ message: "Auction has ended" });
    }

    const basePrice = product.price || 0;
    const currentPrice = product.auctionInfo.currentPrice || basePrice;

    // Check if bid is less than base price
    if (Number(bidAmount) < basePrice) {
      return res.status(400).json({ message: `Bid must be at least $${basePrice.toFixed(2)} (base price)` });
    }
    // Check if bid is less than or equal to current price
    if (Number(bidAmount) <= currentPrice) {
      return res.status(400).json({ message: `Bid must be higher than current price ($${currentPrice.toFixed(2)})` });
    }

    product.auctionInfo.currentPrice = Number(bidAmount);
    product.auctionInfo.currentBidder = req.user.id;
    await product.save();

    // Populate the currentBidder field with the user's name after saving
    const updatedProduct = await Product.findById(productId).populate("auctionInfo.currentBidder", "name");

    console.log(`Bid placed on ${productId} by ${req.user.id}: ${bidAmount}`);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error in placeBid:", error.message, error.stack);
    res.status(500).json({ message: "Error placing bid", error: error.message });
  }
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Amount is required and must be a number" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error("Error in createOrder:", error.message, error.stack);
    res.status(500).json({ message: "Error creating payment order", error: error.message });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { productId, paymentId } = req.body;
    if (!productId || !paymentId) {
      return res.status(400).json({ message: "Product ID and Payment ID are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.auctionInfo.currentBidder.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the winning bidder" });
    }

    product.auctionInfo.paymentId = paymentId;
    product.auctionInfo.status = "Paid";
    await product.save();

    // Populate the currentBidder field with the user's name after saving
    const updatedProduct = await Product.findById(productId).populate("auctionInfo.currentBidder", "name");

    console.log(`Payment confirmed for ${productId}: ${paymentId}`);
    res.json({ message: "Payment confirmed", product: updatedProduct });
  } catch (error) {
    console.error("Error in confirmPayment:", error.message, error.stack);
    res.status(500).json({ message: "Error confirming payment", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getUserProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  placeBid,
  createOrder,
  confirmPayment,
};