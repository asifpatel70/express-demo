var express = require('express');
var router = express.Router();
var user = require('../controllers/userController');
const { authJwt } = require("../middleware");
var chkLogin = require('../middleware/checkLogin');

/* GET users listing. */
router.get('/',chkLogin.checkLogin,user.index);
router.get('/register',user.register);
router.post('/create',user.create);
router.get('/active/:id',user.active);
router.get('/edit/:id',chkLogin.checkLogin,user.edit);
router.post('/update/:id',chkLogin.checkLogin,user.update);
router.delete('/delete',chkLogin.checkLogin,user.remove);
router.post('/activesubmit',user.activesubmit);
router.get('/myprofile',chkLogin.checkLogin,user.myprofile);
router.get('/changepassword',chkLogin.checkLogin,user.changepassword);
router.post('/password',chkLogin.checkLogin,user.password);
module.exports = router;