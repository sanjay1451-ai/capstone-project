# Second-Hand Electronics Trading Platform (VoltTrade)
> **Capstone Project — Full Ecosystem: Authentication, Marketplace, Orders, Barter Swaps, Wishlist & Reviews**

A full-stack, scalable recommerce platform designed to securely buy, sell, and exchange second-hand electronic devices. The system promotes affordable technology access while reducing global electronic waste through circular tech recommerce.

---

## 🏗️ Architecture Overview

The system consists of two decoupled, independently deployable tiers:

- **Frontend**: React.js SPA powered by Vite 5 with CSS3 design tokens, dark glassmorphism, responsive product cards, search/filter bars, details modal with reviews, direct checkout modal (`CheckoutModal`), device trade proposal modal (`ExchangeModal`), user management center dashboard (`Dashboard`), authentication modal (`AuthModal`), user profile dashboard (`Profile`), and centralized API services with JWT auto-injection (`api.js`, `authService.js`, `orderService.js`, `exchangeService.js`, `favoriteService.js`, `reviewService.js`, `categoryService.js`, `productService.js`, `imageService.js`).
- **Backend**: Java Spring Boot 3.3.x RESTful API structured in a clean, layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `security`) secured with Spring Security 6, JJWT, and BCrypt password hashing connected to Supabase PostgreSQL across all 8 relational tables.

```
┌────────────────────────────────────────────────────────┐
│              React.js (Vite) Frontend SPA              │
│                 http://localhost:5173                  │
├────────────────────────────────────────────────────────┤
│  Home • Marketplace • Categories • User Dashboard      │
│  My Purchases • Incoming Sales • Exchange Hub • Saved  │
│  Direct Checkout Modal • Device Trade Barter Modal     │
│  Auth Context (JWT Token in localStorage & Auto Header)│
└───────────────────────────┬────────────────────────────┘
                            │ CORS (REST / JSON / Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.3.x Backend                │
│                 http://localhost:8080                  │
├────────────────────────────────────────────────────────┤
│  Auth API (/api/auth) • Orders API (/api/orders)       │
│  Exchanges API (/api/exchanges) • Favorites API        │
│  Reviews API (/api/products/*/reviews) • Catalog API   │
│  Spring Security Filter Chain • OncePerRequest Filter  │
│  BCrypt Password Encoder • JJWT Token Generator/Parser │
│  JPA Entities: 8 Relational Models (User, Product...)  │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC / SSL
                            ▼
┌────────────────────────────────────────────────────────┐
│                Supabase PostgreSQL DB                  │
│  (users, products, categories, orders, exchanges,      │
│   favorites, reviews, product_images)                  │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization (Phase 3)

### Security Features
- **Stateless JWT Authentication**: Tokens issued upon registration/login with 24-hour expiration (`86400000 ms`), signed with HS256 algorithm.
- **BCrypt Password Hashing**: Passwords stored using one-way adaptive hashing.
- **Zero Password Exposure**: User responses utilize `UserResponseDTO` which never serializes password hashes.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_USER`: Standard customer privileges (Browse, register, login, view/edit profile, list devices, purchase, propose barter trades, add reviews, save to wishlist).
  - `ROLE_ADMIN`: Platform administrator (Full administrative access, category moderation, user auditing, order overrides).

