import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function PressPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.press.title')} subtitle={t('info.press.subtitle')}>
      <h2>{t('info.press.recentNews')}</h2>
      <div className="info-card-grid">
        <div className="info-card">
          <span className="info-tag">{t('info.press.news1Tag')}</span>
          <h3>{t('info.press.news1Title')}</h3>
          <p>{t('info.press.news1Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.press.news2Tag')}</span>
          <h3>{t('info.press.news2Title')}</h3>
          <p>{t('info.press.news2Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.press.news3Tag')}</span>
          <h3>{t('info.press.news3Title')}</h3>
          <p>{t('info.press.news3Desc')}</p>
        </div>
        <div className="info-card">
          <span className="info-tag">{t('info.press.news4Tag')}</span>
          <h3>{t('info.press.news4Title')}</h3>
          <p>{t('info.press.news4Desc')}</p>
        </div>
      </div>

      <h2>{t('info.press.mediaKit')}</h2>
      <p>
        <Trans i18nKey="info.press.mediaKitDesc" components={{ a: <a href="mailto:press@petitstay.com" /> }} />
      </p>

      <h2>{t('info.press.inquiries')}</h2>
      <p>
        <Trans i18nKey="info.press.inquiriesDesc" components={{ a: <a href="mailto:press@petitstay.com" /> }} />
      </p>
    </InfoLayout>
  );
}
