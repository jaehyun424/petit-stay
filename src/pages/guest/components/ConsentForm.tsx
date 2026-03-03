import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ConsentFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function ConsentForm({ onNext, onBack }: ConsentFormProps) {
  const { t } = useTranslation();
  const [consents, setConsents] = useState({ terms: false, privacy: false, liability: false });

  const allConsented = consents.terms && consents.privacy && consents.liability;

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.consentTitle')}</h2>
      <div className="guest-consent-list">
        <label className="guest-consent-item">
          <input
            type="checkbox"
            checked={consents.terms}
            onChange={(e) => setConsents({ ...consents, terms: e.target.checked })}
          />
          <span>{t('guest.termsOfService')}</span>
        </label>
        <label className="guest-consent-item">
          <input
            type="checkbox"
            checked={consents.privacy}
            onChange={(e) => setConsents({ ...consents, privacy: e.target.checked })}
          />
          <span>{t('guest.privacyPolicy')}</span>
        </label>
        <label className="guest-consent-item">
          <input
            type="checkbox"
            checked={consents.liability}
            onChange={(e) => setConsents({ ...consents, liability: e.target.checked })}
          />
          <span>{t('guest.liabilityWaiver')}</span>
        </label>
      </div>
      <div className="guest-consent-signature">
        <label className="guest-info-label">{t('guest.signatureLabel')}</label>
        <div className="guest-signature-pad">
          <p className="guest-signature-placeholder">{t('guest.signaturePlaceholder')}</p>
        </div>
      </div>
      <div className="guest-btn-row">
        <button className="guest-btn guest-btn-secondary" onClick={onBack}>{t('guest.previousStep')}</button>
        <button className="guest-btn guest-btn-primary" onClick={onNext} disabled={!allConsented}>{t('guest.nextStep')}</button>
      </div>
    </div>
  );
}
