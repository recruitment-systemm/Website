import {
  Building2,
  MapPinned,
  ShieldCheck,
  UsersRound,
  Gauge,
  Layers,
} from 'lucide-react'
import { SectionHeading } from '@/landing/components/SectionHeading'

const features = [
  {
    icon: Building2,
    title: 'Guided organization onboarding',
    description:
      'Register your company, submit your tax documents, and track approval status in one place.',
  },
  {
    icon: MapPinned,
    title: 'Location-aware job postings',
    description:
      'Create jobs with an interactive map picker — address and coordinates are captured automatically.',
  },
  {
    icon: UsersRound,
    title: 'HR & interviewer roles',
    description:
      'Invite teammates with role-based access so HR and interviewers only see what they need.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure, multi-tenant by design',
    description:
      'Every organization is fully isolated — your jobs, users, and data never cross tenant boundaries.',
  },
  {
    icon: Gauge,
    title: 'A focused dashboard',
    description:
      'See open roles, pending approvals, and team activity at a glance, without the clutter.',
  },
  {
    icon: Layers,
    title: 'Built to grow with you',
    description:
      'Candidates, interviews, and analytics are on the roadmap — on the same foundation from day one.',
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-b border-border bg-secondary/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything your hiring team needs to get started"
          description="A focused toolset for organizations, jobs, and teams — with room to grow into your full recruitment pipeline."
        />

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3 bg-card px-6 py-8 sm:px-8">
              <feature.icon className="size-5 text-primary" strokeWidth={1.75} />
              <h3 className="font-heading text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
