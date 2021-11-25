const models = require("../../models");
const Product = models.Product;
const Category = models.Category;
const pdoductCategory = models.pdoductCategory;
const {Op} = require("sequelize");
const { check, oneOf, validationResult } = require('express-validator')
const multer = require('multer');
var path = require('path');
const moment = require('moment-timezone');


const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() 
          + path.extname(file.originalname))
    }
  });
  const upload = multer({ storage: imageStorage,
      fileFilter: (req, file, cb) => {
          if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
              cb(null, true);
          } else {
              cb(null, false);
              return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
          }
      }
  })
  
exports.index = async (req, res,next) =>{
    const product = await Product.findAll({
      where: {
        isActive: true
      },
        include: ['category'],
    });
    res.json({
        product,
    });
};
exports.store = async (req, res,next) =>{
    // const errors = validationResult(req);
    // console.log(errors)
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({
    //     errors: errors.array()
    //     });
    // }
    upload.single('image')(req, res, function (err) {
        if(err){
            return res.json({errorMessage:'Only .png, .jpg and .jpeg format allowed!'});
        }
        if(req.body.name == undefined)
        {
            return res.json({errorMessage:"name field required"}); 
        }
        if(req.body.productNumber == undefined)
        {
            return res.json({errorMessage:'productNumber field required'}); 
        }
        if(req.body.price == undefined)
        {
            return res.json({errorMessage:'price field required'}); 
        }
        if(req.body.dateFrom == undefined)
        {
            return res.json({errorMessage:'dateFrom field required'}); 
        }
        if(req.body.dateTo == undefined)
        {
            return res.json({errorMessage:'dateTo field required'}); 
        }
        if(req.body.description == undefined)
        {
            return res.json({errorMessage:'description field required'}); 
        }
        if(req.body.category == undefined)
        {
            return res.json({errorMessage:'category field required'}); 
        }
        if(req.body.status == undefined)
        {
            return res.json({errorMessage:'status field required'}); 
        }
      Product.findAll({
        where: {
          productNumber: req.body.productNumber
        }
      }).then(product => {
          if (product.length > 0) {
            res.json({
               msg: 'Product number already in use'
            });
          }
          else{
            Product.create({ 
              name: req.body.name, 
              productNumber: req.body.productNumber, 
              price: req.body.price,
              dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              description: req.body.description,
              status: req.body.status,
              image: (req.file)? req.file.filename : null,
              createdAt:moment().format('YYYY-MM-DD HH:mm:ss')
            }).then(function(product) {
                var categoryArray = req.body.category.split(',');
                for (var i=0; i<categoryArray.length; i++){
                    pdoductCategory.create({
                            productId: product.id,
                            categoryId: categoryArray[i]
                        }
                    )
                }
                res.json({
                    msg: 'Product created'
                 });
            });
          }            
      })
    });
};
exports.edit =  async (req, res) =>{
    product = await Product.findOne({
            where: {
                isActive:true,
                id: req.params.id
            },
            include: ['category']
        }).then(product => {
      if(!product) {
          return res.json({
              message: "product not found with id " + req.params.id
          });            
      }else
      {
        res.json({
            product,
        });
      }
    });
};
exports.update = async (req, res) =>{
    upload.single('image') (req, res, async function (err) {
        if(err){
            return res.json({errorMessage:'Only .png, .jpg and .jpeg format allowed!'});
        }
        const dataProduct = await Product.findOne({
                where: {
                    isActive:true,
                    productNumber: req.body.productNumber,
                    id: {
                        [Op.ne]: req.params.id,
                    }
                }
        });
        if (dataProduct){
            return res.json({msg: 'product number already in use'});
        }
      Product.update({ 
        name: req.body.name,
        productNumber: req.body.productNumber, 
        price: req.body.price,
        dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
        dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
        description: req.body.description,
        status: req.body.status, 
        image: (req.file)? req.file.filename : req.body.image_edit
      }, {
        where: {
          id: req.params.id
        }
      }).then(product= async (product)  => {
          await pdoductCategory.destroy({
              where: {
                  productId: req.params.id
              }
          });
          var categoryArray = req.body.category.split(',');
          for (var i=0; i<categoryArray.length; i++){
              pdoductCategory.create({
                      productId: req.params.id,
                      categoryId: categoryArray[i]
                  }
              )
          }
        res.json({
            msg: 'Product Edited Successfully'
         });
      })
    })
}
exports.remove = async (req,res) =>{
    upload.none()(req, res, () => {
      Product.update({isActive: false,productNumber : 'DEL'+moment()},{
        where: {
          id: req.body.id
        }
      });
        res.json({msg:'Deleted successfully'});
    })
}
exports.valid = () =>{
    return {
        name:{
          notEmpty: true,
          errorMessage: "Name field isrequired"
    
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
            errorMessage: "price field isrequired"
        },
        dateFrom:{
            notEmpty: true,
            errorMessage: "dateFrom field isrequired"
        },
        dateTo:{
            notEmpty: true,
            errorMessage: "dateTo field isrequired"
        },
        description:{
            notEmpty: true,
            errorMessage: "description field isrequired"
        },
        image:{
            notEmpty: true,
            errorMessage: "image field isrequired"
        },
        category:{
            notEmpty: true,
            errorMessage: "category field isrequired"
        },
        status:{
            notEmpty: true,
            errorMessage: "status field isrequired"
        }
    }
}
    