### Test Credentials
| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@volttrade.com` | `Password123!` | `ROLE_USER` |
| **Admin User** | `admin@volttrade.com` | `AdminPassword123!` | `ROLE_ADMIN` |

---

## 🗄️ Relational Database Schema (All 8 Tables Active)

The complete SQL schema is located in [`supabase_schema.sql`](file:///e:/electronic%20project/supabase_schema.sql).

| Table | Primary Key | Foreign Keys | Key Columns |
| :--- | :--- | :--- | :--- |
| **`users`** | `id (BIGSERIAL)` | — | `name`, `email (UNIQUE)`, `password`, `phone`, `address`, `profile_image`, `role`, `created_at` |
| **`categories`** | `id (BIGSERIAL)` | — | `name (UNIQUE)`, `description` |
| **`products`** | `id (BIGSERIAL)` | `seller_id -> users(id)` | `title`, `description`, `category`, `brand`, `model`, `condition`, `price`, `original_price`, `location`, `status`, `created_at`, `updated_at` |
| **`product_images`** | `id (BIGSERIAL)` | `product_id -> products(id)` | `image_url` |
| **`orders`** | `id (BIGSERIAL)` | `buyer_id -> users(id)`, `product_id -> products(id)` | `quantity`, `total_price`, `order_status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)`, `created_at` |
| **`exchange_requests`**| `id (BIGSERIAL)` | `requester_id -> users(id)`, `product_id -> products(id)`, `offered_product_id -> products(id)` | `message`, `status (PENDING, ACCEPTED, REJECTED, CANCELLED)`, `created_at` |
| **`favorites`** | `id (BIGSERIAL)` | `user_id -> users(id)`, `product_id -> products(id)` | `created_at`, `UNIQUE(user_id, product_id)` |
| **`reviews`** | `id (BIGSERIAL)` | `reviewer_id -> users(id)`, `product_id -> products(id)` | `rating (1-5)`, `comment`, `created_at` |

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite 5 | Single Page Application with React Context API |
| **Styling** | Vanilla CSS3 | Custom tokens, dark glassmorphism, responsive grid |
| **Icons & UI** | Lucide React | Clean SVG vector iconography |
| **HTTP Client** | Axios | Configured with automatic `Authorization: Bearer <token>` interceptor |
| **Backend** | Java 17+ / Spring Boot 3.3.4 | RESTful API Engine |
| **Security** | Spring Security 6 + JJWT | Stateless JWT filter + BCrypt password hashing |
| **Testing** | JUnit 5 + Mockito | 16 Automated unit tests covering all services |
| **Build Tool** | Apache Maven | Multi-module build management |
| **Database** | Supabase PostgreSQL | Cloud-native relational PostgreSQL engine |
| **Version Control**| Git / GitHub | Continuous integration & version control |

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

## 📡 Complete REST API Reference

### 🔐 Authentication API (Phase 3)
- **`POST /api/auth/register`** — Register new user account
- **`POST /api/auth/login`** — Authenticate with email & password, receive JWT token
- **`GET /api/auth/me`** *(Protected)* — Get current user profile from JWT token
- **`PUT /api/auth/profile`** *(Protected)* — Update user's name, phone, address, profile image
- **`GET /api/auth/user/{id}`** — Retrieve public profile for a seller/user

### 📦 Orders & Purchases API (Phase 4)
- **`POST /api/orders`** *(Protected)* — Place an order to purchase a device
- **`GET /api/orders/my-orders`** *(Protected)* — List purchases made by authenticated buyer
- **`GET /api/orders/seller-orders`** *(Protected)* — List sales orders received by seller
- **`PUT /api/orders/{id}/status`** *(Protected)* — Update order fulfillment status (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

### 🔄 Device Barter & Exchange API (Phase 4)
- **`POST /api/exchanges`** *(Protected)* — Propose a device-for-device swap with negotiation note
- **`GET /api/exchanges/received`** *(Protected)* — View trade proposals received for user's listings
- **`GET /api/exchanges/sent`** *(Protected)* — View trade proposals submitted by user
- **`PUT /api/exchanges/{id}/status`** *(Protected)* — Accept, reject, or cancel trade proposal

### ❤️ Wishlist / Favorites API (Phase 4)
- **`POST /api/favorites/{productId}`** *(Protected)* — Toggle product bookmark in user wishlist
- **`GET /api/favorites`** *(Protected)* — Retrieve all favorited products
- **`GET /api/favorites/check/{productId}`** — Check if specific product is favorited

### ⭐ Ratings & Reviews API (Phase 4)
- **`POST /api/products/{productId}/reviews`** *(Protected)* — Submit 1-5 star rating and comment
- **`GET /api/products/{productId}/reviews`** — View all reviews for a product
- **`GET /api/products/{productId}/rating-summary`** — Retrieve average star rating and review count

### 🏷️ Categories & Products API (Phase 2)
- **`GET /api/categories`** — Retrieve all categories
- **`GET /api/products`** — Search and filter products (`?category=...&status=...&brand=...&condition=...&search=...`)
- **`GET /api/products/{id}`** — Retrieve single product details with seller and image attachments
- **`POST /api/products`** *(Protected)* — Create a new listing
- **`PUT /api/products/{id}`** *(Protected)* — Update an existing listing
- **`DELETE /api/products/{id}`** *(Protected)* — Delete a product

### 🩺 Health Check (Phase 1)
- **`GET /api/health`** — Returns `{"status": "Backend is running", "environment": "dev", "version": "1.0.0"}`

---

## 🧪 Build & Test Verification

### Backend Automated Unit Tests (16 Tests):
```bash
cd backend
mvn test "-Dtest=AuthServiceTest,OrderServiceTest,ExchangeRequestServiceTest,FavoriteServiceTest,ReviewServiceTest"
```

### Frontend Production Build:
```bash
cd frontend
npm run build
```
