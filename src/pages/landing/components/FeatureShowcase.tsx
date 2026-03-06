import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { Shield, CheckCircle, ClipboardList, Moon } from 'lucide-react';

const features = [
  {
    icon: <Shield size={28} strokeWidth={1.5} />,
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
    imageAlt: 'Child safety and protection at hotel',
  },
  {
    icon: <CheckCircle size={28} strokeWidth={1.5} />,
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&q=80',
    imageAlt: 'Verified professional childcare specialist with child',
  },
  {
    icon: <ClipboardList size={28} strokeWidth={1.5} />,
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    imageAlt: 'Structured childcare activities for children',
  },
  {
    icon: <Moon size={28} strokeWidth={1.5} />,
    titleKey: 'feature4Title',
    descKey: 'feature4Desc',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    imageAlt: 'Premium hotel evening and night care service',
  },
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

      <div className="feature-grid">
        {features.map((feature, index) => (
          <ScrollReveal key={feature.titleKey} delay={index * 0.1} direction="up">
            <div className="feature-card">
              <div className="feature-card-image">
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  loading="lazy"
                />
              </div>
              <div className="feature-card-body">
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
