// ============================================
// Petit Stay - Sitter App Layout
// Desktop: sidebar + content | Mobile: header + bottom nav
// ============================================

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, DollarSign, User, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../common/Button';
import { TierBadge } from '../common/Badge';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { PageTransition } from '../common/PageTransition';
import { AnimatePresence } from 'framer-motion';
import '../../styles/sitter-layout.css';
import '../../styles/hotel-layout.css';

function getPageTitle(pathname: string, t: (key: string) => string): string {
    if (pathname === '/sitter') return t('nav.schedule');
    if (pathname.includes('/sitter/active')) return t('nav.active');
    if (pathname.includes('/sitter/earnings')) return t('nav.earnings');
    if (pathname.includes('/sitter/profile')) return t('nav.profile');
    return t('nav.schedule');
}

export function SitterLayout() {
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const navItems = [
        { to: '/sitter', icon: <Calendar size={22} strokeWidth={1.75} />, labelKey: 'nav.schedule', end: true },
        { to: '/sitter/active', icon: <Clock size={22} strokeWidth={1.75} />, labelKey: 'nav.active' },
        { to: '/sitter/earnings', icon: <DollarSign size={22} strokeWidth={1.75} />, labelKey: 'nav.earnings' },
        { to: '/sitter/profile', icon: <User size={22} strokeWidth={1.75} />, labelKey: 'nav.profile' },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="sitter-layout">
            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Desktop sidebar */}
            <aside className={`sitter-sidebar sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <BrandLogo size="sm" showName={!sidebarCollapsed} />
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
            <div className="sitter-main-area">
                {/* Mobile header */}
                <header className="sitter-header">
                    <div className="sitter-header-left">
                        <BrandLogo size="sm" showName />
                    </div>
                    <div className="sitter-header-right">
                        <LanguageSwitcher />
                        <TierBadge tier="gold" showLabel={false} />
                        <NotificationBell />
                        <IconButton
                            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                            onClick={toggleTheme}
                            aria-label={t('aria.toggleTheme')}
                        />
                    </div>
                </header>

                {/* Desktop header */}
                <header className="sitter-desktop-header">
                    <h2 className="desktop-page-title">{getPageTitle(location.pathname, t)}</h2>
                    <div className="header-spacer" />
                    <div className="header-user">
                        <LanguageSwitcher />
                        <IconButton
                            icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                            onClick={toggleTheme}
                            aria-label={t('aria.toggleTheme')}
                        />
                        <TierBadge tier="gold" showLabel={false} />
                        <NotificationBell />
                        <span className="header-user-name">{user?.profile.firstName} {user?.profile.lastName}</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="sitter-content">
                    <AnimatePresence mode="wait">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>

            {/* Bottom Navigation (mobile only) */}
            <nav className="bottom-nav sitter-mobile-only">
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
