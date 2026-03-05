const express = require('express');
const isuser=require("../middleware/auth");
const isAdmin=require("../middleware/admin")
const {sendLowStockEmail}=require('../controller/email')
const router = express.Router();


router.post('/email',isuser,isAdmin,sendLowStockEmail)

module.exports = router;