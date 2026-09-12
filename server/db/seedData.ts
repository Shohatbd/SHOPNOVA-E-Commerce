import bcrypt from 'bcryptjs';

export interface SeedCategory {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  description_en: string;
  description_bn: string;
  image: string;
  icon: string;
  sort_order: number;
}

export interface SeedSubcategory {
  id: string;
  category_id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  image?: string;
}

export interface SeedProduct {
  id: string;
  sku: string;
  name_en: string;
  name_bn: string;
  slug: string;
  short_description_en: string;
  short_description_bn: string;
  description_en: string;
  description_bn: string;
  category_id: string;
  subcategory_id?: string;
  brand: string;
  regular_price: number;
  sale_price?: number;
  discount_percentage?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  thumbnail: string;
  images: string[];
  variants: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    color_code?: string;
    price_adjustment?: number;
    stock_quantity: number;
    image?: string;
  }[];
  weight: number;
  is_featured: number;
  is_bestseller: number;
  is_new_arrival: number;
  is_flash_sale: number;
  rating: number;
  review_count: number;
  tags: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export const seedCategories: SeedCategory[] = [
  {
    id: 'cat_men',
    name_en: "Men's Clothing",
    name_bn: "পুরুষদের পোশাক",
    slug: "mens-clothing",
    description_en: "Premium men's shirts, panjabis, polos, t-shirts, jackets and trousers crafted for elegance.",
    description_bn: "প্রিমিয়াম শার্ট, পাঞ্জাবি, পোলো, টি-শার্ট ও ট্রাউজার্স কালেকশন।",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    icon: "Shirt",
    sort_order: 1
  },
  {
    id: 'cat_women',
    name_en: "Women's Clothing",
    name_bn: "নারীদের পোশাক",
    slug: "womens-clothing",
    description_en: "Exquisite sarees, kurtis, three-pieces, western wear and designer gowns.",
    description_bn: "আকর্ষণীয় শাড়ি, কুর্তি, থ্রি-পিস ও ট্রেন্ডি ওয়েস্টার্ন পোশাকের কালেকশন।",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    icon: "Sparkles",
    sort_order: 2
  },
  {
    id: 'cat_kids',
    name_en: "Kids' Items",
    name_bn: "বাচ্চাদের পণ্য ও পোশাক",
    slug: "kids-items",
    description_en: "Comfortable, safe, and colorful clothing, accessories, and toys for infants and kids.",
    description_bn: "শিশুদের আরামদায়ক ও রঙিন পোশাক, খেলনা এবং প্রয়োজনীয় সামগ্রী।",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
    icon: "Smile",
    sort_order: 3
  },
  {
    id: 'cat_watches',
    name_en: "Watches",
    name_bn: "ঘড়ি কালেকশন",
    slug: "watches",
    description_en: "Luxury chronographs, minimalist timepieces, automatic watches, and smart fitness bands.",
    description_bn: "লাক্সারি ক্রনোগ্রাফ, প্রিমিয়াম অটোমেটিক ঘড়ি এবং স্মার্ট ফিটনেস ওয়াচ।",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    icon: "Watch",
    sort_order: 4
  },
  {
    id: 'cat_gadgets',
    name_en: "Gadget Items",
    name_bn: "গ্যাজেট ও ইলেকট্রনিক্স",
    slug: "gadgets",
    description_en: "Latest wireless earbuds, power banks, smart chargers, gaming gear, and tech accessories.",
    description_bn: "লেটেস্ট ওয়্যারলেস ইয়ারবাডস, পাওয়ার ব্যাংক, ফাস্ট চার্জার ও আধুনিক স্মার্ট ডিভাইস।",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    icon: "Headphones",
    sort_order: 5
  }
];

