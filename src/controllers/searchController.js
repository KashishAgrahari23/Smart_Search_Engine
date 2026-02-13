const Product = require("../models/productModel");
const Fuse = require("fuse.js");

const { parseWithLLM } = require("../services/llmParser");
const { parseQuery } = require("../services/queryParser");

// Extract model number for "latest" intent
function extractModelNumber(title) {
  const match = title.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

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

    // 🔥 Step 1: LLM parsing
    let structuredQuery = await parseWithLLM(query);

    if (!structuredQuery) {
      structuredQuery = parseQuery(query);
      console.log("Fallback parser used:", structuredQuery);
    } else {
      console.log("LLM Structured Output:", structuredQuery);
    }

    const products = await Product.find();

    // 🔥 Step 2: Fuse search
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

    // 🔥 Step 3: Filtering

    if (structuredQuery.brand) {
      results = results.filter((r) =>
        r.item.brand
          .toLowerCase()
          .includes(structuredQuery.brand.toLowerCase())
      );
    }

    if (structuredQuery.category) {
      results = results.filter(
        (r) => r.item.category === structuredQuery.category
      );
    }

    if (structuredQuery.maxPrice) {
      results = results.filter(
        (r) =>
          Number(r.item.pricing.price) <= structuredQuery.maxPrice
      );
    }

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

    if (structuredQuery.minStorageGB) {
      results = results.filter((r) => {
        const storage = parseInt(r.item.metadata?.storage);
        return storage >= structuredQuery.minStorageGB;
      });
    }

    // 🔥 Step 4: Ranking

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
      results.sort(
        (a, b) =>
          (b.item.metrics?.rating || 0) -
          (a.item.metrics?.rating || 0)
      );
    }

    // 🔥 Step 5: Pagination

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

exports.getFacets = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    let structuredQuery = await parseWithLLM(query);

    if (!structuredQuery) {
      structuredQuery = parseQuery(query);
    }

    const products = await Product.find();

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

    // Apply same filters as search API
    if (structuredQuery.brand) {
      results = results.filter((r) =>
        r.item.brand
          .toLowerCase()
          .includes(structuredQuery.brand.toLowerCase())
      );
    }

    if (structuredQuery.category) {
      results = results.filter(
        (r) => r.item.category === structuredQuery.category
      );
    }

    if (structuredQuery.maxPrice) {
      results = results.filter(
        (r) =>
          Number(r.item.pricing.price) <= structuredQuery.maxPrice
      );
    }

    const items = results.map(r => r.item);

    // 🔥 Build facets

    const brandMap = {};
    const colorMap = {};
    const storageMap = {};

    let minPrice = Infinity;
    let maxPrice = 0;

    items.forEach((item) => {
      // Brand
      brandMap[item.brand] = (brandMap[item.brand] || 0) + 1;

      // Color
      const color = item.metadata?.color;
      if (color) {
        colorMap[color] = (colorMap[color] || 0) + 1;
      }

      // Storage
      const storage = item.metadata?.storage;
      if (storage) {
        storageMap[storage] = (storageMap[storage] || 0) + 1;
      }

      // Price range
      const price = item.pricing.price;
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    const response = {
      totalResults: items.length,
      brands: Object.entries(brandMap).map(([name, count]) => ({
        name,
        count
      })),
      colors: Object.entries(colorMap).map(([name, count]) => ({
        name,
        count
      })),
      storageOptions: Object.entries(storageMap).map(([value, count]) => ({
        value,
        count
      })),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice
      }
    };

    res.status(200).json(response);

  } catch (error) {
    next(error);
  }
};
