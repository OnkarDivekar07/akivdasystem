const express = require("express");
const upload = require("../uploads/multer");
const {
  addProduct,
  getProduct,
  deleteproduct,
  updateProduct,
  getProductById,
  addStock,
  uploadProductImage,
  deleteProductImage,
  updateMarathiName,
  updateDefaultUnit
} = require("../controller/product");


const router = express.Router();

router.post("/addproduct", addProduct);
router.get("/getproduct", getProduct);
router.get("/:id", getProductById);
router.put("/updateproduct/:id", updateProduct);
router.delete("/removeproduct/:id", deleteproduct);
router.post("/add-stock", addStock);
// 🔐 add adminAuth middleware later if needed
router.put(
  "/:id/unit",
  updateDefaultUnit
);


// ✅ Product image upload
router.post(
  "/:id/upload-image",
  upload.single("image"),
  uploadProductImage
);

router.delete(
  "/:id/delete-image",
  deleteProductImage
);

router.put(
  "/:id/marathi-name",
  updateMarathiName
);

module.exports = router;