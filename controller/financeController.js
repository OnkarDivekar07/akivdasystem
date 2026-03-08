const Transaction  = require("../models/transaction");
const { Op } = require("sequelize");

exports.getFinanceSummary = async (req, res) => {
  try {

    const transactions = await Transaction.findAll({
      order: [["date", "DESC"]],
    });

    let cashTotal = 0;
    let onlineTotal = 0;

    transactions.forEach((t) => {
      if (t.paymentMethod === "cash") {
        cashTotal += parseFloat(t.totalAmount);
      }

      if (t.paymentMethod === "online") {
        onlineTotal += parseFloat(t.totalAmount);
      }
    });

    res.json({
      cashTotal: cashTotal.toFixed(2),
      onlineTotal: onlineTotal.toFixed(2),
      grandTotal: (cashTotal + onlineTotal).toFixed(2),
      transactions,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching finance data",
    });
  }
};