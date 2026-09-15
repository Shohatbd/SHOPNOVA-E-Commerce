import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { parseUrlToRoute, buildUrlFromRoute, RouteState } from './utils/router.ts';

// Layout Components
import { AnnouncementBar } from './components/layout/AnnouncementBar.tsx';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';

// Store Views
import { Home } from './components/store/Home.tsx';
import { ShopPage } from './components/store/ShopPage.tsx';
import { ProductDetailsPage } from './components/store/ProductDetailsPage.tsx';
import { CheckoutPage } from './components/store/CheckoutPage.tsx';
import { OrderSuccessPage } from './components/store/OrderSuccessPage.tsx';
import { OrderTrackingPage } from './components/store/OrderTrackingPage.tsx';
import { CustomerDashboard } from './components/store/CustomerDashboard.tsx';
import { WishlistPage } from './components/store/WishlistPage.tsx';
import { PolicyPages } from './components/store/PolicyPages.tsx';
import { CartDrawer } from './components/store/CartDrawer.tsx';
import { AuthModal } from './components/store/AuthModal.tsx';
import { SEOHead } from './components/common/SEOHead.tsx';
import { CustomScriptsInjector } from './components/common/CustomScriptsInjector.tsx';
import { AIChatWidget } from './components/common/AIChatWidget.tsx';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminProducts } from './components/admin/AdminProducts.tsx';
import { AdminCategories } from './components/admin/AdminCategories.tsx';
import { AdminOrders } from './components/admin/AdminOrders.tsx';
import { AdminInventory } from './components/admin/AdminInventory.tsx';
import { AdminCoupons } from './components/admin/AdminCoupons.tsx';
import { AdminReviews } from './components/admin/AdminReviews.tsx';
import { AdminPayments } from './components/admin/AdminPayments.tsx';
import { AdminCourier } from './components/admin/AdminCourier.tsx';
import { AdminAnalytics } from './components/admin/AdminAnalytics.tsx';
import { AdminBanners } from './components/admin/AdminBanners.tsx';
import { AdminSettings } from './components/admin/AdminSettings.tsx';
import { AdminSmsSettings } from './components/admin/AdminSmsSettings.tsx';
import { AdminCustomers } from './components/admin/AdminCustomers.tsx';
import { AdminSubscribers } from './components/admin/AdminSubscribers.tsx';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs.tsx';
import { StoreBackupManager } from './components/admin/StoreBackupManager.tsx';
import { AdminMessages } from './components/admin/AdminMessages.tsx';

