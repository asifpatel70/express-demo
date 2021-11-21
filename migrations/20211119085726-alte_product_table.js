'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Products','category')
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
        'category')
  }
};
