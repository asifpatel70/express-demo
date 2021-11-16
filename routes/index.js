var express = require('express');
var router = express.Router();
const auth = require("../controllers/authController");
const login = require("../controllers/loginController");
const moment = require('moment-timezone');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedIn)
  {
    res.redirect('/users')
  }
  else
  {
    var loginerr = req.session.loginError;
    if(req.cookies.i18n === undefined) {
      res.cookie('i18n', 'en');
    }
    req.session.loginError = null;
    res.render('login',{i18n: res,session: loginerr});
  }
});
router.get('/login',(req, res, next)=>{
  if(req.session.loggedIn)
  {
    res.redirect('/users')
  }
  else
  {
    var loginerr = req.session.loginError;
    if(req.cookies.i18n === undefined) {
      res.cookie('i18n', 'en');
    }
    req.session.loginError = null;
    res.render('login',{i18n: res,session: loginerr});
  }   
});
router.post("/auth/signin",auth.signin);
router.post("/login/signin",login.signin);
router.get('/logout', function (req, res) {
  req.session = null
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
