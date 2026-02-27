const Product = require('../models/product'); // Assuming this is your Sequelize model
const InventoTracking=require('../models/inventoryTracking')
const sequelize = require("../util/db");
const awsService = require("../util/AWSUploads");

//Add a product
// exports.addProduct = async (req, res) => {
//     try {
//         const { name, quantity, price } = req.body;
//           console.log(req.body.name)
//         // Create a new product using Sequelize
//         const newProduct = await Product.create({ name, quantity, price });
         
//         // Respond with a success message and the created product
//         res.status(201).json({
//             message: 'Product added successfully',
//             product: newProduct
//         });
//     } catch (error) {
//         console.error('Error creating product:', error);
//         res.status(400).send({ message: 'Error creating product', error });
//     }
// };

exports.addProduct = async (req, res) => {
  try {
    const input = req.body;
    const products = Array.isArray(input) ? input : [input];

    const sanitizedProducts = products.map((p) => ({
      name: p.name?.trim(),
      quantity: Number(p.quantity) || 0,
      price: Number(p.price) || 0,
      lower_threshold: Number(p.lower_threshold) || 0,
      upper_threshold: Number(p.upper_threshold) || 0,
    }));

    const createdProducts = await Product.bulkCreate(sanitizedProducts);

    res.status(201).json({
      message: "Product(s) added successfully",
      products: createdProducts,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};


// Get all products
exports.getProduct = async (req, res) => {
    try {
        // Retrieve all products from the database
        const products = await Product.findAll();
        
        // Respond with the products list
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ message: 'Error fetching products', error });
    }
};


exports.deleteproduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Product.findByPk(id);

        if (!data) {
            return res.status(404).send('product not found');
        }

        await data.destroy();
        res.send('Successfully deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = {
      name: req.body.name,
      quantity: Number(req.body.quantity),
      price: Number(req.body.price),
      lower_threshold: Number(req.body.lower_threshold),
      upper_threshold: Number(req.body.upper_threshold),
    };

    await Product.update(updated, { where: { id } });

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ error: error.message });
  }
};


// Track weekly inventory only once when server starts on Monday
const trackWeeklyInventory = async () => {
    try {
        const today = new Date();
        if (today.getDay() !== 1) return; // Only execute on Monday
        
        const formattedDate = today.toISOString().split('T')[0];
        const existingRecord = await InventoTracking.findOne({ where: { date: formattedDate } });
        if (existingRecord) return; // Prevent duplicate entries
        
        const products = await Product.findAll();
        const totalInventoryValue = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
        await InventoTracking.create({ date: formattedDate, totalinventoryValue: totalInventoryValue });
        console.log('Weekly inventory value recorded:', totalInventoryValue);
    } catch (error) {
        console.error('Error tracking weekly inventory:', error);
    }
};

// Run inventory tracking once when the server starts
trackWeeklyInventory();



const QRCode = require('qrcode');
const fs = require('fs');

// Function to generate QR from product ID
async function generateQrCode(productId) {
  // Payload to encode in the QR (can be just productId or JSON)
  const qrData = JSON.stringify({ productId });

  // File path to save image
  const fileName = `qr_codes/${productId}.png`;

  try {
    await QRCode.toFile(fileName, qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
    });

    console.log(`✅ QR code saved as ${fileName}`);
  } catch (err) {
    console.error("❌ Failed to generate QR", err);
  }
}

// Example usage
const exampleProductId = "PRD-LEDSTRIP-12V";
generateQrCode(37);


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addStock = async (req, res) => {
  const { productId, addQuantity } = req.body;

  if (!productId || !addQuantity || addQuantity <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedQty = product.quantity + Number(addQuantity);

    await product.update(
      { quantity: updatedQty },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      message: "Stock updated successfully",
      product: {
        id: product.id,
        name: product.name,
        quantity: updatedQty,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      error: "Failed to update stock",
      details: error.message,
    });
  }
};




exports.uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params; // UUID
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete old image if exists
    if (product.imageUrl) {
      const oldKey = product.imageUrl.split(".com/")[1];
      await awsService.deleteFromS3(oldKey);
    }

    const key = `product-images/${id}-${Date.now()}-${image.originalname}`;

    const imageUrl = await awsService.uploadToS3(
      image.buffer,
      key,
      image.mimetype
    );

    await product.update({ imageUrl });

    res.status(200).json({
      message: "Product image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};



/* 🗑️ DELETE PRODUCT IMAGE */
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params; // UUID

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.imageUrl) {
      return res.status(400).json({ message: "No image to delete" });
    }

    // 🔑 Extract S3 key from URL
    const key = product.imageUrl.split(".com/")[1];

    // 🧹 Delete from S3
    await awsService.deleteFromS3(key);

    // 🗄️ Remove from DB
    await product.update({ imageUrl: null });

    res.status(200).json({
      message: "Product image deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Image delete failed",
      error: error.message,
    });
  }
};

/* 🇮🇳 UPDATE MARATHI NAME */
exports.updateMarathiName = async (req, res) => {
  try {
    const { id } = req.params;
    const { marathiName } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.marathiName = marathiName;
    await product.save();

    res.json({
      message: "Marathi name updated",
      marathiName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};