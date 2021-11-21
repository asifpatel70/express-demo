'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Category.hasMany(models.Product, {as: 'category'})
      Category.belongsToMany(models.Product, {through: 'pdoductCategory', foreignKey: 'categoryId', as: 'product'})
    }
  };
  Category.init({
    name: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    image: DataTypes.TEXT,
    parentId:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};