const models = require("../models");
const Product = models.Product;
const Category = models.Category;
const pdoductCategory = models.pdoductCategory;
const multer = require('multer');
var path = require('path');
//const { Op } = require("sequelize");
const moment = require('moment-timezone');
const Json2csvParser = require("json2csv").Parser;
var PDFDocument = require('pdfkit');
const doc = new PDFDocument();
const excel = require("exceljs");
const sequelize = require('sequelize');
var pdf = require("html-pdf");
var { randomBytes } = require('crypto');
const { check, oneOf, validationResult } = require('express-validator');



const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now() 
        + path.extname(file.originalname))
  }
});
const upload = multer({
  storage: imageStorage,
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
  res.setLocale(req.cookies.i18n);
  const product = await Product.findAll({
    where: {
      isActive: true
    },
    include: ['category'],
    attributes: [
      'name',
      'productNumber',
      'price','image','id',
      [sequelize.fn('date_format', sequelize.col('dateFrom'), '%d-%m-%Y'), 'dateFrom'],
      [sequelize.fn('date_format', sequelize.col('dateTo'), '%d-%m-%Y'), 'dateTo'],
      [sequelize.fn('date_format', sequelize.col('Product.createdAt'), '%d-%m-%Y %H:%i:%s'), 'createdAt'],
      [sequelize.fn('date_format', sequelize.col('Product.updatedAt'), '%d-%m-%Y %H:%i:%s'), 'updatedAt'],
    ]
  });
  res.render('./product/productList',{products : product,moment: moment,i18n: res,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
};
exports.create = async (req, res) =>{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  // const categories = await Category.findAll({
  //   where: {
  //     status: true,
  //   }
  // });
  let categories = await this.categories();
  let result = await this.buildTree(categories,0)
  res.render('./product/create',{result:result,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
};
exports.store = async (req, res,next) =>{
    // const categories = await Category.findAll({
    //   where: {
    //     status: true,
    //   }
    // });
    let categories = await this.categories();
    let result = await this.buildTree(categories,0)
    upload.single('image')(req, res, function (err) {
      const error = [];
      if(err){
        error[8] ={errorMessage:'Only .png, .jpg and .jpeg format allowed!'};
      }
      if(req.body.name == '' || req.body.name == undefined)
      {
         error[0] = {errorMessage:"Name field required"};
      }
      if(req.body.productNumber == '' || req.body.productNumber == undefined)
      {
        error[1] = {errorMessage:'ProductNumber field required'};
      }
      if(req.body.price == '' || req.body.price == undefined)
      {
        error[2] ={errorMessage:'Price field required'};
      }
      if(req.body.dateFrom == undefined || req.body.dateFrom == '')
      {
        error[3] ={errorMessage:'DateFrom field required'};
      }
      if(req.body.dateTo == undefined || req.body.dateTo == '')
      {
        error[4] = {errorMessage:'DateTo field required'};
      }
      if(req.body.description == undefined || req.body.description == '')
      {
        error[5] = {errorMessage:'Description field required'};
      }
      if(req.body.category == undefined || req.body.category == '')
      {
        error[6] = {errorMessage:'Category field required'};
      }
      if(req.body.status == undefined ||  req.body.status == '')
      {
        error[7] ={errorMessage:'Status field required'};
      }
      var filtered = error.filter(function (el) {
        return el != null;
      });
      if(filtered.length > 0){
        return res.render('./product/create',{result:result,error: filtered,token:req.session.csrf,i18n: res,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
      }
      if (!req.body.csrf) {
        return res.render('./product/create',{result:result,token:req.session.csrf,i18n: res,errors:'CSRF Token not included.',loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
      }
    
      if (req.body.csrf !== req.session.csrf) {
        return res.render('./product/create',{result:result,token:req.session.csrf,i18n: res,errors:'CSRF Token do not match.',loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
      }
    
      Product.findAll({
        where: {
          productNumber: req.body.productNumber
        }
      }).then(product => {
          if (product.length > 0) {
            return res.render('./product/create',{result:result,errors:'Product number already in use',i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
          }
          else{
            if(req.cookies.i18n == 'no')
            {
              moment.tz.setDefault("CET");
            }else
            {
              moment.tz.setDefault("Asia/Kolkata");
            }
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
              for (var i=0; i<req.body.category.length; i++){
                pdoductCategory.create({
                      productId: product.id,
                      categoryId: req.body.category[i]
                  }
                )
              }
              res.redirect('/products')
            });
          }            
      })
    });
};
exports.edit =  async (req, res) =>{  
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  // const categories = await Category.findAll({
  //   where: {
  //     status: true,
  //   }
  // });
  let categories = await this.categories();
  let result = await this.buildTree(categories,0)
  product = await Product.findByPk(req.params.id, {include: ['category']})
  .then(product => {
    if(!product) {
        return res.status(404).send({
            message: "product not found with id " + req.params.id
        });            
    }
    res.setLocale(req.cookies.i18n);
    res.render('./product/edit',{result:result,product : product,moment: moment,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
  });
};
exports.update = async (req, res) =>{
  // const categories = await Category.findAll({
  //   where: {
  //     status: true,
  //   }
  // });
  let categories = await this.categories();
  let result = await this.buildTree(categories,0)
  product = await Product.findByPk(req.params.id, {include: ['category']});
  upload.single('image')(req, res,function (err) {
    const error = [];
    if(err){
      error[8] ={errorMessage:'Only .png, .jpg and .jpeg format allowed!'};
    }
    if(req.body.name == '' || req.body.name == undefined)
    {
      error[0] = {errorMessage:"Name field required "};
    }
    if(req.body.productNumber == '' || req.body.productNumber == undefined)
    {
      error[1] = {errorMessage:'Product Number field required '};
    }
    if(req.body.price == '' || req.body.price == undefined)
    {
      error[2] ={errorMessage:'Price field required '};
    }
    if(req.body.dateFrom == undefined || req.body.dateFrom == '')
    {
      error[3] ={errorMessage:'DateFrom field required '};
    }
    if(req.body.dateTo == undefined || req.body.dateTo == '')
    {
      error[4] = {errorMessage:'DateTo field required '};
    }
    if(req.body.description == undefined || req.body.description == '')
    {
      error[5] = {errorMessage:'Description field required '};
    }
    if(req.body.category == undefined || req.body.category == '')
    {
      error[6] = {errorMessage:'Category field required '};
    }
    if(req.body.status == undefined ||  req.body.status == '')
    {
      error[7] ={errorMessage:'Status field required '};
    }
    var filtered = error.filter(function (el) {
      return el != null;
    });
    if(filtered.length > 0){
      return res.render('./product/edit',{error: filtered,result:result,product : product,moment: moment,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    }
    if (!req.body.csrf) {
      return res.render('./product/edit',{errors:'CSRF Token not included.',result:result,product : product,moment: moment,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    }
  
    if (req.body.csrf !== req.session.csrf) {
      return res.render('./product/edit',{errors:'CSRF Token do not match.',result:result,product : product,moment: moment,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    }
    Product.update({ 
      name: req.body.name,
      productNumber: req.body.productNumber, 
      price: req.body.price,
      dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
      dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
      description: req.body.description,
      status: req.body.status, 
      image: (req.file)? req.file.filename : req.body.image_edit,
    }, {
      where: {
        id: req.params.id
      }
    }).then(product= async (product) => {
        await pdoductCategory.destroy({
          where: {
            productId: req.params.id
          }
        });
        for (var i=0; i<req.body.category.length; i++){
          pdoductCategory.create({
                productId: req.params.id,
                categoryId: req.body.category[i]
              }
          )
        }
      res.redirect('/products')
    })
  })
}
exports.remove = async (req,res) =>{
  await Product.update({ 
    isActive: false,
    productNumber : 'DEL'+moment()
    },{
    where: {
      id: req.body.id
    }
  }).then(function(product){
    res.json({msg:'success'});
  });
  //res.redirect('/products')
  //res.json({msg:'success'});
}
exports.valid = () =>{
return {
    name:{
      notEmpty: true,
      errorMessage: "Name field cannot be empty"

    },
    productNumber: {
      notEmpty: true,
      errorMessage: "Product Number cannot be empty",
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
    dateFrom:{
        notEmpty: true,
        errorMessage: "Name field cannot be empty"
      },
    dateTo:{
        notEmpty: true,
        errorMessage: "Name field cannot be empty"
      },
    status:{
        notEmpty: true,
        errorMessage: "Name field cannot be empty"
      },
    description:{
        notEmpty: true,
        errorMessage: "Name field cannot be empty"
      },
    category:{
        notEmpty: true,
        errorMessage: "Name field cannot be empty"
      }
  }
}

exports.exportCsv = async (req, res,next) =>{
  if(req.cookies.i18n == 'no'){
    product = await this.productNo();
  }else{
    product = await this.productEn();
  }
  const jsonData = JSON.parse(JSON.stringify(product));
  const json2csvParser = new Json2csvParser({ header: true});
  const csv = json2csvParser.parse(jsonData);
  res.header('Content-Type', 'text/csv');
  res.attachment(product.csv);
  return res.send(csv);
};
exports.exportPdf = async (req, res,next) =>{
  if(req.cookies.i18n == 'no'){
    product = await this.productNo();
  }else{
    product = await this.productEn();
  }
  const jsonData = JSON.parse(JSON.stringify(product));
  res.render('./product/table',{products:jsonData}, (err, data) => {
    if (err) {
          res.send(err);
    }else{
      var options = {
        "height": "11.25in",
        "width": "8.5in",
        "header": {
            "height": "20mm"
        },
        "footer": {
            "height": "20mm",
        },
      };
    }
    pdf.create(data, options).toFile("./public/images/report.pdf", function (err, data) {
      if (err) {
          res.send(err);
      } else {
        res.download('./public/images/report.pdf', 'report.pdf', (err) => {
          if (err) {
            res.status(500).send({
              message: "Could not download the file. " + err,
            });
          }
        });
      }
    });
  });
  
};
exports.exportExcl = async (req, res,next) =>{
  if(req.cookies.i18n == 'no'){
    product = await this.productNo();
  }else{
    product = await this.productEn();
  }
  const jsonProducts = JSON.parse(JSON.stringify(product));

  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Products");

  worksheet.columns = [
    { header: "Name", key: "name", width: 5 },
    { header: "Product Number", key: "productNumber", width: 25 },
    { header: "Price", key: "price", width: 25 },
    { header: "Date From", key: "dateFrom", width: 10 },
    { header: "Date TO", key: "dateTo", width: 10 },
    { header: "CreatedAt", key: "CreatedAt", width: 10 },
  ];
  worksheet.addRows(jsonProducts);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "products.xlsx"
  );
  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};
exports.productNo = async() =>
{
  return await Product.findAll({
    where: {
      isActive: true
    },
    attributes: [
      'name',
      'productNumber',
      'price',
      [sequelize.fn('date_format', sequelize.col('dateFrom'), '%d.%m.%Y %H:%i:%s'), 'dateFrom'],
      [sequelize.fn('date_format', sequelize.col('dateTo'), '%d.%m.%Y %H:%i:%s'), 'dateTo'],
      [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y %H:%i:%s'), 'createdAt']
    ]
  });
}
exports.productEn = async() =>
{
  return await Product.findAll({
    where: {
      isActive: true
    },
    attributes: [
      'name',
      'productNumber',
      'price',
      [sequelize.fn('date_format', sequelize.col('dateFrom'), '%d-%m-%Y %H:%i:%s'), 'dateFrom'],
      [sequelize.fn('date_format', sequelize.col('dateTo'),   '%d-%m-%Y %H:%i:%s'), 'dateTo'],
      [sequelize.fn('date_format', sequelize.col('createdAt'),'%d-%m-%Y %H:%i:%s'), 'createdAt']
    ]
  });
}
exports.categories = async (parent_id=null,sub_mark='') =>{
  // if(parent_id == null)
  // {
  //     var categories = await Category.findAll({
  //         where: {
  //             parentId: null
  //         }
  //     });
  // }
  // else
  // {
  //     var categories = await Category.findAll({
  //         where: {
  //             parentId: parent_id
  //         }
  //     });
  // }
  // return categories;
  const categories = await Category.findAll({
    where: {
      status: true,
    }
  });
  arr=[];
  categories.forEach( element => {
    arr[element.id] = {'parentId':element.parentId,'name':element.name}
  });
  return arr;
}
exports.buildTree= async (categories,parent_id,sub_mark='',categor = []) =>{
  await categories.forEach((element,key) => {
    if(element.parentId == null)
    {
      element.parentId = 0;
    }

    if(element.parentId === parent_id)
    {
      categor[parent_id+'_'+key] = {name:sub_mark+element.name,id:key};
      this.buildTree(categories,key,sub_mark+'--',categor);
    }
  });
  var finalarr=[];
  var count=0;
  var cat =Object.assign({}, categor);
  for (const [key, value] of Object.entries(cat)) {
    finalarr[count] = value
    count++;
  }
  return finalarr;
}