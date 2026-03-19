const cron = require("node-cron");
const nodemailer = require("nodemailer");
const ProductModel = require("../models/product");
require("dotenv").config();
const { Op } = require("sequelize");

async function getStockAlerts() {
  try {

    const products = await ProductModel.findAll();

    const reorderProducts = [];

    products.forEach(product => {

      const lower = product.lower_threshold ?? 5;
      const upper = product.upper_threshold ?? 100;

      // Only check lower threshold
      if (product.quantity <= lower) {

        const orderQty = upper - product.quantity;

        if (orderQty > 0) {

          reorderProducts.push({
            ...product.toJSON(),
            order_quantity: orderQty
          });

        }

      }

    });

    return { reorderProducts };

  } catch (error) {

    console.error("Error fetching stock alerts:", error);

    return { reorderProducts: [] };

  }
}

exports.sendLowStockEmail = async (req = null, res = null) => {
  try {

    const { reorderProducts } = await getStockAlerts();

    if (reorderProducts.length === 0) {

      if (res) {
        return res.status(200).json({
          message: "No products require reorder.",
          success: true
        });
      }

      return;
    }

    console.log(reorderProducts.length);

    let emailContent = "<h2>📦 Products Requiring Reorder</h2><ul>";

    reorderProducts.forEach(product => {

      emailContent += `
        <li>
          <strong>${product.name}</strong><br>
          Current Quantity: ${product.quantity}<br>
          Upper Threshold: ${product.upper_threshold}<br>
          Suggested Order Quantity: <strong>${product.order_quantity}</strong>
        </li>
      `;

    });

    emailContent += "</ul>";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const messageData = {
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIVER_EMAIL,
      subject: "Inventory Reorder Alert",
      html: emailContent
    };

    await transporter.sendMail(messageData);

    if (res) {
      return res.status(200).json({
        message: "Inventory alert email sent.",
        success: true
      });
    }

  } catch (err) {

    console.error("Error sending email:", err);

    if (res) {
      return res.status(500).json({
        message: err.message || "An error occurred while sending the email.",
        success: false
      });
    }

  }
};

