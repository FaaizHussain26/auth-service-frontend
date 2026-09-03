"use client";

export function Stepper({
  steps,
  currentIndex,
  furthestIndex,
  onStepClick,
}: {
  steps: { title: string }[];
  currentIndex: number;
  furthestIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="mb-6 flex items-center">
      {steps.map((step, index) => {
        const reached = index <= furthestIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.title} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!reached}
              onClick={() => onStepClick?.(index)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${step.title}`}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isCurrent
                  ? "bg-brand-600 text-white"
                  : reached
                    ? "bg-brand-100 text-brand-700 hover:bg-brand-100/80"
                    : "cursor-not-allowed bg-surface-page text-ink-500"
              }`}
            >
              {index + 1}
            </button>
            <span className={`ml-2 hidden text-xs font-medium sm:block ${isCurrent ? "text-ink-900" : "text-ink-500"}`}>
              {step.title}
            </span>
            {index < steps.length - 1 ? <span className="mx-3 h-px flex-1 bg-surface-border" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
