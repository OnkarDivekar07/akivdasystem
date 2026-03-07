// routes/transactionRoutes.js
const express = require('express');
const controller = require('../controller/transaction');
const router = express.Router();
const isAdmin=require("../middleware/admin")
const isuser=require("../middleware/auth");

router.post('/billingTranction',controller.billing)
router.get('/dailytransaction',controller.dailytransactionpage)
router.get('/dailyalltransaction',controller.dailyalltranction)
router.get('/stock',controller.stockPage)
router.get('/showall',controller.showall)
router.get(
  "/daily-entries-view",
  controller.dailyEntriesView
);
router.post("/rollback/:id",isuser,isAdmin, controller.rollbackTransaction);

module.exports = router;
