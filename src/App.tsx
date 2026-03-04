// ============================================
// Petit Stay - Main App Router
// ============================================

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HotelLayout } from './components/layout/HotelLayout';
import { ParentLayout } from './components/layout/ParentLayout';
import { SitterLayout } from './components/layout/SitterLayout';
import { OpsLayout } from './components/layout/OpsLayout';
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

// Hotel Console
const HotelDashboard = lazy(() => import('./pages/hotel/Dashboard'));
const HotelBookings = lazy(() => import('./pages/hotel/Bookings'));
const HotelLiveMonitor = lazy(() => import('./pages/hotel/LiveMonitor'));
const HotelSitters = lazy(() => import('./pages/hotel/SitterManagement'));
const HotelReports = lazy(() => import('./pages/hotel/Reports'));
const HotelSafety = lazy(() => import('./pages/hotel/SafetyDashboard'));
const HotelSettings = lazy(() => import('./pages/hotel/Settings'));
const HotelScanCheckIn = lazy(() => import('./pages/hotel/ScanCheckIn'));

// Parent App
const ParentHome = lazy(() => import('./pages/parent/Home'));
const ParentBooking = lazy(() => import('./pages/parent/Booking'));
const ParentTrustCheckIn = lazy(() => import('./pages/parent/TrustCheckIn'));
const ParentLiveStatus = lazy(() => import('./pages/parent/LiveStatus'));
const ParentHistory = lazy(() => import('./pages/parent/History'));
const ParentProfile = lazy(() => import('./pages/parent/Profile'));
const ParentQRDisplay = lazy(() => import('./pages/parent/QRDisplay'));

// Sitter App
const SitterSchedule = lazy(() => import('./pages/sitter/Schedule'));
const SitterActiveSession = lazy(() => import('./pages/sitter/ActiveSession'));
const SitterEarnings = lazy(() => import('./pages/sitter/Earnings'));
const SitterProfile = lazy(() => import('./pages/sitter/Profile'));
const SitterOnboarding = lazy(() => import('./pages/sitter/Onboarding'));

// Guest (no auth required)
const GuestPage = lazy(() => import('./pages/guest/GuestPage'));

// Ops Console
const OpsDashboard = lazy(() => import('./pages/ops/Dashboard'));
const OpsReservations = lazy(() => import('./pages/ops/Reservations'));
const OpsSitters = lazy(() => import('./pages/ops/SitterManagement'));
const OpsHotels = lazy(() => import('./pages/ops/HotelManagement'));
const OpsSettlements = lazy(() => import('./pages/ops/Settlements'));
const OpsIssues = lazy(() => import('./pages/ops/Issues'));
const OpsInsurance = lazy(() => import('./pages/ops/Insurance'));
const OpsReports = lazy(() => import('./pages/ops/Reports'));

// Common
const NotificationInbox = lazy(() => import('./pages/common/NotificationInbox'));

// Info Pages
const AboutPage = lazy(() => import('./pages/info/AboutPage'));
const CareersPage = lazy(() => import('./pages/info/CareersPage'));
const PressPage = lazy(() => import('./pages/info/PressPage'));
const HelpCenterPage = lazy(() => import('./pages/info/HelpCenterPage'));
const PrivacyPage = lazy(() => import('./pages/info/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/info/TermsPage'));

// Solutions Pages
const ForHotelsPage = lazy(() => import('./pages/solutions/ForHotelsPage'));
const ForFamiliesPage = lazy(() => import('./pages/solutions/ForFamiliesPage'));
const ForSpecialistsPage = lazy(() => import('./pages/solutions/ForSpecialistsPage'));

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
  allowedRoles?: ('parent' | 'sitter' | 'hotel_staff' | 'admin')[];
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
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<string, string> = {
      hotel_staff: '/hotel',
      admin: '/ops',
      parent: '/parent',
      sitter: '/sitter',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
}

// ----------------------------------------
// App Routes
// ----------------------------------------
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Hotel Console Routes */}
        <Route
          path="/hotel"
          element={
            <ProtectedRoute allowedRoles={['hotel_staff', 'admin']}>
              <HotelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HotelDashboard />} />
          <Route path="bookings" element={<HotelBookings />} />
          <Route path="live" element={<HotelLiveMonitor />} />
          <Route path="sitters" element={<HotelSitters />} />
          <Route path="reports" element={<HotelReports />} />
          <Route path="safety" element={<HotelSafety />} />
          <Route path="settings" element={<HotelSettings />} />
          <Route path="scan" element={<HotelScanCheckIn />} />
          <Route path="notifications" element={<NotificationInbox />} />
        </Route>

        {/* Parent App Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentHome />} />
          <Route path="book" element={<ParentBooking />} />
          <Route path="trust-checkin/:bookingId" element={<ParentTrustCheckIn />} />
          <Route path="live/:bookingId" element={<ParentLiveStatus />} />
          <Route path="history" element={<ParentHistory />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route path="qr/:bookingId" element={<ParentQRDisplay />} />
          <Route path="notifications" element={<NotificationInbox />} />
        </Route>

        {/* Sitter App Routes */}
        <Route
          path="/sitter"
          element={
            <ProtectedRoute allowedRoles={['sitter']}>
              <SitterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SitterSchedule />} />
          <Route path="active" element={<SitterActiveSession />} />
          <Route path="earnings" element={<SitterEarnings />} />
          <Route path="profile" element={<SitterProfile />} />
          <Route path="onboarding" element={<SitterOnboarding />} />
          <Route path="notifications" element={<NotificationInbox />} />
        </Route>

        {/* Guest Page (no auth required, token-based) */}
        <Route path="/guest/:reservationId" element={<GuestPage />} />

        {/* Ops Console Routes */}
        <Route
          path="/ops"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OpsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OpsDashboard />} />
          <Route path="reservations" element={<OpsReservations />} />
          <Route path="sitters" element={<OpsSitters />} />
          <Route path="hotels" element={<OpsHotels />} />
          <Route path="settlements" element={<OpsSettlements />} />
          <Route path="issues" element={<OpsIssues />} />
          <Route path="insurance" element={<OpsInsurance />} />
          <Route path="reports" element={<OpsReports />} />
        </Route>

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

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
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
