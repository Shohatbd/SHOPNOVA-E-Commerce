export type Language = 'en' | 'bn';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role_id: 'super_admin' | 'admin' | 'customer';
  avatar?: string;
  password_changed: number;
}

export interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  description_en?: string;
  description_bn?: string;
  image?: string;
  icon?: string;
  sort_order: number;
  is_active: number;
  subcategories?: Subcategory[];
  productCount?: number;
  totalStock?: number;
  stock_quantity?: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  image?: string;
  is_active: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  sku?: string;
  size?: string;
  color?: string;
  color_code?: string;
  price_adjustment?: number;
  stock_quantity: number;
  image?: string;
  is_active?: number;
}

export interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_bn: string;
  slug: string;
  short_description_en?: string;
  short_description_bn?: string;
  description_en?: string;
  description_bn?: string;
  category_id: string;
  subcategory_id?: string;
  brand: string;
  regular_price: number;
  sale_price?: number;
  discount_percentage?: number;
  opening_stock?: number;
  total_received?: number;
  total_delivered?: number;
  total_returned?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  thumbnail: string;
  images?: string[];
  variants?: ProductVariant[];
  video_url?: string;
  weight?: number;
  is_featured: number;
  is_bestseller: number;
  is_new_arrival: number;
  is_flash_sale: number;
  flash_sale_end?: string;
  is_published: number;
  rating: number;
  review_count: number;
  tags?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  is_demo?: number;
  category?: Category;
  subcategory?: Subcategory;
  category_name?: string;
}

export interface CartItem {
  product_id: string;
  variant_id?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name_en: string;
  product_name_bn: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  thumbnail: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card' | 'sslcommerz';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentGateway {
  id: string;
  name_en: string;
  name_bn: string;
  gateway_type: string;
  account_number: string;
  account_type: string;
  charge_percentage: number;
  instruction_en?: string;
  instruction_bn?: string;
  logo_url?: string;
  qr_code_url?: string;
  is_active: number;
  sort_order: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area?: string;
  shipping_postal_code?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_cost: number;
  tax_amount: number;
  grand_total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  courier_name?: string;
  tracking_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  payment?: any;
  shipment?: any;
}

export interface Coupon {
  id: string;
  code: string;
  description_en?: string;
  description_bn?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  is_active: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  is_verified_purchase: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product_name?: string;
  product_thumbnail?: string;
}

export interface Banner {
  id: string;
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  image_url: string;
  button_text_en?: string;
  button_text_bn?: string;
  button_link?: string;
  link_url?: string;
  position?: string;
  badge_en?: string;
  badge_bn?: string;
  sort_order: number;
  is_active: number;
}

export interface SocialMediaItem {
  id: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'whatsapp' | 'tiktok' | 'twitter' | 'linkedin' | 'telegram' | 'pinterest' | 'custom' | string;
  name: string;
  url: string;
  is_active?: boolean | number;
}

export interface PolicyLinkItem {
  id: string;
  title: string;
  title_bn: string;
  path: string;
  icon?: string;
  is_active?: boolean;
}

export interface WhyShopFeatureItem {
  id: string;
  title: string;
  title_bn?: string;
  subtitle: string;
  subtitle_bn?: string;
  icon?: string;
  is_active?: boolean;
}

export interface SiteSettings {
  // Logo & Branding
  logo_url?: string;
  logo_type?: 'image' | 'text' | 'both';
  logo_height?: string;
  favicon_url?: string;
  brand_symbol_url?: string;
  site_name: string;
  site_name_bn?: string;
  default_language?: 'bn' | 'en';
  site_tagline_en: string;
  site_tagline_bn: string;
  header_badge_text_en?: string;
  header_badge_text_bn?: string;

  // Header & Announcement
  site_bg_color?: string;
  announcement_enabled?: string;
  announcement_en: string;
  announcement_bn: string;
  announcement_bg_color?: string;
  announcement_text_color?: string;
  header_phone?: string;
  header_email?: string;
  header_menu_json?: string;
  header_bg_color?: string;
  header_text_color?: string;
  category_bar_bg?: string;
  category_bar_text_color?: string;
  category_btn_border_color?: string;
  category_btn_bg?: string;
  category_btn_text?: string;
  category_active_bg?: string;
  category_active_text?: string;
  category_active_border?: string;
  category_view_shape?: 'circle' | 'square' | 'rounded_square';

  // Flash Sale & Countdown Timer
  flash_sale_enabled?: string | boolean | number;
  flash_sale_end_time?: string;
  flash_sale_title_en?: string;
  flash_sale_title_bn?: string;
  flash_sale_sub_en?: string;
  flash_sale_sub_bn?: string;

  // Side Promo Banners (Daraz Style 2 mini banners beside carousel)
  side_banner_top_enabled?: string | boolean | number;
  side_banner_top_image?: string;
  side_banner_top_badge_en?: string;
  side_banner_top_badge_bn?: string;
  side_banner_top_title_en?: string;
  side_banner_top_title_bn?: string;
  side_banner_top_subtitle_en?: string;
  side_banner_top_subtitle_bn?: string;
  side_banner_top_button_en?: string;
  side_banner_top_button_bn?: string;
  side_banner_top_link?: string;

  side_banner_bottom_enabled?: string | boolean | number;
  side_banner_bottom_image?: string;
  side_banner_bottom_badge_en?: string;
  side_banner_bottom_badge_bn?: string;
  side_banner_bottom_title_en?: string;
  side_banner_bottom_title_bn?: string;
  side_banner_bottom_subtitle_en?: string;
  side_banner_bottom_subtitle_bn?: string;
  side_banner_bottom_button_en?: string;
  side_banner_bottom_button_bn?: string;
  side_banner_bottom_link?: string;

