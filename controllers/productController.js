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
  console.log(moment());
  res.setLocale(req.cookies.i18n);
  const product = await Product.findAll();
  res.render('./product/productList',{products : product,moment: moment,i18n: res});
};
exports.create = (req, res) =>{
  res.setLocale(req.cookies.i18n);
    res.render('./product/create',{i18n: res});
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
              dateFrom: moment.tz(req.body.dateFrom, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              dateTo: moment.tz(req.body.dateTo, 'DD-MM-YYYY', 'CET').format('YYYY-MM-DD'),
              description: req.body.description,
              category: req.body.category,
              status: req.body.status,
              image: req.file.filename,
              createdAt:moment().format('YYYY-MM-DD hh:mm:ss')
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
    res.setLocale(req.cookies.i18n);
    res.render('./product/edit',{product : product,moment: moment,i18n: res});
  });
};
exports.update = async (req, res) =>{
  upload.single('image')(req, res, () => {
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

exports.exportCsv = async (req, res,next) =>{
  const product = await Product.findAll({
    attributes: [
        'name',
        'productNumber',
        'price',
        [sequelize.fn('date_format', sequelize.col('dateFrom'), '%Y-%m-%d %H:%i:%s'), 'dateFrom'],
        [sequelize.fn('date_format', sequelize.col('dateTo'), '%Y-%m-%d %H:%i:%s'), 'dateTo'],
        'description',
        'category',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%Y-%m-%d %H:%i:%s'), 'CreatedAt']
    ]});
  const jsonData = JSON.parse(JSON.stringify(product));
  const json2csvParser = new Json2csvParser({ header: true});
  const csv = json2csvParser.parse(jsonData);
  res.header('Content-Type', 'text/csv');
  res.attachment(product.csv);
  return res.send(csv);
};
exports.exportPdf = async (req, res,next) =>{
  const product = await Product.findAll({
    attributes: [
        'name',
        'productNumber',
        'price',
        [sequelize.fn('date_format', sequelize.col('dateFrom'), '%Y-%m-%d %H:%i:%s'), 'dateFrom'],
        [sequelize.fn('date_format', sequelize.col('dateTo'), '%Y-%m-%d %H:%i:%s'), 'dateTo'],
        'description',
        'category',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%Y-%m-%d %H:%i:%s'), 'CreatedAt']
    ]});
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
  // const json2csvParser = new Json2csvParser({ header: true});
  // const csv = json2csvParser.parse(jsonData);  
  // res.header('Content-Type', 'application/pdf');
  // res.attachment(product.pdf);
  // doc.fillColor('red')
  //    .text("Name",{align: 'left'});
  // doc.fillColor('red')
  //    .text("Product Number",{align: 'left'});
  // doc.fillColor('red')
  //    .text("Price",{align: 'left'});
  // doc.fillColor('red')
  //    .text("Image",{align: 'left'});
  // jsonData.forEach(obj => {
    
  // });
  // doc.pipe(res);
  // doc.end();
 // res.render('./product/productList',{products : product,moment: moment});
};
exports.exportExcl = async (req, res,next) =>{
  const product = await Product.findAll({
    attributes: [
        'name',
        'productNumber',
        'price',
        [sequelize.fn('date_format', sequelize.col('dateFrom'), '%Y-%m-%d %H:%i:%s'), 'dateFrom'],
        [sequelize.fn('date_format', sequelize.col('dateTo'), '%Y-%m-%d %H:%i:%s'), 'dateTo'],
        'description',
        'category',
        [sequelize.fn('date_format', sequelize.col('createdAt'), '%Y-%m-%d %H:%i:%s'), 'CreatedAt']
    ]});
  const jsonProducts = JSON.parse(JSON.stringify(product));

  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Products");

  worksheet.columns = [
    { header: "Name", key: "name", width: 5 },
    { header: "Product Number", key: "productNumber", width: 25 },
    { header: "Price", key: "price", width: 25 },
    { header: "Date From", key: "dateFrom", width: 10 },
    { header: "Date TO", key: "dateTo", width: 10 },
    { header: "Description", key: "description", width: 10 },
    { header: "Category", key: "category", width: 10 },
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