const express = require("express");
const router = express.Router();
const qrController = require("../controller/qrController");

router.post("/generate",qrController.generateQR);

module.exports = router;