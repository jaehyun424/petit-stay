// ============================================
// Petit Stay - Ops Console Layout
// ============================================

import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Users, Building2, Wallet, AlertTriangle,
  BarChart3, Shield, Menu, Sun, Moon, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/hotel-layout.css';
import '../../styles/ops-layout.css';

export function OpsLayout() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/ops', icon: <LayoutDashboard size={20} strokeWidth={1.75} />, labelKey: 'ops.dashboard', end: true },
    { to: '/ops/reservations', icon: <Calendar size={20} strokeWidth={1.75} />, labelKey: 'ops.reservations' },
    { to: '/ops/sitters', icon: <Users size={20} strokeWidth={1.75} />, labelKey: 'ops.sitterManagement' },
    { to: '/ops/hotels', icon: <Building2 size={20} strokeWidth={1.75} />, labelKey: 'ops.hotelManagement' },
    { to: '/ops/settlements', icon: <Wallet size={20} strokeWidth={1.75} />, labelKey: 'ops.settlements' },
    { to: '/ops/issues', icon: <AlertTriangle size={20} strokeWidth={1.75} />, labelKey: 'ops.issues' },
    { to: '/ops/insurance', icon: <Shield size={20} strokeWidth={1.75} />, labelKey: 'ops.insurance' },
    { to: '/ops/reports', icon: <BarChart3 size={20} strokeWidth={1.75} />, labelKey: 'ops.reports' },
  ];

  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || navItems[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="ops-layout">
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BrandLogo size="sm" showName={!sidebarCollapsed} />
            {!sidebarCollapsed && <span className="ops-badge">OPS</span>}
          </div>
          <IconButton
            icon={<Menu size={20} strokeWidth={1.75} />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={t('aria.toggleSidebar')}
            className="sidebar-toggle desktop-only"
          />
        </div>

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

        <div className="sidebar-footer">
          <IconButton
            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
            onClick={toggleTheme}
            aria-label={t('aria.toggleTheme')}
          />
          <LanguageSwitcher />
          <IconButton
            icon={<LogOut size={20} strokeWidth={1.75} />}
            onClick={handleSignOut}
            aria-label={t('aria.signOut')}
          />
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <IconButton
            icon={<Menu size={20} strokeWidth={1.75} />}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={t('aria.openMenu')}
            className="mobile-menu-btn"
          />
          <nav className="ops-breadcrumb" aria-label="Breadcrumb">
            <span className="ops-breadcrumb-root">{t('ops.title')}</span>
            <ChevronRight size={14} strokeWidth={1.75} />
            <span className="ops-breadcrumb-current">{t(currentNav.labelKey)}</span>
          </nav>
          <div className="header-spacer" />
          <div className="header-user">
            <NotificationBell />
            <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
            <Avatar name={`${user?.profile.firstName} ${user?.profile.lastName}`} size="sm" />
          </div>
        </header>

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
