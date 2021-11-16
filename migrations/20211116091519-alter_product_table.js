'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('Products','price', {
      type: Sequelize.DOUBLE(20,2)
    }),
    queryInterface.changeColumn('Products','productNumber', {
      type: Sequelize.STRING(500)
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'price','productNumber')
  }
};
