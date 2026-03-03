import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <span className="landing-footer-logo">
            Petit<span className="text-gold">Stay</span>
          </span>
          <p className="landing-footer-tagline">{t('landing.footerTagline')}</p>
        </div>

        <div className="landing-footer-links">
          <div className="landing-footer-col">
            <h4>{t('landing.footerProduct')}</h4>
            <Link to="/register">{t('landing.footerForHotels')}</Link>
            <Link to="/register">{t('landing.footerForFamilies')}</Link>
            <Link to="/register">{t('landing.footerForSitters')}</Link>
          </div>
          <div className="landing-footer-col">
            <h4>{t('landing.footerCompany')}</h4>
            <Link to="/about">{t('landing.footerAbout')}</Link>
            <Link to="/careers">{t('landing.footerCareers')}</Link>
            <Link to="/press">{t('landing.footerPress')}</Link>
          </div>
          <div className="landing-footer-col">
            <h4>{t('landing.footerSupport')}</h4>
            <Link to="/help">{t('landing.footerHelp')}</Link>
            <Link to="/privacy">{t('landing.footerPrivacy')}</Link>
            <Link to="/terms">{t('landing.footerTerms')}</Link>
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>&copy; 2026 Petit Stay. {t('landing.footerCopyright')}</p>
      </div>
    </footer>
  );
}
