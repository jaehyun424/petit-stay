import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const CTA_VIDEO = 'https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4';
const CTA_POSTER = 'https://images.pexels.com/photos/3209045/pexels-photo-3209045.jpeg?auto=compress&cs=tinysrgb&w=1920';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="cta-section section-fullscreen">
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={CTA_POSTER}
      >
        <source src={CTA_VIDEO} type="video/mp4" />
      </video>
      <div className="video-overlay video-overlay-dark" />

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
