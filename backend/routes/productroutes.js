const express = require("express");
const {
  getAllProducts,
  getUserProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  placeBid,
  confirmPayment,
} = require("../controllers/productcontroller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

module.exports = (upload) => {
  // Public routes (no authentication required)
  router.get("/products", getAllProducts); // Fetch all products (publicly accessible)

  // Protected routes (require authentication)
  router.get("/user-products", authMiddleware, getUserProducts); // Fetch authenticated user's products
  router.post("/products", authMiddleware, upload.single("image"), createProduct); // Create a new product with image upload
  router.put("/products/:id/bid", authMiddleware, placeBid); // Place a bid on a product
  router.post("/products/:id/confirm-payment", authMiddleware, confirmPayment); // Confirm payment for a product

  // Parameterized protected routes (specific product actions)
  router.get("/products/:id", getProductById); // Fetch a single product by ID (publicly accessible)
  router.put("/products/:id", authMiddleware, upload.single("image"), updateProduct); // Update a product with image upload
  router.delete("/products/:id", authMiddleware, deleteProduct); // Delete a product

  return router;
};