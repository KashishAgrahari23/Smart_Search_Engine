require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/productModel");

const MONGO_URI = process.env.MONGO_URI;

// ---------- Data Pools ----------

const brands = ["IPhone", "Samsung", "Redmi", "OnePlus", "Sony", "Realme"];
const categories = ["mobile", "accessory", "laptop", "headphone", "tablet"];
const colors = ["black", "white", "blue", "red", "green", "silver"];
const storages = ["32GB", "64GB", "128GB", "256GB", "512GB"];
const rams = ["4GB", "6GB", "8GB", "12GB", "16GB"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

// ---------- Price Generator ----------

function generatePrice(category) {
  switch (category) {
    case "mobile":
      return randomInt(8000, 150000);
    case "laptop":
      return randomInt(30000, 200000);
    case "headphone":
      return randomInt(1000, 30000);
    case "tablet":
      return randomInt(10000, 90000);
    case "accessory":
      return randomInt(200, 5000);
    default:
      return randomInt(1000, 50000);
  }
}

// ---------- Product Generator ----------

function createRandomProduct() {
  const brand = randomElement(brands);
  const category = randomElement(categories);

  const storage = randomElement(storages);
  const ram = randomElement(rams);
  const color = randomElement(colors);

  const price = generatePrice(category);
  const mrp = price + randomInt(500, 5000);

  return {
    title: `${brand} ${category} ${randomInt(1, 25)} ${storage}`,
    description: `Premium ${brand} ${category} with ${ram} RAM and ${storage} storage in ${color} color.`,
    brand,
    category,

    pricing: {
      price,
      mrp,
      currency: "INR",
    },

    metrics: {
      rating: +(Math.random() * 5).toFixed(1),
      reviewCount: randomInt(0, 5000),
      unitsSold: randomInt(0, 20000),
      returnRate: +(Math.random() * 10).toFixed(1),
    },

    inventory: {
      stock: randomInt(0, 500),
    },

    metadata: {
      ram,
      storage,
      color,
      screenSize: `${randomInt(5, 17)} inches`,
      brightness: `${randomInt(200, 1200)} nits`,
      processor: `${brand} Gen ${randomInt(1, 5)}`,

      // releaseDate
      releaseDate: new Date(
        randomInt(2019, 2025),
        randomInt(0, 11),
        randomInt(1, 28)
      ),
    },
  };
}

// ---------- Seed Function ----------

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    await Product.deleteMany({});
    console.log("Old products removed");
    const products = [];

    for (let i = 0; i < 1000; i++) {
      products.push(createRandomProduct());
    }

    await Product.insertMany(products);

    console.log("1500 Products Inserted Successfully");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();
