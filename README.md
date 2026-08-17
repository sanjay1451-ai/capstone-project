# Second-Hand Electronics Trading Platform (VoltTrade)
> **Capstone Project — Phase 1 & Phase 2: Database Design & Integration**

A full-stack, scalable platform designed to securely buy, sell, and exchange second-hand electronic devices. The system promotes affordable technology access while reducing global electronic waste through circular recommerce.

---

## 🏗️ Architecture Overview

The system consists of two decoupled, independently deployable tiers:

- **Frontend**: React.js SPA powered by Vite 5 with CSS3 design tokens, glassmorphism, responsive product cards, search/filter bars, details modal, and centralized API services (`categoryService.js`, `productService.js`, `imageService.js`).
- **Backend**: Java Spring Boot 3.3.x RESTful API structured in a clean, layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `security`) connected to Supabase PostgreSQL.

```
┌──────────────────────────────────────────────┐
│        React.js (Vite) Frontend SPA          │
│            http://localhost:5173             │
├──────────────────────────────────────────────┤
│  Home • Marketplace • Categories • Details   │
│  API Services: categoryService, product...   │
└──────────────────────┬───────────────────────┘
                       │ CORS (REST / JSON)
                       ▼
┌──────────────────────────────────────────────┐
│          Spring Boot 3.3.x Backend           │
│            http://localhost:8080             │
├──────────────────────────────────────────────┤
│  Categories API • Products API • Images API  │
│  Health Endpoint (/api/health)               │
│  JPA Entities: 8 Relational Models           │
└──────────────────────┬───────────────────────┘
                       │ JDBC / SSL
                       ▼
┌──────────────────────────────────────────────┐
│           Supabase PostgreSQL DB             │
│   (users, products, categories, orders...)   │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Relational Database Schema (8 Tables)

The complete SQL schema is located in [`supabase_schema.sql`](file:///e:/electronic%20project/supabase_schema.sql).

| Table | Primary Key | Foreign Keys | Key Columns |
| :--- | :--- | :--- | :--- |
| **`users`** | `id (BIGSERIAL)` | — | `name`, `email (UNIQUE)`, `password`, `phone`, `address`, `profile_image`, `role`, `created_at` |
| **`categories`** | `id (BIGSERIAL)` | — | `name (UNIQUE)`, `description` |
| **`products`** | `id (BIGSERIAL)` | `seller_id -> users(id)` | `title`, `description`, `category`, `brand`, `model`, `condition`, `price`, `original_price`, `location`, `status`, `created_at`, `updated_at` |
| **`product_images`** | `id (BIGSERIAL)` | `product_id -> products(id)` | `image_url` |
| **`favorites`** | `id (BIGSERIAL)` | `user_id -> users(id)`, `product_id -> products(id)` | `created_at`, `UNIQUE(user_id, product_id)` |
| **`orders`** | `id (BIGSERIAL)` | `buyer_id -> users(id)`, `product_id -> products(id)` | `quantity`, `total_price`, `order_status`, `created_at` |
| **`exchange_requests`**| `id (BIGSERIAL)` | `requester_id -> users(id)`, `product_id -> products(id)`, `offered_product_id -> products(id)` | `message`, `status`, `created_at` |
| **`reviews`** | `id (BIGSERIAL)` | `reviewer_id -> users(id)`, `product_id -> products(id)` | `rating (1-5)`, `comment`, `created_at` |

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite 5 | High-performance Single Page Application |
| **Styling** | Vanilla CSS3 | Custom design tokens, glassmorphism, responsive grid |
| **Icons & UI** | Lucide React | Modern SVG vector icons |
| **HTTP Client** | Axios | Configured API services (`api.js`, `productService.js`, etc.) |
| **Backend** | Java 17+ / Spring Boot 3.3.4 | Enterprise RESTful API Framework |
| **Build Tool** | Apache Maven | Dependency management & compilation |
| **Database** | Supabase PostgreSQL | Cloud-native relational database |
| **Security** | Spring Security 6 + JJWT | Stateless JWT authentication & CORS filter |
| **Version Control**| Git / GitHub | Code management |

---

## 🔒 Supabase PostgreSQL Setup

### Step 1: Run SQL Schema in Supabase
1. Log in to [Supabase](https://supabase.com) and open your project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Copy the contents of [`supabase_schema.sql`](file:///e:/electronic%20project/supabase_schema.sql) and paste it into the editor.
4. Click **Run** to execute the script and generate all 8 tables and indexes.

### Step 2: Configure Environment Variables
Inside the `backend/` directory, update `.env`:

```env
# Full Supabase Connection String:
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
DB_USERNAME=postgres.[your-project-ref]
DB_PASSWORD=your_supabase_password_here
```

---

## 🚀 Running the Application

### 1. Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
*Backend runs at:* **`http://localhost:8080`**

### 2. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at:* **`http://localhost:5173`**

---

## 📡 REST API Reference

### Health Check (Phase 1)
- **`GET /api/health`** — Returns `{"status": "Backend is running", "environment": "dev", "version": "1.0.0"}`

### Categories API (Phase 2)
- **`GET /api/categories`** — Retrieve all categories
- **`GET /api/categories/{id}`** — Retrieve single category by ID
- **`POST /api/categories`** — Create new category (`{"name": "...", "description": "..."}`)

### Products API (Phase 2)
- **`GET /api/products`** — Search and filter products (`?category=...&status=...&brand=...&condition=...&search=...`)
- **`GET /api/products/{id}`** — Retrieve single product details with seller and image attachments
- **`POST /api/products`** — Create a new listing (`{"sellerId": 1, "title": "...", "price": 899, ...}`)
- **`PUT /api/products/{id}`** — Update an existing listing
- **`DELETE /api/products/{id}`** — Delete a product

### Product Images API (Phase 2)
- **`GET /api/products/{productId}/images`** — List all images for a product
- **`POST /api/products/{productId}/images`** — Attach image to product (`{"imageUrl": "..."}`)
- **`DELETE /api/images/{id}`** — Delete an image by ID

---

## 🧪 Build & Compilation Verification

### Backend Verification:
```bash
cd backend
mvn clean compile
```

### Frontend Verification:
```bash
cd frontend
npm run build
```
