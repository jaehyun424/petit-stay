import { useTranslation, Trans } from 'react-i18next';
import { InfoLayout } from './InfoLayout';

const parentFaqKeys = [1, 2, 3, 4, 5] as const;
const sitterFaqKeys = [1, 2, 3, 4] as const;
const partnerFaqKeys = [1, 2, 3] as const;

export default function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <InfoLayout title={t('info.help.title')} subtitle={t('info.help.subtitle')}>
      {/* Parent FAQ */}
      <h2>{t('info.help.faqParentTitle')}</h2>
      <div className="info-faq">
        {parentFaqKeys.map((n) => (
          <details key={`p${n}`}>
            <summary>{t(`info.help.pq${n}`)}</summary>
            <p>{t(`info.help.pa${n}`)}</p>
          </details>
        ))}
      </div>

      {/* Sitter FAQ */}
      <h2>{t('info.help.faqSitterTitle')}</h2>
      <div className="info-faq">
        {sitterFaqKeys.map((n) => (
          <details key={`s${n}`}>
            <summary>{t(`info.help.sq${n}`)}</summary>
            <p>{t(`info.help.sa${n}`)}</p>
          </details>
        ))}
      </div>

      {/* Partner FAQ */}
      <h2>{t('info.help.faqPartnerTitle')}</h2>
      <div className="info-faq">
        {partnerFaqKeys.map((n) => (
          <details key={`t${n}`}>
            <summary>{t(`info.help.tq${n}`)}</summary>
            <p>{t(`info.help.ta${n}`)}</p>
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
