'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('Products','isActive', {
      defaultValue: true,
      type: Sequelize.BOOLEAN
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
     'isActive')
  }
};
