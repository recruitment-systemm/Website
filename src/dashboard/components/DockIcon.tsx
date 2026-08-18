import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface DockItem {
  label: string
  to: string
  icon: LucideIcon
}

const BASE_SIZE = 44
const MAX_SIZE = 68
const PROXIMITY = 140

interface DockIconProps {
  item: DockItem
  mouseX: number | null
}

export function DockIcon({ item, mouseX }: DockIconProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [size, setSize] = useState(BASE_SIZE)

  useEffect(() => {
    if (mouseX === null || !ref.current) {
      setSize(BASE_SIZE)
      return
    }
    const rect = ref.current.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const distance = Math.abs(mouseX - center)
    const falloff = Math.max(0, 1 - distance / PROXIMITY)
    setSize(BASE_SIZE + falloff * (MAX_SIZE - BASE_SIZE))
  }, [mouseX])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink to={item.to} ref={ref} className="flex shrink-0 flex-col items-center">
          {({ isActive }) => (
            <>
              <div
                style={{ width: size, height: size }}
                className={cn(
                  'flex items-center justify-center rounded-xl border transition-[width,height,background-color,border-color,color] duration-150 ease-out',
                  isActive
                    ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon size={size * 0.45} strokeWidth={1.75} />
              </div>
              <span
                className={cn(
                  'mt-1.5 size-1 rounded-full transition-opacity',
                  isActive ? 'bg-primary opacity-100' : 'opacity-0'
                )}
              />
            </>
          )}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={10}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}
