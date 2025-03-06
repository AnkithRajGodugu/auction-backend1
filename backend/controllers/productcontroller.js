const { Product } = require('../models/product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            success: true,
            data: products
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    const { name, description, price, sellerInfo } = req.body;
    
    // Notify frontend or update categories after product creation
    const notifyFrontend = () => {
        // Logic to notify frontend or update categories
    };


    

    // Validate required fields
    if (!name || !description || !price || !sellerInfo || !sellerInfo.username || !sellerInfo.contactNumber || !sellerInfo.email) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        
        const product = await Product.create(req.body);
        notifyFrontend(); // Call the function to notify frontend






        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, sellerInfo } = req.body;

    // Validate required fields
    if (!name || !description || !price || !sellerInfo || !sellerInfo.username || !sellerInfo.contactNumber || !sellerInfo.email) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
