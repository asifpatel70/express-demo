'use strict';
const {
  Model
} = require('sequelize');
const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");
module.exports = (sequelize, DataTypes) => {
  class refreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      refreshToken.belongsTo(models.User, {foreignKey: 'userId', targetKey: 'id'});
    }
  };
  refreshToken.init({
    token: DataTypes.STRING,
    expiryDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'refreshToken',
    timestamps: false,
  });
  refreshToken.createToken = async function (user) {
    let expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

    let _token = uuidv4();

    let refreshToken = await this.create({
      token: _token,
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    });

    return refreshToken.token;
  };

  refreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  }
  return refreshToken;
};