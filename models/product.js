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
      // define association here
    }
  };
  Product.init({
    name: DataTypes.STRING,
    productNumber: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    description: DataTypes.TEXT,
    category: DataTypes.ENUM('consumerProduct','IndustrialProduct'),
    status: DataTypes.ENUM('active','inActive'),
    image: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};