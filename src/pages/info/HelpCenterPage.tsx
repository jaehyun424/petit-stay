import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

export default function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.help.title')} subtitle={t('info.help.subtitle')}>
      <h2>{t('info.help.faqTitle')}</h2>
      <div className="info-faq">
        <details>
          <summary>{t('info.help.q1')}</summary>
          <p>{t('info.help.a1')}</p>
        </details>
        <details>
          <summary>{t('info.help.q2')}</summary>
          <p>{t('info.help.a2')}</p>
        </details>
        <details>
          <summary>{t('info.help.q3')}</summary>
          <p>{t('info.help.a3')}</p>
        </details>
        <details>
          <summary>{t('info.help.q4')}</summary>
          <p>{t('info.help.a4')}</p>
        </details>
        <details>
          <summary>{t('info.help.q5')}</summary>
          <p>{t('info.help.a5')}</p>
        </details>
        <details>
          <summary>{t('info.help.q6')}</summary>
          <p>{t('info.help.a6')}</p>
        </details>
      </div>

      <h2>{t('info.help.contactTitle')}</h2>
      <p>
        <Trans i18nKey="info.help.contactDesc">
          Could not find what you were looking for? Reach out to our support team at <a href="mailto:support@petitstay.com">support@petitstay.com</a> or use the
          in-app chat feature. We are available 24/7 during active sessions.
        </Trans>
      </p>
    </InfoLayout>
  );
}
