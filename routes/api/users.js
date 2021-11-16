var express = require('express');
var router = express.Router();
var user = require('../../controllers/api/userController');
var authJwt = require('../../middleware/auth');
const {body, checkSchema, validationResult} = require('express-validator');

/* GET users listing. */
router.get('/',authJwt.verifyToken,user.index);
// router.get('/register',authJwt.verifyToken,user.register);
 router.post('/create',checkSchema(user.valid()),user.create);
 router.get('/edit/:id',authJwt.verifyToken,user.edit);
 router.post('/update/:id',authJwt.verifyToken,user.update);
 router.delete('/delete',authJwt.verifyToken,user.remove);

module.exports = router;