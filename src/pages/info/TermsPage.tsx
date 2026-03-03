import { useTranslation } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.terms.title')} subtitle={t('info.terms.subtitle')}>
      <p className="info-legal-date">{t('info.terms.lastUpdated')}</p>

      <h2>{t('info.terms.section1Title')}</h2>
      <p>{t('info.terms.section1Content')}</p>

      <h2>{t('info.terms.section2Title')}</h2>
      <p>{t('info.terms.section2Content')}</p>

      <h2>{t('info.terms.section3Title')}</h2>
      <p>{t('info.terms.section3Content')}</p>

      <h2>{t('info.terms.section4Title')}</h2>
      <p>{t('info.terms.section4Content')}</p>

      <h2>{t('info.terms.section5Title')}</h2>
      <p>{t('info.terms.section5Content')}</p>

      <h2>{t('info.terms.section6Title')}</h2>
      <p>{t('info.terms.section6Content')}</p>

      <h2>{t('info.terms.section7Title')}</h2>
      <p>{t('info.terms.section7Content')}</p>

      <h2>{t('info.terms.section8Title')}</h2>
      <p>{t('info.terms.section8Content')}</p>

      <h2>{t('info.terms.section9Title')}</h2>
      <p>{t('info.terms.section9Content')}</p>
    </InfoLayout>
  );
}
