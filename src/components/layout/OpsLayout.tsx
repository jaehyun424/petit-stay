// ============================================
// Petit Stay - Ops Console Layout
// ============================================

import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Users, Building2, Wallet, AlertTriangle,
  BarChart3, Shield, Menu, X, Sun, Moon, LogOut, ChevronRight, MoreHorizontal,
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
import '../../styles/layout/hotel.css';
import '../../styles/layout/ops.css';

export function OpsLayout() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "more" menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  // Close "more" menu on route change
  useEffect(() => { setMoreMenuOpen(false); }, [location.pathname]);

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

  const bottomNavItems = navItems.slice(0, 5); // First 5 items
  const moreNavItems = navItems.slice(5); // Issues, Insurance, Reports
  const isMoreActive = moreNavItems.some((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

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
          <IconButton
            icon={<X size={20} strokeWidth={1.75} />}
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t('aria.closeMenu', 'Close menu')}
            className="sidebar-close-btn mobile-only-btn"
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
          <IconButton
            icon={<LogOut size={20} strokeWidth={1.75} />}
            onClick={handleSignOut}
            aria-label={t('aria.signOut')}
          />
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="mobile-brand-logo">
            <BrandLogo size="sm" showName />
          </div>
          <nav className="ops-breadcrumb" aria-label="Breadcrumb">
            <span className="ops-breadcrumb-root">{t('ops.title')}</span>
            <ChevronRight size={14} strokeWidth={1.75} />
            <span className="ops-breadcrumb-current">{t(currentNav.labelKey)}</span>
          </nav>
          <div className="header-spacer" />
          <div className="header-user">
            <LanguageSwitcher />
            <NotificationBell />
            <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
            <Avatar name={`${user?.profile.firstName} ${user?.profile.lastName}`} size="sm" />
            <IconButton
              icon={<LogOut size={18} strokeWidth={1.75} />}
              onClick={handleSignOut}
              aria-label={t('aria.signOut')}
            />
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

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav ops-mobile-only">
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
        {/* "More" tab for Insurance, Reports, Issues */}
        <div className="bottom-nav-more-wrapper" ref={moreMenuRef}>
          <button
            className={`bottom-nav-item ${isMoreActive ? 'bottom-nav-item-active' : ''}`}
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          >
            <span className="bottom-nav-icon"><MoreHorizontal size={20} strokeWidth={1.75} /></span>
            <span className="bottom-nav-label">{t('common.more', 'More')}</span>
          </button>
          {moreMenuOpen && (
            <div className="ops-more-menu">
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `ops-more-menu-item ${isActive ? 'ops-more-menu-item-active' : ''}`
                  }
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <span className="ops-more-menu-icon">{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
