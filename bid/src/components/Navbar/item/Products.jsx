//components/Products.js

import React, { useState, useEffect } from "react";
import axios from "axios";

function Products() {
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products');
                console.log(response.data); // Log the API response
                setProducts(Array.isArray(response.data) ? response.data : []); // Ensure products is an array

            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const defaultSellerInfo = {
        username: "User 123",
        contactNumber: "9898989898",
        email: "user123@gmail.com",
    };

    const defaultProduct = {
        name: "",
        description: "",
        price: 0,
        sellerInfo: defaultSellerInfo,
        startingDate: "",
        endingDate: "",
        image: null,
    };

    const [products, setProducts] = useState([]); 
    const [newProduct, setNewProduct] = useState(defaultProduct);
    const [editProduct, setEditProduct] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editStartingDate, setEditStartingDate] = useState("");
    const [editEndingDate, setEditEndingDate] = useState("");

    const handleInputChange = (e) => {
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

    const handleImageChange = (e) => {
        setEditProduct({
            ...editProduct,
            image: e.target.files[0],
        });
    };

const addProduct = async () => {
    try {
        const response = await axios.post('/api/products', newProduct);
        setProducts([...products, response.data]);
        setNewProduct(defaultProduct);
    } catch (error) {
        console.error("Error adding product:", error);
    }

    };

    const deleteProduct = (index) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const updateProduct = (index) => {
        const updatedProducts = [...products];
        const updatedProduct = {
            ...editProduct,
            name: editName,
            description: editDescription,
            price: editPrice,
            startingDate: editStartingDate,
            endingDate: editEndingDate,
        };
        updatedProducts[index] = updatedProduct;
        setProducts(updatedProducts);
        setEditProduct(null);
        // Clear edit fields
        setEditName("");
        setEditDescription("");
        setEditPrice("");
        setEditStartingDate("");
        setEditEndingDate("");
    };

    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                maxWidth: "800px",
                margin: "0 auto",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Products</h2>
            <div>
                <h3>Add New Product</h3>
                <div style={{ marginBottom: "10px" }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={newProduct.name}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, description: e.target.value })
                        }
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, price: e.target.value })
                        }
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <input
                        type="text"
                        name="startingDate"
                        placeholder="Starting Date"
                        value={newProduct.startingDate}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, startingDate: e.target.value })
                        }
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <input
                        type="text"
                        name="endingDate"
                        placeholder="Ending Date"
                        value={newProduct.endingDate}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, endingDate: e.target.value })
                        }
                        style={{ marginRight: "10px", padding: "5px" }}
                    />
                    <input
                        type="file"
                        name="image"
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, image: e.target.files[0] })
                        }
                        style={{ padding: "5px" }}
                    />
                    <button
                        onClick={addProduct}
                        style={{ padding: "5px 10px", marginLeft: "10px" }}
                    >
                        Add Product
                    </button>
                </div>
            </div>
            <div>
                <h3>Products List</h3>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {products.map((product, index) => (
                        <li
                            key={index}
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
                                        src={URL.createObjectURL(product.image)}
                                        alt="Product"
                                        style={{
                                            marginRight: "10px",
                                            width: "100px",
                                            height: "auto",
                                            borderRadius: "5px",
                                        }}
                                    />
                                )}
                                <div>
                                    <strong>Name:</strong> {product.name}
                                    <br />
                                    <strong>Description:</strong> {product.description}
                                    <br />
                                    <strong>Price:</strong> ${product.price}
                                    <br />
                                    <strong>Starting Date:</strong> {product.startingDate}
                                    <br />
                                    <strong>Ending Date:</strong> {product.endingDate}
                                    <br />
                                    <strong>Seller Info:</strong> <br />
                                    Username: {product.sellerInfo.username}
                                    <br />
                                    Contact Number: {product.sellerInfo.contactNumber}
                                    <br />
                                    Email: {product.sellerInfo.email}
                                </div>
                            </div>
                            <div>
                                {editProduct === product ? (
                                    <>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editName}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "10px", padding: "5px" }}
                                        />
                                        <input
                                            type="text"
                                            name="description"
                                            value={editDescription}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "10px", padding: "5px" }}
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            value={editPrice}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "10px", padding: "5px" }}
                                        />
                                        <input
                                            type="text"
                                            name="startingDate"
                                            value={editStartingDate}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "10px", padding: "5px" }}
                                        />
                                        <input
                                            type="text"
                                            name="endingDate"
                                            value={editEndingDate}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "10px", padding: "5px" }}
                                        />
                                        <input
                                            type="file"
                                            name="image"
                                            onChange={handleImageChange}
                                            style={{ padding: "5px" }}
                                        />
                                        <button
                                            onClick={() => updateProduct(index)}
                                            style={{ padding: "5px 10px", marginLeft: "10px" }}
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => setEditProduct(null)}
                                            style={{ padding: "5px 10px", marginLeft: "10px" }}
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
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(index)}
                                            style={{ marginLeft: "10px" }}
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
