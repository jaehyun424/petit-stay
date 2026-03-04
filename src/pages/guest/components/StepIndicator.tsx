import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="guest-step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <div key={step} className="guest-step-wrapper">
            {/* Connecting line before (except first step) */}
            {step > 1 && (
              <div className={`guest-step-connector ${step <= currentStep ? 'guest-step-connector-done' : ''}`} />
            )}
            <div className={`guest-step ${isActive ? 'guest-step-active' : ''} ${isCompleted ? 'guest-step-completed' : ''}`}>
              <div className="guest-step-circle">
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step}
              </div>
              <span className="guest-step-label">{labels[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
