// ============================================
// Petit Stay - Guest Page (Token-based, No Login)
// ============================================

import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGuestToken } from '../../hooks/useGuestToken';
import { StepIndicator } from './components/StepIndicator';
import { ReservationInfo } from './components/ReservationInfo';
import { ConsentForm } from './components/ConsentForm';
import { PaymentStep } from './components/PaymentStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import '../../styles/pages/guest.css';

export default function GuestPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t, i18n } = useTranslation();

  // Set language from URL param if provided
  const langParam = searchParams.get('lang');
  if (langParam && ['en', 'ko', 'ja', 'zh'].includes(langParam) && i18n.language !== langParam) {
    i18n.changeLanguage(langParam);
  }

  const { reservation, isLoading, isValid, isExpired, error } = useGuestToken(reservationId, token);
  const [currentStep, setCurrentStep] = useState(1);
  // TODO: Enable feedback step when backend triggers post-service flow

  const stepLabels = [t('guest.step1'), t('guest.step2'), t('guest.step3'), t('guest.step4')];

  if (isLoading) {
    return (
      <div className="guest-page">
        <div className="guest-container">
          <div className="guest-loading">
            <div className="guest-brand">Petit<span className="text-gold">Stay</span></div>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p>{t('guest.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="guest-page">
        <div className="guest-container">
          <div className="guest-error">
            <div className="guest-brand">Petit<span className="text-gold">Stay</span></div>
            <p>{t('guest.tokenExpired')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid || error || !reservation) {
    return (
      <div className="guest-page">
        <div className="guest-container">
          <div className="guest-error">
            <div className="guest-brand">Petit<span className="text-gold">Stay</span></div>
            <p>{t('guest.tokenInvalid')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-page">
      <div className="guest-container">
        <div className="guest-header">
          <div className="guest-brand">Petit<span className="text-gold">Stay</span></div>
          <LanguageSwitcher />
        </div>

        <h1 className="guest-title">{t('guest.pageTitle')}</h1>

        <StepIndicator currentStep={currentStep} totalSteps={4} labels={stepLabels} />

        {currentStep === 1 && (
          <ReservationInfo reservation={reservation} onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <ConsentForm onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
        )}
        {currentStep === 3 && (
          <PaymentStep
            totalAmount={reservation.totalAmount}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <ConfirmationStep
            confirmationCode={reservation.confirmationCode}
            sitterName={reservation.sitterName}
          />
        )}
      </div>
    </div>
  );
}
