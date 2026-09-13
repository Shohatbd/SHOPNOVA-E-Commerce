-- SHOPHATBD Full-Stack Relational E-Commerce Database Schema
-- Compatible with SQLite, PostgreSQL, and MySQL

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role_id TEXT NOT NULL DEFAULT 'customer',
  avatar TEXT,
  is_verified INTEGER DEFAULT 0,
  password_changed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  image TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description_en TEXT,
  short_description_bn TEXT,
  description_en TEXT,
  description_bn TEXT,
  category_id TEXT NOT NULL,
  subcategory_id TEXT,
  brand TEXT,
  regular_price REAL NOT NULL,
  sale_price REAL,
  discount_percentage REAL DEFAULT 0,
  opening_stock INTEGER DEFAULT 0,
  total_received INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_returned INTEGER DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  thumbnail TEXT NOT NULL,
  video_url TEXT,
  weight REAL,
  is_featured INTEGER DEFAULT 0,
  is_bestseller INTEGER DEFAULT 0,
  is_new_arrival INTEGER DEFAULT 0,
  is_flash_sale INTEGER DEFAULT 0,
  flash_sale_end DATETIME,
  is_published INTEGER DEFAULT 1,
  rating REAL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  tags TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  is_demo INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sku TEXT UNIQUE,
  size TEXT,
  color TEXT,
  color_code TEXT,
  price_adjustment REAL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  change_type TEXT NOT NULL, -- 'opening', 'received', 'delivered', 'returned', 'order_cancelled', 'manual_adjustment', 'quick_edit'
  quantity_changed INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT, -- 'order', 'receive_challan', 'customer_return', 'manual', 'opening_stock'
  supplier_name TEXT,
  challan_no TEXT,
  reason TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  postal_code TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  coupon_code TEXT,
  discount_amount REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_discount_amount REAL,
  start_date DATETIME,
  end_date DATETIME,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  discount_amount REAL NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  cost REAL NOT NULL,
  estimated_days TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_area TEXT,
  shipping_postal_code TEXT,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  coupon_code TEXT,
  shipping_cost REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  payment_method TEXT NOT NULL, -- 'cod', 'bkash', 'nagad', 'card', 'sslcommerz'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  order_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'
  courier_name TEXT, -- 'Pathao', 'Steadfast', 'RedX'
  tracking_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  product_name_en TEXT NOT NULL,
  product_name_bn TEXT NOT NULL,
  sku TEXT,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  thumbnail TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  payment_method TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'paid', 'failed', 'refunded'
  gateway_response TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  gateway_type TEXT NOT NULL, -- 'cod', 'bkash', 'nagad', 'rocket', 'upay', 'bank', 'sslcommerz', 'custom'
  account_number TEXT,
  account_type TEXT DEFAULT 'Merchant', -- 'Merchant', 'Personal', 'Agent', 'Current Bank'
  charge_percentage REAL DEFAULT 0,
  instruction_en TEXT,
  instruction_bn TEXT,
  logo_url TEXT,
  qr_code_url TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_shipments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  courier_name TEXT NOT NULL, -- 'Pathao', 'Steadfast', 'RedX'
  consignment_id TEXT,
  tracking_id TEXT NOT NULL,
  shipping_status TEXT NOT NULL DEFAULT 'in_transit',
  delivery_fee REAL DEFAULT 0,
  courier_notes TEXT,
  dispatched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase INTEGER DEFAULT 1,
  status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  subtitle_en TEXT,
  subtitle_bn TEXT,
  image_url TEXT NOT NULL,
  button_text_en TEXT DEFAULT 'Shop Now',
  button_text_bn TEXT DEFAULT 'এখনই কিনুন',
  button_link TEXT DEFAULT '/shop',
  badge_en TEXT,
  badge_bn TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_bn TEXT NOT NULL,
  type TEXT DEFAULT 'order', -- 'order', 'promo', 'system', 'stock'
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  data TEXT, -- JSON string payload
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'disabled'
  response_data TEXT,
  order_id TEXT,
  order_number TEXT,
  event_type TEXT DEFAULT 'order_placed', -- 'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'test', 'custom'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'replied', 'archived'
  admin_notes TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  replied_at DATETIME
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
