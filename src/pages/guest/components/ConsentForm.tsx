import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { DEMO_MODE } from '../../../hooks/useDemo';
import { guestService } from '../../../services/firestore';

interface ConsentFormProps {
  bookingId?: string;
  onNext: () => void;
  onBack: () => void;
}

export function ConsentForm({ bookingId, onNext, onBack }: ConsentFormProps) {
  const { t } = useTranslation();
  const [consents, setConsents] = useState({ care: false, privacy: false, emergency: false });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allConsented = consents.care && consents.privacy && consents.emergency;

  const toggle = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const handleSubmit = async () => {
    if (!allConsented) return;
    setIsSubmitting(true);
    try {
      if (!DEMO_MODE && bookingId) {
        await guestService.submitConsent(bookingId, {
          agreedToTerms: consents.care,
          agreedToPrivacy: consents.privacy,
          agreedToLiability: consents.emergency,
        });
      }
      onNext();
    } catch (err) {
      console.error('Failed to submit consent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const items: { key: keyof typeof consents; label: string; detail: string }[] = [
    {
      key: 'care',
      label: t('guest.careConsentLabel'),
      detail: t('guest.careConsentDetail'),
    },
    {
      key: 'privacy',
      label: t('guest.privacyConsentLabel'),
      detail: t('guest.privacyConsentDetail'),
    },
    {
      key: 'emergency',
      label: t('guest.emergencyConsentLabel'),
      detail: t('guest.emergencyConsentDetail'),
    },
  ];

  return (
    <div className="guest-card">
      <h2 className="guest-card-title">{t('guest.consentTitle')}</h2>
      <p className="guest-subtitle">{t('guest.consentSubtitle')}</p>

      <div className="guest-consent-list">
        {items.map(({ key, label, detail }) => (
          <div key={key} className="guest-consent-item">
            <button
              type="button"
              className={`guest-consent-btn ${consents[key] ? 'guest-consent-btn-checked' : ''}`}
              onClick={() => toggle(key)}
              role="checkbox"
              aria-checked={consents[key]}
              aria-label={label}
            >
              <div className={`guest-consent-check ${consents[key] ? 'guest-consent-check-on' : ''}`} aria-hidden="true">
                {consents[key] && <Check size={14} strokeWidth={3} />}
              </div>
              <span>{label}</span>
            </button>
            <button
              type="button"
              className="guest-consent-expand"
              onClick={() => toggleExpand(key)}
              aria-expanded={expanded === key}
              aria-label={`${expanded === key ? 'Collapse' : 'Expand'} ${label}`}
            >
              {expanded === key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span className="guest-consent-expand-text">
                {expanded === key ? t('guest.readLess') : t('guest.readMore')}
              </span>
            </button>
            {expanded === key && (
              <div className="guest-consent-detail">
                <p>{detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="guest-btn-row">
        <button className="guest-btn guest-btn-secondary" onClick={onBack} disabled={isSubmitting} aria-label={t('guest.previousStep')}>{t('guest.previousStep')}</button>
        <button className="guest-btn guest-btn-primary" onClick={handleSubmit} disabled={!allConsented || isSubmitting} aria-label={t('guest.nextStep')}>
          {isSubmitting ? <span className="guest-spinner" aria-label="Loading" /> : t('guest.nextStep')}
        </button>
      </div>
    </div>
  );
}