export const seedSubcategories: SeedSubcategory[] = [
  // 1. Men's Clothing (2 subcategories)
  {
    id: 'sub_m_panjabi',
    category_id: 'cat_men',
    name_en: 'Panjabi & Ethnic Wear',
    name_bn: 'পাঞ্জাবি ও এথনিক ওয়্যার',
    slug: 'panjabi-ethnic',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub_m_shirts',
    category_id: 'cat_men',
    name_en: 'Shirts & T-Shirts',
    name_bn: 'শার্ট ও টি-শার্ট',
    slug: 'shirts-tshirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },

  // 2. Women's Clothing (2 subcategories)
  {
    id: 'sub_w_saree',
    category_id: 'cat_women',
    name_en: 'Sarees & Traditional Wear',
    name_bn: 'শাড়ি ও ট্র্যাডিশনাল পোশাক',
    slug: 'sarees-traditional',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub_w_salwar',
    category_id: 'cat_women',
    name_en: 'Salwar Kameez & Kurtis',
    name_bn: 'সালওয়ার কামিজ ও কুর্তি',
    slug: 'salwar-kameez-kurtis',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  },

  // 3. Kids' Items (2 subcategories)
  {
    id: 'sub_k_boys',
    category_id: 'cat_kids',
    name_en: "Boys' Clothing & Sets",
    name_bn: 'ছেলে শিশুদের পোশাক',
    slug: 'boys-clothing',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub_k_girls',
    category_id: 'cat_kids',
    name_en: "Girls' Dresses & Frocks",
    name_bn: 'মেয়ে শিশুদের জামা ও ফ্রক',
    slug: 'girls-dresses',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
  },

  // 4. Watches (2 subcategories)
  {
    id: 'sub_w_smart',
    category_id: 'cat_watches',
    name_en: 'Smart Watches',
    name_bn: 'স্মার্ট ওয়াচ',
    slug: 'smart-watches',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub_w_luxury',
    category_id: 'cat_watches',
    name_en: 'Classic Analog Watches',
    name_bn: 'ক্লাসিক ও লাক্সারি অ্যানালগ ঘড়ি',
    slug: 'analog-watches',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
  },

  // 5. Gadget Items (2 subcategories)
  {
    id: 'sub_g_audio',
    category_id: 'cat_gadgets',
    name_en: 'Wireless Earbuds & Headphones',
    name_bn: 'ওয়্যারলেস এয়ারবাডস ও হেডফোন',
    slug: 'earbuds-headphones',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub_g_power',
    category_id: 'cat_gadgets',
    name_en: 'Power Banks & Fast Chargers',
    name_bn: 'পাওয়ার ব্যাংক ও ফাস্ট চার্জার',
    slug: 'power-banks-chargers',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
  }
];

export const seedProducts: SeedProduct[] = [
  // 1. Men's Clothing - Panjabi & Ethnic Wear (sub_m_panjabi)
  {
    id: 'prod_men_panjabi_01',
    sku: 'SN-MEN-PAN-01',
    name_en: 'Royal Embroidered Silk Blend Panjabi',
    name_bn: 'রয়্যাল এমব্রয়ডারি সিল্ক ব্লেন্ড পাঞ্জাবি',
    slug: 'royal-embroidered-silk-blend-panjabi',
    short_description_en: 'Festive silk-cotton blend panjabi with intricate collar & placket embroidery.',
    short_description_bn: 'উৎসব ও আয়োজনের জন্য নিখুঁত এমব্রয়ডারি কলার ও বাটনযুক্ত প্রিমিয়াম সিল্ক ব্লেন্ড পাঞ্জাবি।',
    description_en: 'Tailored from a breathable silk and cotton jacquard fabric, this royal panjabi features delicate thread work along the mandarin collar and front placket. Perfectly paired with pajama or denim for Eid and festive occasions.',
    description_bn: 'ঈদ ও বিশেষ অনুষ্ঠানের জন্য আধুনিক কাট ও ট্র্যাডিশনাল লুকের এক্সক্লুসিভ পাঞ্জাবি। উন্নত মানের ফেব্রিক ও নিখুঁত সেলাই।',
    category_id: 'cat_men',
    subcategory_id: 'sub_m_panjabi',
    brand: 'SHOPNOVA Ethnic',
    regular_price: 3200,
    sale_price: 2490,
    discount_percentage: 22,
    stock_quantity: 60,
    low_stock_threshold: 8,
    thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_pan01_m', sku: 'SN-PAN-01-M', size: '40 (M)', color: 'Off-White & Gold', color_code: '#fef3c7', stock_quantity: 15 },
      { id: 'var_pan01_l', sku: 'SN-PAN-01-L', size: '42 (L)', color: 'Off-White & Gold', color_code: '#fef3c7', stock_quantity: 20 },
      { id: 'var_pan01_xl', sku: 'SN-PAN-01-XL', size: '44 (XL)', color: 'Off-White & Gold', color_code: '#fef3c7', stock_quantity: 15 },
      { id: 'var_pan01_xxl', sku: 'SN-PAN-01-XXL', size: '46 (XXL)', color: 'Off-White & Gold', color_code: '#fef3c7', stock_quantity: 10 }
    ],
    weight: 0.35,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 4.9,
    review_count: 54,
    tags: 'panjabi, ethnic wear, men, eid, festive, traditional',
    seo_title: 'Royal Embroidered Silk Blend Panjabi | SHOPNOVA',
    seo_description: 'Buy premium embroidered festive panjabi for men online in Bangladesh.',
    seo_keywords: 'panjabi bd, eid panjabi, mens ethnic wear'
  },

  // 2. Men's Clothing - Shirts & T-Shirts (sub_m_shirts)
  {
    id: 'prod_men_shirt_01',
    sku: 'SN-MEN-SHIRT-01',
    name_en: 'Premium 100% Combed Cotton Casual Shirt',
    name_bn: 'প্রিমিয়াম ১০০% কম্বড কটন ক্যাজুয়াল শার্ট',
    slug: 'premium-combed-cotton-casual-shirt',
    short_description_en: 'Breathable, wrinkle-resistant 100% long-staple cotton casual button-down shirt.',
    short_description_bn: '১০০% সুতি আরামদায়ক ফেব্রিকের স্মার্ট ক্যাজুয়াল ও ফরমাল শার্ট।',
    description_en: 'A modern regular-fit shirt made of premium combed cotton. Perfect for office, university, or evening outings with neat spread collar, curved hem, and durable mother-of-pearl finish buttons.',
    description_bn: 'অফিস কিংবা আউটিংয়ে পরার জন্য আরামদায়ক ও নিখুঁত ফিটিংয়ের সুতি শার্ট। সহজে ভাঁজ পড়ে না এবং কালার ১০০% পাকা।',
    category_id: 'cat_men',
    subcategory_id: 'sub_m_shirts',
    brand: 'SHOPNOVA Casuals',
    regular_price: 1650,
    sale_price: 1250,
    discount_percentage: 24,
    stock_quantity: 80,
    low_stock_threshold: 10,
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_sh01_m', sku: 'SN-SH01-M', size: 'M (15.5")', color: 'Sky Blue', color_code: '#0284c7', stock_quantity: 20 },
      { id: 'var_sh01_l', sku: 'SN-SH01-L', size: 'L (16")', color: 'Sky Blue', color_code: '#0284c7', stock_quantity: 25 },
      { id: 'var_sh01_xl', sku: 'SN-SH01-XL', size: 'XL (16.5")', color: 'Sky Blue', color_code: '#0284c7', stock_quantity: 20 },
      { id: 'var_sh01_xxl', sku: 'SN-SH01-XXL', size: 'XXL (17")', color: 'Sky Blue', color_code: '#0284c7', stock_quantity: 15 }
    ],
    weight: 0.25,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 0,
    rating: 4.8,
    review_count: 38,
    tags: 'shirt, casual shirt, formal shirt, cotton shirt, men',
    seo_title: 'Premium Combed Cotton Casual Shirt | SHOPNOVA',
    seo_description: 'Buy stylish 100% cotton casual and formal shirts for men in Bangladesh.',
    seo_keywords: 'mens shirt bd, cotton shirt, casual shirts'
  },

  // 3. Women's Clothing - Sarees & Traditional Wear (sub_w_saree)
  {
    id: 'prod_w_saree_01',
    sku: 'SN-WOM-SAR-01',
    name_en: 'Pure Muslin Silk Handwoven Jamdani Saree',
    name_bn: 'পিওর মসলিন সিল্ক ঐতিহ্যবাহী জামদানি শাড়ি',
    slug: 'pure-muslin-silk-handwoven-jamdani-saree',
    short_description_en: 'Authentic 84-count handwoven muslin silk with gold zari floral motifs and contrast pallu.',
    short_description_bn: 'খাঁটি ৮৪-কাউন্ট হস্তশিল্প মসলিন সিল্ক জামদানি শাড়ি ও জমকালো জরি আঁচল।',
    description_en: 'Woven by master artisans in Narayanganj, this lightweight pure muslin silk jamdani features opulent floral zari motifs that drape like a dream. Includes matching unstitched blouse piece.',
    description_bn: 'ঐতিহ্যবাহী কারিগরদের হাতে বোনা হালকা ও আরামদায়ক পিওর মসলিন সিল্ক জামদানি শাড়ি। সাথে পাচ্ছেন ম্যাচিং ব্লাউজ পিস।',
    category_id: 'cat_women',
    subcategory_id: 'sub_w_saree',
    brand: 'SHOPNOVA Weaves',
    regular_price: 8900,
    sale_price: 6990,
    discount_percentage: 21,
    stock_quantity: 25,
    low_stock_threshold: 4,
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_w01_free', sku: 'SN-WOM-SAR-01-FREE', size: 'Standard (6.5 Yards)', color: 'Crimson Red & Gold', color_code: '#991b1b', stock_quantity: 25 }
    ],
    weight: 0.5,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 0,
    rating: 5.0,
    review_count: 42,
    tags: 'saree, jamdani, muslin, silk, traditional, women',
    seo_title: 'Pure Muslin Silk Jamdani Saree | SHOPNOVA',
    seo_description: 'Handcrafted Jamdani Muslin Saree with pure zari artwork in Bangladesh.',
    seo_keywords: 'jamdani saree bd, muslin saree, bridal saree'
  },

  // 4. Women's Clothing - Salwar Kameez & Kurtis (sub_w_salwar)
  {
    id: 'prod_w_salwar_01',
    sku: 'SN-WOM-SAL-01',
    name_en: 'Designer Embroidered Three-Piece Salwar Kameez',
    name_bn: 'ডিজাইনার এমব্রয়ডারি থ্রি-পিস সালওয়ার কামিজ',
    slug: 'designer-embroidered-salwar-kameez',
    short_description_en: '3-Piece festive suit featuring silk chanderi kurta, matching trousers, and digital organza dupatta.',
    short_description_bn: '৩-পিস এক্সক্লুসিভ চান্দেরি সিল্ক কুর্তি, ট্রাউজার্স ও ডিজিটাল প্রিন্ট অরগাঞ্জা ওড়না।',
    description_en: 'Exquisite 3-piece designer set detailed with intricate pearl and cut-dana handwork around the neckline. Finished with a scalloped organza dupatta for an ethereal festive silhouette.',
    description_bn: 'উৎসব ও পার্টিতে পরার জন্য নজরকাড়া পান্না সবুজ চান্দেরি কুর্তি থ্রি-পিস সেট। নরম ও আরামদায়ক ফেব্রিক।',
    category_id: 'cat_women',
    subcategory_id: 'sub_w_salwar',
    brand: 'SHOPNOVA Couture',
    regular_price: 5200,
    sale_price: 4150,
    discount_percentage: 20,
    stock_quantity: 35,
    low_stock_threshold: 6,
    thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_w02_m', sku: 'SN-WOM-SAL-01-M', size: '38 (M)', color: 'Emerald Green', color_code: '#047857', stock_quantity: 12 },
      { id: 'var_w02_l', sku: 'SN-WOM-SAL-01-L', size: '40 (L)', color: 'Emerald Green', color_code: '#047857', stock_quantity: 15 },
      { id: 'var_w02_xl', sku: 'SN-WOM-SAL-01-XL', size: '42 (XL)', color: 'Emerald Green', color_code: '#047857', stock_quantity: 8 }
    ],
    weight: 0.6,
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 4.9,
    review_count: 27,
    tags: 'salwar kameez, kurti, three-piece, partywear, women',
    seo_title: 'Designer Three-Piece Salwar Kameez | SHOPNOVA',
    seo_description: 'Buy designer 3-piece salwar kameez with organza dupatta in Bangladesh.',
    seo_keywords: 'salwar kameez bd, partywear women, three piece'
  },

  // 5. Kids' Items - Boys' Clothing & Sets (sub_k_boys)
  {
    id: 'prod_k_boys_01',
    sku: 'SN-KID-BOY-01',
    name_en: "Boys' 2-Piece Cotton Shirt & Shorts Outfit Set",
    name_bn: 'ছেলে শিশুদের ২-পিস সুতি শার্ট ও প্যান্ট সেট',
    slug: 'boys-cotton-shirt-shorts-set',
    short_description_en: 'Ultra-soft, skin-friendly 100% organic cotton printed casual outfit set for boys.',
    short_description_bn: '১০০% কোমল ও নিরাপদ অর্গানিক কটনের আকর্ষণীয় শার্ট ও শর্টস সেট।',
    description_en: 'Designed with maximum child comfort in mind. Features nickel-free buttons, elasticated soft cotton waistband, and non-toxic hypoallergenic plant dyes.',
    description_bn: 'শিশুদের কোমল ত্বকের কথা মাথায় রেখে তৈরি আরামদায়ক ও ট্রেন্ডি ক্যাজুয়াল পোশাক।',
    category_id: 'cat_kids',
    subcategory_id: 'sub_k_boys',
    brand: 'SHOPNOVA Kids',
    regular_price: 1650,
    sale_price: 1290,
    discount_percentage: 22,
    stock_quantity: 50,
    low_stock_threshold: 10,
    thumbnail: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_k01_2y', sku: 'SN-KID-BOY-2Y', size: '2-3 Years', color: 'Mustard Yellow', color_code: '#ca8a04', stock_quantity: 15 },
      { id: 'var_k01_4y', sku: 'SN-KID-BOY-4Y', size: '4-5 Years', color: 'Mustard Yellow', color_code: '#ca8a04', stock_quantity: 20 },
      { id: 'var_k01_6y', sku: 'SN-KID-BOY-6Y', size: '6-7 Years', color: 'Mustard Yellow', color_code: '#ca8a04', stock_quantity: 15 }
    ],
    weight: 0.25,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 0,
    rating: 4.9,
    review_count: 31,
    tags: 'kids, boys, clothing set, cotton, summer',
    seo_title: 'Organic Cotton Boys Shirt & Shorts Set | SHOPNOVA',
    seo_description: 'Comfortable summer cotton clothing sets for boys in Bangladesh.',
    seo_keywords: 'kids clothing bd, boys clothing set, baby outfit'
  },

  // 6. Kids' Items - Girls' Dresses & Frocks (sub_k_girls)
  {
    id: 'prod_k_girls_01',
    sku: 'SN-KID-GIRL-01',
    name_en: "Girls' Floral Party Frock & Princess Dress",
    name_bn: 'মেয়ে শিশুদের ফ্লোরাল পার্টি ফ্রক ও প্রিন্সেস ড্রেস',
    slug: 'girls-floral-party-frock-princess-dress',
    short_description_en: 'Multi-layer soft tulle frock with floral bodice and breathable cotton lining.',
    short_description_bn: 'নরম টিউল ফেব্রিক ও শতভাগ সুতি লাইনিংযুক্ত রাজকীয় পার্টি ফ্রক।',
    description_en: 'Make your little princess shine at birthdays and weddings with this dreamy pastel frock, crafted with non-itchy cotton inner lining and delicate hand-stitched petals.',
    description_bn: 'জন্মদিন ও পার্টিতে পরার জন্য নজরকাড়া ও পরতে আরামদায়ক পার্টি ড্রেস।',
    category_id: 'cat_kids',
    subcategory_id: 'sub_k_girls',
    brand: 'SHOPNOVA Kids',
    regular_price: 2450,
    sale_price: 1950,
    discount_percentage: 20,
    stock_quantity: 40,
    low_stock_threshold: 8,
    thumbnail: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_k02_3y', sku: 'SN-KID-GIRL-3Y', size: '3-4 Years', color: 'Blush Pink', color_code: '#f43f5e', stock_quantity: 15 },
      { id: 'var_k02_5y', sku: 'SN-KID-GIRL-5Y', size: '5-6 Years', color: 'Blush Pink', color_code: '#f43f5e', stock_quantity: 15 },
      { id: 'var_k02_7y', sku: 'SN-KID-GIRL-7Y', size: '7-8 Years', color: 'Blush Pink', color_code: '#f43f5e', stock_quantity: 10 }
    ],
    weight: 0.3,
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 4.8,
    review_count: 18,
    tags: 'kids, frock, dress, girls, party, princess',
    seo_title: 'Girls Floral Party Frock | SHOPNOVA',
    seo_description: 'Princess party wear frocks for girls with pure cotton lining in Bangladesh.',
    seo_keywords: 'girls frock bd, baby dress, birthday dress'
  },

  // 7. Watches - Smart Watches (sub_w_smart)
  {
    id: 'prod_wat_smart_01',
    sku: 'SN-WAT-SMART-01',
    name_en: 'Aegis Pro AMOLED Curved Bluetooth Calling Smartwatch',
    name_bn: 'ইজিস প্রো বাঁকানো অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ',
    slug: 'aegis-pro-amoled-bluetooth-calling-smartwatch',
    short_description_en: '1.96-inch 3D curved AMOLED display with Always-On screen, 100+ sport modes, and 12-day battery.',
    short_description_bn: '১.৯৬ ইঞ্চি থ্রিডি বাঁকানো অ্যামোলেড ডিসপ্লে, ব্লুটুথ কলিং এবং ১২ দিনের লং ব্যাটারি লাইফ।',
    description_en: 'Stay seamlessly connected on the go. Equipped with precision dual-core chip for lag-free HD voice calls, SpO2 & 24/7 heart rate monitoring, and IP68 waterproof rating.',
    description_bn: 'হাই-ডেফিনিশন ভয়েস কলিং ও হেলথ মনিটরিং সমৃদ্ধ আধুনিক ও ট্রেন্ডি স্মার্টওয়াচ।',
    category_id: 'cat_watches',
    subcategory_id: 'sub_w_smart',
    brand: 'SHOPNOVA Tech',
    regular_price: 4990,
    sale_price: 3690,
    discount_percentage: 26,
    stock_quantity: 55,
    low_stock_threshold: 10,
    thumbnail: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_wat02_blk', sku: 'SN-WAT-SMART-BLK', size: 'One Size (45mm)', color: 'Obsidian Black', color_code: '#18181b', stock_quantity: 30 },
      { id: 'var_wat02_org', sku: 'SN-WAT-SMART-ORG', size: 'One Size (45mm)', color: 'Sunset Orange', color_code: '#ea580c', stock_quantity: 25 }
    ],
    weight: 0.12,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 4.8,
    review_count: 64,
    tags: 'smartwatch, amoled, bluetooth call, fitness, watch',
    seo_title: 'Aegis Pro AMOLED Calling Smartwatch | SHOPNOVA',
    seo_description: 'Best Bluetooth Calling AMOLED Smartwatch price in Bangladesh.',
    seo_keywords: 'smartwatch bd, calling watch, amoled fitness tracker'
  },

  // 8. Watches - Classic Analog Watches (sub_w_luxury)
  {
    id: 'prod_wat_luxury_01',
    sku: 'SN-WAT-LUX-01',
    name_en: "Nova Chrono Sapphire Stainless Steel Automatic Watch",
    name_bn: 'নোভা ক্রনো স্যাফায়ার স্টেইনলেস স্টিল অটোমেটিক ঘড়ি',
    slug: 'nova-chrono-sapphire-stainless-steel-automatic-watch',
    short_description_en: 'Self-winding mechanical automatic movement, sapphire crystal glass, 50m water resistance.',
    short_description_bn: 'সেলফ-ওয়াইন্ডিং মেকানিক্যাল অটোমেটিক মুভমেন্ট, স্যাফায়ার ক্রিস্টাল গ্লাস ও ওয়াটারপ্রুফ।',
    description_en: 'Engineered for discerning horology enthusiasts. Featuring an exhibition case-back displaying the 24-jewel automatic movement, 316L surgical-grade stainless steel bracelet, and scratch-proof sapphire crystal.',
    description_bn: 'প্রিমিয়াম স্যাফায়ার গ্লাস ও মেকানিক্যাল অটোমেটিক মুভমেন্ট সমৃদ্ধ অভিজাত ক্লাসিক ওয়াচ।',
    category_id: 'cat_watches',
    subcategory_id: 'sub_w_luxury',
    brand: 'NOVATRON',
    regular_price: 12500,
    sale_price: 9800,
    discount_percentage: 21,
    stock_quantity: 25,
    low_stock_threshold: 5,
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_wat01_blk', sku: 'SN-WAT-LUX-BLK', size: '42mm Dial', color: 'Midnight Black', color_code: '#0f172a', stock_quantity: 15 },
      { id: 'var_wat01_sil', sku: 'SN-WAT-LUX-SIL', size: '42mm Dial', color: 'Silver Chrome', color_code: '#cbd5e1', price_adjustment: 200, stock_quantity: 10 }
    ],
    weight: 0.18,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 5.0,
    review_count: 56,
    tags: 'watch, chronograph, automatic, sapphire, luxury, analog',
    seo_title: 'Nova Chrono Sapphire Automatic Watch | SHOPNOVA',
    seo_description: 'Luxury automatic mechanical watch in Bangladesh with sapphire crystal glass.',
    seo_keywords: 'automatic watch bd, luxury watch, chronograph'
  },

  // 9. Gadget Items - Wireless Earbuds & Headphones (sub_g_audio)
  {
    id: 'prod_gad_audio_01',
    sku: 'SN-GAD-TWS-01',
    name_en: 'SonicPod ANC Hybrid Active Noise Cancelling Earbuds',
    name_bn: 'সনিকপড এএনসি হাইব্রিড অ্যাক্টিভ নয়েজ ক্যানসেলিং ইয়ারবাডস',
    slug: 'sonicpod-anc-hybrid-noise-cancelling-earbuds',
    short_description_en: '42dB Hybrid ANC, 13mm Beryllium drivers, 4-Mic ENC calling, 40 hours total playtime.',
    short_description_bn: '৪২ ডেসিবেল হাইব্রিড এএনসি, ১৩মিমি ড্রাইভার্স, চার মাইক ইএনসি কলিং এবং ৪০ ঘণ্টার প্লেটাইম।',
    description_en: 'Immerse yourself in concert-hall sound quality. Advanced hybrid noise cancellation silences city background noise, while transparency mode lets you hear your surroundings with a single tap.',
    description_bn: 'অসাধারণ সাউন্ড কোয়ালিটি ও স্পষ্ট ক্রিস্টাল ক্লিয়ার কথা বলার জন্য সেরা এএনসি ইয়ারবাডস।',
    category_id: 'cat_gadgets',
    subcategory_id: 'sub_g_audio',
    brand: 'SonicAudio',
    regular_price: 3890,
    sale_price: 2950,
    discount_percentage: 24,
    stock_quantity: 70,
    low_stock_threshold: 12,
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_gad01_wht', sku: 'SN-GAD-01-WHT', size: 'Standard', color: 'Pearl White', color_code: '#f8fafc', stock_quantity: 40 },
      { id: 'var_gad01_blk', sku: 'SN-GAD-01-BLK', size: 'Standard', color: 'Matte Black', color_code: '#27272a', stock_quantity: 30 }
    ],
    weight: 0.1,
    is_featured: 1,
    is_bestseller: 1,
    is_new_arrival: 1,
    is_flash_sale: 1,
    rating: 4.9,
    review_count: 88,
    tags: 'earbuds, tws, anc, wireless, audio, headphones, gadgets',
    seo_title: 'SonicPod ANC Wireless Earbuds | SHOPNOVA',
    seo_description: 'Best Active Noise Cancelling TWS Earbuds price in BD.',
    seo_keywords: 'tws earbuds bd, anc wireless earphones, bluetooth buds'
  },

  // 10. Gadget Items - Power Banks & Fast Chargers (sub_g_power)
  {
    id: 'prod_gad_power_01',
    sku: 'SN-GAD-POW-01',
    name_en: 'VoltMax 20000mAh 65W PD Fast Charging Power Bank',
    name_bn: 'ভোল্টম্যাক্স ২০০০০ এমএএইচ ৬৫ ওয়াট পিডি ফাস্ট চার্জিং পাওয়ার ব্যাংক',
    slug: 'voltmax-20000mah-65w-pd-fast-charging-power-bank',
    short_description_en: 'Powers MacBooks, laptops & smartphones. Dual Type-C & USB-A fast output with digital display.',
    short_description_bn: 'ল্যাপটপ ও স্মার্টফোন চার্জ করার উপযোগী ৬৫ ওয়াট আল্ট্রা-ফাস্ট পিডি পাওয়ার ব্যাংক।',
    description_en: 'Never run out of power while traveling. With blazing 65W Power Delivery, fast charge your laptops, iPads, or smartphones with multi-layer smart temperature protection and LED display.',
    description_bn: 'স্মার্ট এলইডি ডিসপ্লে ও মাল্টিপল পোর্টসহ প্রিমিয়াম হাই-ক্যাপাসিটি পাওয়ার ব্যাংক।',
    category_id: 'cat_gadgets',
    subcategory_id: 'sub_g_power',
    brand: 'VoltMax',
    regular_price: 4500,
    sale_price: 3490,
    discount_percentage: 22,
    stock_quantity: 45,
    low_stock_threshold: 8,
    thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'var_gad02_gry', sku: 'SN-GAD-02-GRY', size: '20,000mAh', color: 'Space Grey', color_code: '#4b5563', stock_quantity: 45 }
    ],
    weight: 0.42,
    is_featured: 1,
    is_bestseller: 0,
    is_new_arrival: 1,
    is_flash_sale: 0,
    rating: 4.8,
    review_count: 45,
    tags: 'powerbank, 65w, pd, laptop charger, battery, gadgets',
    seo_title: 'VoltMax 65W PD 20000mAh Power Bank | SHOPNOVA',
    seo_description: 'Fast charge laptops and mobiles with VoltMax 65W Power Bank in BD.',
    seo_keywords: 'power bank bd, 65w laptop powerbank, fast charger'
  }
];

