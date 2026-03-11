// ============================================
// Petit Stay V2 - Main App Router
// C2C babysitting marketplace
// ============================================

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DemoBanner } from './components/common/DemoBanner';
import { InstallBanner } from './components/common/InstallBanner';
import { BrandLogo } from './components/common/BrandLogo';
import './index.css';

// ----------------------------------------
// Lazy-loaded Pages
// ----------------------------------------
// Landing
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// V2 Public — Booking funnel
const SearchPage = lazy(() => import('./pages/v2/SearchPage'));
const SitterProfilePage = lazy(() => import('./pages/v2/SitterProfilePage'));
const BookingPage = lazy(() => import('./pages/v2/BookingPage'));
const CheckoutPage = lazy(() => import('./pages/v2/CheckoutPage'));
const BookingDetailPage = lazy(() => import('./pages/v2/BookingDetailPage'));
const ReviewPage = lazy(() => import('./pages/v2/ReviewPage'));

// V2 Sitter Dashboard
const SitterDashboard = lazy(() => import('./pages/v2/sitter/SitterDashboard'));
const SitterProfileEdit = lazy(() => import('./pages/v2/sitter/SitterProfileEdit'));
const SitterPricing = lazy(() => import('./pages/v2/sitter/SitterPricing'));
const SitterAvailability = lazy(() => import('./pages/v2/sitter/SitterAvailability'));
const SitterRequests = lazy(() => import('./pages/v2/sitter/SitterRequests'));
const SitterActiveSession = lazy(() => import('./pages/v2/sitter/SitterActiveSession'));
const SitterEarnings = lazy(() => import('./pages/v2/sitter/SitterEarnings'));
const SitterMyReviews = lazy(() => import('./pages/v2/sitter/SitterMyReviews'));

// V2 Partner Console
const PartnerDashboard = lazy(() => import('./pages/v2/partner/PartnerDashboard'));
const PartnerQR = lazy(() => import('./pages/v2/partner/PartnerQR'));
const PartnerBookings = lazy(() => import('./pages/v2/partner/PartnerBookings'));
const PartnerReports = lazy(() => import('./pages/v2/partner/PartnerReports'));

// Solutions Pages
const ForHotelsPage = lazy(() => import('./pages/solutions/ForHotelsPage'));
const ForFamiliesPage = lazy(() => import('./pages/solutions/ForFamiliesPage'));
const ForSpecialistsPage = lazy(() => import('./pages/solutions/ForSpecialistsPage'));

// Info Pages
const AboutPage = lazy(() => import('./pages/info/AboutPage'));
const CareersPage = lazy(() => import('./pages/info/CareersPage'));
const PressPage = lazy(() => import('./pages/info/PressPage'));
const HelpCenterPage = lazy(() => import('./pages/info/HelpCenterPage'));
const PrivacyPage = lazy(() => import('./pages/info/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/info/TermsPage'));

// 404
const NotFound = lazy(() => import('./pages/NotFound'));

// ----------------------------------------
// Loading Spinner
// ----------------------------------------
function PageLoader() {
  return (
    <div className="page-spinner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <BrandLogo size="md" />
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
}

// ----------------------------------------
// Protected Route
// ----------------------------------------
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('parent' | 'sitter' | 'partner' | 'admin')[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const roleRedirects: Record<string, string> = {
      partner: '/partner',
      parent: '/',
      sitter: '/sitter',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
}

// ----------------------------------------
// Scroll to top on route change
// ----------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ----------------------------------------
// App Routes
// ----------------------------------------
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public — Booking funnel */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sitters/:id" element={<SitterProfilePage />} />
        <Route path="/book/:sitterId" element={<BookingPage />} />
        <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
        <Route path="/booking/:id" element={<BookingDetailPage />} />
        <Route path="/review/:bookingId" element={<ReviewPage />} />

        {/* Sitter Dashboard */}
        <Route path="/sitter" element={<ProtectedRoute allowedRoles={['sitter']}><SitterDashboard /></ProtectedRoute>} />
        <Route path="/sitter/profile" element={<ProtectedRoute allowedRoles={['sitter']}><SitterProfileEdit /></ProtectedRoute>} />
        <Route path="/sitter/pricing" element={<ProtectedRoute allowedRoles={['sitter']}><SitterPricing /></ProtectedRoute>} />
        <Route path="/sitter/availability" element={<ProtectedRoute allowedRoles={['sitter']}><SitterAvailability /></ProtectedRoute>} />
        <Route path="/sitter/requests" element={<ProtectedRoute allowedRoles={['sitter']}><SitterRequests /></ProtectedRoute>} />
        <Route path="/sitter/active" element={<ProtectedRoute allowedRoles={['sitter']}><SitterActiveSession /></ProtectedRoute>} />
        <Route path="/sitter/earnings" element={<ProtectedRoute allowedRoles={['sitter']}><SitterEarnings /></ProtectedRoute>} />
        <Route path="/sitter/reviews" element={<ProtectedRoute allowedRoles={['sitter']}><SitterMyReviews /></ProtectedRoute>} />

        {/* Partner Console */}
        <Route path="/partner" element={<ProtectedRoute allowedRoles={['partner']}><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/partner/qr" element={<ProtectedRoute allowedRoles={['partner']}><PartnerQR /></ProtectedRoute>} />
        <Route path="/partner/bookings" element={<ProtectedRoute allowedRoles={['partner']}><PartnerBookings /></ProtectedRoute>} />
        <Route path="/partner/reports" element={<ProtectedRoute allowedRoles={['partner']}><PartnerReports /></ProtectedRoute>} />

        {/* Solutions Pages */}
        <Route path="/solutions/hotels" element={<ForHotelsPage />} />
        <Route path="/solutions/families" element={<ForFamiliesPage />} />
        <Route path="/solutions/specialists" element={<ForSpecialistsPage />} />

        {/* Info Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// ----------------------------------------
// Main App Component
// ----------------------------------------
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
              <DemoBanner />
              <InstallBanner />
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
