const express = require("express");
const router = express.Router();
const { searchProducts,getSearchFacets  } = require("../controllers/searchController");

router.get("/product", searchProducts);
router.get("/facets", getSearchFacets);

module.exports = router;
