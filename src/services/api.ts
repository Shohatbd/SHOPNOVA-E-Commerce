import { fallbackCategories, fallbackProducts, fallbackBanners } from '../data/fallbackData.ts';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('shopnova_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('shopnova_token', token);
  } else {
    localStorage.removeItem('shopnova_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          success: response.ok,
          message: response.ok ? text : `Server request to ${endpoint} failed with status ${response.status}`
        };
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `Request to ${endpoint} failed (${response.status})`);
    }

    return data;
  } catch (error: any) {
    // If it's a GET request and network/server fails, provide local resilient fallback
    if (!options.method || options.method === 'GET') {
      if (endpoint.startsWith('/categories')) {
        return { success: true, categories: fallbackCategories } as unknown as T;
      }
      if (endpoint.startsWith('/banners')) {
        return { success: true, banners: fallbackBanners } as unknown as T;
      }
      if (endpoint.startsWith('/products/flash-sale')) {
        const flashProds = fallbackProducts.filter(p => p.is_flash_sale === 1);
        return { success: true, products: flashProds } as unknown as T;
      }
      if (endpoint.startsWith('/products')) {
        const parts = endpoint.split('?')[0].split('/');
        // Handle single product request /products/:slugOrId
        if (parts.length > 2 && parts[2] && !['flash-sale', 'admin', 'bulk'].includes(parts[2])) {
          const slugOrId = parts[2];
          const found = fallbackProducts.find(p => p.id === slugOrId || p.slug === slugOrId) || fallbackProducts[0];
          return {
            success: true,
            product: found,
            relatedProducts: fallbackProducts.filter(p => p.id !== found.id),
            reviews: []
          } as unknown as T;
        }

        let prods = [...fallbackProducts];
        if (endpoint.includes('is_featured=1') || endpoint.includes('featured=1') || endpoint.includes('featured=true')) {
          prods = prods.filter(p => p.is_featured === 1);
        }
        if (endpoint.includes('is_bestseller=1') || endpoint.includes('bestseller=1') || endpoint.includes('bestseller=true')) {
          prods = prods.filter(p => p.is_bestseller === 1);
        }
        if (endpoint.includes('category=gadgets')) {
          prods = prods.filter(p => p.category_id === 'cat_gadgets');
        }
        return { success: true, products: prods, total: prods.length } as unknown as T;
      }
      if (endpoint.startsWith('/settings')) {
        return {
          success: true,
          settings: {
            site_name: 'SHOPNOVA',
            currency: 'BDT',
            currency_symbol: '৳'
          }
        } as unknown as T;
      }
    }

    console.warn(`API request to ${endpoint} failed, handled gracefully:`, error?.message || error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  changePassword: (body: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    return request<any>(`/products?${searchParams.toString()}`);
  },
  getAdminProducts: (params: Record<string, any> = {}) =>
    api.getProducts({
      includeUnpublished: 'true',
      limit: 200,
      sort: 'category',
      ...params
    }),
  getProductBySlugOrId: (slugOrId: string) => request<any>(`/products/${slugOrId}`),
  getFlashSaleProducts: () => request<any>('/products/flash-sale'),
  createProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id: string) => request<any>(`/products/${id}/duplicate`, { method: 'POST' }),
  bulkProductAction: (body: any) => request<any>('/products/bulk', { method: 'POST', body: JSON.stringify(body) }),
  clearDemoProducts: () => request<any>('/products/clear-demo-products', { method: 'POST' }),

  // Categories
  getCategories: () => request<any>('/categories'),
  getCategory: (slug: string) => request<any>(`/categories/${slug}`),
  createCategory: (body: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),
  addSubcategory: (categoryId: string, body: { name_en: string; name_bn: string; image?: string }) =>
    request<any>(`/categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify(body) }),
  updateSubcategory: (subId: string, body: { name_en: string; name_bn?: string; slug?: string; image?: string; is_active?: number }) =>
    request<any>(`/categories/subcategories/${subId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSubcategory: (subId: string) =>
    request<any>(`/categories/subcategories/${subId}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request<any>('/orders/my-orders'),
  trackOrder: (query: string) => request<any>(`/orders/track/${encodeURIComponent(query)}`),
  getOrderDetails: (idOrNumber: string) => request<any>(`/orders/details/${idOrNumber}`),
  getAdminOrders: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') searchParams.append(key, String(val));
    });
    return request<any>(`/orders/admin/all?${searchParams.toString()}`);
  },
  updateOrderStatus: (id: string, body: any) => request<any>(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  editOrder: (id: string, body: any) => request<any>(`/orders/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOrder: (id: string) => request<any>(`/orders/admin/${id}`, { method: 'DELETE' }),

  // Payments & Gateways
  processPayment: (body: any) => request<any>('/payments/process', { method: 'POST', body: JSON.stringify(body) }),
  getAdminPayments: () => request<any>('/payments/admin/all'),
  getPaymentGateways: () => request<any>('/payments/gateways'),
  createPaymentGateway: (body: any) => request<any>('/payments/gateways', { method: 'POST', body: JSON.stringify(body) }),
  updatePaymentGateway: (id: string, body: any) => request<any>(`/payments/gateways/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePaymentGateway: (id: string) => request<any>(`/payments/gateways/${id}`, { method: 'DELETE' }),
  updatePaymentTransaction: (id: string, body: any) => request<any>(`/payments/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePaymentTransaction: (id: string) => request<any>(`/payments/transactions/${id}`, { method: 'DELETE' }),

  // Couriers
  getCouriers: () => request<any>('/couriers'),
  getCourierConfig: () => request<any>('/couriers/config'),
  saveCourierConfig: (body: any) => request<any>('/couriers/config', { method: 'POST', body: JSON.stringify(body) }),
  testSteadfastConnection: (body: any) => request<any>('/couriers/test-steadfast', { method: 'POST', body: JSON.stringify(body) }),
  dispatchCourier: (body: any) => request<any>('/couriers/dispatch', { method: 'POST', body: JSON.stringify(body) }),
  getShipments: () => request<any>('/couriers/shipments'),
  syncCourierStatus: (body: { shipment_id: string; status: string }) => request<any>('/couriers/sync-status', { method: 'POST', body: JSON.stringify(body) }),
  checkCourierTracking: (body: { tracking_id?: string; consignment_id?: string; shipment_id?: string }) => request<any>('/couriers/check-tracking', { method: 'POST', body: JSON.stringify(body) }),
  syncAllCouriers: () => request<any>('/couriers/sync-all', { method: 'POST' }),

  // Coupons
  validateCoupon: (body: { code: string; subtotal: number }) => request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify(body) }),
  getCoupons: () => request<any>('/coupons'),
  getAdminCoupons: () => api.getCoupons(),
  createCoupon: (body: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(body) }),
  updateCoupon: (id: string, body: any) => request<any>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCoupon: (id: string) => request<any>(`/coupons/${id}`, { method: 'DELETE' }),

  // Reviews
  submitReview: (body: any) => request<any>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getAdminReviews: () => request<any>('/reviews/admin/all'),
  moderateReview: (id: string, body: any) => request<any>(`/reviews/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReview: (id: string) => request<any>(`/reviews/admin/${id}`, { method: 'DELETE' }),

  // Analytics
  logEvent: (eventName: string, data?: any) => request<any>('/analytics/event', { method: 'POST', body: JSON.stringify({ event_name: eventName, data }) }),
  getAnalyticsDashboard: () => request<any>('/analytics/dashboard'),
  getAnalyticsMetrics: () => api.getAnalyticsDashboard(),
  testMetaCapi: (body: any) => request<any>('/analytics/test-capi', { method: 'POST', body: JSON.stringify(body) }),

  // Settings & Banners
  getSettings: () => request<any>('/settings'),
  getAdminSettings: () => request<any>('/settings/admin'),
  updateSettings: (body: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
  getBanners: () => request<any>('/banners'),
  getAdminBanners: () => request<any>('/banners/admin/all'),
  createBanner: (body: any) => request<any>('/banners', { method: 'POST', body: JSON.stringify(body) }),
  updateBanner: (id: string, body: any) => request<any>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBanner: (id: string) => request<any>(`/banners/${id}`, { method: 'DELETE' }),

  // Admin Specific
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  getCustomers: () => request<any>('/admin/customers'),
  getAdminCustomers: () => api.getCustomers(),
  createCustomer: (body: any) => request<any>('/admin/customers', { method: 'POST', body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: any) => request<any>(`/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCustomer: (id: string) => request<any>(`/admin/customers/${id}`, { method: 'DELETE' }),
  getCustomerOrders: (id: string) => request<any>(`/admin/customers/${id}/orders`),
  getInventory: () => request<any>('/admin/inventory'),
  getInventoryLogs: () => api.getInventory(),
  receiveStock: (body: any) => request<any>('/admin/inventory/receive', { method: 'POST', body: JSON.stringify(body) }),
  returnStock: (body: any) => request<any>('/admin/inventory/return', { method: 'POST', body: JSON.stringify(body) }),
  adjustInventory: (body: any) => request<any>('/admin/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }),
  quickEditInventory: (body: any) => request<any>('/admin/inventory/quick-edit', { method: 'PUT', body: JSON.stringify(body) }),
  deleteInventoryLog: (id: string) => request<any>(`/admin/inventory/logs/${id}`, { method: 'DELETE' }),
  clearInventoryLogs: () => request<any>('/admin/inventory/logs', { method: 'DELETE' }),
  getAuditLogs: () => request<any>('/admin/logs'),
  deleteAuditLog: (id: string) => request<any>(`/admin/logs/${id}`, { method: 'DELETE' }),
  cleanupAuditLogs: (days: number = 7) => request<any>('/admin/logs/cleanup', { method: 'POST', body: JSON.stringify({ days }) }),

  // SMS Gateway
  getSmsLogs: (status?: string, page?: number, limit?: number) => request<any>(`/sms/logs?status=${status || 'all'}&page=${page || 1}&limit=${limit || 50}`),
  sendTestSms: (body: any) => request<any>('/sms/send-test', { method: 'POST', body: JSON.stringify(body) }),
  sendOrderSms: (body: any) => request<any>('/sms/send-order-sms', { method: 'POST', body: JSON.stringify(body) }),
  clearSmsLogs: () => request<any>('/sms/logs/clear', { method: 'DELETE' }),

  // Customer Inquiries / Contact Messages
  getContactMessages: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<any>(`/contact?${q.toString()}`);
  },
  getContactStats: () => request<any>('/contact/stats'),
  updateContactStatus: (id: string, body: { status?: string; admin_notes?: string }) =>
    request<any>(`/contact/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  replyToContact: (id: string, body: { subject?: string; replyContent: string }) =>
    request<any>(`/contact/${id}/reply`, { method: 'POST', body: JSON.stringify(body) }),
  deleteContactMessage: (id: string) => request<any>(`/contact/${id}`, { method: 'DELETE' }),
  testSmtpConnection: (body: any) => request<any>('/contact/test-smtp', { method: 'POST', body: JSON.stringify(body) }),

  // Smart AI Customer Support Chatbot
  sendChatMessage: (message: string, history?: any[]) =>
    request<any>('/chat/message', { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Newsletter Subscribers
  subscribeNewsletter: (email: string) =>
    request<any>('/subscribers', { method: 'POST', body: JSON.stringify({ email }) }),
  getAdminSubscribers: (search?: string) =>
    request<any>(`/subscribers?search=${encodeURIComponent(search || '')}`),
  deleteSubscriber: (id: string) =>
    request<any>(`/subscribers/${id}`, { method: 'DELETE' })
};
