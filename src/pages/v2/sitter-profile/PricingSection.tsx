import { useTranslation } from 'react-i18next';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface PricingSectionProps {
  sitter: SitterProfileDetail;
}

export function PricingSection({ sitter }: PricingSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="sp-section sp-pricing">
      <h2 className="sp-section-title">{t('sitterProfile.pricing')}</h2>

      <div className="sp-price-display">
        <span className="sp-price-amount">
          ₩{sitter.hourlyRate.toLocaleString()}
        </span>
        <span className="sp-price-unit">/{t('search.perHour')}</span>
      </div>

      <p className="sp-price-note">{t('sitterProfile.priceNote')}</p>

      <div className="sp-availability">
        <h3 className="sp-subsection-title">{t('sitterProfile.availability')}</h3>
        <div className="sp-avail-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
            const entry = sitter.availability.find((a) => a.day === day);
            return (
              <div key={day} className={`sp-avail-day ${entry ? 'sp-avail-active' : ''}`}>
                <span className="sp-avail-label">{t(`sitterProfile.day${day}`)}</span>
                {entry ? (
                  <span className="sp-avail-slots">
                    {entry.slots.join(', ')}
                  </span>
                ) : (
                  <span className="sp-avail-off">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
