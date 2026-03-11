const Product = require('../models/product');
const sequelize = require("../util/db");
const awsService = require("../util/AWSUploads");
const sharp = require("sharp");
const ALLOWED_UNITS = ["pcs", "jodi", "dozen"];
const path = require("path");


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
  const { productId, addQuantity, price, lower_threshold, upper_threshold } = req.body;

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

    const updateData = {
      quantity: updatedQty,
    };

    // Optional price update
    if (price !== undefined) {
      if (price < 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid price" });
      }
      updateData.price = price;
    }

    // 🔥 NEW: Optional threshold updates
    if (lower_threshold !== undefined) {
      updateData.lower_threshold = Number(lower_threshold);
    }

    if (upper_threshold !== undefined) {
      updateData.upper_threshold = Number(upper_threshold);
    }

    await product.update(updateData, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Stock updated successfully",
      product: {
        id: product.id,
        name: product.name,
        quantity: updatedQty,
        price: product.price,
        lower_threshold: product.lower_threshold,
        upper_threshold: product.upper_threshold
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
// exports.uploadProductImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const image = req.file;

//     if (!image) {
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     const product = await Product.findByPk(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // 🧹 Delete old image
//     if (product.imageUrl) {
//       const oldKey = product.imageUrl.split(".com/")[1];
//       await awsService.deleteFromS3(oldKey);
//     }

//     // 🔥 COMPRESS IMAGE (75%)
//     const compressedBuffer = await sharp(image.buffer)
//       .resize({
//         width: 1200,          // optional but recommended
//         withoutEnlargement: true,
//       })
//       .jpeg({ quality: 75 }) // 🔥 75% compression
//       .toBuffer();

//     const key = `product-images/${id}-${Date.now()}.jpg`;

//     const imageUrl = await awsService.uploadToS3(
//       compressedBuffer,
//       key,
//       "image/jpeg"
//     );

//     await product.update({ imageUrl });

//     res.status(200).json({
//       message: "Product image uploaded successfully",
//       imageUrl,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Image upload failed",
//       error: error.message,
//     });
//   }
// };


exports.uploadProductImage = async (req, res) => {
  console.log("📥 [UPLOAD] Image upload request received");

  try {
    const { id } = req.params;
    const image = req.file;

    console.log("➡️ Product ID:", id);
    console.log("➡️ File received:", image ? image.originalname : "NO FILE");

    if (!image) {
      console.warn("⚠️ No image in request");
      return res.status(400).json({ message: "No image uploaded" });
    }

    // 🔍 Fetch product
    console.log("🔍 Fetching product from DB...");
    const product = await Product.findByPk(id);

    if (!product) {
      console.warn("❌ Product not found:", id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product found:", product.name);

    // 🧹 Delete old image if exists
    if (product.imageUrl) {
      try {
        const oldKey = product.imageUrl.split(".com/")[1];
        console.log("🧹 Deleting old image:", oldKey);
        await awsService.deleteFromS3(oldKey);
        console.log("✅ Old image deleted");
      } catch (err) {
        console.error("⚠️ Failed to delete old image (continuing):", err.message);
      }
    }

    // 🔥 Compress image
    console.log("🗜️ Compressing image...");
    const compressedBuffer = await sharp(image.buffer)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 75 })
      .toBuffer();

    console.log("✅ Image compressed. Size:", compressedBuffer.length, "bytes");

    // ☁️ Upload to S3
    const key = `product-images/${id}-${Date.now()}.jpg`;
    console.log("☁️ Uploading to S3 with key:", key);

    const imageUrl = await awsService.uploadToS3(
      compressedBuffer,
      key,
      "image/jpeg"
    );

    console.log("✅ Uploaded to S3:", imageUrl);

    // 💾 Update DB
    console.log("💾 Updating product record...");
    await product.update({ imageUrl });

    console.log("🎉 Upload process completed successfully");

    return res.status(200).json({
      message: "Product image uploaded successfully",
      imageUrl,
    });

  } catch (error) {
    console.error("🔥 IMAGE UPLOAD ERROR");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
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


exports.updateDefaultUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { defaultUnit } = req.body;

    // 🔒 Validation
    if (!ALLOWED_UNITS.includes(defaultUnit)) {
      return res.status(400).json({
        message: "Invalid unit. Allowed values: pcs, jodi, dozen",
      });
    }

    // 🔍 Find product
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ✅ Update unit
    product.defaultUnit = defaultUnit;
    await product.save();

    return res.status(200).json({
      message: "Default unit updated successfully",
      product: {
        id: product.id,
        name: product.name,
        defaultUnit: product.defaultUnit,
      },
    });
  } catch (error) {
    console.error("Update default unit error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


exports.downloadStockExcel = (req, res) => {
  const filePath = path.join(__dirname, "../stock-maximization-report.xlsx");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=stock-maximization-report.xlsx"
  );

  res.sendFile(filePath);
};