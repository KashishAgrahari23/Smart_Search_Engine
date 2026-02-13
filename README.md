# 🚀 Smart_SearchEngine

**LLM + Fuzzy Hybrid Search Engine for Electronics E-Commerce**

---

## 📌 Overview

Smart_SearchEngine is a backend microservice built using **Node.js, Express, MongoDB, Fuse.js, and LLM-based query parsing** that powers an intelligent product search system for an electronics e-commerce platform.

The system is designed to simulate how modern e-commerce search works for large product catalogs (1000+ products).

---

## 🎯 Key Features

* 🔎 **Fuzzy Search** (Handles typos like *"ifone"*, *"iphne"*)
* 🧠 **LLM-powered Query Structuring**
* 💰 **Price Intent Detection** (e.g., *"iphone under 50k"*)
* 🆕 **Latest Product Detection** (based on releaseDate)
* 🎨 **Color Filtering**
* 💾 **Storage Filtering**
* 🧩 **Category Detection (mobile/accessory/laptop/etc.)**
* 📄 **Pagination**
* 📊 **Faceted Filtering**
* 🔁 **Rule-based fallback if LLM fails**
* 🧾 **Synthetic dataset with 1000+ products**

---

# 🏗 System Architecture

```
User Query
    ↓
LLM Query Structuring
    ↓ (fallback if fails)
Rule-Based Parser
    ↓
Fuse.js Fuzzy Matching
    ↓
Score Filtering (remove weak matches)
    ↓
Business Filters (price/color/storage/category)
    ↓
Ranking Engine (cheap/latest/default)
    ↓
Pagination
    ↓
Response
```

---

# 🧠 Hybrid Search Design

The system uses a **hybrid search architecture** combining:

### 1️⃣ LLM for Semantic Understanding

LLM converts natural language queries into structured JSON.

### Example

Input:

```
sastha wala iphone 16 red under 50k
```

Structured Output:

```json
{
  "brand": "Apple",
  "product": "iphone",
  "color": "red",
  "maxPrice": 50000,
  "intent": "cheap",
  "category": "mobile"
}
```

---

### 2️⃣ Fuse.js for Fuzzy Matching

Fuse.js handles:

* Typos (ifone → iphone)
* Partial matches
* Weighted text relevance

Configuration highlights:

* Weighted keys (title > brand > description)
* Threshold tuning
* Score-based filtering
* Loose fallback for heavy typos

---

### 3️⃣ Deterministic Business Filtering

After fuzzy matching, structured filters are applied:

* Category filter
* Price filter
* Storage filter
* Color filter

Strict text filtering is avoided to preserve fuzzy results.

---

### 4️⃣ Ranking Engine

Ranking depends on detected intent:

* `cheap` → Sort by price ASC
* `latest` → Sort by metadata.releaseDate DESC
* default → Sort by rating DESC

The system uses `releaseDate: Date` instead of model-number parsing for better scalability.

---

# 📦 Tech Stack

* **Node.js**
* **Express**
* **MongoDB + Mongoose**
* **Fuse.js**
* **LLM API (OpenAI / Groq compatible)**
* **dotenv**

---

# 🗂 Data Model Highlights

Each product contains:

* title
* description
* brand
* category
* pricing (price, mrp, currency)
* metrics (rating, reviewCount, unitsSold, returnRate)
* inventory (stock)
* metadata:

  * ram
  * storage
  * color
  * screenSize
  * brightness
  * processor
  * releaseDate
* searchableText (generated via pre-save middleware)

Synthetic dataset generates **1000+ realistic products**.

---

# 🔌 APIs

---

## 1️⃣ Store Product

```
POST /api/v1/product
```

Stores product in catalog.

---

## 2️⃣ Update Product Metadata

```
PUT /api/v1/product/meta-data
```

Updates storage, color, screen size, etc.

---

## 3️⃣ Search Products

```
GET /api/v1/search/product?query=iphone&page=1&limit=10
```

### Query Params:

* `query` (required)
* `page` (default: 1)
* `limit` (default: 10)

### Response:

```json
{
  "page": 1,
  "limit": 10,
  "totalResults": 42,
  "totalPages": 5,
  "data": [...]
}
```

---

## 4️⃣ Search Facets

```
GET /api/v1/search/facets?query=iphone
```

Returns:

* Brand counts
* Color counts
* Storage counts
* Price range
* Total results

---

# 🧪 Sample Queries to Test

* `Latest iphone`
* `Sasta iPhone`
* `Ifone 16`
* `iPhone 16 red color`
* `iPhone 50k`
* `Samsung under 40k`
* `Redmi 128GB black`

---

# ⚡ Performance Considerations

* LLM timeout handling
* Rule-based fallback
* Score filtering to prevent full DB return
* Pagination to reduce payload
* Controlled Fuse threshold
* Lightweight structured prompt

---

# 🛠 Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/KashishAgrahari23/Smart_Search_Engine
cd Smart_Search_Engine
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Add Environment Variables

Create `.env` file:

```
PORT=8080
MONGO_URI=your_mongodb_connection
OPENAI_API_KEY=your_key   # or GROQ_API_KEY
```

---

### 4️⃣ Seed Database (1000+ Products)

```bash
node scripts/seedProducts.js
```

---

### 5️⃣ Run Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:8080
```

---

# 🔄 Fallback Strategy

If LLM:

* Fails
* Times out
* Returns invalid JSON

System automatically uses rule-based parsing.

This ensures high availability.

---

# 📈 Future Improvements

* Move filtering to MongoDB aggregation
* Redis caching for LLM responses
* Search suggestions API
* Click-based ranking
* Query analytics
* ElasticSearch integration
* Real spell-correction engine

---

# 🎯 Why This Project Is Strong

This project demonstrates:

* Microservice design
* Hybrid search architecture
* LLM integration in backend
* Fuzzy matching tuning
* Ranking algorithms
* Faceted filtering
* Large dataset handling
* Real-world search challenges
* Production-style pagination
* Clean Git branching strategy

---