export const seedBanners = [
  {
    id: 'ban_01',
    title_en: 'Mega Festive & Eid Collection',
    title_bn: 'মেগা উৎসব ও ঈদ ধামাকা কালেকশন',
    subtitle_en: 'Up to 30% OFF on Designer Men, Women & Kids Wear',
    subtitle_bn: 'ডিজাইনার পাঞ্জাবি, শাড়ি ও শিশুদের পোশাকে ৩০% পর্যন্ত আকর্ষণীয় ছাড়',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    button_text_en: 'Explore Collection',
    button_text_bn: 'কালেকশন দেখুন',
    button_link: '/shop',
    badge_en: 'Exclusive Offer',
    badge_bn: 'বিশেষ অফার',
    sort_order: 1,
    is_active: 1
  },
  {
    id: 'ban_02',
    title_en: 'Next-Gen Audio & Smart Gadgets',
    title_bn: 'আধুনিক অডিও ও ট্রেন্ডি স্মার্ট গ্যাজেট',
    subtitle_en: 'Immersive ANC Earbuds, 65W Power Banks & AMOLED Smartwatches',
    subtitle_bn: 'হায়ার-রেজোলিউশন এএনসি বাডস ও প্রিমিয়াম স্মার্টওয়াচ কালেকশন',
    image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&q=80',
    button_text_en: 'Shop Gadgets',
    button_text_bn: 'গ্যাজেট কিনুন',
    button_link: '/shop/gadgets',
    badge_en: 'New Tech',
    badge_bn: 'নতুন প্রযুক্তি',
    sort_order: 2,
    is_active: 1
  }
];

