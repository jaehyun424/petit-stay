import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { Search, CalendarCheck, Smile } from 'lucide-react';

const steps = [
  {
    icon: <Search size={32} strokeWidth={1.5} />,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    number: '01',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    imageAlt: 'Family booking hotel childcare on smartphone',
  },
  {
    icon: <CalendarCheck size={32} strokeWidth={1.5} />,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    number: '02',
    image: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80',
    imageAlt: 'Professional sitter assigned to family',
  },
  {
    icon: <Smile size={32} strokeWidth={1.5} />,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    number: '03',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
    imageAlt: 'Happy child enjoying care activities',
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="how-it-works section-padded section-cream">
      <ScrollReveal>
        <div className="feature-showcase-header">
          <span className="section-eyebrow">{t('landing.howItWorksEyebrow')}</span>
          <h2 className="section-heading">{t('landing.howItWorksTitle')}</h2>
        </div>
      </ScrollReveal>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <ScrollReveal key={step.titleKey} delay={index * 0.15} direction="up">
            <div className="step-card">
              <div className="step-card-image">
                <img
                  src={step.image}
                  alt={step.imageAlt}
                  loading="lazy"
                />
              </div>
              <span className="step-number">{step.number}</span>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{t(`landing.${step.titleKey}`)}</h3>
              <p className="step-desc">{t(`landing.${step.descKey}`)}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
