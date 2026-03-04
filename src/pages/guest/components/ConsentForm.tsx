import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { DEMO_MODE } from '../../../hooks/useDemo';
import { guestService } from '../../../services/firestore';

interface ConsentFormProps {
  bookingId?: string;
  onNext: () => void;
  onBack: () => void;
}

export function ConsentForm({ bookingId, onNext, onBack }: ConsentFormProps) {
  const { t } = useTranslation();
  const [consents, setConsents] = useState({ terms: false, privacy: false, liability: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allConsented = consents.terms && consents.privacy && consents.liability;

  const toggle = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!allConsented) return;
    setIsSubmitting(true);
    try {
      if (!DEMO_MODE && bookingId) {
        await guestService.submitConsent(bookingId, {
          agreedToTerms: consents.terms,
          agreedToPrivacy: consents.privacy,
          agreedToLiability: consents.liability,
        });
      }
      onNext();
    } catch (err) {
      console.error('Failed to submit consent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const items: { key: keyof typeof consents; label: string }[] = [
    { key: 'terms', label: t('guest.termsOfService') },
    { key: 'privacy', label: t('guest.privacyPolicy') },
    { key: 'liability', label: t('guest.liabilityWaiver') },
  ];

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.consentTitle')}</h2>
      <div className="guest-consent-list">
        {items.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`guest-consent-btn ${consents[key] ? 'guest-consent-btn-checked' : ''}`}
            onClick={() => toggle(key)}
          >
            <div className={`guest-consent-check ${consents[key] ? 'guest-consent-check-on' : ''}`}>
              {consents[key] && <Check size={14} strokeWidth={3} />}
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="guest-btn-row">
        <button className="guest-btn guest-btn-secondary" onClick={onBack} disabled={isSubmitting}>{t('guest.previousStep')}</button>
        <button className="guest-btn guest-btn-primary" onClick={handleSubmit} disabled={!allConsented || isSubmitting}>
          {isSubmitting ? <span className="guest-spinner" /> : t('guest.nextStep')}
        </button>
      </div>
    </div>
  );
}
