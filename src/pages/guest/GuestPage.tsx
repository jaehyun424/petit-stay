// ============================================
// Petit Stay - Guest Page (Token-based, No Login)
// ============================================

import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useGuestToken } from '../../hooks/useGuestToken';
import { StepIndicator } from './components/StepIndicator';
import { ReservationInfo } from './components/ReservationInfo';
import { ConsentForm } from './components/ConsentForm';
import { PaymentStep } from './components/PaymentStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { FeedbackStep } from './components/FeedbackStep';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { BrandLogo } from '../../components/common/BrandLogo';
import '../../styles/pages/guest.css';

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

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
  const totalSteps = 5;

  const stepLabels = [t('guest.step1'), t('guest.step2'), t('guest.step3'), t('guest.step4'), t('guest.step5')];

  if (isLoading) {
    return (
      <div className="guest-page">
        <div className="guest-container">
          <div className="guest-loading">
            <BrandLogo size="sm" showName />
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
            <BrandLogo size="sm" showName />
            <div className="guest-error-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="guest-error-title">{t('guest.tokenExpired')}</h2>
            <p className="guest-error-desc">{t('guest.tokenExpiredDesc')}</p>
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
            <BrandLogo size="sm" showName />
            <div className="guest-error-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="guest-error-title">{t('guest.tokenInvalid')}</h2>
            <p className="guest-error-desc">{t('guest.tokenInvalidDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-page">
      <div className="guest-container">
        <div className="guest-header">
          <BrandLogo size="sm" showName />
          <LanguageSwitcher />
        </div>

        <h1 className="guest-title">{t('guest.pageTitle')}</h1>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} labels={stepLabels} />

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit">
            {currentStep === 1 && (
              <ReservationInfo reservation={reservation} onNext={() => setCurrentStep(2)} />
            )}
            {currentStep === 2 && (
              <ConsentForm bookingId={reservation.id} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
            )}
            {currentStep === 3 && (
              <PaymentStep
                reservation={reservation}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                reservation={reservation}
                onNext={() => setCurrentStep(5)}
              />
            )}
            {currentStep === 5 && (
              <FeedbackStep bookingId={reservation.id} onSubmit={() => {}} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
