const express = require("express");
const router = express.Router();

const reorderController = require("../controller/reorderController");

// Suggested reorder quantities
router.get(
  "/suggested-order-quantity",
  reorderController.getSuggestedOrderQuantity
);

module.exports = router;