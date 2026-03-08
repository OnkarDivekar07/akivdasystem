const express = require("express");
const router = express.Router();
const financeController = require("../controller/financeController");

router.get("/finance-summary", financeController.getFinanceSummary);

module.exports = router;