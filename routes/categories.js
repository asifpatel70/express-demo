var express = require('express');
var router = express.Router();
var cat = require('../controllers/categoryController');
const { authJwt } = require("../middleware");
var chkLogin = require('../middleware/checkLogin');

router.get('/',chkLogin.checkLogin,cat.index);
router.get('/create',chkLogin.checkLogin,cat.create);
router.post('/store',chkLogin.checkLogin,cat.store);
router.get('/edit/:id',chkLogin.checkLogin,cat.edit);
router.post('/update/:id',chkLogin.checkLogin,cat.update);
router.delete('/delete',chkLogin.checkLogin,cat.remove);
module.exports = router;