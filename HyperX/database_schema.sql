-- Price Recommendation Database Schema
-- Create database tables for the price recommendation system

-- Users table with authentication
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    mobile TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'United States',
    date_of_birth DATE,
    gender TEXT,
    user_type TEXT DEFAULT 'customer',
    password_hash TEXT NOT NULL,
    google_id TEXT UNIQUE,
    location TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gardeners table
CREATE TABLE IF NOT EXISTS gardeners (
    gardener_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    specialization TEXT,
    rating REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'USA',
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city, state, country)
);

-- Price recommendations table
CREATE TABLE IF NOT EXISTS price_recommendations (
    recommendation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    gardener_id INTEGER,
    location TEXT,
    predicted_demand REAL,
    base_price REAL,
    final_price REAL,
    discount REAL,
    recommended_offer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (gardener_id) REFERENCES gardeners (gardener_id)
);

-- External data cache table
CREATE TABLE IF NOT EXISTS external_data_cache (
    cache_id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    competitor_price REAL,
    market_demand REAL,
    weather_condition TEXT,
    season_flag TEXT,
    cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    UNIQUE(location)
);

-- Remember me tokens table
CREATE TABLE IF NOT EXISTS remember_tokens (
    token_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT OR IGNORE INTO users (user_id, name, email, mobile, street_address, city, state, zip_code, country, user_type, password_hash, location) VALUES
(1, 'John Smith', 'john@example.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', 'United States', 'customer', '$2b$10$example.hash.for.john', 'New York'),
(2, 'Jane Doe', 'jane@example.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'United States', 'customer', '$2b$10$example.hash.for.jane', 'Los Angeles'),
(3, 'Bob Johnson', 'bob@example.com', '555-0103', '789 Pine Rd', 'Chicago', 'IL', '60601', 'United States', 'customer', '$2b$10$example.hash.for.bob', 'Chicago'),
(4, 'Mike Wilson', 'mike@gardener.com', '555-0201', '321 Garden St', 'Austin', 'TX', '78701', 'United States', 'gardener', '$2b$10$example.hash.for.mike', 'Austin'),
(5, 'Admin User', 'admin@example.com', '555-0000', '100 Admin Blvd', 'Washington', 'DC', '20001', 'United States', 'admin', '$2b$10$example.hash.for.admin', 'Washington DC');

INSERT OR IGNORE INTO gardeners (gardener_id, name, email, specialization, rating) VALUES
(1, 'Mike Wilson', 'mike@gardener.com', 'Lawn Care', 4.5),
(2, 'Sarah Brown', 'sarah@gardener.com', 'Garden Design', 4.8),
(3, 'Tom Davis', 'tom@gardener.com', 'Tree Service', 4.2);

INSERT OR IGNORE INTO locations (city, state, country) VALUES
('New York', 'NY', 'USA'),
('Los Angeles', 'CA', 'USA'),
('Chicago', 'IL', 'USA'),
('Houston', 'TX', 'USA'),
('Phoenix', 'AZ', 'USA');

INSERT OR IGNORE INTO external_data_cache (location, competitor_price, market_demand, weather_condition, season_flag, expires_at) VALUES
('New York', 85.00, 0.75, 'Sunny', 'spring', datetime('now', '+1 hour')),
('Los Angeles', 95.00, 0.80, 'Clear', 'spring', datetime('now', '+1 hour')),
('Chicago', 75.00, 0.70, 'Cloudy', 'spring', datetime('now', '+1 hour'));