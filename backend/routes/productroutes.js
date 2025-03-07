const express = require("express");
const {
  getAllProducts,
  getUserProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  placeBid,
} = require("../controllers/productcontroller");
const authMiddleware = require("../middleware/auth"); // Assuming this exists or add it

const router = express.Router();

module.exports = (upload) => {
  router.get("/products", getAllProducts); // Public route
  router.get("/products/my-products", authMiddleware, getUserProducts); // User-specific route
  router.get("/products/:id", getProductById); // Public route
  router.post("/products", authMiddleware, upload.single("image"), createProduct);
  router.put("/products/:id", authMiddleware, upload.single("image"), updateProduct);
  router.delete("/products/:id", authMiddleware, deleteProduct);
  router.post("/products/:id/bid", authMiddleware, placeBid); // Protected bidding
  return router;
};