const AppContent: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { isBn } = useLanguage();
  const { settings } = useSettings();

  // Dynamic Browser Routing State
  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      return parseUrlToRoute(window.location.pathname, window.location.search);
    }
    return { page: 'home' };
  });

  const currentPage = route.page;
  const pageParam = route.param;

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      const parts = window.location.pathname.slice(1).split('/');
      return parts[1] || 'dashboard';
    }
    return 'dashboard';
  });

  // Handle browser back/forward buttons (popstate) & initial history synchronization
  useEffect(() => {
    const current = parseUrlToRoute(window.location.pathname, window.location.search);
    window.history.replaceState(
      { page: current.page, param: current.param },
      '',
      window.location.pathname + window.location.search
    );

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setRoute({ page: event.state.page, param: event.state.param });
        if (event.state.page === 'admin' && event.state.param) {
          setAdminTab(event.state.param);
        }
      } else {
        const parsed = parseUrlToRoute(window.location.pathname, window.location.search);
        setRoute(parsed);
        if (parsed.page === 'admin' && parsed.param) {
          setAdminTab(parsed.param);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize dynamic body background color
  useEffect(() => {
    if (currentPage !== 'admin') {
      const bgColor = settings.site_bg_color || '#F8F9FA';
      document.body.style.backgroundColor = bgColor;
    } else {
      document.body.style.backgroundColor = '#F1F3F5';
    }
  }, [settings.site_bg_color, currentPage]);

  // Handle URL updates and clean SEO-friendly transitions
  const handleNavigate = useCallback((page: string, param?: string) => {
    const targetUrl = buildUrlFromRoute(page, param);
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== targetUrl) {
      window.history.pushState({ page, param }, '', targetUrl);
    }

    setRoute({ page, param });
    if (page === 'admin' && param) {
      setAdminTab(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // If viewing admin route
  if (currentPage === 'admin') {
    // If not logged in as admin, prompt auth modal or redirect
    if (!authLoading && !isAdmin) {
      return (
        <div className="min-h-screen bg-[#F1F3F5] text-slate-800 flex flex-col items-center justify-center p-6 text-[13px] font-sans">
          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto font-black text-lg border border-amber-200">
              🔒
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isBn ? 'এডমিন প্যানেলে প্রবেশাধিকার প্রয়োজন' : 'Administrator Access Required'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isBn
                ? 'এডমিন প্যানেলে প্রবেশ করতে আপনার অনুমোদিত এডমিন অ্যাকাউন্টে লগইন করুন।'
                : 'Please sign in with your authorized administrator credentials to manage products, orders, and site settings.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
              >
                {isBn ? 'এডমিন লগইন করুন' : 'Sign in as Admin'}
              </button>
              <button
                onClick={() => handleNavigate('home')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
              >
                {isBn ? 'স্টোরফ্রন্টে ফিরে যান' : 'Back to Store'}
              </button>
            </div>
          </div>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => {
              if (isAdmin) handleNavigate('admin');
            }}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          const targetUrl = buildUrlFromRoute('admin', tab);
          window.history.pushState({ page: 'admin', param: tab }, '', targetUrl);
        }}
        onExitToStore={() => handleNavigate('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />}
        {adminTab === 'inquiries' && <AdminMessages />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'payments' && <AdminPayments />}
        {adminTab === 'courier' && <AdminCourier />}
        {adminTab === 'analytics' && <AdminAnalytics />}
        {adminTab === 'banners' && <AdminBanners />}
        {adminTab === 'sms' && <AdminSmsSettings />}
        {adminTab === 'settings' && <AdminSettings onNavigateTab={setAdminTab} />}
        {adminTab === 'backup' && <StoreBackupManager />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'subscribers' && <AdminSubscribers />}
        {adminTab === 'logs' && <AdminAuditLogs />}
      </AdminLayout>
    );
  }

  // Storefront Layout
  return (
    <div
      style={{ backgroundColor: settings.site_bg_color || '#F8F9FA' }}
      className="min-h-screen flex flex-col text-slate-800 font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden"
    >
      {/* Dynamic SEO Meta & Schema Injector */}
      <SEOHead currentPage={currentPage} pageParam={pageParam} />
      {/* Custom Header/Footer Scripts, Tracking Pixels, and Chatbots */}
      <CustomScriptsInjector />

      {/* Sticky Header Group: All 3 Bars (Announcement Bar, Main Header, Category Bar) stay frozen/sticky together */}
      <div className="sticky top-0 z-40 shadow-xs">
        <AnnouncementBar />
        <Header
          currentPage={currentPage}
          currentParam={pageParam}
          onNavigate={handleNavigate}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      </div>

      {/* Main View Body */}
      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
        {(currentPage === 'shop' || currentPage === 'category') && (
          <ShopPage
            onNavigate={handleNavigate}
            initialFilter={pageParam}
            initialCategory={currentPage === 'category' ? pageParam : undefined}
          />
        )}
        {currentPage === 'product' && (
          <ProductDetailsPage
            productSlugOrId={pageParam || ''}
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentPage === 'wishlist' && <WishlistPage onNavigate={handleNavigate} />}
        {currentPage === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}
        {(currentPage === 'success' || currentPage === 'order-success') && (
          <OrderSuccessPage orderNumberOrId={pageParam || ''} onNavigate={handleNavigate} />
        )}
        {currentPage === 'track' && (
          <OrderTrackingPage initialTrackingQuery={pageParam} onNavigate={handleNavigate} />
        )}
        {currentPage === 'account' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            initialTab={pageParam as any}
          />
        )}
        {(currentPage === 'about' ||
          currentPage === 'contact' ||
          currentPage === 'shipping-policy' ||
          currentPage === 'refund-policy' ||
          currentPage === 'terms' ||
          currentPage === 'privacy' ||
          currentPage === 'faq' ||
          currentPage.startsWith('l_') ||
          currentPage.startsWith('page_') ||
          currentPage.startsWith('pol_') ||
          currentPage.endsWith('-policy') ||
          currentPage.startsWith('policy-') ||
          currentPage.endsWith('-terms') ||
          currentPage.startsWith('custom-')) && (
          <PolicyPages
            type={currentPage as any}
            onNavigate={(p) => handleNavigate(p)}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (currentPage === 'admin' && !isAdmin) {
            handleNavigate('home');
          }
        }}
      />

      {/* Bottom Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* AI Smart Customer Support Chatbot Widget */}
      <AIChatWidget onNavigate={handleNavigate} />

      {/* Mobile Sticky Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
