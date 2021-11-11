const models = require("../models");
const Product = models.Product;
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
  res.setLocale(req.cookies.i18n);
  const product = await Product.findAll({
    where: {
      isActive: true
    }
  });
  res.render('./product/productList',{products : product,moment: moment,i18n: res});
};
exports.create = (req, res) =>{
  if (req.session.csrf === undefined) {
    req.session.csrf = randomBytes(100).toString('base64');
  }
  res.setLocale(req.cookies.i18n);
  res.render('./product/create',{i18n: res,token: req.session.csrf});
};
exports.store = async (req, res,next) =>{
    upload.single('image')(req, res, () => {
      if (!req.body.csrf) {
        res.render('./product/create',{token:req.session.csrf,i18n: res,errors:'CSRF Token not included.'});
        return false;
      }
    
      if (req.body.csrf !== req.session.csrf) {
        res.render('./product/create',{token:req.session.csrf,i18n: res,errors:'CSRF Token do not match.'});
        return false;
      }
    
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
            console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
            Product.create({ 
              name: req.body.name, 
              productNumber: req.body.productNumber, 
              price: req.body.price,
              dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              description: req.body.description,
              category: req.body.category,
              status: req.body.status,
              image: req.file.filename,
              createdAt:moment().format('YYYY-MM-DD HH:mm:ss')
            }).then(function(product) {
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
  product = await Product.findByPk(req.params.id)
  .then(product => {
    if(!product) {
        return res.status(404).send({
            message: "product not found with id " + req.params.id
        });            
    }
    res.setLocale(req.cookies.i18n);
    res.render('./product/edit',{product : product,moment: moment,i18n: res,token: req.session.csrf});
  });
};
exports.update = async (req, res) =>{
  upload.single('image')(req, res, () => {
    if (!req.body.csrf) {
      return res.send('CSRF Token not included.');
    }
  
    if (req.body.csrf !== req.session.csrf) {
      return res.send('CSRF Token do not match.');
    }
    Product.update({ 
      name: req.body.name,
      productNumber: req.body.productNumber, 
      price: req.body.price,
      dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
      dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
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
  await Product.update({ 
    isActive: false
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
         res.status(200).end();
      }
    });
  });
  res.download('./public/images/report.pdf', 'report.pdf', (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
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
    attributes: [
        'name',
        'productNumber',
        'price',
        [sequelize.fn('date_format', sequelize.col('dateFrom'), '%d.%m.%Y %H:%i:%s'), 'dateFrom'],
        [sequelize.fn('date_format', sequelize.col('dateTo'), '%d.%m.%Y %H:%i:%s'), 'dateTo'],
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%d.%m.%Y %H:%i:%s'), 'CreatedAt']
    ]});
}
exports.productEn = async() =>
{
  return await Product.findAll({
    attributes: [
        'name',
        'productNumber',
        'price',
        [sequelize.fn('date_format', sequelize.col('dateFrom'), '%d-%m-%Y %H:%i:%s'), 'dateFrom'],
        [sequelize.fn('date_format', sequelize.col('dateTo'),   '%d-%m-%Y %H:%i:%s'), 'dateTo'],
        [sequelize.fn('date_format', sequelize.col('createdAt'),'%d-%m-%Y %H:%i:%s'), 'CreatedAt']
    ]});
}