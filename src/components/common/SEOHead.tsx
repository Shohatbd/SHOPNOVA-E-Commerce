import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { tracker } from '../../utils/analytics.ts';

interface SEOHeadProps {
  currentPage: string;
  pageParam?: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  productData?: any;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  currentPage,
  pageParam,
  customTitle,
  customDescription,
  customImage,
  productData
}) => {
  const { settings } = useSettings();
  const { isBn } = useLanguage();

  useEffect(() => {
    const rawSiteName = isBn ? (settings.site_name_bn || 'শপহাটবিডি') : (settings.site_name || 'SHOPHATBD');
    const siteName = rawSiteName === 'SHOPNOVA' ? (isBn ? 'শপহাটবিডি' : 'SHOPHATBD') : rawSiteName;

    const tagline = isBn
      ? settings.site_tagline_bn || 'স্মার্ট কেনাকাটা সুন্দর জীবন'
      : settings.site_tagline_en || 'SHOP SMART LIVE BETTER';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.shophatbd.com';
    const canonicalBase = (settings.canonical_base_url || settings.canonical_url || origin).replace(/\/+$/, '');

    let pageTitle = `${siteName} | ${tagline}`;
    let pageDesc = isBn
      ? (settings.meta_description_bn || settings.seo_description_bn || settings.meta_description_en || settings.seo_description || 'শপহাটবিডি থেকে সেরা মানের পোশাক, ঘড়ি ও ট্রেন্ডিং গ্যাজেট কিনুন সুলভ মূল্যে। দ্রুত হোম ডেলিভারি ও সহজ রিটার্ন সুবিধা সমগ্র বাংলাদেশে।')
      : (settings.meta_description_en || settings.seo_description || 'Shop authentic fashion, watches, electronics, and lifestyle products at SHOPHATBD with fast nationwide home delivery across Bangladesh.');

    let canonicalPath = '';
    let ogType = 'website';
    let ogImage = customImage || settings.og_image_url || settings.logo_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80';

    if (currentPage === 'home') {
      canonicalPath = '';
      const customHomeTitle = isBn
        ? (settings.meta_title_bn || settings.seo_meta_title_bn || settings.meta_title_en || settings.seo_meta_title)
        : (settings.meta_title_en || settings.seo_meta_title);
      if (customHomeTitle && !customHomeTitle.includes('SHOPNOVA') && !customHomeTitle.includes('শপনোভা')) {
        pageTitle = customHomeTitle;
      } else {
        pageTitle = isBn
          ? `${siteName} - ${tagline}`
          : `${siteName} - ${tagline}`;
      }
    } else if (currentPage === 'shop') {
      pageTitle = isBn ? `সকল পণ্য ও কালেকশন | ${siteName}` : `Shop All Products & Collections | ${siteName}`;
      canonicalPath = '/shop';
    } else if (currentPage === 'category') {
      const catName = pageParam ? pageParam.replace(/-/g, ' ').toUpperCase() : 'Category';
      pageTitle = isBn ? `${catName} কালেকশন | ${siteName}` : `${catName} Collection | ${siteName}`;
      canonicalPath = `/category/${encodeURIComponent(pageParam || '')}`;
    } else if (currentPage === 'product' && productData) {
      const prodName = isBn ? (productData.name_bn || productData.name_en) : productData.name_en;
      pageTitle = productData.seo_title || `${prodName} | ${siteName}`;
      pageDesc = productData.seo_description || productData.short_description_en || productData.description_en || pageDesc;
      if (productData.thumbnail) ogImage = productData.thumbnail;
      ogType = 'product';
      canonicalPath = `/product/${encodeURIComponent(productData.slug || productData.id || pageParam || '')}`;
    } else if (currentPage === 'wishlist') {
      pageTitle = isBn ? `আমার পছন্দের তালিকা (উইশলিস্ট) | ${siteName}` : `My Saved Wishlist | ${siteName}`;
      canonicalPath = '/wishlist';
    } else if (currentPage === 'track') {
      pageTitle = isBn ? `অর্ডার ট্র্যাকিং | ${siteName}` : `Track Your Order | ${siteName}`;
      canonicalPath = '/track';
    } else if (currentPage === 'checkout') {
      pageTitle = isBn ? `নিরাপদ চেকআউট | ${siteName}` : `Secure Fast Checkout | ${siteName}`;
      canonicalPath = '/checkout';
    } else if (currentPage === 'about') {
      pageTitle = isBn ? `আমাদের সম্পর্কে | ${siteName}` : `About Us | ${siteName}`;
      canonicalPath = '/about';
    } else if (currentPage === 'contact') {
      pageTitle = isBn ? `যোগাযোগ ও সাপোর্ট | ${siteName}` : `Contact & Help Support | ${siteName}`;
      canonicalPath = '/contact';
    } else if (currentPage === 'shipping-policy') {
      pageTitle = isBn ? `শিপিং ও ডেলিভারি পলিসি | ${siteName}` : `Shipping Policy | ${siteName}`;
      canonicalPath = '/shipping-policy';
    } else if (currentPage === 'refund-policy') {
      pageTitle = isBn ? `রিটার্ন ও রিফান্ড পলিসি | ${siteName}` : `Return & Refund Policy | ${siteName}`;
      canonicalPath = '/refund-policy';
    } else if (currentPage === 'terms') {
      pageTitle = isBn ? `শর্তাবলী ও নিয়মাবলী | ${siteName}` : `Terms & Conditions | ${siteName}`;
      canonicalPath = '/terms';
    } else if (currentPage === 'privacy') {
      pageTitle = isBn ? `গোপনীয়তা নীতি | ${siteName}` : `Privacy Policy | ${siteName}`;
      canonicalPath = '/privacy';
    } else if (currentPage === 'faq') {
      pageTitle = isBn ? `সাধারণ প্রশ্নাবলী (FAQ) | ${siteName}` : `Frequently Asked Questions | ${siteName}`;
      canonicalPath = '/faq';
    }

    if (customTitle) pageTitle = customTitle;
    if (customDescription) pageDesc = customDescription;

    // Automatic sanitization for brand consistency
    pageTitle = pageTitle
      .replace(/SHOPNOVA/gi, isBn ? 'শপহাটবিডি' : 'SHOPHATBD')
      .replace(/শপনোভা/g, 'শপহাটবিডি');
    pageDesc = pageDesc
      .replace(/SHOPNOVA/gi, isBn ? 'শপহাটবিডি' : 'SHOPHATBD')
      .replace(/শপনোভা/g, 'শপহাটবিডি');

    // Update browser title
    document.title = pageTitle;

    // Clean Canonical URL (stripping tracking parameters to protect SEO integrity)
    const cleanCanonicalUrl = `${canonicalBase}${canonicalPath}`;

    // Meta Tag Setter Helper
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // 1. Google Search Indexing & Robots Directives
    const isIndexingEnabled =
      settings.google_index_enabled !== '0' &&
      settings.google_index_enabled !== false &&
      settings.google_index_enabled !== 'false';

    const robotsContent = isIndexingEnabled
      ? settings.seo_robots_directive || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';

    setMetaTag('robots', robotsContent);
    setMetaTag('googlebot', isIndexingEnabled ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, nofollow');
    setMetaTag('bingbot', isIndexingEnabled ? 'index, follow' : 'noindex, nofollow');

    // 2. Standard SEO Meta
    setMetaTag('description', pageDesc);
    if (settings.seo_keywords || settings.meta_keywords || (productData && productData.seo_keywords)) {
      setMetaTag('keywords', (productData?.seo_keywords || settings.seo_keywords || settings.meta_keywords || ''));
    }

    // 3. Open Graph (Facebook / Social)
    setMetaTag('og:title', pageTitle, true);
    setMetaTag('og:description', pageDesc, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:url', cleanCanonicalUrl, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', siteName, true);

    // 4. Twitter / X Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', pageDesc);
    setMetaTag('twitter:image', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = cleanCanonicalUrl;

    // 6. Google Site Verification Tag
    if (settings.google_site_verification) {
      setMetaTag('google-site-verification', settings.google_site_verification);
    }

    // 7. Structured Data Schemas (JSON-LD for Google Rich Snippets)
    const schemas: any[] = [
      // WebSite Schema
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': siteName,
        'url': canonicalBase,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${canonicalBase}/shop?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      // Organization Schema
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': siteName,
        'url': canonicalBase,
        'logo': settings.logo_url || `${canonicalBase}/logo.png`,
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': settings.contact_phone || '+8801700000000',
          'contactType': 'customer service',
          'areaServed': 'BD',
          'availableLanguage': ['English', 'Bengali']
        },
        'sameAs': [
          settings.facebook_url,
          settings.instagram_url,
          settings.youtube_url,
          settings.tiktok_url
        ].filter(Boolean)
      }
    ];

    // Product Schema
    if (currentPage === 'product' && productData) {
      schemas.push({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': productData.name_en,
        'image': productData.thumbnail ? [productData.thumbnail] : [],
        'description': productData.description_en || productData.short_description_en || productData.name_en,
        'sku': productData.sku || productData.id,
        'brand': {
          '@type': 'Brand',
          'name': productData.brand || siteName
        },
        'offers': {
          '@type': 'Offer',
          'url': cleanCanonicalUrl,
          'priceCurrency': settings.currency || 'BDT',
          'price': productData.sale_price ?? productData.regular_price,
          'priceValidUntil': '2028-12-31',
          'availability': productData.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'itemCondition': 'https://schema.org/NewCondition'
        },
        'aggregateRating': productData.rating ? {
          '@type': 'AggregateRating',
          'ratingValue': productData.rating || 4.9,
          'reviewCount': productData.review_count || 12
        } : undefined
      });

      // BreadcrumbList Schema for Product
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': canonicalBase
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': productData.category_id ? productData.category_id.toUpperCase() : 'Shop',
            'item': `${canonicalBase}/shop?category=${encodeURIComponent(productData.category_id || '')}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': productData.name_en,
            'item': cleanCanonicalUrl
          }
        ]
      });
    }

    let scriptTag = document.getElementById('jsonld-schema') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemas);

    // 8. Fire PageView tracking
    tracker.trackPageView(canonicalPath || '/', pageTitle, settings);

  }, [currentPage, pageParam, customTitle, customDescription, customImage, productData, settings, isBn]);

  return null;
};
