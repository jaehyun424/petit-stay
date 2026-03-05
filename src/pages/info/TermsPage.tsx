import { useTranslation } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

const sectionCount = 12;

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.terms.title')} subtitle={t('info.terms.subtitle')}>
      <p className="info-legal-date">{t('info.terms.lastUpdated')}</p>

      {Array.from({ length: sectionCount }, (_, i) => i + 1).map((n) => (
        <div key={n}>
          <h2>{t(`info.terms.section${n}Title`)}</h2>
          <p>{t(`info.terms.section${n}Content`)}</p>
        </div>
      ))}
    </InfoLayout>
  );
}
