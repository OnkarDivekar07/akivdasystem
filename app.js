require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize  = require('./util/db');


const app = express();
const PORT = process.env.PORT || 5000;

const product=require('./models/product')
const tranction=require('./models/transaction')
const users=require('./models/userdetails')
const  InventoTracking=require('./models/inventoryTracking')

const user = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const mainpageroute = require('./routes/mainpageroute')
const repayments=require('./routes/repaymentRoutes')
const emailRoute=require('./routes/email')
const customerRoute=require('./routes/customerCount')
const qrRoutes = require("./routes/qrRoutes");
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
 app.get('/', (req, res) => {
     res.send('Inventory Management API');
 });

 sequelize
 .sync()
 .then(() => {
   app.listen(PORT, () => {
     console.log(`Server Started On PORT ${PORT}`);
   });
 })
 .catch((error) => {
   console.log(error);
 });
