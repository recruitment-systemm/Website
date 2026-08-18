import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

interface RestrictedSectionProps {
  title: string
  description: React.ReactNode
}

/**
 * Shown in place of a dashboard section's real content when the signed-in
 * account's role can't actually use it — e.g. an organization session on
 * Jobs, or an Interviewer on Jobs (HR-only). This isn't a missing feature:
 * each backend endpoint has its own role requirement (see `DashboardDock`'s
 * `DOCK_ITEMS` roles for the full per-section table), so these accounts get
 * a real 401/403/404 if they reach the page directly by URL — the dock
 * already hides the link, this is the landing-page-level backstop.
 */
export function RestrictedSection({ title, description }: RestrictedSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-32 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-5" />
      </span>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-md text-muted-foreground text-pretty">{description}</p>
    </div>
  )
}

export function OrganizationOnlyMessage({ section }: { section: string }) {
  return (
    <>
      You're signed in as the organization itself. To view and manage {section.toLowerCase()}, sign
      in as an HR or Interviewer teammate instead — invite one from the{' '}
      <Link to="/dashboard/organization" className="text-primary hover:underline">
        Organization page
      </Link>{' '}
      if you haven't yet.
    </>
  )
}

export function HrOnlyMessage({ section }: { section: string }) {
  return <>{section} is managed by your HR team — Interviewer accounts have view access elsewhere, but not here.</>
}
