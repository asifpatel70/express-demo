const models = require("../../models");
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
        var categories = await Category.findAll({
            where: {
                status: true,
            }
        });
        res.json({
            categories,
        });
    },
    store : async (req,res) =>{
        //let categories = await this.categories();
        //let result = await this.buildTree(categories,0)
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
                return res.json({errorMessage:filtered.map(x => x['errorMessage']).join(',')});
            }
            Category.findAll({
                where: {
                    status: true,
                    name: req.body.name
                }
            }).then(category = async (category) => {
                if (category.length > 0) {
                   return res.json({
                        msg: 'Name already in use'
                    });
                }
                const datacategory = await Category.findOne({
                    where: {
                        status: false,
                        name: req.body.name
                    }
                });
                if (datacategory) {
                    return res.json({
                        msg: 'Category Name is already use but it is in deactivate mode. Please activate'
                    });
                }
                Category.create({
                    name: req.body.name,
                    status: req.body.status,
                    image: (req.file)? req.file.filename : null,
                    parentId:(req.body.category == 'sub') ? req.body.subcategory: null,
                }).then(function (category) {
                   return res.json({
                        msg: 'Created successfully'
                    });
                });
            });
        });
    },
    edit : async (req, res) => {
        category = await Category.findByPk(req.params.id)
            .then(category => {
                if(!category) {
                    return res.json({
                        message: "category not found with id " + req.params.id
                    });
                }
                return res.json({
                       category
                });
            });
    },
    update : async(req,res) => {
        const category = await Category.findByPk(req.params.id);
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
                return res.json({errorMessage:filtered.map(x => x['errorMessage']).join(',')});
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
                return res.json({
                    msg: 'Edited successfully'
                });
            })
        })
    },
    remove : async (req,res) =>{
        upload.none()(req, res, async () => {
            var result =  await this.categoryTree(req.body.id);
            if(result.length>0)
            {
                console.log('in')
                await Category.update({
                    status: false
                },{
                    where: {
                        id: {
                            [Op.in]: result,
                        }
                    }
                });
            }
            await pdoductCategory.destroy({where:{categoryId:{[Op.in]:result}}});
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
        });
    }
}
exports.categoryTree = async (parent_id,categor = []) =>{
    var categories = await Category.findAll({
        where: {
            parentId:parent_id,
            status: true
        }
    });
    await Promise.all(categories.map(async (element) => {
        categor[element.id] = element.id;
        await this.categoryTree(element.id,categor);
    }));
    var filtered = categor.filter(function (el) {
        return el != null;
    });
    return filtered;
}
