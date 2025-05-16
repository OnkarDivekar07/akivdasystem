const Product = require('../models/product'); // Assuming this is your Sequelize model
const InventoTracking=require('../models/inventoryTracking')

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
        const products = req.body;  // Capture the data from the request body

        // If the request body is a single product (not an array), make it an array
        const productsToCreate = Array.isArray(products) ? products : [products];

        // Create all products using Sequelize
        const createdProducts = await Product.bulkCreate(productsToCreate);

        // Respond with a success message and the created products
        res.status(201).json({
            message: 'Products added successfully',
            products: createdProducts
        });
    } catch (error) {
        console.error('Error creating product(s):', error);
        res.status(400).send({
            message: 'Error creating product(s)',
            error: error.message
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
        const id = req.params.id;

        const { name, quantity, price,threshold  } = req.body;

        // Find the product by primary key (id)
        const product = await Product.findByPk(id);

        // If product doesn't exist, return an error
        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }




        if (name !== undefined) product.name = name;
        if (quantity !== undefined) product.quantity = quantity;
        if (price !== undefined) product.price = price;
        if (threshold !== undefined) product.threshold = threshold;


        // Save the updated product to the database
        const updatedProduct = await product.save();


        // Respond with success and the updated product
        res.status(200).json({
            message: 'Product successfully updated',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
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