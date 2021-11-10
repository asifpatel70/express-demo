const models = require("../../models");
var express = require('express');
const md5 = require('md5');
const User = models.User;
const multer = require('multer');
const upload = multer();
const { body, validationResult } = require('express-validator');

exports.index = async (req, res) =>{
    const users =  await User.findAll({
        where: {
          isActive: true
        }
      });
    res.json({
        users,
    });
};
exports.create = async (req, res,next) =>{
    upload.none()(req, res, () => {
        // const errors = validationResult(req);
        // console.log(errors)
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({
        //     errors: errors.array()
        //     });
        // } 
        if(req.body.firstName == undefined)
        {
            return res.json({errorMessage:"firstName field cannot be empty"}); 
        }
        if(req.body.userName == undefined)
        {
            return res.json({errorMessage:'userName field can not be empty'}); 
        }
        if(req.body.password == undefined)
        {
            return res.json({errorMessage:'password field can not be empty'}); 
        }
        User.findAll({
        where: {
            userName: req.body.userName
        }
        }).
        then(user => {
        if (user.length > 0) {
            return res.json({msg: 'user name already in use'});
        }
        else{
            User.create({ 
            name: req.body.firstName, 
            userName: req.body.userName, 
            password: md5(req.body.password)
            }).then(function(user) {
                return res.json({msg: 'User created'});
            });
        }
        })
    })
};
exports.edit =  async (req, res) =>{
    user = await User.findByPk(req.params.id)
    .then(user => {
        if(!user) {
            return res.json({msg: 'User not found with id ' + req.params.id});
        }
        return res.json({user});
    });
};
exports.update = async (req, res) =>{
    upload.none()(req, res, () => {
         User.update({ name: req.body.firstName, userName: req.body.userName }, {
        where: {
            id: req.params.id
        }
        });
    });
    return res.json({msg: 'User Edited Successfully'});
}
exports.remove = async (req,res) =>{
    upload.none()(req, res, () => {
        User.update({ isActive: false},{
            where: {
              id: req.body.id
            }
        });
    });
    return res.json({msg:'Deleted successfully'});
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