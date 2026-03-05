import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck, BarChart3, Headphones, ArrowRight,
  Calendar, Radio, FileText, Settings,
} from 'lucide-react';
import { LandingNav } from '../landing/components/LandingNav';
import { LandingFooter } from '../landing/components/LandingFooter';
import { ScrollReveal } from '../landing/components/ScrollReveal';
import '../../styles/pages/solutions.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export default function ForHotelsPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const painPoints = [
    { icon: <ShieldCheck size={24} />, titleKey: 'solutions.hotelPain1Title', descKey: 'solutions.hotelPain1Desc' },
    { icon: <Headphones size={24} />, titleKey: 'solutions.hotelPain2Title', descKey: 'solutions.hotelPain2Desc' },
    { icon: <BarChart3 size={24} />, titleKey: 'solutions.hotelPain3Title', descKey: 'solutions.hotelPain3Desc' },
  ];

  const features = [
    { icon: <Calendar size={20} />, titleKey: 'solutions.hotelFeat1Title', descKey: 'solutions.hotelFeat1Desc' },
    { icon: <Radio size={20} />, titleKey: 'solutions.hotelFeat2Title', descKey: 'solutions.hotelFeat2Desc' },
    { icon: <FileText size={20} />, titleKey: 'solutions.hotelFeat3Title', descKey: 'solutions.hotelFeat3Desc' },
    { icon: <Settings size={20} />, titleKey: 'solutions.hotelFeat4Title', descKey: 'solutions.hotelFeat4Desc' },
  ];

  return (
    <div className="solutions-page">
      <LandingNav />

      {/* Hero */}
      <section className="solutions-hero">
        <img src={HERO_IMG} alt="" className="solutions-hero-bg" loading="eager" />
        <div className="solutions-hero-overlay" />
        <motion.div className="solutions-hero-content" variants={fadeUp} initial="hidden" animate="show">
          <span className="solutions-hero-eyebrow">{t('solutions.hotelEyebrow')}</span>
          <h1 className="solutions-hero-title">{t('solutions.hotelTitle')}</h1>
          <p className="solutions-hero-subtitle">{t('solutions.hotelSubtitle')}</p>
        </motion.div>
      </section>

      {/* Pain Points */}
      <div className="solutions-section-alt">
        <div className="solutions-section">
          <ScrollReveal>
            <div className="solutions-section-header">
              <h2>{t('solutions.hotelPainTitle')}</h2>
              <p>{t('solutions.hotelPainSubtitle')}</p>
            </div>
          </ScrollReveal>
          <div className="solutions-cards solutions-cards--3">
            {painPoints.map((item, i) => (
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
      </div>

      {/* Features */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-section-header">
            <h2>{t('solutions.hotelFeatTitle')}</h2>
          </div>
        </ScrollReveal>
        <div className="solutions-cards solutions-cards--4">
          {features.map((item, i) => (
            <ScrollReveal key={item.titleKey} delay={i * 0.08}>
              <div className="solutions-card solutions-card--uniform">
                <div className="solutions-card-icon">{item.icon}</div>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.descKey)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="solutions-section-alt">
        <div className="solutions-section">
          <div className="solutions-stats">
            <div>
              <span className="solutions-stat-value">0%</span>
              <span className="solutions-stat-label">{t('solutions.hotelStat1')}</span>
            </div>
            <div>
              <span className="solutions-stat-value">40%</span>
              <span className="solutions-stat-label">{t('solutions.hotelStat2')}</span>
            </div>
            <div>
              <span className="solutions-stat-value">4.9</span>
              <span className="solutions-stat-label">{t('solutions.hotelStat3')}</span>
            </div>
            <div>
              <span className="solutions-stat-value">24/7</span>
              <span className="solutions-stat-label">{t('solutions.hotelStat4')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing hint */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-pricing-hint">
            <p>{t('solutions.hotelPricingHint')}</p>
          </div>
        </ScrollReveal>
      </div>

      {/* CTA */}
      <div className="solutions-section">
        <div className="solutions-cta">
          <h2>{t('solutions.hotelCtaTitle')}</h2>
          <p>{t('solutions.hotelCtaSubtitle')}</p>
          <Link to="/register?role=hotel_staff" className="solutions-cta-btn">
            {t('solutions.hotelCtaBtn')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
