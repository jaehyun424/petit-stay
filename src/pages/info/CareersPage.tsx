import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.careers.title')} subtitle={t('info.careers.subtitle')}>
      <h2>{t('info.careers.whyTitle')}</h2>
      <p>{t('info.careers.whyDesc')}</p>

      <h2>{t('info.careers.openPositions')}</h2>
      <div className="info-card-grid">
        <div className="info-card">
          <span className="info-tag">{t('info.careers.job1Tag')}</span>
          <h3>{t('info.careers.job1Title')}</h3>
          <p>{t('info.careers.job1Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.careers.job2Tag')}</span>
          <h3>{t('info.careers.job2Title')}</h3>
          <p>{t('info.careers.job2Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.careers.job3Tag')}</span>
          <h3>{t('info.careers.job3Title')}</h3>
          <p>{t('info.careers.job3Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.careers.job4Tag')}</span>
          <h3>{t('info.careers.job4Title')}</h3>
          <p>{t('info.careers.job4Desc')}</p>
        </div>
      </div>

      <h2>{t('info.careers.benefitsTitle')}</h2>
      <ul>
        <li>{t('info.careers.benefit1')}</li>
        <li>{t('info.careers.benefit2')}</li>
        <li>{t('info.careers.benefit3')}</li>
        <li>{t('info.careers.benefit4')}</li>
      </ul>

      <h2>{t('info.careers.howToApply')}</h2>
      <p>
        <Trans i18nKey="info.careers.applyEmail" components={{ a: <a href="mailto:careers@petitstay.com" /> }} />
      </p>
    </InfoLayout>
  );
}
