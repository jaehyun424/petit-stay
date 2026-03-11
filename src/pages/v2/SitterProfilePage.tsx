import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar } from 'lucide-react';
import { sitterProfiles } from '../../data/v2-demo-sitters';
import { BrandLogo } from '../../components/common/BrandLogo';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { ProfileHeader } from './sitter-profile/ProfileHeader';
import { VerificationBadges } from './sitter-profile/VerificationBadges';
import { ExperienceSection } from './sitter-profile/ExperienceSection';
import { PricingSection } from './sitter-profile/PricingSection';
import { ReviewList } from './sitter-profile/ReviewList';
import { StatsSection } from './sitter-profile/StatsSection';
import '../../styles/pages/v2-sitter-profile.css';

export default function SitterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sitter = id ? sitterProfiles[id] : undefined;

  if (!sitter) {
    return (
      <div className="sp-page">
        <div className="sp-not-found">
          <h2>{t('sitterProfile.notFound')}</h2>
          <Link to="/search" className="sp-back-link">{t('sitterProfile.backToSearch')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* Nav */}
      <nav className="sp-nav">
        <div className="sp-nav-inner">
          <div className="sp-nav-left">
            <button className="sp-back-btn" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="sp-nav-logo">
              <BrandLogo size="sm" showName />
            </Link>
          </div>
          <div className="sp-nav-actions">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="sp-content">
        <div className="sp-main">
          <ProfileHeader sitter={sitter} />
          <VerificationBadges sitter={sitter} />
          <ExperienceSection sitter={sitter} />
          <PricingSection sitter={sitter} />
          <StatsSection sitter={sitter} />
          <ReviewList sitter={sitter} />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sp-cta-bar">
        <div className="sp-cta-inner">
          <div className="sp-cta-price">
            <span className="sp-cta-amount">₩{sitter.hourlyRate.toLocaleString()}</span>
            <span className="sp-cta-unit">/{t('search.perHour')}</span>
          </div>
          <Link to={`/book/${sitter.id}`} className="sp-cta-btn">
            <Calendar size={18} />
            {t('sitterProfile.bookThis')}
          </Link>
        </div>
      </div>
    </div>
  );
}
