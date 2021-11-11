const models = require("../models");
const md5 = require('md5')
const User = models.User;
var { randomBytes } = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
     auth: {
          user: 'asif.patel.hs@gmail.com',
          pass: '@021Asif',
       },
  secure: true,
  service: 'Gmail'
});
const mailData = {
  from: 'asif.patel.hs@gmail.com',  // sender address
    to: 'asif.patel@heliossolutions.co',   // list of receivers
    subject: 'Registration',
    text: 'Successfully ragisterd',
    html: '<b>Hey there! </b><br> This is activation mail<br/>',
};

exports.index = async (req, res) =>{
  res.setLocale(req.cookies.i18n);
  const users = await User.findAll({
    where: {
      isActive: true
    }
  });
  res.render('./user/userList',{users : users,i18n: res});
};
exports.register = (req, res) =>{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  res.render('./user/register',{i18n: res,token: req.session.csrf});
};
exports.create = async (req, res,next) =>{ 
  if (!req.body.csrf) {
    res.render('./user/register',{errors:'CSRF Token not included.'});
    return false;
  }

  if (req.body.csrf !== req.session.csrf) {
    res.render('./user/register',{errors:'CSRF Token do not match.'});
    return false;
  }
  User.findAll({
    where: {
      userName: req.body.userName
    }
  }).
  then(user => {
    if (user.length > 0) {
      res.render('./user/register',{errors:'user name already in use'});
    }
    else{
      User.create({ 
        name: req.body.firstName, 
        userName: req.body.userName, 
        password: md5(req.body.password)
        }).then(function(user) {
          transporter.sendMail(mailData, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
          res.redirect('/users')
      });
    }
  })
};
exports.edit =  async (req, res) =>{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  user = await User.findByPk(req.params.id)
  .then(user => {
    if(!user) {
        return res.status(404).send({
            message: "User not found with id " + req.params.id
        });            
    }
    res.render('./user/edit',{users : user,i18n: res,token: req.session.csrf});
  });
};
exports.update = async (req, res) =>{
  if (!req.body.csrf) {
    return res.send('CSRF Token not included.');
  }

  if (req.body.csrf !== req.session.csrf) {
    return res.send('CSRF Token do not match.');
  }
  await User.update({ name: req.body.firstName, userName: req.body.userName }, {
    where: {
      id: req.params.id
    }
  });
  res.redirect('/users')
  // const users = await User.findAll();
  // res.render('./user/userList',{users : users});
}
exports.remove = async (req,res) =>{
  await User.update({ 
    isActive: false
    },{
    where: {
      id: req.body.id
    }
  }).then(function(product){
    res.json({msg:'success'});
  });
}
exports.valid = () =>{
return {
    firstName:{
      notEmpty: true,
      errorMessage: "Name field cannot be empty"

    },
    userName: {
        custom: {
            options: value => {
                return User.findAll({
                  where: {
                    userName: value
                  }
                }).then(user => {
                    if (user.length > 0) {
                        return Promise.reject('Username already in use')
                    }
                })
            }
        }
    },
    password: {
        isStrongPassword: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
    }
  }
}