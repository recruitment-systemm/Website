import { SectionHeading } from '@/landing/components/SectionHeading'

const steps = [
  {
    step: '01',
    title: 'Register your organization',
    description:
      'Create your company account and upload your tax registration document.',
  },
  {
    step: '02',
    title: 'Get reviewed and approved',
    description:
      'An administrator reviews your request. You’ll be notified once your organization is accepted.',
  },
  {
    step: '03',
    title: 'Invite your team',
    description:
      'Add HR users and interviewers, and assign them the right level of access.',
  },
  {
    step: '04',
    title: 'Post and manage jobs',
    description:
      'Create job openings with location details and manage them through to close.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Process"
          title="From registration to your first hire"
          description="A simple, guided path to get your organization up and running."
        />

        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="border-t border-border pt-5">
              <span className="font-heading text-3xl font-semibold text-primary/25">
                {item.step}
              </span>
              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
