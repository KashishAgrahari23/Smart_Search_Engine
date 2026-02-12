const intentDictionary = {
  cheap: ["cheap", "sasta", "budget", "low", "under"],
  latest: ["latest", "new", "newest", "recent"]
};

const brandList = ["iphone", "samsung", "redmi", "apple"];

function extractPrice(query) {
  // match patterns like 50000 or 50k
  const numberMatch = query.match(/\d+k|\d{4,6}/);

  if (!numberMatch) return null;

  let value = numberMatch[0].toLowerCase();

  if (value.includes("k")) {
    return parseInt(value.replace("k", "")) * 1000;
  }

  return parseInt(value);
}

function parseQuery(rawQuery) {
  const normalizedQuery = rawQuery.toLowerCase().trim();

  const intents = {
    cheap: false,
    latest: false
  };

  // Detect intent
  Object.keys(intentDictionary).forEach((key) => {
    intentDictionary[key].forEach((word) => {
      if (normalizedQuery.includes(word)) {
        intents[key] = true;
      }
    });
  });

  // Extract price
  const maxPrice = extractPrice(normalizedQuery);

  // Detect brand
  let detectedBrand = null;
  brandList.forEach((brand) => {
    if (normalizedQuery.includes(brand)) {
      detectedBrand = brand;
    }
  });

  return {
    normalizedQuery,
    intents,
    maxPrice,
    detectedBrand
  };
}

module.exports = { parseQuery };
