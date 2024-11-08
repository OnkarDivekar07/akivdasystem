const Sequelize = require('sequelize')
const sequelize = require('../util/db');
 
// Define the 'Repayment' model
const Repayment = sequelize.define('Repayment', {
  // Define the columns
  supplierName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  contactDetails: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amountOwed: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  dueDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, {
  // Options
  timestamps: true,  // Automatically add createdAt and updatedAt fields
  tableName: 'repayments'  // Specify the table name
});

module.exports = Repayment;
