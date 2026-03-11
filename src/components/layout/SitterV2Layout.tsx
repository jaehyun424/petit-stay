import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home, Inbox, Play, Wallet, User } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import '../../styles/pages/v2-sitter.css';

interface SitterV2LayoutProps {
  children: ReactNode;
  title: string;
  titleKo: string;
  subtitle?: string;
  subtitleKo?: string;
  showBack?: boolean;
  pendingRequests?: number;
}

export function SitterV2Layout({
  children,
  title,
  titleKo,
  subtitle,
  subtitleKo,
  showBack = false,
  pendingRequests = 0,
}: SitterV2LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const tabs = [
    { path: '/sitter', icon: Home, label: 'Home', labelKo: '홈' },
    { path: '/sitter/requests', icon: Inbox, label: 'Requests', labelKo: '요청', badge: pendingRequests },
    { path: '/sitter/active', icon: Play, label: 'Session', labelKo: '세션' },
    { path: '/sitter/earnings', icon: Wallet, label: 'Earnings', labelKo: '수입' },
    { path: '/sitter/profile', icon: User, label: 'Profile', labelKo: '프로필' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="st-layout">
      {/* Top nav */}
      <nav className="st-nav">
        <div className="st-nav-inner">
          <div className="st-nav-left">
            {showBack && (
              <button className="st-back-btn" onClick={() => navigate('/sitter')} aria-label="Back">
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/sitter" className="st-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="st-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="st-header">
        <h1 className="st-title">{isKo ? titleKo : title}</h1>
        {(subtitle || subtitleKo) && (
          <p className="st-subtitle">{isKo ? subtitleKo : subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="st-content">
        {children}
      </div>

      {/* Bottom tabs */}
      <div className="st-bottom-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`st-tab ${active ? 'active' : ''}`}
            >
              <span className="st-tab-icon">
                <Icon size={20} />
              </span>
              {isKo ? tab.labelKo : tab.label}
              {tab.badge ? <span className="st-tab-badge">{tab.badge}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
