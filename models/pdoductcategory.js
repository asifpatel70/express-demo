'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pdoductCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      pdoductCategory.belongsTo(models.Product, {foreignKey: 'productId'})
      pdoductCategory.belongsTo(models.Category, {foreignKey: 'categoryId'})
    }
  };
  pdoductCategory.init({
    productId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pdoductCategory',
  });
  return pdoductCategory;
};