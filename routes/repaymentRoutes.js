const express = require('express');

const {getrepayment,getsinglerepayment,postrepayment,deleteRepayment,updaterepayment,getrepaymentpage}=require('../controller/repayments')
const router = express.Router();


router.post('/repayments',postrepayment)
router.get('/repayments/:id',getsinglerepayment)
router.get('/repayments',getrepayment)
router.put('/repayments/:id',updaterepayment)
router.delete('/repayments/:id',deleteRepayment)
router.get('/repaymentpage',getrepaymentpage)

module.exports = router;