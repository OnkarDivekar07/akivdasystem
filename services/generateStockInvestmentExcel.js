const ExcelJS = require("exceljs");
const Product = require('../models/product');

exports.generateStockInvestmentExcel = async () => {
  try {
    const products = await Product.findAll();

    let totalInvestment = 0;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Investment");

    sheet.columns = [
      { header: "Product Name", key: "name", width: 30 },
      { header: "Current Quantity", key: "currentQty", width: 18 },
      { header: "Max Threshold", key: "maxThreshold", width: 18 },
      { header: "Required Quantity", key: "requiredQty", width: 18 },
      { header: "Price Per Unit", key: "price", width: 15 },
      { header: "Required Money", key: "requiredMoney", width: 18 },
    ];

    for (const product of products) {
      const currentQty = Number(product.quantity) || 0;
      const maxQty = Number(product.upper_threshold) || 0;
      const price = Number(product.price) || 0;

      // Skip already maximized
      if (currentQty >= maxQty) continue;

      const requiredQty = maxQty - currentQty;
      const requiredMoney = requiredQty * price;

      totalInvestment += requiredMoney;

      sheet.addRow({
        name: product.name,
        currentQty,
        maxThreshold: maxQty,
        requiredQty,
        price,
        requiredMoney,
      });
    }

    // Add total row
    sheet.addRow({});
    sheet.addRow({
      name: "TOTAL",
      requiredMoney: totalInvestment,
    });

    const filePath = "./stock-maximization-report.xlsx";

    await workbook.xlsx.writeFile(filePath);

    console.log("Excel report generated:", filePath);
    console.log("Total Investment Required:", totalInvestment);

  } catch (error) {
    console.error("Excel generation failed:", error);
  }
};