// routes/transactionRoutes.js
const express = require('express');
const controller = require('../controller/transaction');
const router = express.Router();


router.post('/billingTranction',controller.billing)
router.get('/dailytransaction',controller.dailytransactionpage)
router.get('/dailyalltransaction',controller.dailyalltranction)
router.get('/stock',controller.stockPage)
router.get('/showall',controller.showall)

module.exports = router;
