import { useTranslation } from 'react-i18next';

interface ConfirmationStepProps {
  confirmationCode: string;
  sitterName?: string;
}

export function ConfirmationStep({ confirmationCode, sitterName }: ConfirmationStepProps) {
  const { t } = useTranslation();

  return (
    <div className="guest-card guest-confirmation">
      <div className="guest-confirmation-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className="guest-card-title">{t('guest.confirmationTitle')}</h2>
      <p className="guest-confirmation-message">{t('guest.confirmationMessage')}</p>
      <div className="guest-confirmation-code">
        <span className="guest-info-label">{t('guest.confirmationCode')}</span>
        <span className="guest-code">{confirmationCode}</span>
      </div>
      {sitterName && (
        <p className="guest-confirmation-sitter">{t('guest.sitterArrival')}</p>
      )}
    </div>
  );
}
