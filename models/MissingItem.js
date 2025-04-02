// models/MissingItem.js
const Sequelize = require('sequelize');
const sequelize = require('../util/db'); // Ensure this is your Sequelize instance

const MissingItem = sequelize.define('MissingItem',{
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  requestCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0, // Start with 0 requests
  },
});

module.exports = MissingItem;
