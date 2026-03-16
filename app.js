require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize  = require('./util/db');
const cron = require("node-cron");


const app = express();
const PORT = process.env.PORT || 5000;

//const supplierRoutes = require("./routes/supplierRoutes");
//const Supplier = require('./models/supplier');
//const ProductSupplier = require('./models/productsupplier');
const product=require('./models/product')
const tranction=require('./models/transaction')
const users=require('./models/userdetails')
const  InventoTracking=require('./models/inventoryTracking')
//const PurchaseOrder = require('./models/PurchaseOrder')
//const PurchaseOrderItem = require('./models/PurchaseOrderItem')
//const { generateAutoOrders } = require("./services/autoOrderGenerator");
const user = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const mainpageroute = require('./routes/mainpageroute')
const repayments=require('./routes/repaymentRoutes')
const emailRoute=require('./routes/email')
const customerRoute=require('./routes/customerCount')
const qrRoutes = require("./routes/qrRoutes");
//const purchaseOrders = require("./routes/purchaseOrderRoutes");
const financeRoutes = require("./routes/financeRoutes");
//const webhookRoute = require("./routes/webhook");
const reorderRoutes = require("./routes/reorderRoutes");

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public')); // Assuming your CSS is in the 'public/css' directory




app.use(mainpageroute)
app.use('/user', user)
 app.use('/products', productRoutes);
 app.use('/transactions', transactionRoutes);
 app.use('/repayments',repayments)
 app.use('/sendemail',emailRoute)
 app.use('/customers',customerRoute)
 app.use("/qr", qrRoutes);
 //app.use("/purchase-orders", purchaseOrders);
// app.use("/suppliers", supplierRoutes);
 app.use("/api", financeRoutes);
 //app.use("/webhook", webhookRoute);
 app.use("/reorder", reorderRoutes);

 app.get('/', (req, res) => {
     res.send('Inventory Management API');
 });

// // Purchase Order Relations

// PurchaseOrder.hasMany(PurchaseOrderItem, {
//   foreignKey: "order_id",
//   as: "PurchaseOrderItems"
// });

// PurchaseOrderItem.belongsTo(PurchaseOrder, {
//   foreignKey: "order_id",
// });

// PurchaseOrderItem.belongsTo(product, {
//   foreignKey: "product_id",
//   as: "Product"
// });


// Product Supplier Relations

// product.hasMany(ProductSupplier, {
//   foreignKey: "product_id",
// });

// Supplier.hasMany(ProductSupplier, {
//   foreignKey: "supplier_id",
// });

// ProductSupplier.belongsTo(product, {
//   foreignKey: "product_id",
// });

// ProductSupplier.belongsTo(Supplier, {
//   foreignKey: "supplier_id",
// });


// PurchaseOrderItem -> Supplier
// PurchaseOrderItem.belongsTo(Supplier, { foreignKey: "supplier_id" });
// Supplier.hasMany(PurchaseOrderItem, { foreignKey: "supplier_id" });
// cron.schedule("*/2 * * * *", async () => {
//   console.log("Cron running every 2 minutes");
  
//   await generateAutoOrders();
// });

// cron.schedule("0 2 * * *", async () => {
//   console.log("Running Auto Order Generator...");
//   await generateAutoOrders();
// });

 sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected (sync disabled)");
    app.listen(PORT, () => {
      console.log(`Server Started On PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });