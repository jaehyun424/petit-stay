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
          <div key={step} className={`guest-step ${isActive ? 'guest-step-active' : ''} ${isCompleted ? 'guest-step-completed' : ''}`}>
            <div className="guest-step-circle">
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className="guest-step-label">{labels[i]}</span>
            {step < totalSteps && <div className={`guest-step-line ${isCompleted ? 'guest-step-line-completed' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
