const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const InventoTracking = sequelize.define('InventoTracking', {
    date: {
        type: Sequelize.DATEONLY, // Stores only the date (YYYY-MM-DD)
        allowNull: false,
        unique: true, // Ensure only one record per day
    },
    totalinventoryValue: {
        type: Sequelize.INTEGER,
        defaultValue: 0, // Start with 0 customers for a new day
        allowNull: false
    }
}, {
    timestamps: false // No createdAt or updatedAt fields
});

module.exports = InventoTracking;
