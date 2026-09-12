import initSqlJs, { type Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  seedCategories,
  seedSubcategories,
  seedProducts,
  seedBanners,
  seedCoupons,
  seedShippingMethods,
  seedSettings
} from './seedData.ts';

let dbInstance: Database | null = null;
const DB_FILE_PATH = path.join(process.cwd(), 'shopnova.db');

export function getDb(): Database {
  if (!dbInstance) {
    throw new Error('Database is not initialized. Please call initDatabase() first.');
  }
  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

export function query<T = any>(sqlQuery: string, params: any[] = []): T[] {
  const db = getDb();
  try {
    const stmt = db.prepare(sqlQuery);
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error(`Database Query Error on [${sqlQuery}]:`, error);
    throw error;
  }
}

export function queryOne<T = any>(sqlQuery: string, params: any[] = []): T | null {
  const rows = query<T>(sqlQuery, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sqlQuery: string, params: any[] = []): { changes: number } {
  const db = getDb();
  try {
    db.run(sqlQuery, params);
    saveDatabase();
    return { changes: db.getRowsModified() };
  } catch (error) {
    console.error(`Database Run Error on [${sqlQuery}]:`, error);
    throw error;
  }
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('Loaded existing database from', DB_FILE_PATH);
    } catch (e) {
      console.warn('Could not read existing db, creating fresh database...', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Created fresh in-memory database');
  }

  // Load and apply schema
  const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    dbInstance.exec(schemaSql);
  }

  // Ensure subcategories table has image column
  try {
    dbInstance.run('ALTER TABLE subcategories ADD COLUMN image TEXT');
  } catch (_) {}

  // Ensure contact_messages table exists
  try {
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        admin_notes TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        replied_at DATETIME
      )
    `);
  } catch (err) {
    console.error('Failed to verify contact_messages table:', err);
  }

  // Ensure subscribers table exists
  try {
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Failed to verify subscribers table:', err);
  }

  // Ensure default admin alert email and SMTP settings exist
  const defaultContactSettings = [
    { key: 'admin_notification_email', value: 'liakot911@gmail.com' },
    { key: 'smtp_enabled', value: '0' },
    { key: 'smtp_host', value: 'smtp.gmail.com' },
    { key: 'smtp_port', value: '465' },
    { key: 'smtp_secure', value: '1' },
    { key: 'smtp_user', value: '' },
    { key: 'smtp_pass', value: '' },
    { key: 'smtp_from_name', value: 'SHOPNOVA Customer Care' },
    { key: 'smtp_from_email', value: '' }
  ];
  for (const st of defaultContactSettings) {
    try {
      dbInstance.run(
        `INSERT OR IGNORE INTO site_settings (id, key, value) VALUES (?, ?, ?)`,
        [`st_${st.key}`, st.key, st.value]
      );
    } catch (_) {}
  }

  try {
    dbInstance.run('UPDATE products SET opening_stock = stock_quantity WHERE (opening_stock = 0 OR opening_stock IS NULL) AND stock_quantity > 0');
  } catch (_) {}

  // Ensure inventory and demo columns exist in products table
  try { dbInstance.run("ALTER TABLE products ADD COLUMN is_demo INTEGER DEFAULT 0"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN opening_stock INTEGER DEFAULT 0"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_received INTEGER DEFAULT 0"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_delivered INTEGER DEFAULT 0"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_returned INTEGER DEFAULT 0"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN reference_id TEXT"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN reference_type TEXT"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN supplier_name TEXT"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN challan_no TEXT"); } catch (_) {}
  try { dbInstance.run("ALTER TABLE product_variants ADD COLUMN image TEXT"); } catch (_) {}

  // Check if store has completed initial setup/seeding
  const storeInitRow = queryOne<{ value: string }>("SELECT value FROM site_settings WHERE key = 'store_data_initialized'");
  const isStoreInitialized = Boolean(storeInitRow && storeInitRow.value === '1');

  // Ensure default roles
  dbInstance.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES ('super_admin', 'Super Admin', 'Full platform control')");
  dbInstance.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES ('admin', 'Admin', 'Store and product manager')");
  dbInstance.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES ('customer', 'Customer', 'Shopper account')");

  // Check if admin user exists
  const existingAdmin = queryOne('SELECT id FROM users WHERE username IN (?, ?, ?, ?) OR role_id IN (?, ?)', ['Shophatbd', 'shophatbd', 'md_liakot_ali', 'mo_liakot_ali', 'admin', 'super_admin']);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('Hasan@1985', 10);
    const adminId = 'usr_admin_shophatbd';
    dbInstance.run(
      `INSERT INTO users (id, name, username, email, password_hash, phone, role_id, is_verified, password_changed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        'Shophatbd Admin',
        'Shophatbd',
        'liakot911@gmail.com',
        passwordHash,
        '01724709454',
        'super_admin',
        1,
        1
      ]
    );

    // Add demo customer
    const custHash = bcrypt.hashSync('12345678', 10);
    dbInstance.run(
      `INSERT OR IGNORE INTO users (id, name, username, email, password_hash, phone, role_id, is_verified, password_changed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'usr_customer_01',
        'রহিম আহমেদ (Rahim Ahmed)',
        'rahim_ahmed',
        'customer@shopnova.com',
        custHash,
        '+880 1811-987654',
        'customer',
        1,
        1
      ]
    );
  }

  // Ensure default categories exist without overwriting any user customizations
  for (const cat of seedCategories) {
    dbInstance.run(
      `INSERT OR IGNORE INTO categories (id, name_en, name_bn, slug, description_en, description_bn, image, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.name_en, cat.name_bn, cat.slug, cat.description_en, cat.description_bn, cat.image, cat.icon, cat.sort_order]
    );
  }

  for (const sub of seedSubcategories) {
    dbInstance.run(
      `INSERT OR IGNORE INTO subcategories (id, category_id, name_en, name_bn, slug, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sub.id, sub.category_id, sub.name_en, sub.name_bn, sub.slug, sub.image || null]
    );
  }

  // ONLY ON FIRST INITIALIZATION: Seed demo products, banners, and coupons
  if (!isStoreInitialized) {
    console.log('Performing first-time initial store seeding...');

    for (const prod of seedProducts) {
      dbInstance.run(
        `INSERT OR IGNORE INTO products (
          id, sku, name_en, name_bn, slug, short_description_en, short_description_bn,
          description_en, description_bn, category_id, subcategory_id, brand,
          regular_price, sale_price, discount_percentage, opening_stock, total_received, total_delivered, total_returned, stock_quantity, low_stock_threshold,
          thumbnail, weight, is_featured, is_bestseller, is_new_arrival, is_flash_sale,
          rating, review_count, tags, seo_title, seo_description, seo_keywords, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          prod.id, prod.sku, prod.name_en, prod.name_bn, prod.slug,
          prod.short_description_en, prod.short_description_bn,
          prod.description_en, prod.description_bn,
          prod.category_id, prod.subcategory_id || null, prod.brand,
          prod.regular_price, prod.sale_price || null, prod.discount_percentage || 0,
          prod.stock_quantity, prod.stock_quantity, prod.low_stock_threshold,
          prod.thumbnail, prod.weight, prod.is_featured, prod.is_bestseller,
          prod.is_new_arrival, prod.is_flash_sale,
          prod.rating, prod.review_count, prod.tags,
          prod.seo_title, prod.seo_description, prod.seo_keywords
        ]
      );

      // Add product images
      let imgIdx = 0;
      for (const imgUrl of prod.images) {
        dbInstance.run(
          `INSERT OR IGNORE INTO product_images (id, product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [`img_${prod.id}_${imgIdx}`, prod.id, imgUrl, imgIdx === 0 ? 1 : 0, imgIdx]
        );
        imgIdx++;
      }

      // Add product variants
      for (const v of prod.variants) {
        dbInstance.run(
          `INSERT OR IGNORE INTO product_variants (id, product_id, sku, size, color, color_code, price_adjustment, stock_quantity, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [v.id, prod.id, v.sku, v.size || null, v.color || null, v.color_code || null, v.price_adjustment || 0, v.stock_quantity, v.image || null]
        );
      }
    }

    for (const b of seedBanners) {
      dbInstance.run(
        `INSERT OR IGNORE INTO banners (id, title_en, title_bn, subtitle_en, subtitle_bn, image_url, button_text_en, button_text_bn, button_link, badge_en, badge_bn, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.title_en, b.title_bn, b.subtitle_en, b.subtitle_bn, b.image_url, b.button_text_en, b.button_text_bn, b.button_link, b.badge_en, b.badge_bn, b.sort_order, b.is_active]
      );
    }

    for (const c of seedCoupons) {
      dbInstance.run(
        `INSERT OR IGNORE INTO coupons (id, code, description_en, description_bn, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.code, c.description_en, c.description_bn, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.usage_limit, c.is_active]
      );
    }

    for (const s of seedShippingMethods) {
      dbInstance.run(
        `INSERT OR IGNORE INTO shipping_methods (id, name_en, name_bn, description_en, description_bn, cost, estimated_days, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.name_en, s.name_bn, s.description_en, s.description_bn, s.cost, s.estimated_days, s.is_active]
      );
    }

    // Mark store data as initialized so seed demo data is never repeated or overwritten
    dbInstance.run(
      `INSERT OR REPLACE INTO site_settings (id, key, value) VALUES ('st_store_data_initialized', 'store_data_initialized', '1')`
    );
  } else {
    console.log('Store data already initialized. All custom products, edits, categories, and settings are strictly preserved.');
    // Flag any initial demo products as is_demo = 1 if not set
    try {
      dbInstance.run(`UPDATE products SET is_demo = 1 WHERE id LIKE 'prod_men_%' OR id LIKE 'prod_w_%' OR id LIKE 'prod_k_%' OR id LIKE 'prod_wat_%' OR id LIKE 'prod_gad_%'`);
    } catch (_) {}
  }

  // Insert any missing site settings using INSERT OR IGNORE (NEVER overwrite existing custom settings)
  for (const st of seedSettings) {
    dbInstance.run(
      `INSERT OR IGNORE INTO site_settings (id, key, value) VALUES (?, ?, ?)`,
      [`st_${st.key}`, st.key, st.value]
    );
  }

    // Seed sample reviews
    dbInstance.run(
      `INSERT OR IGNORE INTO reviews (id, product_id, user_id, user_name, rating, comment, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'rev_01',
        'prod_men_panjabi_01',
        'usr_customer_01',
        'Tanvir Hasan',
        5,
        'পাঞ্জাবির কাপড় অত্যন্ত প্রিমিয়াম এবং কলার এমব্রয়ডারি চমৎকার! সাইজও একদম পারফেক্ট।',
        1,
        'approved'
      ]
    );

    dbInstance.run(
      `INSERT OR IGNORE INTO reviews (id, product_id, user_id, user_name, rating, comment, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'rev_02',
        'prod_wat_luxury_01',
        'usr_customer_01',
        'Mahmudul Karim',
        5,
        'Real sapphire crystal glass and authentic automatic movement. Delivery was fast inside Dhaka!',
        1,
        'approved'
      ]
    );

    // Seed initial demo order
    const orderId = 'ord_demo_1001';
    dbInstance.run(
      `INSERT OR IGNORE INTO orders (
        id, order_number, user_id, customer_name, customer_phone, customer_email,
        shipping_address, shipping_city, shipping_area, shipping_postal_code,
        subtotal, discount_amount, coupon_code, shipping_cost, grand_total,
        payment_method, payment_status, order_status, courier_name, tracking_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        'SN-2026-1001',
        'usr_customer_01',
        'রহিম আহমেদ (Rahim Ahmed)',
        '+880 1811-987654',
        'customer@shopnova.com',
        'House 12, Road 4, Sector 7, Uttara',
        'Dhaka',
        'Uttara',
        '1230',
        2790,
        279,
        'WELCOME10',
        60,
        2571,
        'bkash',
        'paid',
        'processing',
        'Pathao',
        'PTH-88492019'
      ]
    );

    dbInstance.run(
      `INSERT OR IGNORE INTO order_items (
        id, order_id, product_id, variant_id, product_name_en, product_name_bn,
        sku, size, color, quantity, unit_price, total_price, thumbnail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'item_ord_1001_1',
        orderId,
        'prod_men_panjabi_01',
        'var_pan01_l',
        'Royal Embroidered Silk Blend Panjabi',
        'রয়্যাল এমব্রয়ডারি সিল্ক ব্লেন্ড পাঞ্জাবি',
        'SN-PAN-01-L',
        '42 (L)',
        'Royal Blue',
        1,
        2790,
        2790,
        'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80'
      ]
    );

    // Log admin action
    dbInstance.run(
      `INSERT OR IGNORE INTO admin_logs (id, admin_id, admin_name, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['log_01', 'usr_admin_liakot', 'Md Liakot Ali', 'INIT_SYSTEM', 'database', 'all', 'System initial database schema and seed data loaded successfully']
    );

  // Ensure admin username and password are set to Shophatbd / Hasan@1985 only if not already customized
  const existingAdminUser = queryOne<{ id: string; password_changed: number }>(
    "SELECT id, password_changed FROM users WHERE username = 'Shophatbd' OR role_id IN ('admin', 'super_admin')"
  );
  if (existingAdminUser && existingAdminUser.password_changed !== 1) {
    const hasanPasswordHash = bcrypt.hashSync('Hasan@1985', 10);
    dbInstance.run(
      "UPDATE users SET username = 'Shophatbd', name = 'Shophatbd Admin', email = 'liakot911@gmail.com', password_hash = ?, password_changed = 1 WHERE id = ?",
      [hasanPasswordHash, existingAdminUser.id]
    );
  }
  dbInstance.run("UPDATE admin_logs SET admin_name = 'Shophatbd Admin' WHERE admin_name IN ('মোঃ লিয়াকত আলী', 'Md Liakot Ali')");

  // Ensure site branding defaults without overwriting user custom changes
  dbInstance.run("UPDATE site_settings SET value = 'SHOPHATBD' WHERE key = 'site_name' AND (value = 'SHOPNOVA' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'শপহাটবিডি' WHERE key = 'site_name_bn' AND (value = 'SHOPNOVA' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'SHOP SMART LIVE BETTER' WHERE key = 'site_tagline_en' AND (value = '' OR value IS NULL OR value LIKE '%SHOPNOVA%')");
  dbInstance.run("UPDATE site_settings SET value = 'স্মার্ট কেনাকাটা সুন্দর জীবন' WHERE key = 'site_tagline_bn' AND (value = '' OR value IS NULL OR value LIKE '%শপনোভা%')");
  dbInstance.run("UPDATE site_settings SET value = 'JOIN THE SHOPHATBD CLUB' WHERE key = 'footer_newsletter_title_en' AND (value LIKE '%SHOPNOVA%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'শপহাটবিডি ক্লাবে যুক্ত থাকুন' WHERE key = 'footer_newsletter_title_bn' AND (value LIKE '%SHOPNOVA%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'liakot911@gmail.com' WHERE key = 'contact_email' AND (value = 'support@shopnova.com' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'liakot911@gmail.com' WHERE key = 'admin_notification_email' AND (value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'Shophatbd Customer Care' WHERE key = 'smtp_from_name' AND (value = 'SHOPNOVA Customer Care' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = '01724709454' WHERE key = 'contact_phone' AND (value LIKE '%1700%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'https://wa.me/8801724709454' WHERE key = 'contact_whatsapp' AND (value LIKE '%1700%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = '01724709454' WHERE key = 'whatsapp_chat_number' AND (value LIKE '%1700%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'মহেশপুর, ঝিনাইদহ, বাংলাদেশ' WHERE key = 'company_address_bn' AND (value LIKE '%বনানী%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = 'Maheshpur, Jhenaidah, Bangladesh' WHERE key = 'company_address_en' AND (value LIKE '%Banani%' OR value = '' OR value IS NULL)");
  dbInstance.run("UPDATE site_settings SET value = '/logo.png' WHERE key = 'logo_url' AND (value IS NULL OR value = '' OR value LIKE '%shopnova%')");

  // Ensure payment gateways have user's personal bKash/Nagad number only if not set
  dbInstance.run("UPDATE payment_gateways SET account_number = '01724709454', account_type = 'Personal', instruction_bn = 'বিকাশ পার্সোনাল নম্বর ০১৭২৪৭০৯৪৫৪ এ সেন্ড মানি করুন।', instruction_en = 'Send money to bKash Personal Number 01724709454.' WHERE gateway_type = 'bkash' AND (account_number IS NULL OR account_number = '' OR account_number = 'N/A')");
  dbInstance.run("UPDATE payment_gateways SET account_number = '01724709454', account_type = 'Personal', instruction_bn = 'নগদ পার্সোনাল নম্বর ০১৭২৪৭০৯৪৫৪ এ সেন্ড মানি করুন।', instruction_en = 'Send money to Nagad Personal Number 01724709454.' WHERE gateway_type = 'nagad' AND (account_number IS NULL OR account_number = '' OR account_number = 'N/A')");

  // Ensure inventory columns exist in products table
  try { dbInstance.run("ALTER TABLE products ADD COLUMN opening_stock INTEGER DEFAULT 0"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_received INTEGER DEFAULT 0"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_delivered INTEGER DEFAULT 0"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE products ADD COLUMN total_returned INTEGER DEFAULT 0"); } catch (e) {}

  // Ensure reference columns exist in inventory_history table
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN reference_id TEXT"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN reference_type TEXT"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN supplier_name TEXT"); } catch (e) {}
  try { dbInstance.run("ALTER TABLE inventory_history ADD COLUMN challan_no TEXT"); } catch (e) {}

  // Ensure image column exists in product_variants
  try { dbInstance.run("ALTER TABLE product_variants ADD COLUMN image TEXT"); } catch (e) {}

  // Ensure default categories like Watch, Wallet, Trimmer, Laptop, Glass exist
  for (const cat of seedCategories) {
    try {
      dbInstance.run(
        `INSERT OR IGNORE INTO categories (id, name_en, name_bn, slug, description_en, description_bn, image, icon, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cat.id, cat.name_en, cat.name_bn, cat.slug, cat.description_en, cat.description_bn, cat.image, cat.icon, cat.sort_order]
      );
    } catch (e) {}
  }

  // Initialize opening_stock for any products where it's 0/null and has stock
  try {
    dbInstance.run(`
      UPDATE products
      SET opening_stock = stock_quantity
      WHERE (opening_stock IS NULL OR opening_stock = 0)
        AND (total_received = 0 OR total_received IS NULL)
        AND (total_delivered = 0 OR total_delivered IS NULL)
        AND stock_quantity > 0
    `);
  } catch (e) {}

  // Ensure payment_gateways table exists
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS payment_gateways (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      gateway_type TEXT NOT NULL,
      account_number TEXT,
      account_type TEXT DEFAULT 'Merchant',
      charge_percentage REAL DEFAULT 0,
      instruction_en TEXT,
      instruction_bn TEXT,
      logo_url TEXT,
      qr_code_url TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default payment gateways if none exist
  const existingGateways = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM payment_gateways');
  if (!existingGateways || existingGateways.count === 0) {
    const defaultGateways = [
      {
        id: 'gw_cod',
        name_en: 'Cash on Delivery (COD)',
        name_bn: 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)',
        gateway_type: 'cod',
        account_number: 'N/A',
        account_type: 'Cash on Doorstep',
        charge_percentage: 0,
        instruction_en: 'Pay in cash when your package is delivered to your doorstep.',
        instruction_bn: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে নগদ টাকা পরিশোধ করুন।',
        logo_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=200&q=80',
        sort_order: 1,
        is_active: 1
      },
      {
        id: 'gw_bkash',
        name_en: 'bKash Send Money / Payment',
        name_bn: 'বিকাশ পেমেন্ট / সেন্ড মানি',
        gateway_type: 'bkash',
        account_number: '01724709454',
        account_type: 'Personal',
        charge_percentage: 1.5,
        instruction_en: 'Send Money to bKash Personal Number: 01724709454. Enter Order ID in reference.',
        instruction_bn: 'বিকাশ পার্সোনাল নম্বর ০১৭২৪৭০৯৪৫৪ এ সেন্ড মানি করুন এবং রেফারেন্সে আপনার অর্ডার নম্বর দিন।',
        logo_url: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&w=200&q=80',
        sort_order: 2,
        is_active: 1
      },
      {
        id: 'gw_nagad',
        name_en: 'Nagad Send Money / Payment',
        name_bn: 'নগদ পেমেন্ট গেটওয়ে',
        gateway_type: 'nagad',
        account_number: '01724709454',
        account_type: 'Personal',
        charge_percentage: 1.2,
        instruction_en: 'Send Money to Nagad Personal Number: 01724709454.',
        instruction_bn: 'নগদ পার্সোনাল নম্বর ০১৭২৪৭০৯৪৫৪ এ সেন্ড মানি অথবা পেমেন্ট সম্পন্ন করুন।',
        logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
        sort_order: 3,
        is_active: 1
      },
      {
        id: 'gw_rocket',
        name_en: 'Rocket / DBBL Mobile Banking',
        name_bn: 'রকেট মোবাইল ব্যাংকিং',
        gateway_type: 'rocket',
        account_number: '01900-987654-7',
        account_type: 'Personal / Merchant',
        charge_percentage: 1.0,
        instruction_en: 'Send money to Rocket 12-digit account number 01900-987654-7.',
        instruction_bn: 'রকেট ১২ ডিজিট নম্বরে টাকা পাঠিয়ে ট্রানজাকশন আইডি সংরক্ষণ করুন।',
        logo_url: '',
        sort_order: 4,
        is_active: 1
      },
      {
        id: 'gw_bank',
        name_en: 'Direct Bank Transfer / Wire',
        name_bn: 'সরাসরি ব্যাংক ডিপোজিট / অনলাইন ট্রান্সফার',
        gateway_type: 'bank',
        account_number: 'Bank Asia A/C: 1043450098231',
        account_type: 'Current Account',
        charge_percentage: 0,
        instruction_en: 'Bank: Bank Asia Ltd | Branch: Banani, Dhaka | Account Name: SHOPNOVA Lifestyle Ltd | A/C: 1043450098231',
        instruction_bn: 'ব্যাংক এশিয়া লিমিটেড | বনানী শাখা | হিসাব নাম: শপনোভা লাইফস্টাইল | হিসাব নম্বর: ১০৪৩৪৫০০৯৮২৩১',
        logo_url: '',
        sort_order: 5,
        is_active: 1
      },
      {
        id: 'gw_card',
        name_en: 'Visa / Mastercard / SSLCommerz',
        name_bn: 'ক্রেডিট/ডেবিট কার্ড ও ইন্টারনেট ব্যাংকিং',
        gateway_type: 'card',
        account_number: 'SSLCommerz Merchant Terminal',
        account_type: 'Online Gateway',
        charge_percentage: 2.0,
        instruction_en: 'Secure payment via Visa, Mastercard, American Express, and UnionPay.',
        instruction_bn: 'ভিসা, মাস্টারকার্ড এবং অনলাইন ব্যাংকিংয়ের মাধ্যমে নিরাপদ পেমেন্ট।',
        logo_url: '',
        sort_order: 6,
        is_active: 1
      }
    ];

    defaultGateways.forEach((gw) => {
      dbInstance?.run(
        `INSERT OR IGNORE INTO payment_gateways (
          id, name_en, name_bn, gateway_type, account_number, account_type,
          charge_percentage, instruction_en, instruction_bn, logo_url, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gw.id, gw.name_en, gw.name_bn, gw.gateway_type, gw.account_number,
          gw.account_type, gw.charge_percentage, gw.instruction_en, gw.instruction_bn,
          gw.logo_url, gw.sort_order, gw.is_active
        ]
      );
    });
  }

  // Ensure store_policies_json and footer_service_links_json are cleanly synchronized
  try {
    const policiesRow = queryOne<{ value: string }>('SELECT value FROM site_settings WHERE key = "store_policies_json"');
    if (policiesRow && policiesRow.value) {
      const parsed = JSON.parse(policiesRow.value);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p: any) => p.id !== 'about' && p.id !== 'contact' && p.id !== 'privacy' && p.path !== 'about' && p.path !== 'contact' && p.path !== 'privacy');
        if (filtered.length !== parsed.length) {
          dbInstance.run('UPDATE site_settings SET value = ? WHERE key = "store_policies_json"', [JSON.stringify(filtered)]);
        }
      }
    }

    const footerRow = queryOne<{ value: string }>('SELECT value FROM site_settings WHERE key = "footer_service_links_json"');
    if (footerRow && footerRow.value) {
      const parsed = JSON.parse(footerRow.value);
      if (Array.isArray(parsed)) {
        const hasPrivacy = parsed.some((l: any) => l.page === 'privacy' || l.id === '3' || l.label === 'Privacy Policy');
        const updated = parsed.map((l: any) => {
          if (l.page === 'about' || l.id === '1' || l.label === 'About Us') {
            return {
              id: '1',
              label: 'About Us',
              label_bn: l.label_bn || 'আমাদের সম্পর্কে',
              page: 'about',
              is_active: l.is_active !== false,
              short_description: l.short_description || 'Discover the story, mission, and dedication to authentic quality driving SHOPNOVA across Bangladesh.',
              short_description_bn: l.short_description_bn || 'শপনোভা-এর মিশন, প্রিমিয়াম পণ্যের প্রতিশ্রুতি ও ৬৪ জেলায় দ্রুততম হোম ডেলিভারির গল্প।',
              description_bn: l.description_bn || `আমাদের গল্প ও অঙ্গীকার:
শপনোভা বাংলাদেশের একটি শীর্ষস্থানীয় আধুনিক ফ্যাশন ও স্মার্ট টেকনোলজি ই-কমার্স প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো দেশের প্রতিটি প্রান্তে মানুষের কাছে ১০০% অরিজিনাল, প্রিমিয়াম কোয়ালিটির লাইফস্টাইল পণ্য ও গ্যাজেট দ্রুততম সময়ে পৌঁছে দেওয়া।

আমরা বিশ্বাস করি শুধুমাত্র পণ্য বিক্রয় করাই আমাদের শেষ কথা নয়; বরং সততা, বিশ্বস্ত কোয়ালিটি এবং অতুলনীয় আন্তরিক গ্রাহক সেবার মাধ্যমে একটি দীর্ঘমেয়াদী পারিবারিক আস্থার সম্পর্ক গড়ে তোলাই আমাদের সার্থকতা। ৬৪ জেলার প্রতিটি গ্রাহকের মুখে সন্তুষ্টির হাসি ফোটানোই শপনোভা টিমের প্রতিটি সদস্যের নিরন্তর প্রচেষ্টা।`,
              description_en: l.description_en || `Our Story & Purpose:
We are a premier lifestyle and tech destination in Bangladesh, committed to curating 100% authentic apparel, modern accessories, and smart gadgets with seamless nationwide doorstep fulfillment.

Beyond commerce, our purpose is defined by uncompromising quality, honest pricing, and responsive customer care that builds enduring relationships with families across all 64 districts.`
            };
          }
          if (l.page === 'contact' || l.id === '2' || l.label === 'Contact & Support') {
            return {
              id: '2',
              label: 'Contact & Support',
              label_bn: l.label_bn || 'যোগাযোগ ও সাপোর্ট',
              page: 'contact',
              is_active: l.is_active !== false,
              short_description: l.short_description || 'Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.',
              short_description_bn: l.short_description_bn || 'অর্ডার, ডেলিভারি বা যেকোনো সহায়তার জন্য আমাদের ২৪/৭ ডেডিকেটেড কাস্টমার সাপোর্ট সর্বদা প্রস্তুত।',
              description_bn: l.description_bn || `কাস্টমার সাপোর্ট ও হেল্পলাইন:
যেকোনো অর্ডার সংক্রান্ত তথ্য, ডেলিভারি আপডেট বা যেকোনো সহযোগিতার জন্য আমাদের ডেডিকেটেড সাপোর্ট টিম সর্বদা প্রস্তুত রয়েছে।

যোগাযোগের মাধ্যমসমূহ:
১. হেল্পলাইন ও কাস্টমার কেয়ার: সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত সরাসরি কল করতে পারেন।
২. অফিসিয়াল হোয়াটসঅ্যাপ: দ্রুত উত্তর ও অর্ডার ট্র্যাকিংয়ের জন্য মেসেজ পাঠান।
৩. ইমেইল সাপোর্ট: ২৪ ঘণ্টার মধ্যে দ্রুত সমাধান পেতে অফিসিয়াল ঠিকানায় ইমেইল করুন।
৪. কেন্দ্রীয় অফিস: সরাসরি আলোচনার জন্য ঢাকার বনানীতে আমাদের অফিসে সাদর আমন্ত্রণ।`,
              description_en: l.description_en || `Customer Support & Helpline:
Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.

Ways to Connect With Us:
1. Hotline & Helpdesk: Call our helpline directly between 9:00 AM and 10:00 PM for instant voice assistance.
2. Official WhatsApp: Message our team on WhatsApp for quick inquiries, image sharing, and order confirmation.
3. Email Support: Send your detailed queries or feedback to our official email—we reply within 24 hours.
4. Corporate Office: You are always welcome to visit our central corporate office in Banani, Dhaka.`
            };
          }
          return l;
        });

        if (!hasPrivacy) {
          updated.push({
            id: '3',
            label: 'Privacy Policy',
            label_bn: 'গোপনীয়তা ও ডাটা পলিসি',
            page: 'privacy',
            is_active: true,
            short_description: 'We prioritize your personal data security and privacy through robust 256-bit encryption.',
            short_description_bn: 'আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা ও আধুনিক এনক্রিপশন প্রযুক্তিতে প্রতিশ্রুতিবদ্ধ।',
            description_bn: `১. ব্যক্তিগত তথ্যের সুরক্ষা:
আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা ও গোপনীয়তা রক্ষা করতে অঙ্গীকারবদ্ধ। আপনার নাম, মোবাইল নম্বর, ইমেইল এবং ডেলিভারি ঠিকানা শুধুমাত্র আপনার অর্ডার প্রসেসিং ও পার্সেল প্রেরণের উদ্দেশ্যে সংগ্রহ করা হয়।

২. পেমেন্ট ও আর্থিক তথ্যের শতভাগ নিরাপত্তা:
অনলাইন পেমেন্টের ক্ষেত্রে আমাদের প্ল্যাটফর্ম আন্তর্জাতিক মানসম্পন্ন ২৫৬-বিট SSL এনক্রিপশন প্রযুক্তি ব্যবহার করে। আপনার ক্রেডিট/ডেবিট কার্ড নাম্বার, CVV কিংবা বিকাশ-নগদ পিন কখনোই আমাদের নিজস্ব সার্ভারে সংরক্ষিত হয় না।

৩. তথ্য তৃতীয় পক্ষের সাথে শেয়ার না করার নীতি:
কুরিয়ার ডেলিভারি পার্টনার ছাড়া কোনো অননুমোদিত তৃতীয় পক্ষের কাছে আমরা কখনোই গ্রাহকের ব্যক্তিগত তথ্য বিক্রি, ভাড়া বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করি না।

৪. গ্রাহকের অধিকার ও তথ্য সংশোধন:
আপনার ব্যক্তিগত অ্যাকাউন্ট বা প্রোফাইল সংক্রান্ত যেকোনো তথ্য আপডেট, সংশোধন কিংবা স্থায়ীভাবে মুছে ফেলার অনুরোধের জন্য আমাদের ডেডিকেটেড সাপোর্ট টিমের সাথে যেকোনো সময় সরাসরি যোগাযোগ করতে পারেন।`,
            description_en: `1. Privacy Commitment & Personal Data Protection:
We are dedicated to safeguarding your personal data and respect your confidentiality. We collect essential information such as customer name, contact phone, delivery address, and email solely for order fulfillment and logistics tracking.

2. Financial & Payment Security:
Online payments are conducted through PCI-DSS compliant, 256-bit SSL encrypted gateways. We never store credit/debit card numbers, CVVs, or mobile banking PINs on our servers.

3. Zero Third-Party Data Selling:
Customer data is strictly never rented, sold, or disclosed to unauthorized third parties, except as required by designated logistics partners solely to complete doorstep delivery.

4. Customer Rights & Data Management:
You retain full rights to request verification, amendment, or removal of your personal information from our active databases by contacting our privacy support desk.`
          });
        }
        if (!hasPrivacy) {
          dbInstance.run('UPDATE site_settings SET value = ? WHERE key = "footer_service_links_json"', [JSON.stringify(updated)]);
        }
      }
    }
  } catch (err) {
    console.error('Failed to migrate footer policy links:', err);
  }

  saveDatabase();
  console.log('Database initialized and ready with live stock lifecycle tracking.');
}
