const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProductMetadata,
} = require('../controllers/ProductController');

router.post("/product", createProduct);
router.put("/product/meta-data", updateProductMetadata);

module.exports = router;
