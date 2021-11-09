var express = require('express');
var router = express.Router();
var product = require('../../controllers/api/productController');
var authJwt = require('../../middleware/auth');
const { checkSchema } = require('express-validator');

/* GET products listing. */
router.get('/',authJwt.verifyToken,product.index);
router.get('/edit/:id',authJwt.verifyToken,product.edit);
router.delete('/delete',authJwt.verifyToken,product.remove);
router.post('/store',[authJwt.verifyToken,checkSchema(product.valid())],product.store);
router.post('/update/:id',[authJwt.verifyToken,checkSchema(product.valid())],product.update);

module.exports = router;