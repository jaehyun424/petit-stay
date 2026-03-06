import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const CTA_BG = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=80';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="cta-section section-fullscreen cta-section-with-bg">
      <img className="cta-bg-image" src={CTA_BG} alt="" loading="lazy" aria-hidden="true" />
      <div className="cta-bg-overlay" />
      <div className="cta-content">
        <ScrollReveal>
          <h2 className="cta-title">{t('landing.ctaTitle')}</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="cta-subtitle">{t('landing.ctaSubtitle')}</p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <Link to="/register" className="hero-btn-primary">
            {t('landing.ctaGetStarted')}
            <ArrowRight size={18} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
