const express = require('express');
const router = express.Router();
const {
    
    getAllProducts,
    createProduct,
} = require('../controllers/productcontroller');


router.get('/products', getAllProducts);
router.post('/products', createProduct);

module.exports = router;

// API Routes
const Product = mongoose.model('Product', productSchema);
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
  });
  
  app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  });
  
  app.put('/api/products/:id', async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  });
  
  app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  });