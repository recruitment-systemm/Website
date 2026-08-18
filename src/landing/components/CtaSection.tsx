import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="border-b border-border bg-foreground px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <span className="font-mono text-xs font-medium tracking-[0.15em] text-primary uppercase">
          Get started
        </span>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-background sm:text-4xl">
          Ready to organize your hiring process?
        </h2>
        <p className="mt-4 text-lg text-background/70 text-pretty">
          Register your organization today and get your team hiring in one
          focused workspace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link to="/register">
              Register your company
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-11 px-6 text-base text-background hover:bg-white/10 hover:text-background"
          >
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
