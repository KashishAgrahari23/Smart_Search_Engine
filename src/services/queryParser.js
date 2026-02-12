const intentDictionary = {
  cheap: ["cheap", "sasta", "sastha", "budget", "low", "under"],
  latest: ["latest", "new", "newest", "recent"]
};

const brandList = ["iphone", "samsung", "redmi"];

const colorList = ["red", "blue", "black", "white"];

const accessoryKeywords = ["cover", "case", "charger", "protector"];

// 🔹 Extract price (50k / 50000)
function extractPrice(query) {
  const match = query.match(/\d+k|\d{4,6}/);

  if (!match) return null;

  let value = match[0].toLowerCase();

  if (value.includes("k")) {
    return parseInt(value.replace("k", "")) * 1000;
  }

  return parseInt(value);
}

function parseQuery(rawQuery) {
  const normalizedQuery = rawQuery.toLowerCase().trim();

  // 🔹 Intent detection
  const intents = {
    cheap: false,
    latest: false
  };

  Object.keys(intentDictionary).forEach((intentKey) => {
    intentDictionary[intentKey].forEach((word) => {
      if (normalizedQuery.includes(word)) {
        intents[intentKey] = true;
      }
    });
  });

  // 🔹 Price detection
  const maxPrice = extractPrice(normalizedQuery);

  // 🔹 Brand detection
  let detectedBrand = null;
  brandList.forEach((brand) => {
    if (normalizedQuery.includes(brand)) {
      detectedBrand = brand;
    }
  });

  // 🔹 Color detection
  let detectedColor = null;
  colorList.forEach((color) => {
    if (normalizedQuery.includes(color)) {
      detectedColor = color;
    }
  });

  // 🔹 Accessory intent
  const isAccessoryQuery = accessoryKeywords.some((word) =>
    normalizedQuery.includes(word)
  );

  // 🔹 Storage intent
  const wantsMoreStorage = normalizedQuery.includes("more storage");

  // 🔹 Clean query for Fuse (remove price numbers)
  const cleanedQuery = normalizedQuery
    .replace(/\d+k|\d{4,6}/g, "")
    .trim();

  return {
    normalizedQuery: cleanedQuery,
    intents,
    maxPrice,
    detectedBrand,
    detectedColor,
    isAccessoryQuery,
    wantsMoreStorage
  };
}

module.exports = { parseQuery };
