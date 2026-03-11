import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../../../components/common/LanguageSwitcher';
import { BrandLogo } from '../../../components/common/BrandLogo';

export function LandingNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <div className="landing-nav-inner">
          <Link to="/" className="landing-nav-logo">
            <BrandLogo size="sm" showName />
          </Link>

          {/* Desktop links */}
          <div className="landing-nav-links">
            <button onClick={() => scrollTo('how-it-works')}>{t('landing.navHowItWorks')}</button>
            <button onClick={() => scrollTo('sitters')}>{t('landing.navReviews')}</button>
            <LanguageSwitcher />
            <Link to="/login" className="landing-nav-cta">{t('landing.navSignIn')}</Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`landing-nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('aria.toggleMenu')}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay + drawer — must be outside nav to avoid backdrop-filter containing block */}
      {mobileOpen && (
        <>
          <div className="landing-nav-mobile-overlay" onClick={() => setMobileOpen(false)} />
          <motion.div
            className="landing-nav-mobile"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          >
            <div className="landing-nav-mobile-header">
              <BrandLogo size="sm" showName />
              <button
                className="landing-nav-mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="landing-nav-mobile-scroll">
              <button onClick={() => scrollTo('how-it-works')}>{t('landing.navHowItWorks')}</button>
              <button onClick={() => scrollTo('sitters')}>{t('landing.navReviews')}</button>
              <button onClick={() => scrollTo('testimonials')}>{t('landing.testimonialsEyebrow')}</button>
              <LanguageSwitcher />
            </div>
            <div className="landing-nav-mobile-footer">
              <Link to="/login" className="landing-nav-cta" onClick={() => setMobileOpen(false)}>
                {t('landing.navSignIn')}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