export const seedCoupons = [
  {
    id: 'coup_01',
    code: 'WELCOME10',
    description_en: 'Get 10% instant discount on your first order over ৳1,000.',
    description_bn: '১০০০ টাকার বেশি প্রথম অর্ডারে পাবেন ১০% তাৎক্ষণিক ছাড়।',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1000,
    max_discount_amount: 500,
    usage_limit: 500,
    is_active: 1
  },
  {
    id: 'coup_02',
    code: 'NOVA20',
    description_en: 'Special 20% discount on orders above ৳2,000.',
    description_bn: '২০০০ টাকার বেশি অর্ডারে স্পেশাল ২০% মেগা ছাড়।',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 2000,
    max_discount_amount: 1000,
    usage_limit: 300,
    is_active: 1
  },
  {
    id: 'coup_03',
    code: 'EID500',
    description_en: 'Flat ৳500 discount on orders above ৳3,000.',
    description_bn: '৩০০০ টাকার কেনাকাটায় সরাসরি ৫০০ টাকা ক্যাশ ছাড়!',
    discount_type: 'fixed',
    discount_value: 500,
    min_order_amount: 3000,
    max_discount_amount: 500,
    usage_limit: 200,
    is_active: 1
  }
];

export const seedShippingMethods = [
  {
    id: 'ship_in_dhaka',
    name_en: 'Inside Dhaka City',
    name_bn: 'ঢাকা সিটির ভেতরে',
    description_en: 'Express home delivery within 24-48 hours',
    description_bn: '২৪-৪৮ ঘণ্টার মধ্যে দ্রুত হোম ডেলিভারি',
    cost: 60,
    estimated_days: '1-2 Days',
    is_active: 1
  },
  {
    id: 'ship_out_dhaka',
    name_en: 'Outside Dhaka (All Bangladesh)',
    name_bn: 'ঢাকার বাইরে (সমগ্র বাংলাদেশ)',
    description_en: 'Reliable doorstep delivery in 2-4 working days',
    description_bn: '২-৪ কার্যদিবসের মধ্যে জেলা ও উপজেলা পর্যায়ে ডেলিভারি',
    cost: 120,
    estimated_days: '2-4 Days',
    is_active: 1
  },
  {
    id: 'ship_express',
    name_en: 'Same-Day Urgent Express (Dhaka)',
    name_bn: 'সেম-ডে আর্জেন্ট এক্সপ্রেস (ঢাকা)',
    description_en: 'Guaranteed delivery within 8-12 hours',
    description_bn: '৮-১২ ঘণ্টার মধ্যে দ্রুততম সুপার এক্সপ্রেস ডেলিভারি',
    cost: 150,
    estimated_days: 'Same Day',
    is_active: 1
  }
];

