-- ===================================================================
-- Supabase PostgreSQL Schema: Second-Hand Electronics Trading Platform
-- Phase 2: Database Design and Integration
-- ===================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_image TEXT,
    role VARCHAR(30) DEFAULT 'ROLE_USER' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(50) NOT NULL, -- 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR'
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    location VARCHAR(150),
    status VARCHAR(50) DEFAULT 'AVAILABLE' NOT NULL, -- 'AVAILABLE', 'RESERVED', 'SOLD', 'EXCHANGED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. PRODUCT_IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_favorite UNIQUE (user_id, product_id)
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1 NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. EXCHANGE_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS exchange_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    offered_product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_reviewer_product UNIQUE (reviewer_id, product_id)
);

-- 9. MESSAGES TABLE (BUYER-SELLER DIRECT COMMUNICATION)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. REPORTS TABLE (PRODUCT FLAGGING & MODERATION)
CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL, -- 'FAKE_PRODUCT', 'SCAM', 'INCORRECT_INFO', 'INAPPROPRIATE_CONTENT'
    details TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'RESOLVED', 'DISMISSED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ===================================================================
-- INDEXES FOR HIGH PERFORMANCE QUERYING
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_product ON exchange_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_reports_product ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ===================================================================
-- SEED DATA (INITIAL CATEGORIES & DEMO USER)
-- ===================================================================
INSERT INTO categories (name, description) VALUES
    ('Smartphones', 'Pre-owned Apple, Samsung, Google, and OnePlus mobile devices.'),
    ('Laptops & PCs', 'Refurbished MacBooks, gaming laptops, and desktop workstations.'),
    ('Audio & Headphones', 'Wireless earbuds, noise-canceling headphones, and Hi-Fi speakers.'),
    ('Gaming Consoles', 'PlayStation, Xbox, Nintendo Switch, and gaming accessories.'),
    ('Tablets & E-Readers', 'iPads, Android tablets, and digital reading devices.'),
    ('Smartwatches & Wearables', 'Apple Watch, Garmin, and fitness trackers.'),
    ('Cameras & Optics', 'DSLRs, mirrorless cameras, lenses, and creator gear.')
ON CONFLICT (name) DO NOTHING;

-- Demo seller user for initial product listings & Admin account
INSERT INTO users (id, name, email, password, phone, address, profile_image, role) VALUES
    (1, 'Alex Rivers', 'alex.rivers@example.com', '$2a$10$eO1v00n..P4zP039c2tOFe769d45e523fbb5465c4013ba0c0906', '+1-555-0192', '124 Tech Boulevard, San Francisco, CA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ROLE_USER'),
    (2, 'EcoTrade Electronics', 'store@ecotrade.com', '$2a$10$eO1v00n..P4zP039c2tOFe769d45e523fbb5465c4013ba0c0906', '+1-555-0144', '500 Green Way, Seattle, WA', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'ROLE_USER'),
    (3, 'VoltTrade Admin', 'admin@volttrade.com', '$2a$10$eO1v00n..P4zP039c2tOFe769d45e523fbb5465c4013ba0c0906', '+1-555-0100', '100 Security HQ, New York, NY', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'ROLE_ADMIN')
ON CONFLICT (email) DO NOTHING;
