// routes/productRoutes.js
const express = require('express');

const {addProduct,getProduct,deleteproduct,updateProduct,getProductById,addStock}=require('../controller/product')
const router = express.Router();


router.post('/addproduct',addProduct)
router.post("/add-stock", addStock);
router.get('/getproduct',getProduct)
router.get("/:id",getProductById);
router.put('/updateproduct/:id',updateProduct)
router.delete('/removeproduct/:id',deleteproduct)




module.exports = router;
