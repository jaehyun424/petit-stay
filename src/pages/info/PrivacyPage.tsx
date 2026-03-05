import { useTranslation } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

const sectionCount = 10;

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.privacy.title')} subtitle={t('info.privacy.subtitle')}>
      <p className="info-legal-date">{t('info.privacy.lastUpdated')}</p>

      {Array.from({ length: sectionCount }, (_, i) => i + 1).map((n) => (
        <div key={n}>
          <h2>{t(`info.privacy.section${n}Title`)}</h2>
          <p>{t(`info.privacy.section${n}Content`)}</p>
        </div>
      ))}
    </InfoLayout>
  );
}
