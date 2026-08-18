import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const statusSteps = [
  { label: 'Submitted', done: true },
  { label: 'Reviewed', done: true },
  { label: 'Approved', done: true },
]

const openRoles = [
  { title: 'Senior Product Designer', location: 'Cairo, Egypt' },
  { title: 'Backend Engineer', location: 'Remote' },
  { title: 'Talent Acquisition Lead', location: 'Dubai, UAE' },
]

export function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pt-20 pb-24 lg:grid-cols-[1.1fr_1fr] lg:pt-28 lg:pb-28">
        <div className="flex flex-col items-start gap-6">
          <span className="font-mono text-xs font-medium tracking-[0.15em] text-primary uppercase">
            Recruitment operations, for approved organizations
          </span>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            From registration to your first hire
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            HireDesk gates access at the door: organizations register, an
            administrator reviews and approves, and only then can HR and
            interviewers manage jobs — isolated, per tenant, from day one.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <Link to="/register">
                Register your company
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <p className="font-mono text-xs text-muted-foreground">
            No credit card required — approvals reviewed in 1–2 business days.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(11,18,32,0.04),0_16px_40px_-24px_rgba(11,18,32,0.25)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded bg-primary text-[11px] font-semibold text-primary-foreground">
                  H
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  acme-recruiting.hiredesk.app
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-approved/10 px-2 py-0.5 font-mono text-[11px] font-medium text-approved">
                <span className="size-1.5 rounded-full bg-approved" />
                Approved
              </span>
            </div>

            <div className="border-b border-border px-5 py-4">
              <p className="mb-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Organization status
              </p>
              <div className="flex items-center">
                {statusSteps.map((step, index) => (
                  <div key={step.label} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-approved text-approved-foreground">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {step.label}
                      </span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <span className="mx-2 h-px flex-1 bg-approved/40" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  Open roles
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {openRoles.length} active
                </span>
              </div>
              <div className="flex flex-col divide-y divide-border rounded-md border border-border">
                {openRoles.map((job) => (
                  <div key={job.title} className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{job.title}</span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {job.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
