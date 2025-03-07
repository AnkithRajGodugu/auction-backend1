import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Categories.css";

function Categories() {
  const [products, setProducts] = useState([]);
  const [biddingItem, setBiddingItem] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        console.log("Fetched products:", response.data);
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load categories. Please try again.");
      }
    };
    fetchProducts();
  }, []);

  // Define calculateTimeRemaining before using it
  const calculateTimeRemaining = (start, end) => {
    const now = new Date();
    const endDate = new Date(end);
    const diffMs = endDate - now;
    if (diffMs <= 0) return "Ended";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  // Enrich products with auctionInfo
  const enrichedProducts = products.map((product) => ({
    ...product,
    auctionInfo: product.auctionInfo || {
      status: "Open",
      timeRemaining: calculateTimeRemaining(product.startingDate, product.endingDate),
      basePrice: parseFloat(product.price),
      currentPrice: product.auctionInfo?.currentPrice || 0,
      currentBidder: product.auctionInfo?.currentBidder || null,
    },
  }));

  const handleBidClick = (item) => {
    setBiddingItem(item);
    setBidAmount(parseFloat(item.price) + Math.floor(Math.random() * 50) + 1);
  };

  const handlePlaceBid = () => {
    setProducts(products.map((product) =>
      product._id === biddingItem._id
        ? {
            ...product,
            auctionInfo: {
              ...product.auctionInfo,
              currentPrice: bidAmount,
              currentBidder: "user123",
            },
          }
        : product
    ));
    setBiddingItem(null);
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="categories-list">
        {enrichedProducts.map((product) => (
          <div key={product._id} className="category-item">
            <div className="category-image">
              {product.image ? (
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <div style={{ padding: "15px" }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Starting Date:</strong> {product.startingDate}</p>
              <p><strong>Ending Date:</strong> {product.endingDate}</p>
              <div>
                <p><strong>Seller Info:</strong></p>
                <p>Username: {product.sellerInfo?.username || "N/A"}</p>
                <p>Contact Number: {product.sellerInfo?.contactNumber || "N/A"}</p>
                <p>Email: {product.sellerInfo?.email || "N/A"}</p>
              </div>
              <div>
                <p><strong>Auction Status:</strong> {product.auctionInfo.status}</p>
                <p><strong>Time Remaining:</strong> {product.auctionInfo.timeRemaining}</p>
                {product.auctionInfo.status === "Open" && (
                  <button onClick={() => handleBidClick(product)}>Bid Now</button>
                )}
              </div>
              {biddingItem && biddingItem._id === product._id && (
                <div>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                    min={product.auctionInfo.basePrice + 1}
                  />
                  <button onClick={handlePlaceBid}>Place Bid</button>
                  <button onClick={() => setBiddingItem(null)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;