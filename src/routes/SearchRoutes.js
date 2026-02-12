const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/searchController");

router.get("/search/product", searchProducts);

module.exports = router;
