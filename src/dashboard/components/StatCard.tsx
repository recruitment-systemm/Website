import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: 'default' | 'approved' | 'pending'
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'bg-primary/10 text-primary',
  approved: 'bg-approved/10 text-approved',
  pending: 'bg-pending/10 text-pending',
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'default' }: StatCardProps) {
  return (
    <Card className="gap-3">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', ACCENT_CLASSES[accent])}>
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  )
}
