const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

// Load environment variables from .env
const result = dotEnv.config({ path: './backend/.env' });

if (result.error) {
    console.error("Error loading .env file:", result.error);
    process.exit(1);
}

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

const path = require('path'); // Import path module

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../bid')));






const productRoutes = require('./routes/productroutes');
const authRoutes = require('./routes/authroutes'); // Import auth routes

app.use('/api', productRoutes);
app.use('/api', authRoutes); // Register auth routes

console.log("Environment Variables:", process.env);
if (!process.env.MONGO_URL) {
    console.error("Error: MONGO_URL is not defined in the environment variables.");
    process.exit(1);
}
console.log("MongoDB URI:", process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB Atlas connected successfully");
    })
    .catch((err) => {
        console.log(err);
    });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../bid', 'index.html'));



});

app.listen(PORT, () => {
    console.log(`My Server is running on ${PORT} number`);
});
