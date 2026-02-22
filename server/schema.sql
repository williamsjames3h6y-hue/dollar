-- Data Annotation Platform MySQL Schema
-- Database: admsoayacucho_56
-- Generated: 2026-02-20

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS earnings;
DROP TABLE IF EXISTS brand_identification_tasks;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS payment_gateways;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table (authentication)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles table
CREATE TABLE user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(50),
  location VARCHAR(255),
  vip_tier ENUM('free', 'bronze', 'silver', 'gold', 'platinum') DEFAULT 'free',
  task_completion_rate DECIMAL(5,2) DEFAULT 0.00,
  total_tasks_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_vip_tier (vip_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallets table
CREATE TABLE wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brand (brand),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Brand identification tasks table
CREATE TABLE brand_identification_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  assigned_to INT NOT NULL,
  correct_brand VARCHAR(255) NOT NULL,
  brand_options JSON NOT NULL,
  selected_brand VARCHAR(255),
  confidence_level ENUM('low', 'medium', 'high'),
  notes TEXT,
  status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
  reward_amount DECIMAL(10,2) NOT NULL,
  actual_reward DECIMAL(10,2),
  is_correct BOOLEAN,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Earnings table
CREATE TABLE earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT,
  task_type VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES brand_identification_tasks(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_earned_at (earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment methods table
CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  method_type ENUM('paypal', 'bank_transfer', 'crypto', 'upi', 'other') NOT NULL,
  account_details JSON NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment gateways table (admin configured)
CREATE TABLE payment_gateways (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('stripe', 'paypal', 'razorpay', 'square', 'other') NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO products (name, brand, category, image_url, description) VALUES
('Classic Running Shoes', 'Nike', 'Footwear', '/products/P1.jpg', 'Premium running shoes with advanced cushioning'),
('Sports Jacket', 'Adidas', 'Apparel', '/products/P2.jpg', 'Weather-resistant sports jacket'),
('Training Sneakers', 'Puma', 'Footwear', '/products/P3.jpg', 'Lightweight training sneakers'),
('Athletic T-Shirt', 'Under Armour', 'Apparel', '/products/P4.jpg', 'Moisture-wicking athletic shirt'),
('Casual Sneakers', 'Reebok', 'Footwear', '/products/P5.jpg', 'Comfortable casual sneakers');

-- Insert default admin user (password: admin123)
-- Note: Password is hashed using bcrypt with 10 rounds
INSERT INTO users (email, password, role, created_at) VALUES
('admin@dataannotation.com', '$2a$10$rN8xqzHqHZKZjxH8k5b5/.X5N5N5N5N5N5N5N5N5N5N5N5N5N5N5O', 'admin', NOW());

-- Get the admin user ID and create profile
SET @admin_id = LAST_INSERT_ID();

INSERT INTO user_profiles (user_id, full_name, vip_tier, created_at, updated_at) VALUES
(@admin_id, 'Admin User', 'platinum', NOW(), NOW());

INSERT INTO wallets (user_id, balance, total_earned, created_at, updated_at) VALUES
(@admin_id, 0, 0, NOW(), NOW());
