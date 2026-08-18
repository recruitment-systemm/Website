interface DashboardComingSoonProps {
  title: string
  description: string
}

export function DashboardComingSoon({ title, description }: DashboardComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-32 text-center">
      <span className="font-mono text-xs font-medium tracking-[0.15em] text-primary uppercase">
        Coming soon
      </span>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-md text-muted-foreground text-pretty">{description}</p>
    </div>
  )
}
