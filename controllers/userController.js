const models = require("../models");
const md5 = require('md5')
const User = models.User;
const { check, oneOf, validationResult } = require('express-validator')

exports.index = async (req, res) =>{
   if(!req.session.loggedIn)
   res.redirect('login');
    
  const users = await User.findAll();
  res.render('./user/userList',{users : users});
};
exports.register = (req, res) =>{
  if(!req.session.loggedIn)
  res.redirect('/login');
  else  
  res.render('./user/register');
};
exports.create = async (req, res,next) =>{ 
    try{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('./user/register',{errors: errors.array()});
        //res.end();
        return;
      }
      User.create({ 
          name: req.body.firstName, 
          userName: req.body.userName, 
          password: md5(req.body.password)
          }).then(function(user) {
            res.redirect('/users')
      });
    }
    catch(err)  
    {
      return next(err)
    }
};
exports.edit =  async (req, res) =>{
  if(!req.session.loggedIn)
  res.redirect('login');
  
  user = await User.findByPk(req.params.id)
  .then(user => {
    if(!user) {
        return res.status(404).send({
            message: "User not found with id " + req.params.id
        });            
    }
    res.render('./user/edit',{users : user});
  });
};
exports.update = async (req, res) =>{
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
  await User.destroy({
    where: {
      id: req.body.id
    }
  });
  //res.redirect('/users')
  res.json({msg:'success'});
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