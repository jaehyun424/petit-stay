import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { AnimatedCounter } from '../../../components/common/AnimatedCounter';

const stats = [
  { key: 'hotels', target: 30, suffix: '+' },
  { key: 'families', target: 5000, suffix: '+' },
  { key: 'sessions', target: 50, suffix: '+' },
  { key: 'satisfaction', target: 100, suffix: '%' },
];

export function TrustBar() {
  const { t } = useTranslation();

  return (
    <section className="trust-bar section-padded">
      <ScrollReveal>
        <div className="trust-bar-grid">
          {stats.map((stat) => (
            <div key={stat.key} className="trust-stat">
              <span className="trust-stat-value">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2} />
              </span>
              <span className="trust-stat-label">{t(`landing.stat${stat.key.charAt(0).toUpperCase() + stat.key.slice(1)}`)}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
