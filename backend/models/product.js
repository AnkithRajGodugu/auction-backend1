const mongoose = require('mongoose');
const Product = mongoose.model('Product', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    sellerInfo: {
        username: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
    },

    startingDate: String,
    endingDate: String,
    image: String,
}));

module.exports = { Product };
