const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const {
    getAllProducts,
    createProduct,
updateProduct,
} = require('../controllers/productcontroller');


router.get('/products', getAllProducts);
router.post('/products', createProduct);

router.put('/products/:id', updateProduct);
module.exports = router;
