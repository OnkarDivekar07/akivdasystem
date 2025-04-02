const express = require('express');

const {sendLowStockEmail}=require('../controller/email')
const router = express.Router();


router.post('/email',sendLowStockEmail)

module.exports = router;