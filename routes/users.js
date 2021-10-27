var express = require('express');
var router = express.Router();
const { checkSchema } = require('express-validator');
var user = require('../controllers/userController');
const { authJwt } = require("../middleware");

/* GET users listing. */
router.get('/',user.index);
router.get('/register',user.register);
router.post('/create',checkSchema(user.valid()),user.create);
router.get('/edit/:id', user.edit);
router.post('/update/:id', user.update);
router.get('/delete/:id',user.remove);

module.exports = router;