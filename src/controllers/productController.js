const Product = require("../models/productModel");

// Create Product
exports.createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      rating,
      stock,
      price,
      mrp,
      currency,
      brand,
      category
    } = req.body;

    if (!title || !description || !price || !mrp || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const productData = {
      title,
      description,
      brand: brand || "Unknown",
      category: category || "mobile",

      pricing: {
        price,
        mrp,
        currency: currency || "INR",
      },

      metrics: {
        rating: rating || 0,
      },

      inventory: {
        stock,
      },
    };

    const product = await Product.create(productData);

    res.status(201).json({
      productId: product._id,
    });

  } catch (error) {
    next(error);
  }
};

exports.updateProductMetadata = async (req, res, next) => {
  try {
    const { productId, Metadata } = req.body;

    if (!productId || !Metadata) {
      return res.status(400).json({
        success: false,
        message: "productId and Metadata are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.metadata = {
      ...product.metadata,
      ...Metadata,
    };

    await product.save();

    res.status(200).json({
      productId: product._id,
      Metadata: product.metadata,
    });

  } catch (error) {
    next(error);
  }
};
