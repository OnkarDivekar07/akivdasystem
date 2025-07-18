//http://localhost:5000/transactions/showall
const { Op } = require('sequelize');
const Transaction  = require('../models/transaction');
const   Product=require('../models/product')
const sequelize = require('../util/db');
const { response } = require('express');

// exports.billing = async (req, res) => {
//     const billingData = req.body; // Expecting an array of items purchased
//     const totalAmount = parseFloat(billingData[billingData.length - 1].total_amount); // Total amount from the frontend

//     let totalProfit = 0;
//     let transactionItems = [];

//     let transaction;  // Declare transaction variable outside the try block

//     try {

//         // Filter out non-item data (items that don't have item_name field)
//         const validItems = billingData.filter(item => item.item_name);

//         if (validItems.length === 0) {
//             throw new Error("No valid items in the billing data.");
//         }

//         // Start a transaction to ensure that the stock and transaction are updated atomically
//         transaction = await sequelize.transaction();

//         // Loop through each valid item in the billing data
//         for (let item of validItems) {
//             const { item_name, quantity, price, total } = item;

//             // Ensure quantity and price are valid numbers (they come as strings from the frontend)
//             const quantityNum = parseInt(quantity, 10);
//             const priceNum = parseFloat(price);
//             const totalNum = parseFloat(total);

//             if (isNaN(quantityNum) || isNaN(priceNum) || isNaN(totalNum)) {
//                 throw new Error(`Invalid data for ${item_name}: Quantity, Price, or Total is not a valid number.`);
//             }

//             // Fetch product details to calculate profit and update stock
//             const product = await Product.findOne({ where: { name: item_name } });

//             if (!product) {
//                 throw new Error(`Product with name ${item_name} not found.`);
//             }

//             // Calculate profit (Assuming you have a 'costPrice' field in the 'Products' table)
//             const profit = (priceNum - product.price) * quantityNum;
//             totalProfit += profit;

//             // Decrease product quantity in stock
//             if (product.quantity < quantityNum) {
//                 throw new Error(`Not enough stock for ${item_name}`);
//             }

//             // Update product quantity in stock
//             await product.update({ quantity: product.quantity - quantityNum }, { transaction });

//             // Create a new transaction record
//             const newTransaction = await Transaction.create({
//                 productId: product.id,
//                 itemsPurchased: item_name,
//                 quantity: quantityNum,
//                 totalAmount: totalNum,
//                 profit: profit,
//                 date: new Date(),
//             }, { transaction });

//             // Store the transaction item
//             transactionItems.push(newTransaction);
//         }

//         // Commit the transaction
//         await transaction.commit();

//         // Send the response back to the frontend
//         res.status(200).json({
//             message: 'Transaction completed successfully.',
//             transactionItems,
//             totalAmount: totalAmount.toFixed(2),
//             totalProfit: totalProfit.toFixed(2),
//         });
//     } catch (error) {
//         // Rollback the transaction in case of any error
//         if (transaction) {  // Check if transaction is defined before rolling back
//             await transaction.rollback();
//         }

//         console.error(error);
//         res.status(500).json({
//             error: 'There was an error processing your transaction.',
//             details: error.message,
//         });
//     }
// };


exports.purchaseSingleItem = async (req, res) => {
  const { productId, quantity, sellingPrice } = req.body;

  if (!productId || !quantity || !sellingPrice) {
    return res.status(400).json({ error: "productId, quantity, and sellingPrice are required." });
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    const quantityNum = parseInt(quantity);
    const sellingPriceNum = parseFloat(sellingPrice);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      throw new Error("Invalid quantity.");
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      throw new Error("Invalid selling price.");
    }

    if (product.quantity < quantityNum) {
      throw new Error("Not enough stock available.");
    }

    const totalAmount = sellingPriceNum * quantityNum;
    const profit = (sellingPriceNum - product.price) * quantityNum;

    await product.update(
      { quantity: product.quantity - quantityNum },
      { transaction }
    );

    const newTransaction = await Transaction.create({
      productId: product.id,
      itemsPurchased: product.name,
      quantity: quantityNum,
      totalAmount,
      profit,
      date: new Date(),
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      sucess:true,
      message: "✅ Purchase recorded successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error(error);
    res.status(500).json({
      error: "❌ Failed to process purchase.",
      details: error.message,
    });
  }
};




















































exports.dailyalltranction = async (req, res) => {
    try {
        // Get today's date (UTC)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of the day (00:00:00)

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // End of the day (23:59:59)

        // Fetch only today's transactions
        const dailyTransactions = await Transaction.findAll({
            where: {
                date: {
                    [Op.between]: [todayStart, todayEnd] // Filter transactions between todayStart and todayEnd
                }
            }
        });

        res.status(200).json(dailyTransactions);
    } catch (error) {
        console.error('Error fetching daily transactions:', error);
        res.status(500).send({ message: 'Error fetching daily transactions', error });
    }
};


exports.dailytransactionpage = (request, response, next) => {
    response.sendFile('dailytranction.html', { root: 'view' });
}

exports.stockPage = (request, response, next) => {
    response.sendFile('inventory.html', { root: 'view' });
}


// Endpoint to calculate daily and monthly sales and profits
exports.showall = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of this month
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // End of this month

        // Fetch daily transactions
        const dailyTransactions = await Transaction.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // Calculate daily profit and daily sales
        const dailyProfit = dailyTransactions.reduce((total, transaction) => total + transaction.profit, 0);
        const dailySales = dailyTransactions.reduce((total, transaction) => total + transaction.totalAmount, 0);

        // Fetch monthly transactions
        const monthlyTransactions = await Transaction.findAll({
            where: {
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        // Calculate monthly profit and monthly sales
        const monthlyProfit = monthlyTransactions.reduce((total, transaction) => total + transaction.profit, 0);
        const monthlySales = monthlyTransactions.reduce((total, transaction) => total + transaction.totalAmount, 0);

        // Send the response
        res.status(200).json({
            dailyProfit: dailyProfit.toFixed(2),
            dailySales: dailySales.toFixed(2),
            monthlyProfit: monthlyProfit.toFixed(2),
            monthlySales: monthlySales.toFixed(2)
        });
    } catch (error) {
        console.error('Error calculating sales and profit:', error);
        res.status(500).json({
            error: 'There was an error calculating the daily and monthly sales and profits.',
            details: error.message
        });
    }
};



