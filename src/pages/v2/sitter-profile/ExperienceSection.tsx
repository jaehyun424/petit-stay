import { useTranslation } from 'react-i18next';
import { Briefcase, Moon } from 'lucide-react';
import type { SitterProfileDetail } from '../../../data/v2-demo-sitters';

interface ExperienceSectionProps {
  sitter: SitterProfileDetail;
}

const serviceKeys: Record<string, string> = {
  play: 'sitterProfile.servicePlay',
  meal: 'sitterProfile.serviceMeal',
  sleep: 'sitterProfile.serviceSleep',
  safety: 'sitterProfile.serviceSafety',
};

const ageSymbol: Record<string, string> = {
  none: '○',
  basic: '◑',
  experienced: '◎',
};

export function ExperienceSection({ sitter }: ExperienceSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="sp-section">
      <h2 className="sp-section-title">{t('sitterProfile.experience')}</h2>

      <div className="sp-exp-summary">
        <Briefcase size={18} />
        <span>
          {t('sitterProfile.yearsExp', { count: sitter.experienceYears })}
        </span>
      </div>

      <div className="sp-age-exp">
        <h3 className="sp-subsection-title">{t('sitterProfile.ageExperience')}</h3>
        <div className="sp-age-exp-grid">
          {sitter.ageExperience.map(({ range, level }) => (
            <div key={range} className="sp-age-exp-item">
              <span className="sp-age-symbol">{ageSymbol[level]}</span>
              <span className="sp-age-range">{range}{t('sitterProfile.ageUnit')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-services">
        <h3 className="sp-subsection-title">{t('sitterProfile.serviceScope')}</h3>
        <div className="sp-service-tags">
          {sitter.services.map((s) => (
            <span key={s} className="sp-service-tag">{t(serviceKeys[s])}</span>
          ))}
        </div>
      </div>

      <div className={`sp-night ${sitter.nightAvailable ? 'sp-night-yes' : 'sp-night-no'}`}>
        <Moon size={16} />
        <span>
          {sitter.nightAvailable
            ? t('sitterProfile.nightYes')
            : t('sitterProfile.nightNo')}
        </span>
      </div>
    </section>
  );
}
