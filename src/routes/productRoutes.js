const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProductMetadata,
} = require('../controllers/productController');

router.post("/", createProduct);
router.put("/meta-data", updateProductMetadata);

module.exports = router;
