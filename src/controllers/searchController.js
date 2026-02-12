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

    // 🔥 Parse Query
    const {
      normalizedQuery,
      intents,
      maxPrice,
      detectedBrand,
      detectedColor,
      isAccessoryQuery,
      wantsMoreStorage
    } = parseQuery(query);

    const products = await Product.find();

    // 🔥 Fuse search (text relevance first)
    const fuse = new Fuse(products, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "brand", weight: 0.2 },
        { name: "category", weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
    });

    let results = fuse.search(normalizedQuery);

    // 🔥 Strong brand restriction
    if (detectedBrand) {
      results = results.filter(
        (r) =>
          r.item.title.toLowerCase().includes(detectedBrand) ||
          r.item.brand.toLowerCase().includes(detectedBrand)
      );
    }

    // 🔥 Category restriction (mobile vs accessory)
    if (detectedBrand && !isAccessoryQuery) {
      results = results.filter(
        (r) => r.item.category === "mobile"
      );
    }

    if (isAccessoryQuery) {
      results = results.filter(
        (r) => r.item.category === "accessory"
      );
    }

    // 🔥 Price filtering
    if (maxPrice) {
      results = results.filter(
        (r) => Number(r.item.pricing.price) <= maxPrice
      );
    }

    // 🔥 Color filtering
    if (detectedColor) {
      results = results.filter(
        (r) =>
          r.item.title.toLowerCase().includes(detectedColor) ||
          r.item.metadata?.color?.toLowerCase().includes(detectedColor)
      );
    }

    // 🔥 Ranking logic
    const rankedResults = results.map((result) => {
      const p = result.item;

      let businessScore = 0;

      // Rating boost
      businessScore += (p.metrics?.rating || 0) * 2;

      // Stock boost / penalty
      if (p.inventory?.stock > 0) {
        businessScore += 5;
      } else {
        businessScore -= 5;
      }

      // Cheap intent boost
      if (intents.cheap) {
        businessScore += (100000 - p.pricing.price) / 10000;
      }

      // Latest intent boost
      if (intents.latest && p.metadata?.launchYear) {
        businessScore += (p.metadata.launchYear - 2020);
      }

      // Storage boosting
      if (wantsMoreStorage && p.metadata?.storage) {
        const storageValue = parseInt(p.metadata.storage);
        if (!isNaN(storageValue)) {
          businessScore += storageValue / 64;
        }
      }

      const relevanceScore = (1 - result.score) * 10;

      return {
        item: p,
        finalScore: relevanceScore + businessScore,
      };
    });

    // 🔥 Sort
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
