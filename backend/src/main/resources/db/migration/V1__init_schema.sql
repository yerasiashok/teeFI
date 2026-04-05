-- teeFI initial schema
-- V1__init_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name   VARCHAR(200) NOT NULL,
    line1       VARCHAR(255) NOT NULL,
    line2       VARCHAR(255),
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    pincode     VARCHAR(20)  NOT NULL,
    country     VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE products (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                  VARCHAR(255) NOT NULL,
    description           TEXT,
    movie_title           VARCHAR(255) NOT NULL,
    language              VARCHAR(50)  NOT NULL,
    product_type          VARCHAR(50)  NOT NULL,
    base_price            NUMERIC(10,2) NOT NULL,
    thumbnail_url         TEXT,
    printful_blueprint_id VARCHAR(100),
    printful_template_id  VARCHAR(100),
    s3_artwork_key        VARCHAR(500),
    active                BOOLEAN NOT NULL DEFAULT TRUE,
    featured              BOOLEAN NOT NULL DEFAULT FALSE,
    director              VARCHAR(200),
    release_year          INTEGER,
    tags                  VARCHAR(500),
    created_at            TIMESTAMP,
    updated_at            TIMESTAMP
);

CREATE TABLE product_images (
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL
);

CREATE TABLE product_variants (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size                VARCHAR(50),
    color               VARCHAR(100),
    material            VARCHAR(100),
    price               NUMERIC(10,2) NOT NULL,
    stock_quantity      INTEGER,
    printful_variant_id VARCHAR(100),
    sku                 VARCHAR(100),
    available           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE TABLE carts (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE cart_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(cart_id, variant_id)
);

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    order_number        VARCHAR(50) NOT NULL UNIQUE,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    shipping_full_name  VARCHAR(200),
    shipping_line1      VARCHAR(255),
    shipping_line2      VARCHAR(255),
    shipping_city       VARCHAR(100),
    shipping_state      VARCHAR(100),
    shipping_pincode    VARCHAR(20),
    shipping_country    VARCHAR(100),
    shipping_phone      VARCHAR(20),
    subtotal            NUMERIC(10,2) NOT NULL,
    shipping_cost       NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL,
    payment_provider    VARCHAR(20),
    payment_id          VARCHAR(200),
    payment_order_id    VARCHAR(200),
    pod_order_id        VARCHAR(100),
    tracking_number     VARCHAR(200),
    tracking_url        TEXT,
    shipping_carrier    VARCHAR(100),
    notes               TEXT,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_name        VARCHAR(255),
    movie_title         VARCHAR(255),
    variant_size        VARCHAR(50),
    variant_color       VARCHAR(100),
    thumbnail_url       TEXT,
    unit_price          NUMERIC(10,2) NOT NULL,
    quantity            INTEGER NOT NULL,
    line_total          NUMERIC(10,2) NOT NULL,
    printful_variant_id VARCHAR(100),
    s3_artwork_key      VARCHAR(500),
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_language    ON products(language);
CREATE INDEX idx_products_type        ON products(product_type);
CREATE INDEX idx_products_movie       ON products(movie_title);
CREATE INDEX idx_products_active      ON products(active);
CREATE INDEX idx_orders_user          ON orders(user_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_payment_oid   ON orders(payment_order_id);
CREATE INDEX idx_orders_pod_oid       ON orders(pod_order_id);
