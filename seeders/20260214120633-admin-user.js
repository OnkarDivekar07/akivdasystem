'use strict';
const bcrypt = require('bcrypt');
const email= process.env.ADMIN_EMAIL
module.exports = {
  async up (queryInterface, Sequelize) {
    if (!email) {
      throw new Error("ADMIN_EMAIL is not defined in environment variables");
    }
    await queryInterface.bulkInsert('users', [{
      email:email,
      otp: '000000',  // dummy OTP
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email:email
    }, {});
  }
};
