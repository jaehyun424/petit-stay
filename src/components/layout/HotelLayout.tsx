// ============================================
// Petit Stay - Hotel Layout (Concierge Console)
// Desktop: sidebar + content | Mobile: header + bottom nav
// ============================================

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Radio, Users, FileText, QrCode,
  ShieldCheck, Settings, Menu, X, Sun, Moon, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWhiteLabel } from '../../hooks/hotel/useWhiteLabel';
import { IconButton } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/layout/hotel.css';

function getPageTitle(pathname: string, t: (key: string) => string): string {
  if (pathname === '/hotel') return t('nav.dashboard');
  if (pathname.includes('/hotel/bookings')) return t('nav.bookings');
  if (pathname.includes('/hotel/live')) return t('nav.liveMonitor');
  if (pathname.includes('/hotel/sitters')) return t('nav.sitterManagement');
  if (pathname.includes('/hotel/reports')) return t('nav.reports');
  if (pathname.includes('/hotel/scan')) return t('nav.scanQR');
  if (pathname.includes('/hotel/safety')) return t('nav.safety');
  if (pathname.includes('/hotel/settings')) return t('nav.settings');
  return t('nav.dashboard');
}

// ----------------------------------------
// Component
// ----------------------------------------
export function HotelLayout() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useWhiteLabel(user?.hotelId);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navItems = [
    { to: '/hotel', icon: <LayoutDashboard size={20} strokeWidth={1.75} />, labelKey: 'nav.dashboard', end: true },
    { to: '/hotel/bookings', icon: <Calendar size={20} strokeWidth={1.75} />, labelKey: 'nav.bookings' },
    { to: '/hotel/live', icon: <Radio size={20} strokeWidth={1.75} />, labelKey: 'nav.liveMonitor' },
    { to: '/hotel/sitters', icon: <Users size={20} strokeWidth={1.75} />, labelKey: 'nav.sitterManagement' },
    { to: '/hotel/reports', icon: <FileText size={20} strokeWidth={1.75} />, labelKey: 'nav.reports' },
    { to: '/hotel/scan', icon: <QrCode size={20} strokeWidth={1.75} />, labelKey: 'nav.scanQR' },
    { to: '/hotel/safety', icon: <ShieldCheck size={20} strokeWidth={1.75} />, labelKey: 'nav.safety' },
    { to: '/hotel/settings', icon: <Settings size={20} strokeWidth={1.75} />, labelKey: 'nav.settings' },
  ];

  const bottomNavItems = [
    navItems[0], // Dashboard
    navItems[1], // Bookings
    navItems[2], // Live Monitor
    navItems[3], // Sitter Management
    navItems[7], // Settings
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="hotel-layout">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`hotel-sidebar sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {branding.logoUrl ? (
              <div className="sidebar-brand-logo">
                <img src={branding.logoUrl} alt={branding.hotelName} className="sidebar-brand-img" loading="lazy" />
                {!sidebarCollapsed && <span className="sidebar-brand-name">{branding.hotelName}</span>}
              </div>
            ) : (
              <BrandLogo size="sm" showName={!sidebarCollapsed} />
            )}
          </div>
          <IconButton
            icon={<Menu size={20} strokeWidth={1.75} />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={t('aria.toggleSidebar')}
            className="sidebar-toggle desktop-only"
          />
          <IconButton
            icon={<X size={20} strokeWidth={1.75} />}
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t('aria.closeMenu', 'Close menu')}
            className="sidebar-close-btn mobile-only-btn"
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-nav-label">{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <IconButton
            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
            onClick={toggleTheme}
            aria-label={t('aria.toggleTheme')}
          />
          <IconButton
            icon={<LogOut size={20} strokeWidth={1.75} />}
            onClick={handleSignOut}
            aria-label={t('aria.signOut')}
          />
        </div>
      </aside>

      {/* Main area */}
      <div className="hotel-main-area">
        {/* Mobile header */}
        <header className="hotel-header">
          <div className="hotel-header-left">
            <BrandLogo size="sm" showName />
          </div>
          <div className="hotel-header-right">
            <LanguageSwitcher />
            <NotificationBell />
            <IconButton
              icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
              onClick={toggleTheme}
              aria-label={t('aria.toggleTheme')}
            />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hotel-desktop-header">
          <h2 className="desktop-page-title">{getPageTitle(location.pathname, t)}</h2>
          <div className="header-spacer" />
          <div className="header-user">
            <LanguageSwitcher />
            <IconButton
              icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
              onClick={toggleTheme}
              aria-label={t('aria.toggleTheme')}
            />
            <NotificationBell />
            <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="hotel-content">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav hotel-mobile-only">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`
            }
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
