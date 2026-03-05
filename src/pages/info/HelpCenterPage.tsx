import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

const faqCount = 15;

export default function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.help.title')} subtitle={t('info.help.subtitle')}>
      <h2>{t('info.help.faqTitle')}</h2>
      <div className="info-faq">
        {Array.from({ length: faqCount }, (_, i) => i + 1).map((n) => (
          <details key={n}>
            <summary>{t(`info.help.q${n}`)}</summary>
            <p>{t(`info.help.a${n}`)}</p>
          </details>
        ))}
      </div>

      <h2>{t('info.help.contactTitle')}</h2>
      <p>
        <Trans i18nKey="info.help.contactDesc" components={{ a: <a href="mailto:support@petitstay.com" /> }} />
      </p>
    </InfoLayout>
  );
}
