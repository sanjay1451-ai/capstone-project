# Second-Hand Electronics Trading Platform (VoltTrade)
> **Capstone Project — Full Ecosystem: Authentication, Product Catalog, Sell Module, Orders, Barter Swaps, Wishlist & Reviews**

A full-stack, scalable recommerce platform designed to securely buy, sell, and exchange second-hand electronic devices. The system promotes affordable technology access while reducing global electronic waste through circular tech recommerce.

---

## 🏗️ Architecture Overview

The system consists of two decoupled, independently deployable tiers:

- **Frontend**: React.js SPA powered by Vite 5 with CSS3 design tokens, dark glassmorphism, responsive product cards, search/filter bars, details modal with reviews, direct checkout modal (`CheckoutModal`), device trade proposal modal (`ExchangeModal`), user management center dashboard (`Dashboard`), authentication modal (`AuthModal`), dedicated Sell Electronics page (`Sell`), multi-photo image uploader (`ImageUpload`), user profile dashboard (`Profile`), and centralized API services with JWT auto-injection (`api.js`, `authService.js`, `productService.js`, `orderService.js`, `exchangeService.js`, `favoriteService.js`, `reviewService.js`, `categoryService.js`, `imageService.js`).
- **Backend**: Java Spring Boot 3.3.x RESTful API structured in a clean, layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `security`) secured with Spring Security 6, JJWT, and BCrypt password hashing connected to Supabase PostgreSQL across all 8 relational tables.

```
┌────────────────────────────────────────────────────────┐
│              React.js (Vite) Frontend SPA              │
│                 http://localhost:5173                  │
├────────────────────────────────────────────────────────┤
│  Home • Marketplace • Categories • Sell Device Page    │
│  User Dashboard (My Listings • Purchases • Sales)      │
│  Exchange Hub • Saved Wishlist • Image Uploader        │
│  Direct Checkout Modal • Device Barter Swap Modal      │
│  Auth Context (JWT Token in localStorage & Auto Header)│
└───────────────────────────┬────────────────────────────┘
                            │ CORS (REST / JSON / Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.3.x Backend                │
│                 http://localhost:8080                  │
├────────────────────────────────────────────────────────┤
│  Auth API (/api/auth) • Products CRUD (/api/products)  │
│  Orders API (/api/orders) • Exchanges (/api/exchanges) │
│  Favorites API (/api/favorites) • Reviews API          │
│  Seller Ownership Validator • Input/Price Validator    │
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
└───────────────────────────┘
```

---

## 🏷️ Sell Electronics Module (Phase 4)

### Seller Form & Listing Features:
- **Device Specifications**: Product title, category dropdown, brand, model code/number, detailed description.
- **Condition Grading**:
  - `LIKE_NEW`: Flawless condition, original packaging & accessories.
  - `EXCELLENT`: Minimal cosmetic signs of use, 100% functional.
  - `GOOD`: Minor scratches or scuffs, fully tested & working.
  - `FAIR`: Visible wear or battery degradation, fully operational.
  - `USED`: Standard secondhand device, tested and verified.
- **Smart Pricing & Discount Calculator**: Live percentage discount and savings display compared to original retail price.
- **Image Handling & Uploader (`ImageUpload`)**:
  - Drag-and-drop file upload with preview.
  - Custom image URL support.
  - Curated high-resolution gadget preset selector.
  - Primary cover photo selector and instant thumbnail removal.
- **Ownership & Security Enforcement**:
  - Only authenticated users can create listings.
  - Users can only edit and delete their **own** listings (`SecurityException` / `403 Forbidden` if unauthorized).
  - Platform administrators (`ROLE_ADMIN`) have global moderation privileges.
- **My Listings Dashboard**:
  - View all user listings with status badges (`AVAILABLE`, `RESERVED`, `SOLD`, `EXCHANGED`).
  - One-click edit listing modal with prefilled data.
  - Delete listing with confirmation prompt.

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
| **`orders`** | `id (BIGSERIAL)` | `buyer_id -> users(id)`, `product_id -> products(id)` | `quantity`, `total_price`, `order_status`, `created_at` |
| **`exchange_requests`**| `id (BIGSERIAL)` | `requester_id -> users(id)`, `product_id -> products(id)`, `offered_product_id -> products(id)` | `message`, `status`, `created_at` |
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
| **Testing** | JUnit 5 + Mockito | 20 Automated unit tests covering all services |
| **Build Tool** | Apache Maven | Multi-module build management |
| **Database** | Supabase PostgreSQL | Cloud-native relational PostgreSQL engine |
| **Version Control**| Git / GitHub | Continuous integration & version control |

---

## 📡 Complete REST API Reference

### 📱 Product & Sell Module API (Phase 4)
- **`GET /api/products`** — Search and filter products (`?category=...&status=...&brand=...&condition=...&search=...`)
- **`GET /api/products/{id}`** — Retrieve single product details with seller and image attachments
- **`GET /api/products/my-listings`** *(Protected)* — Retrieve all listings created by the authenticated seller
- **`POST /api/products`** *(Protected)* — Create a new listing (automatically sets seller ID from token)
- **`PUT /api/products/{id}`** *(Protected)* — Update an existing listing (validates seller ownership)
- **`DELETE /api/products/{id}`** *(Protected)* — Delete a product (validates seller ownership)

### 🔐 Authentication API (Phase 3)
- **`POST /api/auth/register`** — Register new user account
- **`POST /api/auth/login`** — Authenticate with email & password, receive JWT token
- **`GET /api/auth/me`** *(Protected)* — Get current user profile from JWT token
- **`PUT /api/auth/profile`** *(Protected)* — Update user's name, phone, address, profile image
- **`GET /api/auth/user/{id}`** — Retrieve public profile for a seller/user

### 📦 Orders & Purchases API
- **`POST /api/orders`** *(Protected)* — Place an order to purchase a device
- **`GET /api/orders/my-orders`** *(Protected)* — List purchases made by authenticated buyer
- **`GET /api/orders/seller-orders`** *(Protected)* — List sales orders received by seller
- **`PUT /api/orders/{id}/status`** *(Protected)* — Update order fulfillment status

### 🔄 Device Barter & Exchange API
- **`POST /api/exchanges`** *(Protected)* — Propose a device swap with negotiation note
- **`GET /api/exchanges/received`** *(Protected)* — View trade proposals received
- **`GET /api/exchanges/sent`** *(Protected)* — View trade proposals submitted
- **`PUT /api/exchanges/{id}/status`** *(Protected)* — Accept, reject, or cancel trade proposal

### ❤️ Wishlist & Reviews API
- **`POST /api/favorites/{productId}`** *(Protected)* — Toggle product bookmark in user wishlist
- **`GET /api/favorites`** *(Protected)* — Retrieve all favorited products
- **`POST /api/products/{productId}/reviews`** *(Protected)* — Submit 1-5 star rating and comment
- **`GET /api/products/{productId}/reviews`** — View all reviews for a product

---

## 🧪 Build & Test Verification

### Backend Automated Unit Tests (20 Tests):
```bash
cd backend
mvn test "-Dtest=AuthServiceTest,ProductServiceTest,OrderServiceTest,ExchangeRequestServiceTest,FavoriteServiceTest,ReviewServiceTest"
```

### Frontend Production Build:
```bash
cd frontend
npm run build
```
