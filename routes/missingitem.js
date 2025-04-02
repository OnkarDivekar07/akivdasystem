const express = require('express');

const {postmissingitem,getsinglemissingitem,getmissingitem,updatemissingitem,deletemissingitem,getmissingitempage}=require('../controller/missingitem')
const router = express.Router();


router.post('/missingitem',postmissingitem)
router.get('/missingitem/:id',getsinglemissingitem)
router.get('/missingitem',getmissingitem)
router.put('/missingitem/:id',updatemissingitem)
router.delete('/missingitem/:id',deletemissingitem)
router.get('/missingitempage',getmissingitempage)

module.exports = router;