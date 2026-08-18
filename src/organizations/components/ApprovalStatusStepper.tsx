import { Check } from 'lucide-react'
import type { OrganizationStatus } from '@/organizations/types/organization'

const STEPS = ['Submitted', 'Reviewed', 'Approved'] as const

/**
 * How far along the approval process each status is. In practice only PENDING
 * reaches this component — rejected organizations get `RegistrationRejectedPage`,
 * which deliberately shows no progress tracker — but REJECTED is mapped anyway
 * so the component stays total over `OrganizationStatus`.
 */
const COMPLETED_STEPS: Record<OrganizationStatus, number> = {
  PENDING: 1,
  ACCEPTED: 3,
  REJECTED: 1,
}

interface ApprovalStatusStepperProps {
  status: OrganizationStatus
}

export function ApprovalStatusStepper({ status }: ApprovalStatusStepperProps) {
  const completed = COMPLETED_STEPS[status]

  return (
    <div className="flex items-center">
      {STEPS.map((label, index) => {
        const done = index < completed
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={
                  done
                    ? 'flex size-6 items-center justify-center rounded-full bg-approved text-approved-foreground'
                    : 'flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground'
                }
              >
                {done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <span className={`mx-2 h-px flex-1 ${done ? 'bg-approved/40' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
