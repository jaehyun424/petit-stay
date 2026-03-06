import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Award, Calendar, GraduationCap, DollarSign, ArrowRight,
  BadgeCheck, Briefcase, Languages,
} from 'lucide-react';
import { LandingNav } from '../landing/components/LandingNav';
import { LandingFooter } from '../landing/components/LandingFooter';
import { ScrollReveal } from '../landing/components/ScrollReveal';
import '../../styles/pages/solutions.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1200&q=80';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export default function ForSpecialistsPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const benefits = [
    { icon: <Award size={24} />, titleKey: 'solutions.specBenefit1Title', descKey: 'solutions.specBenefit1Desc' },
    { icon: <DollarSign size={24} />, titleKey: 'solutions.specBenefit2Title', descKey: 'solutions.specBenefit2Desc' },
    { icon: <Calendar size={24} />, titleKey: 'solutions.specBenefit3Title', descKey: 'solutions.specBenefit3Desc' },
    { icon: <GraduationCap size={24} />, titleKey: 'solutions.specBenefit4Title', descKey: 'solutions.specBenefit4Desc' },
  ];

  return (
    <div className="solutions-page">
      <LandingNav />

      {/* Hero */}
      <section className="solutions-hero">
        <img src={HERO_IMG} alt="" className="solutions-hero-bg" loading="eager" />
        <div className="solutions-hero-overlay" />
        <motion.div className="solutions-hero-content" variants={fadeUp} initial="hidden" animate="show">
          <span className="solutions-hero-eyebrow">{t('solutions.specEyebrow')}</span>
          <h1 className="solutions-hero-title">{t('solutions.specTitle')}</h1>
          <p className="solutions-hero-subtitle">{t('solutions.specSubtitle')}</p>
        </motion.div>
      </section>

      {/* Benefits */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-section-header">
            <h2>{t('solutions.specBenefitTitle')}</h2>
          </div>
        </ScrollReveal>
        <div className="solutions-cards solutions-cards--4">
          {benefits.map((item, i) => (
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

      {/* Earnings */}
      <div className="solutions-section-alt">
        <div className="solutions-section">
          <ScrollReveal>
            <div className="solutions-section-header">
              <h2>{t('solutions.specEarningsTitle')}</h2>
              <p>{t('solutions.specEarningsSubtitle')}</p>
            </div>
          </ScrollReveal>
          <div className="solutions-stats">
            <div>
              <span className="solutions-stat-value">&#8361;60,000+</span>
              <span className="solutions-stat-label">{t('solutions.specStat1')}</span>
            </div>
            <div>
              <span className="solutions-stat-value">&#8361;90,000</span>
              <span className="solutions-stat-label">{t('solutions.specStat2')}</span>
            </div>
            <div>
              <span className="solutions-stat-value">+20%</span>
              <span className="solutions-stat-label">{t('solutions.specStat3')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="solutions-section">
        <ScrollReveal>
          <div className="solutions-section-header">
            <h2>{t('solutions.specReqTitle')}</h2>
            <p>{t('solutions.specReqSubtitle')}</p>
          </div>
        </ScrollReveal>
        <div className="solutions-cards solutions-cards--3">
          {([
            { key: 'solutions.specReq1', icon: <BadgeCheck size={24} /> },
            { key: 'solutions.specReq2', icon: <Briefcase size={24} /> },
            { key: 'solutions.specReq3', icon: <Languages size={24} /> },
          ] as const).map((item, i) => (
            <ScrollReveal key={item.key} delay={i * 0.1}>
              <div className="solutions-card solutions-card--uniform">
                <div className="solutions-card-icon">{item.icon}</div>
                <h3>{t(`${item.key}Title`)}</h3>
                <p>{t(`${item.key}Desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="solutions-section">
        <div className="solutions-cta">
          <h2>{t('solutions.specCtaTitle')}</h2>
          <p>{t('solutions.specCtaSubtitle')}</p>
          <Link to="/register?role=sitter" className="solutions-cta-btn">
            {t('solutions.specCtaBtn')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
