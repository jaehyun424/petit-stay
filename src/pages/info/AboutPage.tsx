import { useTranslation } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.about.title')} subtitle={t('info.about.subtitle')}>
      <h2>{t('info.about.missionTitle')}</h2>
      <p>{t('info.about.missionDesc')}</p>

      <h2>{t('info.about.howWeWorkTitle')}</h2>
      <p>{t('info.about.howWeWorkDesc')}</p>
      <ul>
        <li>{t('info.about.bullet1')}</li>
        <li>{t('info.about.bullet2')}</li>
        <li>{t('info.about.bullet3')}</li>
        <li>{t('info.about.bullet4')}</li>
      </ul>

      <h2>{t('info.about.whereTitle')}</h2>
      <p>{t('info.about.whereDesc')}</p>

      <h2>{t('info.about.teamTitle')}</h2>
      <p>{t('info.about.teamDesc')}</p>
    </InfoLayout>
  );
}
