const Product = require("../models/productModel");
const Fuse = require("fuse.js");

exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();

    const products = await Product.find();

    const fuse = new Fuse(products, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "brand", weight: 0.2 },
        { name: "category", weight: 0.1 }
      ],
      threshold: 0.3,        // stricter matching
      includeScore: true,
    });

    const results = fuse.search(normalizedQuery);

    // Filter strong matches only
    const filteredResults = results.filter(
      (result) => result.score <= 0.3
    );

    const formatted = filteredResults.map((result) => {
      const p = result.item;

      return {
        productId: p._id,
        title: p.title,
        description: p.description,
        mrp: p.pricing.mrp,
        sellingPrice: p.pricing.price,
        metadata: p.metadata,
        stock: p.inventory.stock,
      };
    });

    res.status(200).json({
      data: formatted,
    });

  } catch (error) {
    next(error);
  }
};
