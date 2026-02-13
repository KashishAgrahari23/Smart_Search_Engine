const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProductMetadata,
} = require('../controllers/productController');

router.post("/product", createProduct);
router.put("/product/meta-data", updateProductMetadata);

module.exports = router;
