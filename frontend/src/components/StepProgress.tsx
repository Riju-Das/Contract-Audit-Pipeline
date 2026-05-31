type StepProgressProps = {
    steps: { label: string; description?: string }[];
    currentStep?: number;
};

export function StepProgress({ steps, currentStep = 0 }: StepProgressProps) {
    return (
        <div className="step-progress">
            {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isActive = index === currentStep;
                const isLast = index === steps.length - 1;
                const stateClass = isDone
                    ? 'step-progress-item--done'
                    : isActive
                    ? 'step-progress-item--active'
                    : '';

                return (
                    <div key={index} className={`step-progress-item ${stateClass}`}>
                        <div className="step-progress-indicator">
                            <div className="step-progress-dot">
                                {isDone ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            {!isLast && <div className="step-progress-line" />}
                        </div>
                        <div className="step-progress-label">{step.label}</div>
                        {step.description && (
                            <div className="step-progress-desc">{step.description}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
