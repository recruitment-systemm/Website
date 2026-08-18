import { Skeleton } from '@/components/ui/skeleton'

export function CandidateBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex w-72 shrink-0 flex-col gap-3">
          <Skeleton className="h-8 rounded-lg" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <Skeleton key={cardIndex} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
