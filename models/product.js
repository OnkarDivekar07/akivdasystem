const Sequelize = require('sequelize')
const sequelize = require('../util/db');
 
    const Product = sequelize.define('Product', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    });


    module.exports=Product
