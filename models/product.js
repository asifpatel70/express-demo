'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Product.belongsTo(models.Category, {foreignKey: 'category', as: 'categoryId'})
      //Product.hasMany(models.Category, {as: 'categoryId'})
      Product.belongsToMany(models.Category, {through: 'pdoductCategory', foreignKey: 'productId', as: 'category'})
    }
  };
  Product.init({
    name: DataTypes.STRING,
    productNumber: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    description: DataTypes.TEXT,
    //category: DataTypes.ENUM('consumerProduct','IndustrialProduct'),
    status: DataTypes.ENUM('active','inActive'),
    image: DataTypes.TEXT,
    isActive:DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};