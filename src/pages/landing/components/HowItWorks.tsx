import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { Search, UserCheck, Heart } from 'lucide-react';

const steps = [
  { icon: <Search size={32} strokeWidth={1.5} />, titleKey: 'step1Title', descKey: 'step1Desc', number: '01' },
  { icon: <UserCheck size={32} strokeWidth={1.5} />, titleKey: 'step2Title', descKey: 'step2Desc', number: '02' },
  { icon: <Heart size={32} strokeWidth={1.5} />, titleKey: 'step3Title', descKey: 'step3Desc', number: '03' },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="v2-how section-padded section-cream">
      <ScrollReveal>
        <div className="v2-how-header">
          <span className="section-eyebrow">{t('landing.howItWorksEyebrow')}</span>
          <h2 className="section-heading">{t('landing.howItWorksTitle')}</h2>
        </div>
      </ScrollReveal>

      <div className="v2-how-grid">
        {steps.map((step, i) => (
          <ScrollReveal key={step.titleKey} delay={i * 0.12} direction="up">
            <div className="v2-how-card">
              <span className="v2-how-number">{step.number}</span>
              <div className="v2-how-icon">{step.icon}</div>
              <h3 className="v2-how-title">{t(`landing.${step.titleKey}`)}</h3>
              <p className="v2-how-desc">{t(`landing.${step.descKey}`)}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
