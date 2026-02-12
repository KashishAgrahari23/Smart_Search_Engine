const express = require("express");
const router = express.Router();
const { searchProducts , getFacets } = require("../controllers/searchController");

router.get("/search/product", searchProducts);
router.get("/search/facets", getFacets);


module.exports = router;
