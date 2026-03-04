import { useTranslation } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.privacy.title')} subtitle={t('info.privacy.subtitle')}>
      <p className="info-legal-date">{t('info.privacy.lastUpdated')}</p>

      <h2>{t('info.privacy.section1Title')}</h2>
      <p>{t('info.privacy.section1Content')}</p>

      <h2>{t('info.privacy.section2Title')}</h2>
      <p>{t('info.privacy.section2Content')}</p>

      <h2>{t('info.privacy.section3Title')}</h2>
      <p>{t('info.privacy.section3Content')}</p>

      <h2>{t('info.privacy.section4Title')}</h2>
      <p>{t('info.privacy.section4Content')}</p>

      <h2>{t('info.privacy.section5Title')}</h2>
      <p>{t('info.privacy.section5Content')}</p>

      <h2>{t('info.privacy.section6Title')}</h2>
      <p>{t('info.privacy.section6Content')}</p>

      <h2>{t('info.privacy.section7Title')}</h2>
      <p>{t('info.privacy.section7Content')}</p>

      <h2>{t('info.privacy.section8Title')}</h2>
      <p>{t('info.privacy.section8Content')}</p>
    </InfoLayout>
  );
}
