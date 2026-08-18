import type { ReactNode } from 'react'
import { HomeLink } from '@/shared/components/HomeLink'
import { BrandMark } from '@/shared/components/BrandMark'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
}

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  contentClassName,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <HomeLink>
          <BrandMark wordmarkClassName="" />
        </HomeLink>

        <div className="max-w-sm">
          <span className="font-mono text-xs font-medium tracking-[0.15em] text-primary uppercase">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="mt-4 text-background/70 text-pretty">{description}</p>
        </div>

        <p className="font-mono text-xs text-background/50">
          Multi-tenant · Role-based · Secure by design
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className={cn('mx-auto w-full max-w-sm', contentClassName)}>
          <HomeLink className="mb-8 block w-fit lg:hidden">
            <BrandMark />
          </HomeLink>

          {children}

          {footer && <div className="mt-6 border-t border-border pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
