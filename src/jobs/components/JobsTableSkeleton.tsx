import { Skeleton } from '@/components/ui/skeleton'

export function JobsTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-11 rounded-lg" />
      ))}
    </div>
  )
}
