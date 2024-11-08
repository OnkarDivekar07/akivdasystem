document.addEventListener('DOMContentLoaded', function () {
    const addProductButton = document.getElementById('addProduct');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productForm = document.getElementById('productForm');
    
    let products = []; // This will hold the inventory data

    // Function to calculate total value for each product
    function calculateTotalValue(quantity, price) {
        return (quantity * price).toFixed(2);
    }

    // Function to calculate total inventory value
    function calculateTotalInventoryValue() {
        const totalValue = products.reduce((sum, product) => {
            return sum + (product.quantity * product.price);
        }, 0);

        // Update the total inventory value on the page
        document.getElementById('totalInventoryValue').textContent = `$${totalValue.toFixed(2)}`;
    }

    // Function to render the inventory table
    function renderInventory() {
        inventoryTableBody.innerHTML = ''; // Clear the current table body

        products.forEach((product, index) => {
            const row = document.createElement('tr');
            
            // Check if the quantity is below 10 to add a red style
            const quantityClass = product.quantity < 10 ? 'text-danger' : '';

            row.innerHTML = `
                <td>${product.name}</td>
                <td><input type="number" class="form-control product-quantity ${quantityClass}" value="${product.quantity}" data-index="${index}" min="0"></td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>$${calculateTotalValue(product.quantity, product.price)}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove-product" data-index="${index}">Remove</button>
                </td>
            `;

            inventoryTableBody.appendChild(row);
        });

        // Update event listeners
        updateEventListeners();

        // After rendering, calculate the total inventory value
        calculateTotalInventoryValue();
    }

    // Function to fetch products from the backend
    function fetchProducts() {
        axios.get('http://localhost:5000/products/getproduct')
            .then(response => {
                console.log(response)
                // Update the products array with data from the server
                products = response.data;  // Assuming the response contains an array of products
                renderInventory();  // Re-render the table with the fetched products
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    // Event listener for adding new products
    addProductButton.addEventListener('click', function () {
        document.getElementById('productName').value = '';
        document.getElementById('productQuantity').value = 1;
        document.getElementById('productPrice').value = 0;
        productModal.show();
    });

    // Event listener for the product form submit
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('productName').value;
        const quantity = parseInt(document.getElementById('productQuantity').value);
        const price = parseFloat(document.getElementById('productPrice').value);

        // Prepare the product data object
        const productData = {
            name: name,
            quantity: quantity,
            price: price
        };

        // Axios POST request to add the product to the backend
        axios.post('http://localhost:5000/products/addproduct', productData)
            .then(response => {
                // If successful, add the product to the local array and re-render the inventory table
                console.log(response.data); // You can log the response if needed
                products.push({ name, quantity, price });

                // Close the modal and re-render the inventory table
                productModal.hide();
                renderInventory();
            })
            .catch(error => {
                console.error('Error adding product:', error);
            });
    });

    // Update event listeners for quantity inputs and remove buttons
    function updateEventListeners() {
        // Quantity change event listeners
        const quantityInputs = document.querySelectorAll('.product-quantity');
        quantityInputs.forEach(input => {
            input.addEventListener('input', function (e) {
                const index = e.target.getAttribute('data-index');
                products[index].quantity = parseInt(e.target.value);
                renderInventory(); // Re-render after update
                const id = products[index].id;

                // Update the backend when quantity is changed
                axios.put(`http://localhost:5000/products/updateproduct/${id}`, products[index])
                    .then(response => {
                        console.log('Product updated:', response.data);
                    })
                    .catch(error => {
                        console.error('Error updating product:', error);
                    });
            });
        });

        // Remove product event listeners
        const removeButtons = document.querySelectorAll('.remove-product');
        removeButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                const index = e.target.getAttribute('data-index');
                const productId = products[index].id; // Assuming the product has an ID field
                products.splice(index, 1); // Remove product from array
                renderInventory(); // Re-render after removal

                // Make an API call to remove the product from the backend
                axios.delete(`http://localhost:5000/products/removeproduct/${productId}`)
                    .then(response => {
                        console.log('Product removed:', response.data);
                    })
                    .catch(error => {
                        console.error('Error removing product:', error);
                    });
            });
        });
    }

    // Initial render of the inventory table (empty initially)
    fetchProducts();  // Fetch products from the backend when the page loads
});