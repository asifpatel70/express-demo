var express = require('express');
var router = express.Router();
var product = require('../controllers/productController');
var chkLogin = require('../middleware/checkLogin');
const { checkSchema } = require('express-validator');
const user = require("../controllers/userController");

/* GET products listing. */
router.get('/',chkLogin.checkLogin,product.index);
router.get('/create',[chkLogin.checkLogin,checkSchema(product.valid())],product.create);
router.get('/edit/:id',chkLogin.checkLogin,product.edit);
router.delete('/delete',chkLogin.checkLogin,product.remove);
router.post('/store',chkLogin.checkLogin,product.store);
router.post('/update/:id',product.update);
router.get('/exportcsv/',product.exportCsv);
router.get('/exportpdf/',product.exportPdf);
router.get('/exportexcl/',product.exportExcl);

module.exports = router;