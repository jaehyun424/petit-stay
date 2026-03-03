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
      </div>

      <h2>{t('info.press.mediaKit')}</h2>
      <p>
        <Trans i18nKey="info.press.mediaKitDesc">
          For logos, brand guidelines, and high-resolution images, please contact our
          communications team at <a href="mailto:press@petitstay.com">press@petitstay.com</a>.
        </Trans>
      </p>

      <h2>{t('info.press.inquiries')}</h2>
      <p>
        <Trans i18nKey="info.press.inquiriesDesc">
          Journalists and media professionals can reach us at <a href="mailto:press@petitstay.com">press@petitstay.com</a>.
          We aim to respond to all inquiries within 24 hours.
        </Trans>
      </p>
    </InfoLayout>
  );
}
