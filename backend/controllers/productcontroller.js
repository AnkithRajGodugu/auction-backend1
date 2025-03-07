const mongoose = require("mongoose"); // Add mongoose for consistency
const Product = require("../models/product"); // Fixed to match file name: product.js

// Verify Product is a constructor at module level
console.log("Product model:", Product);

// Get all products (public, optional)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (error) {
    console.error("Error in getUserProducts:", error);
    res.status(500).json({ message: "Error fetching user products", error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    console.log("User from token:", req.user);

    // Check authentication
    if (!req.user || !req.user.id) {
      console.log("Authentication failed: No user or user ID");
      return res.status(401).json({ message: "Authentication required" });
    }

    const { name, description, price, startingDate, endingDate, sellerInfo } = req.body;

    // Validate required fields
    const requiredFields = { name, description, price, startingDate, endingDate };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.log(`Validation failed: ${key} is missing`);
        return res.status(400).json({ message: `${key} is required` });
      }
    }

    // Parse and validate sellerInfo
    let parsedSellerInfo;
    try {
      parsedSellerInfo = sellerInfo ? JSON.parse(sellerInfo) : {};
      const sellerFields = ["username", "contactNumber", "email"];
      for (const field of sellerFields) {
        if (!parsedSellerInfo[field]) {
          console.log(`Validation failed: sellerInfo.${field} is missing`);
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
      startingDate,
      endingDate,
      sellerInfo: parsedSellerInfo,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      auctionInfo: {
        status: "Open",
        currentPrice: 0,
        currentBidder: null,
      },
      user: req.user.id,
    };

    console.log("Product data to save:", productData);

    // Double-check Product constructor
    if (typeof Product !== "function") {
      throw new Error("Product is not a constructor function");
    }

    const product = new Product(productData);
    await product.save();
    console.log("Product saved successfully:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, description, price, startingDate, endingDate, sellerInfo } = req.body;
    const updatedData = {
      name,
      description,
      price: parseFloat(price) || 0,
      startingDate,
      endingDate,
      sellerInfo: sellerInfo ? JSON.parse(sellerInfo) : {},
    };
    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updatedData,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found or not yours" });
    res.json(product);
  } catch (error) {
    console.error("Error in updateProduct:", error);
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
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// Place a bid on a product
const placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const now = new Date();
    const endDate = new Date(product.endingDate);
    if (endDate <= now) {
      product.auctionInfo.status = "Closed";
      await product.save();
      return res.status(400).json({ message: "Auction has ended" });
    }

    const basePrice = product.price;
    const currentPrice = product.auctionInfo.currentPrice || basePrice;
    if (bidAmount <= currentPrice) {
      return res.status(400).json({ message: "Bid must be higher than current price" });
    }

    product.auctionInfo.currentPrice = bidAmount;
    product.auctionInfo.currentBidder = req.user.id;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Error in placeBid:", error);
    res.status(500).json({ message: "Error placing bid", error: error.message });
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
};