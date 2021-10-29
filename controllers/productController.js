const models = require("../models");
const Product = models.Product;
const multer = require('multer');
var path = require('path');
const { Op } = require("sequelize");


const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now() 
        + path.extname(file.originalname))
  }
});
const upload = multer({ storage: imageStorage })

exports.index = async (req, res,next) =>{
  const product = await Product.findAll();
  res.render('./product/productList',{products : product});
};
exports.create = (req, res) =>{
    res.render('./product/create');
};
exports.store = async (req, res,next) =>{
    upload.single('image')(req, res, () => {
      Product.findAll({
        where: {
          productNumber: req.body.productNumber
        }
      }).then(product => {
          if (product.length > 0) {
              res.render('./product/create',{errors:'Product number already in use'});
              return false;
          }
          else{
            Product.create({ 
              name: req.body.name, 
              productNumber: req.body.productNumber, 
              price: req.body.price,
              dateFrom: req.body.dateFrom,
              dateTo: req.body.dateTo,
              description: req.body.description,
              category: req.body.category,
              status: req.body.status,
              image: req.file.filename
            }).then(function(product) {
                  res.redirect('/products')
            });
          }            
      })
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
  upload.single('image')(req, res, () => {
    Product.update({ 
      name: req.body.name,
      productNumber: req.body.productNumber, 
      price: req.body.price,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status, 
      image: (req.file)? req.file.filename : req.body.image_edit,
    }, {
      where: {
        id: req.params.id
      }
    }).then(function(product) {
      res.redirect('/products')
    })
  })
}
exports.remove = async (req,res) =>{
  await Product.destroy({
    where: {
      id: req.body.id
    }
  });
  //res.redirect('/products')
  res.json({msg:'success'});
}
exports.valid = () =>{
return {
    name:{
      notEmpty: true,
      errorMessage: "Name field cannot be empty"

    },
    productNumber: {
        custom: {
            options: value => {
                return Product.findAll({
                  where: {
                    productNumber: value
                  }
                }).then(product => {
                    if (product.length > 0) {
                        return Promise.reject('Product number already in use')
                    }
                })
            }
        }
    },
    price:{
      notEmpty: true,
      errorMessage: "Name field cannot be empty"
    },
  }
}