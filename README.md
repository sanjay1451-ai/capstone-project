# Second-Hand Electronics Trading Platform (VoltTrade)
> **Capstone Project — Phase 1, Phase 2 & Phase 3: Authentication & Security**

A full-stack, scalable platform designed to securely buy, sell, and exchange second-hand electronic devices. The system promotes affordable technology access while reducing global electronic waste through circular recommerce.

---

## 🏗️ Architecture Overview

The system consists of two decoupled, independently deployable tiers:

- **Frontend**: React.js SPA powered by Vite 5 with CSS3 design tokens, glassmorphism, responsive product cards, search/filter bars, details modal, authentication modal (`AuthModal`), user profile dashboard (`Profile`), and centralized API services with JWT auto-injection (`api.js`, `authService.js`, `categoryService.js`, `productService.js`, `imageService.js`).
- **Backend**: Java Spring Boot 3.3.x RESTful API structured in a clean, layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `security`) secured with Spring Security 6, JJWT, and BCrypt password hashing connected to Supabase PostgreSQL.

```
┌────────────────────────────────────────────────────────┐
│              React.js (Vite) Frontend SPA              │
│                 http://localhost:5173                  │
├────────────────────────────────────────────────────────┤
│  Home • Marketplace • Categories • User Profile        │
│  Auth Context (JWT Token in localStorage & Auto Header)│
│  Sign In / Registration Modal with 1-Click Demo Logins │
└───────────────────────────┬────────────────────────────┘
                            │ CORS (REST / JSON / Bearer JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.3.x Backend                │
│                 http://localhost:8080                  │
├────────────────────────────────────────────────────────┤
│  Auth API (/api/auth) • Products API • Categories API   │
│  Spring Security Filter Chain • OncePerRequest Filter  │
│  BCrypt Password Encoder • JJWT Token Generator/Parser │
│  JPA Entities: 8 Relational Models (User, Product...)  │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC / SSL
                            ▼
┌────────────────────────────────────────────────────────┐
│                Supabase PostgreSQL DB                  │
│        (users, products, categories, orders...)        │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization (Phase 3)

### Security Features
- **Stateless JWT Authentication**: Tokens issued upon registration/login with 24-hour expiration (`86400000 ms`), signed with HS256 algorithm.
- **BCrypt Password Hashing**: Passwords stored using one-way adaptive hashing.
- **Zero Password Exposure**: User responses utilize `UserResponseDTO` which never serializes password hashes.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_USER`: Standard customer privileges (Browse, register, login, view/edit profile, list devices, negotiate trades).
  - `ROLE_ADMIN`: Platform administrator (Full administrative access, category moderation, user auditing).
- **Protected Endpoints**: Unauthenticated requests to protected endpoints return `401 Unauthorized` with structured JSON error messages.

### Test Credentials
| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@volttrade.com` | `Password123!` | `ROLE_USER` |
| **Admin User** | `admin@volttrade.com` | `AdminPassword123!` | `ROLE_ADMIN` |

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
| **Frontend** | React 18 + Vite 5 | Single Page Application with React Context API |
| **Styling** | Vanilla CSS3 | Custom tokens, dark glassmorphism, responsive grid |
| **Icons & UI** | Lucide React | Clean SVG vector iconography |
| **HTTP Client** | Axios | Configured with automatic `Authorization: Bearer <token>` interceptor |
| **Backend** | Java 17+ / Spring Boot 3.3.4 | RESTful API Engine |
| **Security** | Spring Security 6 + JJWT | Stateless JWT filter + BCrypt password hashing |
| **Build Tool** | Apache Maven | Multi-module build management & unit test runner |
| **Database** | Supabase PostgreSQL | Cloud-native relational PostgreSQL engine |
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

### 🔐 Authentication API (Phase 3)
- **`POST /api/auth/register`** — Register new user account
- **`POST /api/auth/login`** — Authenticate with email & password, receives JWT token
- **`GET /api/auth/me`** *(Protected)* — Get current user profile from JWT token
- **`PUT /api/auth/profile`** *(Protected)* — Update user's name, phone, address, profile image
- **`GET /api/auth/user/{id}`** — Retrieve public profile for a seller/user

### Health Check (Phase 1)
- **`GET /api/health`** — Returns `{"status": "Backend is running", "environment": "dev", "version": "1.0.0"}`

### Categories API (Phase 2)
- **`GET /api/categories`** — Retrieve all categories
- **`GET /api/categories/{id}`** — Retrieve single category by ID
- **`POST /api/categories`** *(Protected)* — Create new category (`{"name": "...", "description": "..."}`)

### Products API (Phase 2)
- **`GET /api/products`** — Search and filter products (`?category=...&status=...&brand=...&condition=...&search=...`)
- **`GET /api/products/{id}`** — Retrieve single product details with seller and image attachments
- **`POST /api/products`** *(Protected)* — Create a new listing (`{"sellerId": 1, "title": "...", "price": 899, ...}`)
- **`PUT /api/products/{id}`** *(Protected)* — Update an existing listing
- **`DELETE /api/products/{id}`** *(Protected)* — Delete a product

### Product Images API (Phase 2)
- **`GET /api/products/{productId}/images`** — List all images for a product
- **`POST /api/products/{productId}/images`** *(Protected)* — Attach image to product
- **`DELETE /api/images/{id}`** *(Protected)* — Delete an image by ID

---

## 🧪 Build & Test Verification

### Backend Tests & Compilation:
```bash
cd backend
mvn test
mvn clean compile
```

### Frontend Production Build:
```bash
cd frontend
npm run build
```
