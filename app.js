var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
const cors = require("cors");
const session = require('express-session')
var $ = require('jquery');
var i18n = require('i18n');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");


i18n.configure({

//define how many languages we would support in our application
locales:['en', 'no'],

//define the path to language json files, default is /locales
directory: __dirname + '/resources/locales',

//define the default language
defaultLocale: 'en',

// define a custom cookie name to parse locale settings from 
cookie: 'i18n'
});
//console.log(document.cookie)
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');

// // parse application/json
 
 //app.use(cors(corsOptions));
 app.use(cookieParser("i18n_demo"));
 app.use(session({
  secret: '2C44-4D44-WppQ38S',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000000 }
}));

app.use(i18n.init);
app.use('/jquery',express.static(path.join(__dirname+'/node_modules/jquery/dist/')));
//app.use(express.static(path.join(__dirname+'/public')));  


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);

const dotenv = require('dotenv').config();

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
