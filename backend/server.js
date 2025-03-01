const express=require("express")
const MongoClient=require("mongoose")
const dotEnv=require("dotenv")
const bodyParser=require("body-parser")
const cors = require('cors');
const app=express();


dotEnv.config();
app.use(bodyParser.json());
app.use(cors());
const PORT=process.env.PORT||5000;
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

MongoClient.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("MongoDB Atlas connected successfully")
})
.catch((err)=>{
    console.log(err);
})
app.listen(PORT,()=>{
    console.log(`My Server is running on ${PORT} number`)
});