export const seedSettings = [
  { key: 'site_name', value: 'SHOPHATBD' },
  { key: 'site_name_bn', value: 'শপহাটবিডি' },
  { key: 'site_tagline_en', value: 'SHOP SMART LIVE BETTER' },
  { key: 'site_tagline_bn', value: 'স্মার্ট কেনাকাটা সুন্দর জীবন' },
  { key: 'currency', value: 'BDT' },
  { key: 'currency_symbol', value: '৳' },
  { key: 'contact_phone', value: '01724709454' },
  { key: 'contact_email', value: 'liakot911@gmail.com' },
  { key: 'company_address_en', value: 'Maheshpur, Jhenaidah, Bangladesh' },
  { key: 'company_address_bn', value: 'মহেশপুর, ঝিনাইদহ, বাংলাদেশ' },
  { key: 'announcement_en', value: '⚡ Welcome to Shophatbd! Free Home Delivery on orders above ৳2,500! Call: 01724709454 ⚡' },
  { key: 'announcement_bn', value: '⚡ শপহাটবিডি-তে স্বাগতম! যেকোনো তথ্যে সরাসরি কল করুন: ০১৭২৪৭০৯৪৫৪ ⚡' },
  { key: 'facebook_url', value: 'https://facebook.com/shophatbd' },
  { key: 'instagram_url', value: 'https://instagram.com/shophatbd' },
  { key: 'youtube_url', value: 'https://youtube.com/@shophatbd' },
  { key: 'contact_whatsapp', value: 'https://wa.me/8801724709454' },
  { key: 'whatsapp_chat_number', value: '01724709454' },
  { key: 'logo_url', value: '/logo.png' },
  { key: 'footer_about_en', value: '' },
  { key: 'footer_about_bn', value: '' },
  { key: 'footer_newsletter_title_en', value: 'JOIN THE SHOPHATBD CLUB' },
  { key: 'footer_newsletter_title_bn', value: 'শপহাটবিডি ক্লাবে যুক্ত থাকুন' },
  {
    key: 'footer_service_links_json',
    value: JSON.stringify([
      {
        id: '1',
        label: 'About Us',
        label_bn: 'আমাদের সম্পর্কে',
        page: 'about',
        is_active: true,
        short_description_bn: 'শপনোভা-এর মিশন, প্রিমিয়াম পণ্যের প্রতিশ্রুতি ও ৬৪ জেলায় দ্রুততম হোম ডেলিভারির গল্প।',
        short_description: 'Discover the story, mission, and dedication to authentic quality driving SHOPNOVA across Bangladesh.',
        description_bn: `আমাদের গল্প ও অঙ্গীকার:
শপনোভা বাংলাদেশের একটি শীর্ষস্থানীয় আধুনিক ফ্যাশন ও স্মার্ট টেকনোলজি ই-কমার্স প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো দেশের প্রতিটি প্রান্তে মানুষের কাছে ১০০% অরিজিনাল, প্রিমিয়াম কোয়ালিটির লাইফস্টাইল পণ্য ও গ্যাজেট দ্রুততম সময়ে পৌঁছে দেওয়া।

আমরা বিশ্বাস করি শুধুমাত্র পণ্য বিক্রয় করাই আমাদের শেষ কথা নয়; বরং সততা, বিশ্বস্ত কোয়ালিটি এবং অতুলনীয় আন্তরিক গ্রাহক সেবার মাধ্যমে একটি দীর্ঘমেয়াদী পারিবারিক আস্থার সম্পর্ক গড়ে তোলাই আমাদের সার্থকতা। ৬৪ জেলার প্রতিটি গ্রাহকের মুখে সন্তুষ্টির হাসি ফোটানোই শপনোভা টিমের প্রতিটি সদস্যের নিরন্তর প্রচেষ্টা।`,
        description_en: `Our Story & Purpose:
We are a premier lifestyle and tech destination in Bangladesh, committed to curating 100% authentic apparel, modern accessories, and smart gadgets with seamless nationwide doorstep fulfillment.

Beyond commerce, our purpose is defined by uncompromising quality, honest pricing, and responsive customer care that builds enduring relationships with families across all 64 districts.`
      },
      {
        id: '2',
        label: 'Contact & Support',
        label_bn: 'যোগাযোগ ও সাপোর্ট',
        page: 'contact',
        is_active: true,
        short_description_bn: 'অর্ডার, ডেলিভারি বা যেকোনো সহায়তার জন্য আমাদের ২৪/৭ ডেডিকেটেড কাস্টমার সাপোর্ট সর্বদা প্রস্তুত।',
        short_description: 'Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.',
        description_bn: `কাস্টমার সাপোর্ট ও হেল্পলাইন:
যেকোনো অর্ডার সংক্রান্ত তথ্য, ডেলিভারি আপডেট বা যেকোনো সহযোগিতার জন্য আমাদের ডেডিকেটেড সাপোর্ট টিম সর্বদা প্রস্তুত রয়েছে।

যোগাযোগের মাধ্যমসমূহ:
১. হেল্পলাইন ও কাস্টমার কেয়ার: সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত সরাসরি কল করতে পারেন।
২. অফিসিয়াল হোয়াটসঅ্যাপ: দ্রুত উত্তর ও অর্ডার ট্র্যাকিংয়ের জন্য মেসেজ পাঠান।
৩. ইমেইল সাপোর্ট: ২৪ ঘণ্টার মধ্যে দ্রুত সমাধান পেতে অফিসিয়াল ঠিকানায় ইমেইল করুন।
৪. কেন্দ্রীয় অফিস: সরাসরি আলোচনার জন্য ঢাকার বনানীতে আমাদের অফিসে সাদর আমন্ত্রণ।`,
        description_en: `Customer Support & Helpline:
Our dedicated support team is available 7 days a week to assist you with orders, delivery updates, and all questions.

Ways to Connect With Us:
1. Hotline & Helpdesk: Call our helpline directly between 9:00 AM and 10:00 PM for instant voice assistance.
2. Official WhatsApp: Message our team on WhatsApp for quick inquiries, image sharing, and order confirmation.
3. Email Support: Send your detailed queries or feedback to our official email—we reply within 24 hours.
4. Corporate Office: You are always welcome to visit our central corporate office in Banani, Dhaka.`
      },
      {
        id: '3',
        label: 'Privacy Policy',
        label_bn: 'গোপনীয়তা ও ডাটা পলিসি',
        page: 'privacy',
        is_active: true,
        short_description_bn: 'আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা ও আধুনিক এনক্রিপশন প্রযুক্তিতে প্রতিশ্রুতিবদ্ধ।',
        short_description: 'We prioritize your personal data security and privacy through robust 256-bit encryption.',
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
      }
    ])
  },
  {
    key: 'footer_social_links_json',
    value: JSON.stringify([
      { id: 'soc_fb', platform: 'facebook', name: 'Facebook Page', url: 'https://facebook.com/shopnovabd', is_active: true },
      { id: 'soc_ig', platform: 'instagram', name: 'Instagram Profile', url: 'https://instagram.com/shopnovabd', is_active: true },
      { id: 'soc_yt', platform: 'youtube', name: 'YouTube Channel', url: 'https://youtube.com/@shopnovabd', is_active: true },
      { id: 'soc_wa', platform: 'whatsapp', name: 'WhatsApp Helpline', url: 'https://wa.me/8801700000000', is_active: true }
    ])
  },
  {
    key: 'store_policies_json',
    value: JSON.stringify([
      { id: 'shipping-policy', title: 'Shipping & Delivery Policy', title_bn: 'ডেলিভারি ও শিপিং পলিসি', path: 'shipping-policy', icon: 'truck', is_active: true },
      { id: 'refund-policy', title: 'Return & Refund Policy', title_bn: 'রিটার্ন ও রিফান্ড নীতি', path: 'refund-policy', icon: 'rotate-ccw', is_active: true },
      { id: 'terms', title: 'Terms & Conditions', title_bn: 'ব্যবহারের শর্তাবলী', path: 'terms', icon: 'file-text', is_active: true },
      { id: 'faq', title: 'Frequently Asked Questions (FAQ)', title_bn: 'সাধারণ জিজ্ঞাসা', path: 'faq', icon: 'help', is_active: true },
      { id: 'track', title: 'Live Order Tracking Portal', title_bn: 'লাইভ অর্ডার ট্র্যাকিং', path: 'track', icon: 'map-pin', is_active: true }
    ])
  },
  { key: 'free_shipping_threshold', value: '2500' },
  { key: 'tax_rate_percentage', value: '0' },
  { key: 'maintenance_mode', value: '0' },
  { key: 'google_analytics_id', value: '' },
  { key: 'meta_pixel_id', value: '' },
  { key: 'meta_capi_enabled', value: '0' },
  { key: 'meta_access_token', value: '' },
  { key: 'meta_test_event_code', value: '' },
  { key: 'sms_enabled', value: '0' },
  { key: 'sms_provider', value: 'greenweb' },
  { key: 'sms_api_key', value: '' },
  { key: 'sms_sender_id', value: '' },
  { key: 'sms_order_placed_enabled', value: '1' },
  { key: 'sms_order_confirmed_enabled', value: '1' },
  { key: 'sms_order_shipped_enabled', value: '1' },
  { key: 'sms_order_delivered_enabled', value: '1' },
  { key: 'sms_template_order_placed', value: 'Dear {customer_name}, your order #{order_number} of {grand_total} has been received at {site_name}! Track here: {tracking_url}' },
  { key: 'sms_template_order_confirmed', value: 'Dear {customer_name}, your order #{order_number} has been confirmed and is being processed for delivery. {site_name}' },
  { key: 'sms_template_order_shipped', value: 'Dear {customer_name}, your order #{order_number} has been shipped via {courier_name}. Tracking ID: {tracking_id}. {site_name}' },
  { key: 'sms_template_order_delivered', value: 'Dear {customer_name}, your order #{order_number} has been delivered successfully! Thank you for shopping with {site_name}.' }
];
