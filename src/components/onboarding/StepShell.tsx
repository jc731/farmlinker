import { cn } from '@/lib/utils';

interface Props {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function StepShell({
  step, totalSteps, title, description, children,
  onBack, onNext, onSubmit, submitLabel = 'Submit profile', loading,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Content */}
      <div className="space-y-5">{children}</div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium',
            onBack
              ? 'border border-input hover:bg-accent'
              : 'invisible'
          )}
        >
          Back
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue
          </button>
        )}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
