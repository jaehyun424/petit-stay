import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { ShieldCheck, Baby, Monitor } from 'lucide-react';

const FEATURE_IMAGES = [
  'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8363093/pexels-photo-8363093.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3760790/pexels-photo-3760790.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const features = [
  { icon: <Baby size={28} strokeWidth={1.5} />, titleKey: 'feature1Title', descKey: 'feature1Desc', image: FEATURE_IMAGES[0] },
  { icon: <ShieldCheck size={28} strokeWidth={1.5} />, titleKey: 'feature2Title', descKey: 'feature2Desc', image: FEATURE_IMAGES[1] },
  { icon: <Monitor size={28} strokeWidth={1.5} />, titleKey: 'feature3Title', descKey: 'feature3Desc', image: FEATURE_IMAGES[2] },
];

export function FeatureShowcase() {
  const { t } = useTranslation();

  return (
    <section id="features" className="feature-showcase section-padded">
      <ScrollReveal>
        <div className="feature-showcase-header">
          <span className="section-eyebrow">{t('landing.featuresEyebrow')}</span>
          <h2 className="section-heading">{t('landing.featuresTitle')}</h2>
          <p className="section-subheading">{t('landing.featuresSubtitle')}</p>
        </div>
      </ScrollReveal>

      <div className="feature-list">
        {features.map((feature, index) => (
          <ScrollReveal
            key={feature.titleKey}
            direction={index % 2 === 0 ? 'left' : 'right'}
            delay={0.1}
          >
            <div className={`feature-row ${index % 2 === 1 ? 'feature-row-reverse' : ''}`}>
              <div className="feature-image-wrap">
                <img
                  src={feature.image}
                  alt={t(`landing.${feature.titleKey}`)}
                  className="feature-image"
                  loading="lazy"
                />
              </div>
              <div className="feature-text">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{t(`landing.${feature.titleKey}`)}</h3>
                <p className="feature-desc">{t(`landing.${feature.descKey}`)}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
