import { siteConfig } from '@/shared/config/site'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
}

export function BrandMark({
  className,
  markClassName,
  wordmarkClassName = 'text-foreground',
}: BrandMarkProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground',
          markClassName
        )}
      >
        H
      </span>
      <span className={cn('font-heading text-base font-semibold tracking-tight', wordmarkClassName)}>
        {siteConfig.name}
      </span>
    </span>
  )
}
