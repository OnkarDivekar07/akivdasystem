const Sequelize = require('sequelize');
const sequelize = require('../util/db');  // Import your Sequelize instance

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,  // Ensure emails are unique
  },
  otp: {
    type: Sequelize.STRING,
    allowNull: true,  // Store the OTP
  },
  otpExpiry: {
    type: Sequelize.DATE,
    allowNull: true,  // Expiry time for OTP
  },
});

module.exports = User;
