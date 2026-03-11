import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { demoSitters } from '../../../data/v2-demo-sitters';

function formatRate(rate: number): string {
  return `₩${rate.toLocaleString()}`;
}

export function SitterPreview() {
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  return (
    <section id="sitters" className="v2-sitters section-padded">
      <ScrollReveal>
        <div className="v2-sitters-header">
          <span className="section-eyebrow">{t('landing.sittersEyebrow')}</span>
          <h2 className="section-heading">{t('landing.sittersTitle')}</h2>
          <p className="section-subheading">{t('landing.sittersSubtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="v2-sitter-grid">
        {demoSitters.map((sitter, i) => (
          <ScrollReveal key={sitter.id} delay={i * 0.1} direction="up">
            <div className="v2-sitter-card">
              <div className="v2-sitter-photo-wrap">
                <img
                  src={sitter.photo}
                  alt={isKo ? sitter.nameKo : sitter.name}
                  className="v2-sitter-photo"
                  loading="lazy"
                />
              </div>
              <div className="v2-sitter-info">
                <h3 className="v2-sitter-name">{isKo ? sitter.nameKo : sitter.name}</h3>
                <div className="v2-sitter-rating">
                  <Star size={14} fill="var(--gold-400)" color="var(--gold-400)" />
                  <span>{sitter.rating}</span>
                  <span className="v2-sitter-review-count">({sitter.reviewCount})</span>
                </div>
                <div className="v2-sitter-langs">
                  {sitter.languages.map((lang) => (
                    <span key={lang} className="v2-lang-badge">{lang}</span>
                  ))}
                </div>
                <div className="v2-sitter-badges">
                  {sitter.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="v2-cert-badge">{badge}</span>
                  ))}
                </div>
                <div className="v2-sitter-rate">
                  {formatRate(sitter.hourlyRate)}<span className="v2-sitter-rate-unit">/{t('landing.perHour')}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.3}>
        <div className="v2-sitters-cta">
          <Link to="/search" className="v2-sitters-browse-btn">
            {t('landing.browseSitters')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
