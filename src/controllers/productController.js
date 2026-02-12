const Product = require("../models/productModel");
//Create Product
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      productId: product._id,
    });
  } catch (error) {
    next(error);
  }
};

// Update Product Metadata
exports.updateProductMetadata = async (req, res, next) => {
  try {
    const { productId, metadata } = req.body;

    if (!productId || !metadata) {
      return res.status(400).json({
        success: false,
        message: "productId and metadata are required",
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
      ...metadata,
    };

    await product.save();

    res.status(200).json({
      success: true,
      productId: product._id,
      metadata: product.metadata,
    });
  } catch (error) {
    next(error);
  }
};
