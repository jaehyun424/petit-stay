import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <nav className="guest-step-indicator" aria-label={t('guest.stepIndicatorLabel')} role="navigation">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const stepClass = `guest-step ${isActive ? 'guest-step-active' : ''} ${isCompleted ? 'guest-step-completed' : ''}`;
        return (
          <div key={step} className="guest-step-wrapper">
            {step > 1 && (
              <div className="guest-step-connector-track" aria-hidden="true">
                <motion.div
                  className="guest-step-connector-fill"
                  initial={false}
                  animate={{ scaleX: step <= currentStep ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            )}
            <div
              className={stepClass}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
            >
              <motion.div
                className="guest-step-circle"
                aria-label={`${t('guest.stepLabel')} ${step}: ${labels[i]}${isCompleted ? ` (${t('guest.completed')})` : ''}`}
                role="img"
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                  </motion.span>
                ) : step}
              </motion.div>
              <span className="guest-step-label" aria-hidden="true">{labels[i]}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
