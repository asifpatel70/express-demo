var express = require('express');
var router = express.Router();
const auth = require("../controllers/authController");
const login = require("../controllers/loginController");
const moment = require('moment-timezone');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedIn)
  res.redirect('/users')
  else
  res.redirect('login');
});
router.get('/login',(req, res, next)=>{
  if(req.session.loggedIn)
  {
    res.redirect('/users')
  }
  else
  {
    if(req.cookies.i18n === undefined) {
      res.cookie('i18n', 'en');
    }
    res.render('login');
  }
  
});
router.post("/auth/signin",auth.signin);
router.post("/login/signin",login.signin);
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/login')
});

router.get('/no', function (req, res) {
  res.cookie('i18n', 'no');
  moment.tz.setDefault("CET");
  res.redirect('back');
});

router.get('/en', function (req, res) {
  res.cookie('i18n', 'en');
  moment.tz.setDefault("CET");
  res.redirect('back');
});


module.exports = router;
