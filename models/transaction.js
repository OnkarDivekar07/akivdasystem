const Sequelize = require('sequelize')
const sequelize = require('../util/db');
 
    const Transaction = sequelize.define('Transaction', {
        productId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Products',
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
       itemsPurchased:{
        type: Sequelize.STRING,
            allowNull: false,
       },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        totalAmount:{
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        profit:{
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    });


module.exports= Transaction
