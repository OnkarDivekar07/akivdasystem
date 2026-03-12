const express = require("express");
const upload = require("../uploads/multer");
const isuser=require("../middleware/auth");
const isAdmin=require("../middleware/admin")
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

router.post("/addproduct",isuser,isAdmin, addProduct);
router.get("/getproduct",isuser,isAdmin, getProduct);
router.get("/:id",getProductById);
router.put("/updateproduct/:id",isuser,isAdmin, updateProduct);
router.delete("/removeproduct/:id",isuser,isAdmin, deleteproduct);
router.post("/add-stock",isuser,isAdmin, addStock);

router.put(
  "/:id/unit",isuser,
  isAdmin,updateDefaultUnit
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