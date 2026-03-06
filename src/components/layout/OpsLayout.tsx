// ============================================
// Petit Stay - Ops Console Layout
// Desktop: sidebar + content | Mobile: header + bottom nav
// (Unified with Parent/Sitter pattern)
// ============================================

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Users, Building2, Wallet, AlertTriangle,
  BarChart3, Shield, Menu, X, Sun, Moon, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/layout/hotel.css';
import '../../styles/layout/ops.css';

function getPageTitle(pathname: string, t: (key: string) => string): string {
    if (pathname === '/ops') return t('ops.dashboard');
    if (pathname.includes('/ops/reservations')) return t('ops.reservations');
    if (pathname.includes('/ops/sitters')) return t('ops.sitterManagement');
    if (pathname.includes('/ops/hotels')) return t('ops.hotelManagement');
    if (pathname.includes('/ops/settlements')) return t('ops.settlements');
    if (pathname.includes('/ops/issues')) return t('ops.issues');
    if (pathname.includes('/ops/insurance')) return t('ops.insurance');
    if (pathname.includes('/ops/reports')) return t('ops.reports');
    return t('ops.dashboard');
}

export function OpsLayout() {
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

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

    // Bottom nav: 4 primary items (matching Parent/Sitter pattern)
    // Remaining items accessible via sidebar
    const bottomNavItems = [
        navItems[0], // Dashboard
        navItems[1], // Reservations
        navItems[2], // Sitters
        navItems[4], // Settlements
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="ops-layout">
            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`ops-sidebar sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
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

            {/* Main area */}
            <div className="ops-main-area">
                {/* Mobile header */}
                <header className="ops-header">
                    <div className="ops-header-logo">
                        <IconButton
                            icon={<Menu size={20} strokeWidth={1.75} />}
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label={t('aria.openMenu')}
                            className="ops-mobile-menu-btn"
                        />
                        <BrandLogo size="sm" showName />
                    </div>
                    <div className="ops-header-right">
                        <LanguageSwitcher />
                        <NotificationBell />
                        <IconButton
                            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                            onClick={toggleTheme}
                            aria-label={t('aria.toggleTheme')}
                        />
                    </div>
                </header>

                {/* Desktop top bar */}
                <header className="ops-desktop-header">
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

                {/* Main Content */}
                <main className="ops-content">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>

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
            </nav>
        </div>
    );
}
