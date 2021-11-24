const models = require("../models");
const md5 = require('md5')
const User = models.User;
const { randomBytes } = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require("sequelize");
const { check, oneOf, validationResult } = require('express-validator')
const transporter = nodemailer.createTransport({
  port: 465,               // true for 465, false for other ports
  host: "smtp.gmail.com",
     auth: {
          user: 'asif.patel.hs@gmail.com',
          pass: '****',
       },
  secure: true,
  service: 'Gmail'
});
exports.index = async (req, res) =>{
  res.setLocale(req.cookies.i18n);
  const users = await User.findAll({
    where: {
      isActive: true
    }
  });
  //req.session.loginuserid
  res.render('./user/userList',{users : users,i18n: res,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
};
exports.register = (req, res) =>{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  res.render('./user/register',{i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
};
exports.create = async (req, res,next) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('./user/register',{error: errors.array(),i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    return;
  }
  if (!req.body.csrf) {
    res.render('./user/register',{errors:'CSRF Token not included.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    return false;
  }

  if (req.body.csrf !== req.session.csrf) {
    res.render('./user/register',{errors:'CSRF Token do not match.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    return false;
  }
  User.findAll({
    where: {
      isActive:true,
      [Op.or]: [
        { userName: req.body.userName, },
        { email: req.body.email}
      ]
    }
  }).
  then(user = async (user) => {
    if (user.length > 0) {
      return res.render('./user/register',{errors:'user name or email already in use',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    }
    else{
      const mailData = {
        from: 'asif.patel.hs@gmail.com',  // sender address
          to: req.body.email,   // list of receivers
          subject: 'Registration',
          text: 'Successfully ragister',
          html: '<b>Hey there! </b><br> This is an activation mail<br/>',
      };
      const dataUser = await User.findOne({ where: { isActive:false,
        userName: req.body.userName 
        } 
      });
      if (dataUser){
        return res.render('./user/register',{errors:'user name already in use',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
      }
      const userData = await User.findOne({ where: { isActive:false,
        email: req.body.email
        } 
      });
      if (userData) {
        return res.redirect('/users/active/'+userData.id);
      }
      // else
      // {
        User.create({ 
          name: req.body.firstName, 
          userName: req.body.userName, 
          password: md5(req.body.password),
          email:req.body.email,
          }).then(function(user) {
            transporter.sendMail(mailData, function (err, info) {
              if(err)
                console.log(err)
              else
                console.log(info);
          });
            res.redirect('/users')
        });
      //}
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
    res.render('./user/edit',{users : user,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  });
};
exports.update = async (req, res) =>
{
  user = await User.findByPk(req.params.id);
  if(req.body.firstName == '' || req.body.firstName == undefined)
  {
    return res.render('./user/edit',{errors:'Firstname can not be empty',users : user,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  if (!req.body.csrf) {
    return res.render('./user/edit',{errors:'CSRF Token not included.',users : user,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  if (req.body.csrf !== req.session.csrf) {
    return res.render('./user/edit',{errors:'CSRF Token do not match.',users : user,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  await User.update({ name: req.body.firstName}, {
    where: {
      id: req.params.id
    }
  });
  res.redirect('/users')
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
      notEmpty: true,
      errorMessage: "user Name field cannot be empty",
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
exports.active = (req,res) =>
{
  return res.render('./user/active',{id:req.params.id})
}
exports.activesubmit = async (req,res) =>{
  await User.update({ 
    isActive: true
    },{
    where: {
      id: req.body.id
    }
  }).then(function(user){
    res.redirect('/login')
  });
}
exports.myprofile = async(req,res) =>
{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  user = await User.findByPk(req.session.loginuserid)
      .then(user => {
        res.render('./user/edit',{users : user,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
      });
}
exports.changepassword = async (req,res) =>
{
  return res.render('./user/changePassword',{i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
}
exports.password = async (req,res) =>
{
  user = await User.findByPk(req.session.loginuserid);
  if(req.body.oldPassword == '' || req.body.oldPassword == undefined)
  {
    return res.render('./user/changePassword',{errors:'old password can not be empty.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  if((md5(req.body.oldPassword)) != user.password)
  {
    return res.render('./user/changePassword',{errors:'Old Password does not verify.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  if(req.body.password == '' || req.body.password == undefined)
  {
    return res.render('./user/changePassword',{errors:'new password can not be empty.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  if(req.body.password != req.body.confirmPassword)
  {
    return res.render('./user/changePassword',{errors:'Password Confirmation does not match password.',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  }
  await User.update({
    password: md5(req.body.password)
  },{
    where: {
      id: req.session.loginuserid
    }
  }).then(function(user){
    res.redirect('/users')
  });
}