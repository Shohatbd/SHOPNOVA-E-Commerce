export interface RouteState {
  page: string;
  param?: string;
}

/**
 * Parses the current browser pathname and search params into the application route state.
 */
export function parseUrlToRoute(pathname: string, search: string): RouteState {
  // Strip trailing slashes, ensure clean root '/'
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(search);

  if (cleanPath === '/' || cleanPath === '') {
    if (searchParams.get('category')) {
      return { page: 'category', param: searchParams.get('category')! };
    }
    if (searchParams.get('q')) {
      return { page: 'shop', param: searchParams.get('q')! };
    }
    return { page: 'home', param: undefined };
  }

  // Remove leading slash and split path parts
  const rawParts = cleanPath.slice(1).split('/');
  const firstPart = decodeURIComponent(rawParts[0] || '').trim();
  const restPart = rawParts.slice(1).map((p) => decodeURIComponent(p.trim())).join('/');

  const lowerFirst = firstPart.toLowerCase();

  if (lowerFirst === 'shop') {
    if (searchParams.get('category')) {
      return { page: 'category', param: searchParams.get('category')! };
    }
    if (searchParams.get('q')) {
      return { page: 'shop', param: searchParams.get('q')! };
    }
    if (restPart) {
      return { page: 'shop', param: restPart };
    }
    return { page: 'shop', param: undefined };
  }

  if (lowerFirst === 'category') {
    return { page: 'category', param: restPart || undefined };
  }

  if (lowerFirst === 'product') {
    return { page: 'product', param: restPart || undefined };
  }

  if (lowerFirst === 'track') {
    return { page: 'track', param: restPart || searchParams.get('order') || undefined };
  }

  if (lowerFirst === 'wishlist') {
    return { page: 'wishlist', param: undefined };
  }

  if (lowerFirst === 'checkout') {
    return { page: 'checkout', param: undefined };
  }

  if (lowerFirst === 'order-success' || lowerFirst === 'success') {
    return { page: 'order-success', param: restPart || searchParams.get('order') || undefined };
  }

  if (lowerFirst === 'account') {
    return { page: 'account', param: restPart || 'profile' };
  }

  if (lowerFirst === 'admin') {
    return { page: 'admin', param: restPart || 'dashboard' };
  }

  // Explicit policy or info page route (e.g. /policy/warranty or /page/custom-info)
  if (lowerFirst === 'policy' || lowerFirst === 'page') {
    return { page: restPart || 'about', param: undefined };
  }

  // Common static policy and information pages
  const policySlugs = [
    'about',
    'contact',
    'shipping-policy',
    'refund-policy',
    'terms',
    'privacy',
    'faq'
  ];

  if (
    policySlugs.includes(lowerFirst) ||
    lowerFirst.startsWith('l_') ||
    lowerFirst.startsWith('page_') ||
    lowerFirst.startsWith('pol_') ||
    lowerFirst.endsWith('-policy') ||
    lowerFirst.startsWith('policy-') ||
    lowerFirst.endsWith('-terms') ||
    lowerFirst.startsWith('custom-')
  ) {
    return { page: lowerFirst, param: undefined };
  }

  // Direct category or friendly URL fallback (e.g., "/mens-clothing" or "/Men's Clothing")
  return { page: 'category', param: firstPart };
}

/**
 * Builds a clean, SEO-friendly browser URL from the page and optional parameters.
 */
export function buildUrlFromRoute(page: string, param?: string): string {
  if (page === 'home' || !page) {
    return '/';
  }
  if (page === 'shop') {
    if (param && param !== 'all' && param !== 'flash_sale' && param !== 'bestseller') {
      return `/shop?q=${encodeURIComponent(param)}`;
    }
    if (param === 'flash_sale') {
      return '/shop?filter=flash_sale';
    }
    if (param === 'bestseller') {
      return '/shop?filter=bestseller';
    }
    return '/shop';
  }
  if (page === 'category') {
    return param ? `/category/${encodeURIComponent(param)}` : '/shop';
  }
  if (page === 'product') {
    return param ? `/product/${encodeURIComponent(param)}` : '/shop';
  }
  if (page === 'track') {
    return param ? `/track/${encodeURIComponent(param)}` : '/track';
  }
  if (page === 'wishlist') {
    return '/wishlist';
  }
  if (page === 'checkout') {
    return '/checkout';
  }
  if (page === 'order-success' || page === 'success') {
    return param ? `/order-success/${encodeURIComponent(param)}` : '/order-success';
  }
  if (page === 'account') {
    return param && param !== 'profile' ? `/account/${encodeURIComponent(param)}` : '/account';
  }
  if (page === 'admin') {
    return param && param !== 'dashboard' ? `/admin/${encodeURIComponent(param)}` : '/admin';
  }
  // Policy or custom page
  return `/${encodeURIComponent(page)}`;
}
