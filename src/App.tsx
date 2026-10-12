import { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth';
import { CartProvider } from '@/cart';
import { LanguageProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';
import { queryClient } from '@/lib/query-client';
import { initTracking, trackPageView } from '@/lib/tracking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartDrawer, MobileBottomNav, WhatsAppFloat } from '@/components/MobileNav';
import { ChatWidget } from '@/components/ChatWidget';
import { ApiDebugOverlay } from '@/components/ApiDebugOverlay';
import SplashScreen from '@/components/SplashScreen';
import { Toaster } from '@/components/ui/sonner';
import Home from '@/pages/Home';

const TiresPage = lazy(() => import('@/pages/TiresPage'));
const TireDetailPage = lazy(() => import('@/pages/TireDetailPage'));
const BatteriesPage = lazy(() => import('@/pages/BatteriesPage'));
const BatteryDetailPage = lazy(() => import('@/pages/BatteryDetailPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const BranchesPage = lazy(() => import('@/pages/BranchesPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const OfferDetailsPage = lazy(() => import('@/pages/OfferDetailsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const RescuePage = lazy(() => import('@/pages/RescuePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const TaxonomyPage = lazy(() => import('@/pages/TaxonomyPage'));
const BlogListPage = lazy(() => import('@/pages/BlogListPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Tracking() {
  const { pathname, search } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    void initTracking();
  }, []);

  useEffect(() => {
    // The initial page view is already sent by the tracker init snippets.
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <SplashScreen />
              <ScrollToTop />
              <Tracking />
              <div className="" >
                <Header />
                <main>
                <Suspense fallback={<div className="min-h-[60vh] bg-paper" />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tires" element={<TiresPage />} />
                  <Route path="/tires/:id" element={<TireDetailPage />} />
                  <Route path="/batteries" element={<BatteriesPage />} />
                  <Route path="/batteries/:id" element={<BatteryDetailPage />} />
                  <Route path="/services" element={<Navigate to="/booking" replace />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/rescue" element={<RescuePage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/branches" element={<BranchesPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/offers/:id" element={<OfferDetailsPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/taxonomy" element={<TaxonomyPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/return-policy" element={<LegalPage doc="return" />} />
                  <Route path="/terms" element={<LegalPage doc="terms" />} />
                  <Route path="/cancellation-policy" element={<LegalPage doc="cancellation" />} />
                  <Route path="/privacy-policy" element={<LegalPage doc="privacy" />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Home />} />
                </Routes>
                </Suspense>
              </main>
              <Footer />
              <MobileBottomNav />
              <WhatsAppFloat />
              <ChatWidget />
              <ApiDebugOverlay />
              <CartDrawer />
              <Toaster position="top-center" richColors />
            </div>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
