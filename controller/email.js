const cron = require("node-cron");
const nodemailer = require("nodemailer");
const   ProductModel=require('../models/product')
require("dotenv").config();
const { Op } = require('sequelize'); // Sequelize operator for filtering

async function getLowStockProducts() {
    // Replace this with actual logic to fetch products and check if their quantity is below threshold
    const LOW_STOCK_THRESHOLD = 5;
    const PRODUCT_SPECIFIC_THRESHOLDS = {
    "13":10,
    "28":20,
    "29":20,
    "30":20,
    "31":20,
    "32":20,
    "33":20,
    "34":20,
    "35":20,
    "36":20,
    "37":20,
    "38":100,
    "39":100,
    "40":100,
    "41":100,
    "42":100,
    "43":100,
    "44":100,
    "45":100,
    "46":100,
    "47":100,
    "48":100,
    "76":1,
    "77":1,
    "78":1,
    "79":1,
    "80":1,
    "81":1,
    "82":1,
    "83":1,
    "84":1,
    "85":1,
    "86":1,
    "87":1,
    "218":120,
    "52":2
     
};


    // Simulate fetching all products (replace this with your actual DB query)
    const products = await ProductModel.findAll();  // Assuming you have a Product model
    //return products.filter(product => product.quantity < LOW_STOCK_THRESHOLD);
    return products.filter(product => {
           const productId = String(product.id);  
        const threshold = PRODUCT_SPECIFIC_THRESHOLDS[productId] || LOW_STOCK_THRESHOLD;
        return product.quantity < threshold;
    });
}

exports.sendLowStockEmail = async (req, res) => {
    try {
        // Get the low stock products from the database
        const lowStockProducts = await getLowStockProducts();

        if (lowStockProducts.length === 0) {
            return res.status(200).json({
                message: "No low stock products found.",
                success: true,
            });
        }

        // Prepare the email content with a list of low-stock products
        let emailContent = '<h2>Low Stock Products</h2>';
        emailContent += '<ul>';

        lowStockProducts.forEach(product => {
            emailContent += `  
                <li>
                    <strong>${product.name}</strong><br>
                    Quantity: ${product.quantity}<br>
                    Price: $${product.price.toFixed(2)}<br>
                </li>
            `;
        });

        emailContent += '</ul>';

        // Create a transporter object using your email service credentials (e.g., Gmail)
        const transporter = nodemailer.createTransport({
            service: "gmail", // You can replace it with any SMTP service of your choice (e.g., SendGrid, etc.)
            auth: {
                user: process.env.EMAIL_USER,  // Your email address
                pass: process.env.EMAIL_PASSWORD,  // Your email password or an app-specific password if using Gmail
            },
        });
        // Define the email data
        const messageData = {
            from: `"Your Store" <${process.env.EMAIL_USER}>`,  // Sender email
            to: "onkardivekar07@gmail.com",  // Replace with the owner's email
            subject: "Low Stock Alert: Products Below Threshold",
            html: emailContent,  // Send the email content as HTML
        };

        // Send the email
        await transporter.sendMail(messageData);

        return res.status(200).json({
            message: "Low stock email sent to the owner.",
            success: true,
        });
    } catch (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({
            message: err.message || "An error occurred while sending the email.",
            success: false,
        });
    }
};


cron.schedule("0 9 * * 1", () => {
    console.log("Running cron job to send low stock email...");
    sendLowStockEmail();
});