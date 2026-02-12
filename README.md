# 🚀 Smart_SearchEngine

LLM-Powered Hybrid Search Engine for Electronics E-Commerce

---

## 📌 Overview

Smart_SearchEngine is a backend microservice built using **Node.js, Express, MongoDB, Fuse.js, and OpenAI** that powers an intelligent product search system for an electronics e-commerce platform.

It supports:

* 🔎 Fuzzy search (handles typos like *"ifone"*)
* 🧠 LLM-powered semantic query understanding
* 💰 Price intent detection (e.g., *"iphone under 50k"*)
* 🆕 Latest product detection
* 🎨 Color filtering
* 💾 Storage filtering
* 🧩 Accessory vs mobile category detection
* 📄 Pagination
* 📊 Faceted filtering (brand, color, storage, price range)
* 🔁 Rule-based fallback if LLM fails

---

## 🏗 Architecture

```
User Query
    ↓
LLM Structured Parsing (OpenAI)
    ↓ (fallback if fails)
Rule-Based Parser
    ↓
Fuse.js Fuzzy Matching
    ↓
Deterministic Filtering
    ↓
Ranking Engine (cheap/latest/default)
    ↓
Pagination
    ↓
Response
```

---

## 🧠 Hybrid Search Design

This project uses a **hybrid approach**:

### 1️⃣ LLM Query Understanding

User query is converted into structured JSON:

Example:

Input:

```
sastha wala iphone 16 red under 50k
```

LLM Output:

```json
{
  "brand": "Apple",
  "modelNumber": 16,
  "color": "red",
  "maxPrice": 50000,
  "intent": "cheap",
  "category": "mobile"
}
```

---

### 2️⃣ Deterministic Backend Filtering

After parsing, backend applies:

* Brand filter
* Category filter
* Price filter
* Storage filter
* Color filter

---

### 3️⃣ Ranking Engine

* `cheap` → sort by price ASC
* `latest` → sort by model number DESC
* default → sort by rating DESC

---

## 📦 Tech Stack

* **Node.js**
* **Express**
* **MongoDB + Mongoose**
* **Fuse.js** (fuzzy matching)
* **OpenAI API (gpt-4o-mini)** (LLM parsing)

---

## 🔌 APIs

---

### 1️⃣ Store Product

```
POST /api/v1/product
```

Stores product in catalog.

---

### 2️⃣ Update Product Metadata

```
PUT /api/v1/product/meta-data
```

Updates storage, color, screen size etc.

---

### 3️⃣ Search Products (Hybrid LLM)

```
GET /api/v1/search/product?query=iphone&page=1&limit=10
```

Query Parameters:

* `query` (required)
* `page` (default: 1)
* `limit` (default: 10)

Response:

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

### 4️⃣ Search Facets

```
GET /api/v1/search/facets?query=iphone
```

Returns:

* Brand counts
* Color counts
* Storage counts
* Price range
* Total results

Example:

```json
{
  "totalResults": 8,
  "brands": [{ "name": "Apple", "count": 5 }],
  "colors": [{ "name": "Red", "count": 2 }],
  "storageOptions": [{ "value": "128GB", "count": 3 }],
  "priceRange": {
    "min": 35000,
    "max": 131999
  }
}
```

---

## ⚡ Performance Considerations

* LLM timeout: 1000ms
* Rule-based fallback if LLM fails
* Pagination to reduce payload
* Deterministic filtering after Fuse
* Lightweight structured prompt to reduce latency

---

## 🛠 Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <https://github.com/KashishAgrahari23/Smart_Search_Engine>
cd Smart_SearchEngine
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
OPENAI_API_KEY=your_openai_api_key
```

---

### 4️⃣ Run Server

```bash
npm run dev
```

Server runs on:

```
http://localhost:8080
```

---

## 🧪 Sample Queries to Test

* `Latest iphone`
* `Sasta iPhone`
* `Ifone 16`
* `iPhone 16 red color`
* `iPhone 16 more storage`
* `iPhone cover `
* `iPhone 50k `

---

## 🔄 Fallback Mechanism

If OpenAI API:

* Times out
* Fails
* Returns invalid JSON

System automatically falls back to rule-based parsing.

---

## 📈 Future Improvements

* MongoDB aggregation-based facets
* Redis caching for LLM results
* Search suggestions API
* Popularity-based ranking
* Real-time indexing
* ElasticSearch integration

---

## 🎯 Why This Project is Strong

This project demonstrates:

* Microservice design
* LLM integration in backend systems
* Hybrid search architecture
* Deterministic ranking
* Fuzzy matching
* Faceted filtering
* Production-style pagination
* Clean Git workflow

---
