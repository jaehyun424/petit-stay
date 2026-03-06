import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

const faqKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export default function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.help.title')} subtitle={t('info.help.subtitle')}>
      <h2>{t('info.help.faqTitle')}</h2>
      <div className="info-faq">
        {faqKeys.map((n) => (
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
