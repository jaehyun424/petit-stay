// ============================================
// Petit Stay - Auth Layout (Login/Register)
// ============================================

import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';

// Component
export function AuthLayout() {
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="auth-layout">
            {/* Theme toggle */}
            <div className="auth-theme-toggle">
                <IconButton
                    icon={isDark ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
                    onClick={toggleTheme}
                    aria-label={t('aria.toggleTheme')}
                />
            </div>

            {/* Content */}
            <div className="auth-content">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <BrandLogo size="lg" />
                    </div>
                    <h1 className="auth-logo-text">
                        Petit<span className="text-gold">Stay</span>
                    </h1>
                    <p className="auth-logo-tagline">{t('auth.tagline')}</p>
                </div>

                <div className="auth-card">
                    <Outlet />
                </div>

                <footer className="auth-footer">
                    <p>{t('auth.copyright')}</p>
                </footer>
            </div>
        </div>
    );
}
