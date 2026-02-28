const express = require("express");
const router = express.Router();
const {backfillMarathiNames} = require("../controller/internal.controller");

router.post("/internal/backfill-marathi", backfillMarathiNames);

module.exports = router;