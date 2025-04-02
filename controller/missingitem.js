// controllers/repayments.js
const MissingItem = require('../models/MissingItem');

// POST: Create a new missing item
exports.postmissingitem = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    
    // Create a new missing item with requestCount = 0
    const newItem = await MissingItem.create({ name });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating missing item' });
  }
};

// GET: Retrieve all missing items
exports.getmissingitem = async (req, res) => {
  try {
    const items = await MissingItem.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving missing items' });
  }
};

// GET: Retrieve a single missing item by ID
exports.getsinglemissingitem = async (req, res) => {
  try {
    const item = await MissingItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Missing item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving missing item' });
  }
};

// PUT: Update a missing item's name or request count
exports.updatemissingitem = async (req, res) => {
  try {
    const { name, requestCount } = req.body;
    const item = await MissingItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Missing item not found' });
    }

    item.name = name || item.name; // Update name if provided
    item.requestCount = requestCount !== undefined ? requestCount : item.requestCount; // Update request count if provided

    await item.save();
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating missing item' });
  }
};

// DELETE: Delete a missing item by ID
exports.deletemissingitem = async (req, res) => {
  try {
    const item = await MissingItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Missing item not found' });
    }

    await item.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting missing item' });
  }
};


exports.getmissingitempage = (request, response, next) => {
    response.sendFile('missingitem.html', { root: 'view' });
}