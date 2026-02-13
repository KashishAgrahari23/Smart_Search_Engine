const Product = require("../models/productModel");
const Fuse = require("fuse.js");

const { parseWithLLM } = require("../services/llmParser");
const { parseQuery } = require("../services/queryParser");

exports.searchProducts = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // 🔥 Step 1 — LLM Parsing (Hybrid)
    let structuredQuery = await parseWithLLM(query);

    if (!structuredQuery) {
      structuredQuery = parseQuery(query);
      console.log("Fallback parser used:", structuredQuery);
    } else {
      console.log("LLM Structured Output:", structuredQuery);
    }

    const products = await Product.find();

    // 🔥 Step 2 — Fuse Search (PRIMARY text matching engine)

    const searchText =
      structuredQuery.product ||
      structuredQuery.brand ||
      query;

    const fuse = new Fuse(products, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "brand", weight: 0.3 },
        { name: "description", weight: 0.2 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });

    let results = fuse.search(searchText.toLowerCase().trim());
    
    results = results.filter((r) => r.score <= 0.5);
    // 🔥 Loose fallback for heavy typos
    if (results.length === 0) {
      const looseFuse = new Fuse(products, {
        keys: ["title", "brand"],
        threshold: 0.8,
        ignoreLocation: true,
        includeScore: true,
      });

      results = looseFuse.search(searchText.toLowerCase().trim());
       results = results.filter((r) => r.score <= 0.7);
    }

    // 🔥 Step 3 — Business Filters (NOT text filters)

    // Category filter
    if (structuredQuery.category) {
      results = results.filter(
        (r) => r.item.category === structuredQuery.category
      );
    }

    // Price filter
    if (structuredQuery.maxPrice) {
      results = results.filter(
        (r) =>
          Number(r.item.pricing.price) <= structuredQuery.maxPrice
      );
    }

    // Color filter
    if (structuredQuery.color) {
      const colorFiltered = results.filter(
        (r) =>
          r.item.title
            .toLowerCase()
            .includes(structuredQuery.color.toLowerCase()) ||
          r.item.metadata?.color
            ?.toLowerCase()
            .includes(structuredQuery.color.toLowerCase())
      );

      if (colorFiltered.length > 0) {
        results = colorFiltered;
      }
    }

    // Storage filter
    if (structuredQuery.minStorageGB) {
      const storageFiltered = results.filter((r) => {
        const storage = parseInt(r.item.metadata?.storage);
        return storage >= structuredQuery.minStorageGB;
      });

      if (storageFiltered.length > 0) {
        results = storageFiltered;
      }
    }

    // 🔥 Step 4 — Ranking

    if (structuredQuery.intent === "cheap") {
      results.sort(
        (a, b) =>
          a.item.pricing.price - b.item.pricing.price
      );
    }

    else if (structuredQuery.intent === "latest") {
      results.sort(
        (a, b) =>
          new Date(b.item.metadata?.releaseDate || 0) -
          new Date(a.item.metadata?.releaseDate || 0)
      );
    }

    else {
      // Default ranking by rating
      results.sort(
        (a, b) =>
          (b.item.metrics?.rating || 0) -
          (a.item.metrics?.rating || 0)
      );
    }

    // 🔥 Step 5 — Pagination

    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limitNumber);

    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedResults = results.slice(startIndex, endIndex);

    const formatted = paginatedResults.map(({ item }) => ({
      productId: item._id,
      title: item.title,
      description: item.description,
      mrp: item.pricing.mrp,
      sellingPrice: item.pricing.price,
      metadata: item.metadata,
      stock: item.inventory.stock,
    }));

    res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalResults,
      totalPages,
      data: formatted,
    });

  } catch (error) {
    next(error);
  }
};
