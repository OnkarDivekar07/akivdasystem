const { DataTypes } = require("sequelize");
const sequelize = require("../util/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marathiName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  lower_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  upper_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  imageUrl: {
  type: DataTypes.STRING,
  allowNull: true,
},
});

module.exports = Product;