  // Why Shop With Store / Trust Features Banner (Homepage)
  why_shop_enabled?: string | boolean | number;
  why_shop_title_en?: string;
  why_shop_title_bn?: string;
  why_shop_subtitle_en?: string;
  why_shop_subtitle_bn?: string;
  why_shop_bg_color?: string;
  why_shop_title_color?: string;
  why_shop_subtitle_color?: string;
  why_shop_card_bg?: string;
  why_shop_card_border?: string;
  why_shop_card_title_color?: string;
  why_shop_card_desc_color?: string;
  why_shop_icon_bg?: string;
  why_shop_icon_color?: string;
  why_shop_features_json?: string;

  // Footer & Trust Badges
  footer_bg_color?: string;
  footer_text_color?: string;
  footer_bottom_bg?: string;
  footer_trust_badge_bg?: string;
  footer_trust_badge_card_bg?: string;
  footer_trust_badge_text_color?: string;
  footer_trust_badge_icon_bg?: string;
  footer_trust_badge_icon_color?: string;
  footer_trust_badge_border_color?: string;
  footer_about_en?: string;
  footer_about_bn?: string;
  footer_trust_badges_json?: string;
  footer_category_links_json?: string;
  footer_service_links_json?: string;
  footer_social_links_json?: string;
  store_policies_json?: string;
  footer_policies_title?: string;
  footer_policies_title_en?: string;
  footer_policies_title_bn?: string;
  footer_copyright_en?: string;
  footer_copyright_bn?: string;
  footer_newsletter_title?: string;
  footer_newsletter_title_en?: string;
  footer_newsletter_title_bn?: string;
  footer_newsletter_sub?: string;
  footer_newsletter_sub_en?: string;
  footer_newsletter_sub_bn?: string;
  footer_newsletter_btn_en?: string;
  footer_newsletter_btn_bn?: string;
  footer_newsletter_btn_bg?: string;
  footer_newsletter_btn_text_color?: string;
  footer_newsletter_placeholder_en?: string;
  footer_newsletter_placeholder_bn?: string;
  footer_newsletter_enabled?: string | boolean | number;

  // Google SEO & Ranking Settings
  google_index_enabled?: string | boolean | number;
  seo_robots_directive?: string;
  seo_meta_title?: string;
  seo_meta_title_bn?: string;
  seo_description?: string;
  seo_description_bn?: string;
  seo_keywords?: string;
  google_site_verification?: string;
  og_image_url?: string;
  canonical_base_url?: string;
  canonical_url?: string;
  sitemap_url?: string;
  auto_generate_sitemap?: string | boolean | number;

  // Payment Gateways Display Toggles
  payment_bkash_enabled?: string;
  payment_nagad_enabled?: string;
  payment_rocket_enabled?: string;
  payment_card_enabled?: string;
  payment_cod_enabled?: string;

  // Contact & Socials
  contact_phone: string;
  contact_email: string;
  contact_whatsapp?: string;
  company_address_en: string;
  company_address_bn: string;
  support_hours_en?: string;
  support_hours_bn?: string;
  support_response_time_en?: string;
  support_response_time_bn?: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url?: string;
  twitter_url?: string;

  // Shipping & Rates
  shipping_inside_dhaka?: string | number;
  shipping_outside_dhaka?: string | number;
  free_shipping_threshold: string;
  tax_rate_percentage?: string;

  // General & Integrations
  currency: string;
  currency_symbol: string;
  maintenance_mode?: string;

  // Google Analytics, GTM & Google Ads Conversion Tracking
  google_analytics_id?: string;
  gtm_container_id?: string;
  google_ads_conversion_id?: string;
  google_ads_purchase_label?: string;
  google_ads_add_to_cart_label?: string;
  google_ads_begin_checkout_label?: string;
  google_ads_lead_label?: string;
  google_enhanced_conversions_enabled?: string | boolean | number;

  // Meta Pixel & Conversions API (CAPI) Tracking
  meta_pixel_id?: string;
  meta_capi_enabled?: string | boolean | number;
  meta_access_token?: string;
  meta_test_event_code?: string;

  // TikTok Pixel
  tiktok_pixel_id?: string;

  // Custom Scripts & Floating Chat Widgets
  custom_header_code?: string;
  custom_footer_code?: string;
  whatsapp_chat_enabled?: string | boolean | number;
  whatsapp_chat_number?: string;
  whatsapp_chat_greeting?: string;
  messenger_chat_enabled?: string | boolean | number;
  messenger_page_username?: string;
  ai_chat_enabled?: string | boolean | number;
  ai_chat_btn_color?: string;

  [key: string]: any;
}

export interface ShippingMethod {
  id: string;
  name_en: string;
  name_bn: string;
  description_en?: string;
  description_bn?: string;
  cost: number;
  estimated_days: string;
  is_active: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface InventoryHistoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  change_type: 'opening' | 'received' | 'delivered' | 'returned' | 'order_cancelled' | 'manual_adjustment' | 'quick_edit' | string;
  quantity_changed: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  reference_type?: string;
  supplier_name?: string;
  challan_no?: string;
  reason?: string;
  created_by?: string;
  created_at: string;
  product_name?: string;
  product_name_bn?: string;
  product_sku?: string;
  product_thumbnail?: string;
}

export interface InventorySummary {
  total_opening_stock: number;
  total_received: number;
  total_delivered: number;
  total_returned: number;
  total_closing_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
}
