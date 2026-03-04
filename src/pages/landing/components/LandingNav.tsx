import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../../../components/common/LanguageSwitcher';
import { BrandLogo } from '../../../components/common/BrandLogo';

export function LandingNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
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
          <button onClick={() => scrollTo('features')}>{t('landing.navFeatures')}</button>
          <button onClick={() => scrollTo('how-it-works')}>{t('landing.navHowItWorks')}</button>
          <button onClick={() => scrollTo('testimonials')}>{t('landing.navReviews')}</button>
          <LanguageSwitcher />
          <Link to="/login" className="landing-nav-cta">{t('landing.navSignIn')}</Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="landing-nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('aria.toggleMenu')}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="landing-nav-mobile"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <button onClick={() => scrollTo('features')}>{t('landing.navFeatures')}</button>
          <button onClick={() => scrollTo('how-it-works')}>{t('landing.navHowItWorks')}</button>
          <button onClick={() => scrollTo('testimonials')}>{t('landing.navReviews')}</button>
          <LanguageSwitcher />
          <Link to="/login" className="landing-nav-cta">{t('landing.navSignIn')}</Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
