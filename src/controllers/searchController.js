const Product = require("../models/productModel");
const Fuse = require("fuse.js");
const { parseQuery } = require("../services/queryParser");

exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    //  Parse query
    const { normalizedQuery, intents, maxPrice, detectedBrand } =
      parseQuery(query);

    let products = await Product.find();

    //  Filter by brand 
    if (detectedBrand) {
      products = products.filter((p) =>
        p.brand.toLowerCase().includes(detectedBrand)
      );
    }

    //  Filter by max price 
    if (maxPrice) {
      products = products.filter(
        (p) => p.pricing.price <= maxPrice
      );
    }

    //  Fuse search
    const fuse = new Fuse(products, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "brand", weight: 0.2 },
        { name: "category", weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
    });

    const results = fuse.search(normalizedQuery);

    const filteredResults = results.filter(
      (result) => result.score <= 0.3
    );

    //  Ranking Logic
    const rankedResults = filteredResults.map((result) => {
      const p = result.item;

      let businessScore = 0;

      // Boost rating
      businessScore += (p.metrics?.rating || 0) * 2;

      // Boost stock availability
      if (p.inventory?.stock > 0) {
        businessScore += 5;
      } else {
        businessScore -= 5; 
      }

      // Cheap intent boost (lower price = higher score)
      if (intents.cheap) {
        businessScore += (100000 - p.pricing.price) / 10000;
      }

      // Latest intent boost
      if (intents.latest && p.metadata?.launchYear) {
        businessScore += (p.metadata.launchYear - 2020);
      }

      const relevanceScore = (1 - result.score) * 10;

      const finalScore = relevanceScore + businessScore;

      return {
        item: p,
        finalScore,
      };
    });

    // Sort by finalScore
    rankedResults.sort((a, b) => b.finalScore - a.finalScore);

    const formatted = rankedResults.map(({ item }) => ({
      productId: item._id,
      title: item.title,
      description: item.description,
      mrp: item.pricing.mrp,
      sellingPrice: item.pricing.price,
      metadata: item.metadata,
      stock: item.inventory.stock,
    }));

    res.status(200).json({
      data: formatted,
    });

  } catch (error) {
    next(error);
  }
};
