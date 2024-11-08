// routes/productRoutes.js
const express = require('express');

const {addProduct,getProduct,deleteproduct,updateProduct}=require('../controller/product')
const router = express.Router();


router.post('/addproduct',addProduct)
router.get('/getproduct',getProduct)
router.put('/updateproduct/:id',updateProduct)
router.delete('/removeproduct/:id',deleteproduct)



module.exports = router;
