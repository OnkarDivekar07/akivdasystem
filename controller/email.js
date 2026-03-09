const cron = require("node-cron");
const nodemailer = require("nodemailer");
const   ProductModel=require('../models/product')
require("dotenv").config();
const { Op } = require('sequelize'); // Sequelize operator for filtering


async function getStockAlerts() {
  try {
    const products = await ProductModel.findAll();

    const lowStock = [];
    const overStock = [];

    products.forEach(product => {
      const lower = product.lower_threshold ?? 5;
      const upper = product.upper_threshold ?? 100;

      if (product.quantity < lower) {
        lowStock.push(product);
      }

      if (product.quantity > upper) {
        overStock.push(product);
      }
    });

    return { lowStock, overStock };

  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    return { lowStock: [], overStock: [] };
  }
}

// exports.sendLowStockEmail = async (req=null, res=null) => {
//     try {
//         // Get the low stock products from the database
//         const lowStockProducts = await getLowStockProducts();

//         if (lowStockProducts.length === 0) {
//             if (res)  return res.status(200).json({
//                 message: "No low stock products found.",
//                 success: true,
//             });
//         }
//         console.log(lowStockProducts.length)

//         // Prepare the email content with a list of low-stock products
//         let emailContent = '<h2>Low Stock Products</h2>';
//         emailContent += '<ul>';

//         lowStockProducts.forEach(product => {
//             emailContent += `  
//                 <li>
//                     <strong>${product.name}</strong><br>
//                     Quantity: ${product.quantity}<br>
//                     Price: $${product.price.toFixed(2)}<br>
//                 </li>
//             `;
//         });

//         emailContent += '</ul>';

//         // Create a transporter object using your email service credentials (e.g., Gmail)
//         const transporter = nodemailer.createTransport({
//             service: "gmail", // You can replace it with any SMTP service of your choice (e.g., SendGrid, etc.)
//             auth: {
//                 user: process.env.EMAIL_USER,  // Your email address
//                 pass: process.env.EMAIL_PASSWORD,  // Your email password or an app-specific password if using Gmail
//             },
//         });
//         // Define the email data
//         const messageData = {
//             from: `"Your Store" <${process.env.EMAIL_USER}>`,  // Sender email
//             to: process.env.RECIVER_EMAIL,  // Replace with the owner's email
//             subject: "Low Stock Alert: Products Below Threshold",
//             html: emailContent,  // Send the email content as HTML
//         };

//         // Send the email
//         await transporter.sendMail(messageData);
//             if (res) return res.status(200).json({
//             message: "Low stock email sent to the owner.",
//             success: true,
//         });
//     } catch (err) {
//         console.error("Error sending email:", err);
//         if (res) return res.status(500).json({
//             message: err.message || "An error occurred while sending the email.",
//             success: false,
//         });
//     }
// };

exports.sendLowStockEmail = async (req = null, res = null) => {
    try {
       const { lowStock, overStock } = await getStockAlerts();

        if (lowStockProducts.length === 0) {
            if (res) return res.status(200).json({
                message: "No low stock products found.",
                success: true,
            });
        }
        console.log(lowStockProducts.length)
        let emailContent = "<h2>📦 Daily Inventory Report</h2>";

if (lowStock.length > 0) {
  emailContent += "<h3>⚠️ Low Stock Products</h3><ul>";

  lowStock.forEach(product => {
    const lower = product.lower_threshold ?? 5;
    const suggested = Math.max((lower * 2) - product.quantity, 0);

    emailContent += `
      <li>
        <strong>${product.name}</strong><br>
        Quantity: ${product.quantity}<br>
        Minimum Threshold: ${lower}<br>
        Suggested Reorder: <strong>${suggested}</strong>
      </li>
    `;
  });

  emailContent += "</ul>";
}

if (overStock.length > 0) {
  emailContent += "<h3>📈 Overstock Products</h3><ul>";

  overStock.forEach(product => {
    const upper = product.upper_threshold ?? 100;

    emailContent += `
      <li>
        <strong>${product.name}</strong><br>
        Quantity: ${product.quantity}<br>
        Maximum Threshold: ${upper}
      </li>
    `;
  });

  emailContent += "</ul>";
}

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const messageData = {
            from: `"Your Store" <${process.env.EMAIL_USER}>`,
            to: process.env.RECIVER_EMAIL,
            subject: "Low Stock Alert: Products Below Threshold",
            html: emailContent,
        };

        await transporter.sendMail(messageData);

        if (res) return res.status(200).json({
            message: "Low stock email sent to the owner.",
            success: true,
        });

    } catch (err) {
        console.error("Error sending email:", err);
        if (res) return res.status(500).json({
            message: err.message || "An error occurred while sending the email.",
            success: false,
        });
    }
};








cron.schedule("0 9 * * *", () => {
    console.log("Running cron job to send low stock email...");
    exports.sendLowStockEmail()
});