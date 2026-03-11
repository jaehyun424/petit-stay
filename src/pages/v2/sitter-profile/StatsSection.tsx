import { useTranslation } from 'react-i18next';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface StatsSectionProps {
  sitter: SitterProfileDetail;
}

export function StatsSection({ sitter }: StatsSectionProps) {
  const { t } = useTranslation();
  const { stats } = sitter;

  const items = [
    { label: t('sitterProfile.responseRate'), value: `${stats.responseRate}%`, good: stats.responseRate >= 90 },
    { label: t('sitterProfile.acceptRate'), value: `${stats.acceptRate}%`, good: stats.acceptRate >= 85 },
    { label: t('sitterProfile.cancelRate'), value: `${stats.cancelRate}%`, good: stats.cancelRate <= 5 },
    { label: t('sitterProfile.rebookRate'), value: `${stats.rebookRate}%`, good: stats.rebookRate >= 30 },
  ];

  return (
    <section className="sp-section">
      <h2 className="sp-section-title">{t('sitterProfile.statistics')}</h2>
      <div className="sp-stats-grid">
        {items.map(({ label, value, good }) => (
          <div key={label} className="sp-stat-card">
            <span className={`sp-stat-value ${good ? 'sp-stat-good' : 'sp-stat-neutral'}`}>
              {value}
            </span>
            <span className="sp-stat-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
