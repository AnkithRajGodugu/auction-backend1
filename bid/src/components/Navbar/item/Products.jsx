import React, { useState, useEffect } from "react";
import axios from "axios";
import "../item/Products.css"; // Assuming this exists for styling

function Products() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    sellerInfo: {
      username: "", // Will be populated from user data
      contactNumber: "",
      email: "",
    },
    startingDate: "",
    endingDate: "",
    image: null,
  });
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStartingDate, setEditStartingDate] = useState("");
  const [editEndingDate, setEditEndingDate] = useState("");
  const [error, setError] = useState(null);

  // Fetch user-specific products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your products.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/products/my-products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched user products:", response.data);
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load your products. Please try again.");
      }
    };
    fetchProducts();
  }, []);

  // Fetch user info to prefill sellerInfo (optional)
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email } = response.data; // Assuming backend returns user data
        setNewProduct((prev) => ({
          ...prev,
          sellerInfo: {
            username: name,
            contactNumber: prev.sellerInfo.contactNumber || "9898989898", // Default or from user profile
            email: email,
          },
        }));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Handle input changes for new product
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Handle image change for new product
  const handleNewImageChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  // Handle input changes for editing product
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setEditName(value);
        break;
      case "description":
        setEditDescription(value);
        break;
      case "price":
        setEditPrice(value);
        break;
      case "startingDate":
        setEditStartingDate(value);
        break;
      case "endingDate":
        setEditEndingDate(value);
        break;
      default:
        break;
    }
  };

  // Handle image change for editing product
  const handleEditImageChange = (e) => {
    setEditProduct({ ...editProduct, image: e.target.files[0] });
  };

  // Add a new product
  const addProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to add a product.");
      return;
    }

    console.log("Token:", token); // Log token for debugging

    // Ensure sellerInfo is populated (fallback values if not set)
    const sellerInfo = {
      username: newProduct.sellerInfo.username || "DefaultUser",
      contactNumber: newProduct.sellerInfo.contactNumber || "1234567890",
      email: newProduct.sellerInfo.email || "user@example.com",
    };

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("startingDate", newProduct.startingDate);
    formData.append("endingDate", newProduct.endingDate);
    formData.append("sellerInfo", JSON.stringify(sellerInfo));
    if (newProduct.image) formData.append("image", newProduct.image);

    console.log("FormData contents:", {
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      startingDate: newProduct.startingDate,
      endingDate: newProduct.endingDate,
      sellerInfo: sellerInfo,
      image: newProduct.image ? newProduct.image.name : null,
    });

    try {
      const response = await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        sellerInfo: { username: "", contactNumber: "", email: "" },
        startingDate: "",
        endingDate: "",
        image: null,
      });
      setError(null);
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to delete a product.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((product) => product._id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
    }
  };

  // Update a product
  const updateProduct = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to update a product.");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName);
    formData.append("description", editDescription);
    formData.append("price", editPrice);
    formData.append("startingDate", editStartingDate);
    formData.append("endingDate", editEndingDate);
    formData.append("sellerInfo", JSON.stringify(editProduct.sellerInfo || newProduct.sellerInfo));
    if (editProduct.image instanceof File) formData.append("image", editProduct.image);

    try {
      const response = await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.map((p) => (p._id === id ? response.data : p)));
      setEditProduct(null);
      setEditName("");
      setEditDescription("");
      setEditPrice("");
      setEditStartingDate("");
      setEditEndingDate("");
      setError(null);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product. Please try again.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        color: "rgb(20, 91, 91)",
      }}
    >
      <h2 className="header">Your Products</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Add New Product Form */}
      <div>
        <h3 className="header2">Add New Product</h3>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newProduct.name}
            onChange={handleNewInputChange}
            style={{ marginRight: "10px", padding: "5px", width: "150px" }}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newProduct.description}
            onChange={handleNewInputChange}
            style={{ marginRight: "10px", padding: "5px", width: "150px" }}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleNewInputChange}
            style={{ marginRight: "10px", padding: "5px", width: "100px" }}
          />
          <input
            type="text"
            name="startingDate"
            placeholder="Starting Date"
            value={newProduct.startingDate}
            onChange={handleNewInputChange}
            style={{ marginRight: "10px", padding: "5px", width: "120px" }}
          />
          <input
            type="text"
            name="endingDate"
            placeholder="Ending Date"
            value={newProduct.endingDate}
            onChange={handleNewInputChange}
            style={{ marginRight: "10px", padding: "5px", width: "120px" }}
          />
          <input
            type="file"
            onChange={handleNewImageChange}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button
            className="button"
            onClick={addProduct}
            style={{ padding: "5px 10px" }}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product List */}
      <div>
        <h3 className="header3">Your Products List</h3>
        {products.length === 0 && !error && <p>No products found.</p>}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {products.map((product) => (
            <li
              key={product._id}
              style={{
                marginBottom: "20px",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                {product.image && (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    style={{
                      marginRight: "15px",
                      width: "100px",
                      height: "auto",
                      borderRadius: "5px",
                    }}
                  />
                )}
                <div>
                  <strong className="inside">Name:</strong> {product.name}<br />
                  <strong className="inside">Description:</strong> {product.description}<br />
                  <strong className="inside">Price:</strong> ${product.price}<br />
                  <strong className="inside">Starting Date:</strong> {product.startingDate}<br />
                  <strong className="inside">Ending Date:</strong> {product.endingDate}<br />
                  <strong className="inside">Seller Info:</strong><br />
                  {product.sellerInfo ? (
                    <>
                      Username: {product.sellerInfo.username}<br />
                      Contact Number: {product.sellerInfo.contactNumber}<br />
                      Email: {product.sellerInfo.email}
                    </>
                  ) : (
                    "Seller info not available"
                  )}
                </div>
              </div>
              <div>
                {editProduct && editProduct._id === product._id ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editName}
                      onChange={handleEditInputChange}
                      style={{ marginRight: "10px", padding: "5px", width: "150px" }}
                    />
                    <input
                      type="text"
                      name="description"
                      value={editDescription}
                      onChange={handleEditInputChange}
                      style={{ marginRight: "10px", padding: "5px", width: "150px" }}
                    />
                    <input
                      type="number"
                      name="price"
                      value={editPrice}
                      onChange={handleEditInputChange}
                      style={{ marginRight: "10px", padding: "5px", width: "100px" }}
                    />
                    <input
                      type="text"
                      name="startingDate"
                      value={editStartingDate}
                      onChange={handleEditInputChange}
                      style={{ marginRight: "10px", padding: "5px", width: "120px" }}
                    />
                    <input
                      type="text"
                      name="endingDate"
                      value={editEndingDate}
                      onChange={handleEditInputChange}
                      style={{ marginRight: "10px", padding: "5px", width: "120px" }}
                    />
                    <input
                      type="file"
                      onChange={handleEditImageChange}
                      style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <button
                      onClick={() => updateProduct(product._id)}
                      style={{ padding: "5px 10px", marginRight: "10px" }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditProduct(null)}
                      style={{ padding: "5px 10px" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditProduct(product);
                        setEditName(product.name);
                        setEditDescription(product.description);
                        setEditPrice(product.price);
                        setEditStartingDate(product.startingDate);
                        setEditEndingDate(product.endingDate);
                      }}
                      style={{ padding: "5px 10px", marginRight: "10px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      style={{ padding: "5px 10px" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Products;