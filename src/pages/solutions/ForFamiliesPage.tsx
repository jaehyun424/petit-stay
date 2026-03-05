import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Globe, Camera, Clock, ArrowRight,
  Heart, Star, MapPin,
} from 'lucide-react';
import { LandingNav } from '../landing/components/LandingNav';
import { LandingFooter } from '../landing/components/LandingFooter';
import { ScrollReveal } from '../landing/components/ScrollReveal';
import '../../styles/pages/solutions.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export default function ForFamiliesPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const trustItems = [
    { icon: <ShieldCheck size={24} />, titleKey: 'solutions.famTrust1Title', descKey: 'solutions.famTrust1Desc' },
    { icon: <Camera size={24} />, titleKey: 'solutions.famTrust2Title', descKey: 'solutions.famTrust2Desc' },
    { icon: <Clock size={24} />, titleKey: 'solutions.famTrust3Title', descKey: 'solutions.famTrust3Desc' },
    { icon: <Globe size={24} />, titleKey: 'solutions.famTrust4Title', descKey: 'solutions.famTrust4Desc' },
  ];

  const scenarios = [
    { icon: <Heart size={28} />, titleKey: 'solutions.famScene1Title', descKey: 'solutions.famScene1Desc' },
    { icon: <MapPin size={28} />, titleKey: 'solutions.famScene2Title', descKey: 'solutions.famScene2Desc' },
    { icon: <Star size={28} />, titleKey: 'solutions.famScene3Title', descKey: 'solutions.famScene3Desc' },
  ];

  return (
    <div className="solutions-page">
      <LandingNav />

      {/* Hero */}
      <section className="solutions-hero">
        <img src={HERO_IMG} alt="" className="solutions-hero-bg" loading="eager" />
        <div className="solutions-hero-overlay" />
        <motion.div className="solutions-hero-content" variants={fadeUp} initial="hidden" animate="show">
          <span className="solutions-hero-eyebrow">{t('solutions.famEyebrow')}</span>
          <h1 className="solutions-hero-title">{t('solutions.famTitle')}</h1>
          <p className="solutions-hero-subtitle">{t('solutions.famSubtitle')}</p>
        </motion.div>
      </section>

      {/* Trust elements */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-section-header">
            <h2>{t('solutions.famTrustTitle')}</h2>
          </div>
        </ScrollReveal>
        <div className="solutions-cards solutions-cards--4">
          {trustItems.map((item, i) => (
            <ScrollReveal key={item.titleKey} delay={i * 0.1}>
              <div className="solutions-card solutions-card--uniform">
                <div className="solutions-card-icon">{item.icon}</div>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.descKey)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="solutions-section-alt">
        <div className="solutions-section">
          <ScrollReveal>
            <div className="solutions-section-header">
              <h2>{t('solutions.famSceneTitle')}</h2>
              <p>{t('solutions.famSceneSubtitle')}</p>
            </div>
          </ScrollReveal>
          <div className="solutions-cards solutions-cards--3">
            {scenarios.map((item, i) => (
              <ScrollReveal key={item.titleKey} delay={i * 0.1}>
                <div className="solutions-card solutions-card--uniform solutions-card--centered">
                  <div className="solutions-card-icon">{item.icon}</div>
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.descKey)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-section-header">
            <h2>{t('solutions.famProcessTitle')}</h2>
          </div>
        </ScrollReveal>
        <div className="solutions-cards solutions-cards--3">
          {(['solutions.famStep1', 'solutions.famStep2', 'solutions.famStep3'] as const).map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div className="solutions-card solutions-card--uniform solutions-card--centered">
                <span className="solutions-step-number">0{i + 1}</span>
                <h3>{t(`${key}Title`)}</h3>
                <p>{t(`${key}Desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="solutions-section">
        <div className="solutions-cta">
          <h2>{t('solutions.famCtaTitle')}</h2>
          <p>{t('solutions.famCtaSubtitle')}</p>
          <Link to="/register?role=parent" className="solutions-cta-btn">
            {t('solutions.famCtaBtn')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
