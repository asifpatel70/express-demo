const models = require("../models");
const Category = models.Category;
const { randomBytes } = require('crypto');
const {Op} = require("sequelize");
const md5 = require("md5");
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");

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


module.exports = {
    index : async (req, res) =>{
        res.setLocale(req.cookies.i18n);
        const categories = await Category.findAll({
            where: {
                status: true
            }
        });
        res.render('./category/catList',{categories : categories,i18n: res,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    },
    create : async (req, res) =>{
        if (req.session.csrf === undefined) {
            req.session.csrf = randomBytes(100).toString('base64');
        }
        res.setLocale(req.cookies.i18n);
        const categories = await Category.findAll({
            where: {
                status: true,
            }
        });
        res.render('./category/create',{categories : categories,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    },
    store : async (req,res) =>{
        const categories = await Category.findAll({
            where: {
                status: true,
            }
        });
        upload.single('image')(req, res, () => {
            if (!req.body.csrf) {
                res.render('./category/create', {
                    errors: 'CSRF Token not included.',
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn: req.session.loggedIn,
                    loginusername: req.session.loginusername,
                    loginuserid: req.session.loginuserid,
                    categories : categories
                });
                return false;
            }

            if (req.body.csrf !== req.session.csrf) {
                return res.render('./category/create', {
                    errors: 'CSRF Token do not match.',
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn: req.session.loggedIn,
                    loginusername: req.session.loginusername,
                    loginuserid: req.session.loginuserid,
                    categories : categories
                });

            }
            Category.findAll({
                where: {
                    status: true,
                    name: req.body.name
                }
            }).then(category = async (category) => {
                if (category.length > 0) {
                    res.render('./category/create', {
                        errors: 'Name already in use',
                        i18n: res,
                        token: req.session.csrf,
                        loggedIn: req.session.loggedIn,
                        loginusername: req.session.loginusername,
                        loginuserid: req.session.loginuserid,
                        categories : categories
                    });
                    return false;
                }
                const datacategory = await Category.findOne({
                    where: {
                        status: false,
                        name: req.body.name
                    }
                });
                if (datacategory) {
                    res.render('./category/create', {
                        errors: 'Category Name is already use but it is in deactivate mode. Please activate',
                        i18n: res,
                        token: req.session.csrf,
                        loggedIn: req.session.loggedIn,
                        loginusername: req.session.loginusername,
                        loginuserid: req.session.loginuserid,
                        categories : categories
                    });
                    return false;
                }
                Category.create({
                    name: req.body.name,
                    status: req.body.status,
                    image: (req.file)? req.file.filename : null,
                    parentId:(req.body.category == 'sub') ? req.body.subcategory: null,
                }).then(function (category) {
                    return res.redirect('/categories')
                });
            });
        });
    },
    edit : async (req, res) => {
        const categories = await Category.findAll({
            where: {
                status: true,
                id: {
                    [Op.ne]: req.params.id,
                }
            }
        });
        category = await Category.findByPk(req.params.id)
            .then(category => {
                if(!category) {
                    return res.status(404).send({
                        message: "category not found with id " + req.params.id
                    });
                }
                res.setLocale(req.cookies.i18n);
                res.render('./category/edit',{categories:categories,category : category,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
            });
    },
    update : async(req,res) => {
        upload.single('image')(req, res, () => {
            if (!req.body.csrf) {
                return res.send('CSRF Token not included.');
            }

            if (req.body.csrf !== req.session.csrf) {
                return res.send('CSRF Token do not match.');
            }
            Category.update({
                name: req.body.name,
                status: req.body.status,
                image: (req.file)? req.file.filename : req.body.image_edit,
                parentId:(req.body.category == 'sub') ? req.body.subcategory: null,
            }, {
                where: {
                    id: req.params.id
                }
            }).then(function(product) {
                res.redirect('/categories')
            })
        })
    },
    remove : async (req,res) =>{
        await Category.update({
            status: false
        },{
            where: {
                id: req.body.id
            }
        }).then(function(category){
            res.json({msg:'success'});
        });
    }
}