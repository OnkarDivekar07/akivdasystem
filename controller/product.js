const Product = require('../models/product'); // Assuming this is your Sequelize model

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
        console.log("Product ID:", id);  // Log the product ID

        const { name, quantity, price } = req.body;
        console.log("Request body:", req.body);  // Log the request body

        // Find the product by primary key (id)
        const product = await Product.findByPk(id);

        // If product doesn't exist, return an error
        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }

        // Log the product before update
        console.log("Product before update:", product);

        // Update the product fields (conditionally)
        product.name = name || product.name; 
        product.quantity = quantity || product.quantity;
        product.price = price || product.price;

        // Log the product after setting new values
        console.log("Product after update:", product);

        // Save the updated product to the database
        const updatedProduct = await product.save();

        // Log the response to verify if the save succeeded
        console.log("Updated product:", updatedProduct);

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
