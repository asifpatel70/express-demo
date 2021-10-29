'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('Products','dateFrom', {
        allowNull: false,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Products','dateTo', {
        allowNull: false,
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('Products','description', {
        allowNull: true,
        type: Sequelize.TEXT
      }),
      queryInterface.addColumn('Products','category', {
        allowNull: true,
        type: Sequelize.ENUM('consumerProduct','IndustrialProduct')
      }),
      queryInterface.addColumn('Products','status', {
        allowNull: true,
        type: Sequelize.ENUM('active','inActive')
      }),
      queryInterface.addColumn('Products','image', {
        allowNull: true,
        type: Sequelize.TEXT
      })
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'dateFrom',
      'dateTo',
      'description',
      'category',
      'image')
  }
};
