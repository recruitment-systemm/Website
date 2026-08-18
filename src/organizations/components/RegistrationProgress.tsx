import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegistrationProgressProps {
  currentStep: 1 | 2
}

const steps = [
  { step: 1, label: 'Company details' },
  { step: 2, label: 'Tax verification' },
] as const

export function RegistrationProgress({ currentStep }: RegistrationProgressProps) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((step, index) => {
        const isComplete = currentStep > step.step
        const isActive = currentStep === step.step
        return (
          <div key={step.step} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-medium',
                  isComplete && 'bg-primary text-primary-foreground',
                  isActive && 'border border-primary text-primary',
                  !isComplete && !isActive && 'border border-border text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="size-3.5" strokeWidth={3} /> : step.step}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className={cn('mx-3 h-px flex-1', isComplete ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
