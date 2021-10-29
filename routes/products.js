var express = require('express');
var router = express.Router();
var product = require('../controllers/productController');
var chkLogin = require('../middleware/checkLogin');

/* GET products listing. */
router.get('/',chkLogin.checkLogin,product.index);
router.get('/create',chkLogin.checkLogin,product.create);
router.get('/edit/:id',chkLogin.checkLogin,product.edit);
router.delete('/delete',chkLogin.checkLogin,product.remove);
router.post('/store',chkLogin.checkLogin,product.store);
router.post('/update/:id',product.update);

module.exports = router;