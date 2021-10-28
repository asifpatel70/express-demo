var express = require('express');
var router = express.Router();
const { checkSchema } = require('express-validator');
var product = require('../controllers/productController');

/* GET products listing. */
router.get('/',product.index);
router.get('/create',product.create);
router.post('/store',checkSchema(product.valid()),product.store);
router.get('/edit/:id', product.edit);
router.post('/update/:id', product.update);
router.delete('/delete',product.remove);

module.exports = router;