import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home, QrCode, CalendarDays, FileText } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import '../../styles/pages/v2-partner.css';

interface PartnerV2LayoutProps {
  children: ReactNode;
  title: string;
  titleKo: string;
  subtitle?: string;
  subtitleKo?: string;
  showBack?: boolean;
}

export function PartnerV2Layout({
  children,
  title,
  titleKo,
  subtitle,
  subtitleKo,
  showBack = false,
}: PartnerV2LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const tabs = [
    { path: '/partner', icon: Home, label: 'Home', labelKo: '홈' },
    { path: '/partner/qr', icon: QrCode, label: 'QR', labelKo: 'QR' },
    { path: '/partner/bookings', icon: CalendarDays, label: 'Bookings', labelKo: '예약' },
    { path: '/partner/reports', icon: FileText, label: 'Reports', labelKo: '리포트' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="pt-layout">
      {/* Top nav */}
      <nav className="pt-nav">
        <div className="pt-nav-inner">
          <div className="pt-nav-left">
            {showBack && (
              <button className="pt-back-btn" onClick={() => navigate('/partner')} aria-label="Back">
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/partner" className="pt-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="pt-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-header">
        <h1 className="pt-title">{isKo ? titleKo : title}</h1>
        {(subtitle || subtitleKo) && (
          <p className="pt-subtitle">{isKo ? subtitleKo : subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="pt-content">
        {children}
      </div>

      {/* Bottom tabs */}
      <div className="pt-bottom-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`pt-tab ${active ? 'active' : ''}`}
            >
              <span className="pt-tab-icon">
                <Icon size={20} />
              </span>
              {isKo ? tab.labelKo : tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
