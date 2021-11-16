'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('Users','email', {
      unique: true,
      type: Sequelize.STRING,
      allowNull: false
    })
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'email','createdBy','updatedBy')
  }
};
