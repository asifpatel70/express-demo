const models = require("../models");
const Category = models.Category;
const pdoductCategory = models.pdoductCategory;
const { randomBytes } = require('crypto');
const {Op} = require("sequelize");
const multer = require("multer");
const path = require("path");

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
module.exports = {
    index : async (req, res) =>{
        res.setLocale(req.cookies.i18n);
        var categories = await Category.findAll({
            where: {
                status: true,
            }
        });
       // var categories = await this.categories();
       //const result = await this.categoryTree();
        res.render('./category/catList',{categories : categories,i18n: res,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    },
    create : async (req, res) =>{
        if (req.session.csrf === undefined) {
            req.session.csrf = randomBytes(100).toString('base64');
        }
        res.setLocale(req.cookies.i18n);
        let categories = await this.categories();
        let result = await this.buildTree(categories,0)
        res.render('./category/create',{result:result,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
    },
    store : async (req,res) =>{
        let categories = await this.categories();
        let result = await this.buildTree(categories,0)
        upload.single('image')(req, res,function (err){
            const error = [];
            if(err){
                error[2] ={errorMessage:'Only .png, .jpg and .jpeg format allowed!'};
            }
            if(req.body.name == '' || req.body.name == undefined)
            {
                error[0] = {errorMessage:"Name field required"};
            }
            if(req.body.status == '' || req.body.status == undefined)
            {
                error[1] = {errorMessage:'status field required'};
            }
            var filtered = error.filter(function (el) {
                return el != null;
            });
            if(filtered.length > 0){
                res.render('./category/create', {
                    error: filtered,
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn: req.session.loggedIn,
                    loginusername: req.session.loginusername,
                    loginuserid: req.session.loginuserid,
                    result : result
                });
                return false;
            }
            if (!req.body.csrf) {
                res.render('./category/create', {
                    errors: 'CSRF Token not included.',
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn: req.session.loggedIn,
                    loginusername: req.session.loginusername,
                    loginuserid: req.session.loginuserid,
                    result : result
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
                    result : result
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
                        result : result
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
        // const categories = await Category.findAll({
        //     where: {
        //         status: true,
        //         id: {
        //             [Op.ne]: req.params.id,
        //         }
        //     }
        // });
        let categories = await this.categories();
        let result = await this.buildTree(categories,0)
        category = await Category.findByPk(req.params.id)
            .then(category => {
                if(!category) {
                    return res.status(404).send({
                        message: "category not found with id " + req.params.id
                    });
                }
                res.setLocale(req.cookies.i18n);
                res.render('./category/edit',{result:result,category : category,i18n: res,token: req.session.csrf,loggedIn:req.session.loggedIn,loginusername:req.session.loginusername,loginuserid:req.session.loginuserid});
            });
    },
    update : async(req,res) => {
        const category = await Category.findByPk(req.params.id);
        // const categories = await Category.findAll({
        //     where: {
        //         status: true,
        //         id: {
        //             [Op.ne]: req.params.id,
        //         }
        //     }
        // });
        let categories = await this.categories();
        let result = await this.buildTree(categories,0)
        upload.single('image')(req, res,function (err){
            const error = [];
            if(err){
                error[2] ={errorMessage:'Only .png, .jpg and .jpeg format allowed!'};
            }
            if(req.body.name == '' || req.body.name == undefined)
            {
                error[0] = {errorMessage:"Name field required"};
            }
            if(req.body.status == '' || req.body.status == undefined)
            {
                error[1] = {errorMessage:'status field required'};
            }
            var filtered = error.filter(function (el) {
                return el != null;
            });
            if(filtered.length > 0){
                return res.render('./category/edit',{
                    result:result,
                    category : category,
                    error: filtered,
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn:req.session.loggedIn,
                    loginusername:req.session.loginusername,
                    loginuserid:req.session.loginuserid
                });
            }
            if (!req.body.csrf) {
               return  res.render('./category/edit',{
                   result:result,
                    category : category,
                    errors: 'CSRF Token not included.',
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn:req.session.loggedIn,
                    loginusername:req.session.loginusername,
                    loginuserid:req.session.loginuserid
                });
            }

            if (req.body.csrf !== req.session.csrf) {
               return res.render('./category/edit',{
                   result:result,
                    category : category,
                    errors: 'CSRF Token do not match.',
                    i18n: res,
                    token: req.session.csrf,
                    loggedIn:req.session.loggedIn,
                    loginusername:req.session.loginusername,
                    loginuserid:req.session.loginuserid
                });
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
        await pdoductCategory.destroy({where:{categoryId:req.body.id}});
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

exports.categoryTree = async (parent_id = null, sub_mark = '',categor = []) =>{
    var categories = await this.categories(parent_id,sub_mark);
        await Promise.all(categories.map(async (element) => {
        categor[element.id] = sub_mark+element.name;
        await this.categoryTree(element.id, sub_mark+'--',categor);
    }));
    return categor;
}
exports.categories = async () =>{
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