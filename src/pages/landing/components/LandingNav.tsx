import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from '../../../components/common/LanguageSwitcher';
import { BrandLogo } from '../../../components/common/BrandLogo';

export function LandingNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

          {/* Solutions dropdown */}
          <div className="landing-nav-dropdown-wrap" ref={dropdownRef}>
            <button
              className="landing-nav-dropdown-trigger"
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              aria-expanded={solutionsOpen}
            >
              {t('solutions.navSolutions')} <ChevronDown size={14} />
            </button>
            {solutionsOpen && (
              <div className="landing-nav-dropdown">
                <Link to="/solutions/hotels" onClick={() => setSolutionsOpen(false)}>
                  {t('solutions.navForHotels')}
                </Link>
                <Link to="/solutions/families" onClick={() => setSolutionsOpen(false)}>
                  {t('solutions.navForFamilies')}
                </Link>
                <Link to="/solutions/specialists" onClick={() => setSolutionsOpen(false)}>
                  {t('solutions.navForSpecialists')}
                </Link>
              </div>
            )}
          </div>

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
          <div className="landing-nav-mobile-solutions">
            <span className="landing-nav-mobile-solutions-label">{t('solutions.navSolutions')}</span>
            <Link to="/solutions/hotels" onClick={() => setMobileOpen(false)}>
              {t('solutions.navForHotels')}
            </Link>
            <Link to="/solutions/families" onClick={() => setMobileOpen(false)}>
              {t('solutions.navForFamilies')}
            </Link>
            <Link to="/solutions/specialists" onClick={() => setMobileOpen(false)}>
              {t('solutions.navForSpecialists')}
            </Link>
          </div>
          <button onClick={() => scrollTo('how-it-works')}>{t('landing.navHowItWorks')}</button>
          <button onClick={() => scrollTo('testimonials')}>{t('landing.navReviews')}</button>
          <LanguageSwitcher />
          <Link to="/login" className="landing-nav-cta">{t('landing.navSignIn')}</Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
