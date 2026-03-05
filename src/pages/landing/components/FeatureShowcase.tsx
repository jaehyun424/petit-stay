import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { Shield, CheckCircle, ClipboardList, Moon } from 'lucide-react';

const features = [
  { icon: <Shield size={28} strokeWidth={1.5} />, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: <CheckCircle size={28} strokeWidth={1.5} />, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: <ClipboardList size={28} strokeWidth={1.5} />, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: <Moon size={28} strokeWidth={1.5} />, titleKey: 'feature4Title', descKey: 'feature4Desc' },
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
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{t(`landing.${feature.titleKey}`)}</h3>
              <p className="feature-desc">{t(`landing.${feature.descKey}`)}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
