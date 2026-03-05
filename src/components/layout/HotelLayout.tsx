// ============================================
// Petit Stay - Hotel Layout (Sidebar + Content)
// ============================================

import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Radio, Users, FileText, QrCode,
  ShieldCheck, Settings, Menu, X, Sun, Moon, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWhiteLabel } from '../../hooks/useWhiteLabel';
import { IconButton } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/hotel-layout.css';

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="hotel-layout">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {branding.logoUrl ? (
              <div className="sidebar-brand-logo">
                <img src={branding.logoUrl} alt={branding.hotelName} className="sidebar-brand-img" />
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

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <IconButton
            icon={<Menu size={20} strokeWidth={1.75} />}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('aria.openMenu')}
            className="mobile-menu-btn"
          />
          <div className="header-spacer" />
          <div className="header-user">
            <LanguageSwitcher />
            <NotificationBell />
            <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
            <Avatar name={`${user?.profile.firstName} ${user?.profile.lastName}`} size="sm" />
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
