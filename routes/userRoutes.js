const express = require('express')

const router = express.Router();

const Controller = require('../controller/user')


router.post('/verifyOTP', Controller.verifyOTP)
router.post('/sendOTP', Controller.sendOTP)
// router.get('/get-new-token', Controller.updatetoken)
// router.get('', Controller.usergethomePage);


module.exports = router;