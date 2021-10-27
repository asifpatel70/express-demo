const models = require("../models");
const Product = models.Product;
const { check, oneOf, validationResult } = require('express-validator')

exports.index = async (req, res) =>{
    const product = await Product.findAll();
    res.render('./product/productList',{products : product});
};
exports.create = (req, res) =>{
    res.render('./product/create');
};
exports.store = async (req, res,next) =>{ 
    Product.create({ 
          name: req.body.name, 
          productNumber: req.body.productNumber, 
          price: req.body.price
          }).then(function(user) {
            res.redirect('/products')
      });
};
exports.edit =  async (req, res) =>{
  product = await Product.findByPk(req.params.id)
  .then(product => {
    if(!product) {
        return res.status(404).send({
            message: "product not found with id " + req.params.id
        });            
    }
    res.render('./product/edit',{product : product});
  });
};
exports.update = async (req, res) =>{
  await Product.update({ name: req.body.name,productNumber: req.body.productNumber, 
    price: req.body.price }, {
    where: {
      id: req.params.id
    }
  });
  res.redirect('/products')
}
exports.remove = async (req,res) =>{
  await Product.destroy({
    where: {
      id: req.params.id
    }
  });
  res.redirect('/products')
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