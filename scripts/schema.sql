-- DouxBatter Database Schema
-- Run this script on your Hostinger MySQL database to create the required tables

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  city VARCHAR(50) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_type ENUM('standard','express') DEFAULT 'standard',
  delivery_date DATE NOT NULL,
  delivery_time_slot VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  ziina_payment_id VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reference_number (reference_number),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_id VARCHAR(100) NOT NULL,
  variant_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
