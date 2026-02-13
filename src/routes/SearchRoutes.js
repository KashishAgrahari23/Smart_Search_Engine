const express = require("express");
const router = express.Router();
const { searchProducts,getSearchFacets  } = require("../controllers/searchController");

router.get("/search/product", searchProducts);
router.get("/search/facets", getSearchFacets);

module.exports = router;
