# 🚀 Express Caching Workshop

A hands-on **Express.js REST API** demonstrating layered architecture and middleware-based in-memory caching. This project covers core caching concepts including TTL (time-to-live), cache HIT/MISS headers, cache expiration, and cache invalidation — all backed by a simple JSON-based data store.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Caching](#caching)
- [Cache HIT / MISS](#cache-hit--miss)
- [Cache Invalidation](#cache-invalidation)
- [TTL / Expiration](#ttl--expiration)
- [Database](#database)
- [Testing](#testing)
- [Workshop Requirements Checklist](#workshop-requirements-checklist)
- [Technologies](#technologies)
- [Author](#author)
- [License](#license)

---

## Overview

This project is an Express.js REST API built for a caching workshop. It demonstrates how to implement **middleware-based in-memory caching** within a clean layered architecture.

Key concepts demonstrated:

- **Layered architecture** — Routes → Middleware → Controller → Service → Database
- **Middleware-based caching** — Cache logic is isolated in dedicated middleware
- **Cache TTL** — Cached responses expire after 60 seconds
- **Cache HIT / MISS** — Response headers indicate whether data came from cache or fresh fetch
- **Cache invalidation** — Mutating operations (POST, PUT, PATCH, DELETE) clear the cache automatically
- **JSON-based data storage** — A lightweight `db.json` file acts as the data store

---

## ✨ Features

- REST API with full CRUD support for products
- `GET /products` — retrieve all products
- `GET /products/:id` — retrieve a single product by ID
- `POST /products` — create a new product
- `PUT /products/:id` — fully update a product
- `PATCH /products/:id` — partially update a product
- `DELETE /products/:id` — delete a product
- In-memory caching via `cache.middleware.js`
- 60-second cache TTL
- Cache creation timestamp stored with each entry
- `X-Cache: HIT` / `X-Cache: MISS` response headers
- Cache expiration and automatic refresh
- Cache invalidation after successful POST, PUT, PATCH, and DELETE via `invalidate.middleware.js`
- Clean layered architecture

---

## 🏗️ Architecture

```
Client
  ↓
Routes          — Defines API endpoints and attaches middleware
  ↓
Middleware      — Checks cache (cache.middleware.js) or invalidates it (invalidate.middleware.js)
  ↓
Controller      — Handles request/response lifecycle
  ↓
Service         — Contains business logic
  ↓
Database        — Reads/writes data to db.json
```

Each layer has a single responsibility:

| Layer | File(s) | Responsibility |
|---|---|---|
| **Routes** | `routes/product.routes.js` | Maps HTTP methods and paths to controller functions and middleware |
| **Middleware** | `middleware/cache.middleware.js`, `middleware/invalidate.middleware.js` | Intercepts requests to serve cached responses or clear stale cache |
| **Controller** | `controllers/product.controller.js` | Parses request data, calls services, and sends HTTP responses |
| **Service** | `services/product.service.js` | Implements business logic and delegates data operations to the database layer |
| **Database** | `database/product.database.js` | Reads from and writes to `db.json` |

---

## 📁 Project Structure

```
express-caching-workshop-v2/
├── controllers/
│   └── product.controller.js
├── database/
│   └── product.database.js
├── middleware/
│   ├── cache.middleware.js
│   └── invalidate.middleware.js
├── routes/
│   └── product.routes.js
├── services/
│   └── product.service.js
├── db.json
├── package.json
├── package-lock.json
├── server.js
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/azmolwasimhussain-ops/express-caching-workshop-v2.git
```

2. **Navigate into the project directory**

```bash
cd express-caching-workshop-v2
```

3. **Install dependencies**

```bash
npm install
```

> `node_modules` is not committed to the repository — it is excluded by `.gitignore`. Running `npm install` will recreate it locally.

4. **Start the server**

```bash
node server.js
```

5. **Server is running at:**

```
http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Retrieve all products |
| `GET` | `/products/:id` | Retrieve a single product by ID |
| `POST` | `/products` | Create a new product |
| `PUT` | `/products/:id` | Fully update a product by ID |
| `PATCH` | `/products/:id` | Partially update a product by ID |
| `DELETE` | `/products/:id` | Delete a product by ID |

---

## 🗄️ Caching

Caching is implemented in `middleware/cache.middleware.js`. It uses an **in-memory cache** (a plain JavaScript object) to store responses keyed by the request URL.

**How it works:**

- The **cache key** is the requested URL (e.g. `/products` or `/products/1`)
- Each cache entry stores:
  - The response **data**
  - A **`createdAt`** timestamp (milliseconds)
- The **TTL is 60 seconds**
- On each request, the middleware checks if a valid (non-expired) cache entry exists
- If valid → the cached response is returned immediately (cache HIT)
- If expired → the stale entry is deleted and fresh data is fetched (cache MISS)
- If no entry exists → fresh data is fetched (cache MISS)
- After fetching fresh data, the response is stored in the cache for future requests

**Cache flow:**

```
Request
  ↓
Check Cache
  ↓
Cache HIT → Return cached data
  ↓
Cache MISS / Expired
  ↓
Controller → Service → Database
  ↓
Store response in cache
  ↓
Return response
```

---

## 📊 Cache HIT / MISS

Every response from a cacheable endpoint includes an `X-Cache` header indicating whether the response was served from cache or fetched fresh.

| Header Value | Meaning |
|---|---|
| `X-Cache: HIT` | Response was served from the in-memory cache |
| `X-Cache: MISS` | Response was fetched fresh from the database and then cached |

---

## 🔄 Cache Invalidation

`middleware/invalidate.middleware.js` is responsible for clearing the cache after a successful mutating operation (any `2xx` response).

It is applied to:

| Method | Endpoint |
|---|---|
| `POST` | `/products` |
| `PUT` | `/products/:id` |
| `PATCH` | `/products/:id` |
| `DELETE` | `/products/:id` |

**Example flow:**

```
GET /products   →  X-Cache: MISS   (no cache yet, fetched fresh)

GET /products   →  X-Cache: HIT    (served from cache)

POST /products  →  cache cleared   (invalidate middleware clears all cache entries)

GET /products   →  X-Cache: MISS   (cache was cleared, fetched fresh again)
```

This ensures that after any data mutation, clients always receive up-to-date responses.

---

## ⏱️ TTL / Expiration

```
TTL = 60 seconds
```

Each cache entry records a `createdAt` timestamp at the time it is stored. On every incoming request, the middleware calculates the **age** of the cached entry:

```
age = Date.now() - cache[key].createdAt
```

If `age >= TTL (60,000ms)`, the cached entry is considered **expired** and is deleted. The request then proceeds through the full stack to fetch fresh data, which is stored back in the cache with a new `createdAt` timestamp.

---

## 🗃️ Database

This project uses **`db.json`** as a lightweight, file-based data store. There is no external database (no MongoDB, PostgreSQL, MySQL, or Redis). The database layer reads from and writes to this JSON file directly.

This keeps the project self-contained and easy to run without any external infrastructure.

---

## 🧪 Testing

You can test the API using any HTTP client such as [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), or `curl`.

### Test Cache HIT / MISS

**First request (cache MISS):**

```
GET http://localhost:3000/products
→ X-Cache: MISS
```

**Second request within 60 seconds (cache HIT):**

```
GET http://localhost:3000/products
→ X-Cache: HIT
```

The same pattern applies to `GET /products/:id`.

### Test Cache Invalidation

```
GET http://localhost:3000/products
→ X-Cache: MISS

GET http://localhost:3000/products
→ X-Cache: HIT

POST http://localhost:3000/products
Body: { "name": "New Product", "price": 99 }
→ cache is cleared

GET http://localhost:3000/products
→ X-Cache: MISS   (cache was invalidated, fresh fetch)
```

The same invalidation behaviour applies after `PUT`, `PATCH`, and `DELETE`.

---

## ✅ Workshop Requirements Checklist

- [x] Layered architecture
- [x] Routes layer
- [x] Controllers layer
- [x] Services layer
- [x] Database layer
- [x] Middleware layer
- [x] `GET /products` caching
- [x] `GET /products/:id` caching
- [x] Cache HIT/MISS headers
- [x] 60-second TTL
- [x] Cache creation timestamp
- [x] Cache expiration
- [x] Fresh database fetch after expiration
- [x] Cache refresh after fresh fetch
- [x] Cache invalidation after POST
- [x] Cache invalidation after PUT
- [x] Cache invalidation after PATCH
- [x] Cache invalidation after DELETE

---

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| JavaScript | Application language |
| REST API | API design pattern |
| Express Middleware | Cache and invalidation logic |
| In-memory caching | Fast, TTL-based response caching |
| JSON | Lightweight data storage (`db.json`) |

---

## 👤 Author

**Azmol Wasim Hussain**

- GitHub: [github.com/azmolwasimhussain-ops](https://github.com/azmolwasimhussain-ops)
- Portfolio: [azmol-portfolio.vercel.app](https://azmol-portfolio.vercel.app)
- LinkedIn: [linkedin.com/in/azmol-wasim-hussain-404778376](https://www.linkedin.com/in/azmol-wasim-hussain-404778376/)

---

## 📄 License

This project was created for **educational and workshop purposes**. Feel free to use it as a reference or learning resource.
