const Product = require("../models/productModel");
const Fuse = require("fuse.js");

const { parseWithLLM } = require("../services/llmParser");
const { parseQuery } = require("../services/queryParser");

// 🔥 Helper to extract model number (for "latest" intent)
function extractModelNumber(title) {
  const match = title.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // 🔥 Step 1: Try LLM parsing
    let structuredQuery = await parseWithLLM(query);

    // 🔥 Step 2: Fallback if LLM fails
    if (!structuredQuery) {
      structuredQuery = parseQuery(query);
    }

    const products = await Product.find();

    // 🔥 Step 3: Fuse fuzzy search (always for typo handling)
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

    let results = fuse.search(query.toLowerCase().trim());

    // 🔥 Step 4: Structured filtering

    // Brand filter
    if (structuredQuery.brand) {
      results = results.filter((r) =>
        r.item.brand
          .toLowerCase()
          .includes(structuredQuery.brand.toLowerCase())
      );
    }

    // Category filter
    if (structuredQuery.category) {
      results = results.filter(
        (r) => r.item.category === structuredQuery.category
      );
    }

    // Max price filter
    if (structuredQuery.maxPrice) {
      results = results.filter(
        (r) =>
          Number(r.item.pricing.price) <= structuredQuery.maxPrice
      );
    }

    // Color filter
    if (structuredQuery.color) {
      results = results.filter(
        (r) =>
          r.item.title
            .toLowerCase()
            .includes(structuredQuery.color.toLowerCase()) ||
          r.item.metadata?.color
            ?.toLowerCase()
            .includes(structuredQuery.color.toLowerCase())
      );
    }

    // Storage filter
    if (structuredQuery.minStorageGB) {
      results = results.filter((r) => {
        const storage = parseInt(r.item.metadata?.storage);
        return storage >= structuredQuery.minStorageGB;
      });
    }

    // 🔥 Step 5: Ranking logic

    if (structuredQuery.intent === "cheap") {
      results.sort(
        (a, b) =>
          a.item.pricing.price - b.item.pricing.price
      );
    }

    else if (structuredQuery.intent === "latest") {
      results.sort(
        (a, b) =>
          extractModelNumber(b.item.title) -
          extractModelNumber(a.item.title)
      );
    }

    else {
      // Default ranking: relevance + rating
      results.sort(
        (a, b) =>
          (b.item.metrics?.rating || 0) -
          (a.item.metrics?.rating || 0)
      );
    }

    const formatted = results.map(({ item }) => ({
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
