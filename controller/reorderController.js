const Product = require("../models/product");

exports.getSuggestedOrderQuantity = async (req, res) => {
  try {

    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "marathiName",
        "quantity",
        "upper_threshold"
      ]
    });

    const result = products.map((p) => {

      const suggestedQty = Math.max(
        (p.upper_threshold || 0) - (p.quantity || 0),
        0
      );

      return {
        id: p.id,
        name: p.name,
        marathiName: p.marathiName,
        quantity: p.quantity,
        upper_threshold: p.upper_threshold,
        suggested_order_quantity: suggestedQty
      };

    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Suggested reorder error:", error);
    res.status(500).json({
      message: "Failed to fetch reorder data",
      error: error.message
    });
  }
};