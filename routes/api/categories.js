var express = require('express');
var router = express.Router();
var cat = require('../../controllers/api/categoryController');
var authJwt = require('../../middleware/auth');

router.get('/',authJwt.verifyToken,cat.index);
router.post('/store',authJwt.verifyToken,cat.store);
router.get('/edit/:id',authJwt.verifyToken,cat.edit);
router.post('/update/:id',authJwt.verifyToken,cat.update);
router.delete('/delete',authJwt.verifyToken,cat.remove);
module.exports = router;
