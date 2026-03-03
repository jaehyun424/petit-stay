// ============================================
// Petit Stay - Parent App Layout
// Desktop: sidebar + content | Mobile: header + bottom nav
// ============================================

import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Layers, Clock, User, Sun, Moon, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/parent-layout.css';
import '../../styles/hotel-layout.css';

export function ParentLayout() {
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/parent', icon: <Home size={22} strokeWidth={1.75} />, labelKey: 'nav.home', end: true },
        { to: '/parent/book', icon: <Layers size={22} strokeWidth={1.75} />, labelKey: 'nav.book' },
        { to: '/parent/history', icon: <Clock size={22} strokeWidth={1.75} />, labelKey: 'nav.history' },
        { to: '/parent/profile', icon: <User size={22} strokeWidth={1.75} />, labelKey: 'nav.profile' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="parent-layout">
            {/* Desktop sidebar overlay (mobile) */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`parent-sidebar sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <BrandLogo size="sm" />
                        {!sidebarCollapsed && <span className="sidebar-logo-text">Petit<span className="text-gold">Stay</span></span>}
                    </div>
                    <IconButton
                        icon={<Menu size={20} strokeWidth={1.75} />}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label="Toggle sidebar"
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
                        aria-label="Toggle theme"
                    />
                    <LanguageSwitcher />
                    <IconButton
                        icon={<LogOut size={20} strokeWidth={1.75} />}
                        onClick={handleSignOut}
                        aria-label="Sign out"
                    />
                </div>
            </aside>

            {/* Desktop header (inside main content area) */}
            <div className="parent-main-area">
                {/* Mobile header */}
                <header className="parent-header">
                    <div className="parent-header-logo">
                        <IconButton
                            icon={<Menu size={20} strokeWidth={1.75} />}
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                            className="parent-mobile-menu-btn"
                        />
                        <BrandLogo size="sm" />
                        <span className="parent-header-brand">Petit<span className="text-gold">Stay</span></span>
                    </div>
                    <div className="parent-header-right">
                        <NotificationBell />
                        <LanguageSwitcher />
                        <IconButton
                            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        />
                    </div>
                </header>

                {/* Desktop top bar */}
                <header className="parent-desktop-header">
                    <IconButton
                        icon={<Menu size={20} strokeWidth={1.75} />}
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                        className="mobile-menu-btn"
                    />
                    <div className="header-spacer" />
                    <div className="header-user">
                        <NotificationBell />
                        <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="parent-content">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>

            {/* Bottom Navigation (mobile only) */}
            <nav className="bottom-nav mobile-only">
                {navItems.map((item) => (
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
