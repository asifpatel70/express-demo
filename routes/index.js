var express = require('express');
var router = express.Router();
const auth = require("../controllers/authController");
const login = require("../controllers/loginController");


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.loggedIn)
  res.redirect('/users')
  else
  res.redirect('login');
});
router.get('/login',(req, res, next)=>{
  if(req.session.loggedIn)
  res.redirect('/users')
  else
  res.render('login');
});
router.post("/auth/signin",login.signin);
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/login')
});

module.exports = router;
