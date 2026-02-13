const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true, 
    },

    pricing: {
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      mrp: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    metrics: {
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      unitsSold: {
        type: Number,
        default: 0,
      },
      returnRate: {
        type: Number,
        default: 0,
      },
    },

    inventory: {
      stock: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    metadata: {
      ram: String,
      storage: String,
      screenSize: String,
      color: String,
      brightness: String,
      processor: String,
      releaseDate: {
        type: Date,
      },
    },

    searchableText: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to prepare searchable text
productSchema.pre("save", function (next)  {
  this.searchableText = `
    ${this.title}
    ${this.description}
    ${this.brand}
    ${this.category}
    ${this.metadata?.ram || ""}
    ${this.metadata?.storage || ""}
    ${this.metadata?.color || ""}
  `.toLowerCase();

  next()
});

module.exports = mongoose.model("Product", productSchema);
