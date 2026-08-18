import { Link } from 'react-router-dom'
import { FileText, Mail, Phone } from 'lucide-react'
import { CandidateAvatar } from '@/candidates/components/CandidateAvatar'
import { STAGE_CONFIG } from '@/candidates/config/stageConfig'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/candidates/types/candidate'

interface ApplicationsTableProps {
  applications: Candidate[]
  /** Job id → title, resolved from `listJobs()` since `ApplicationResponse` only carries `jobId`. */
  jobTitles: Record<string, string>
  onPreviewResume: (candidate: Candidate) => void
}

export function ApplicationsTable({ applications, jobTitles, onPreviewResume }: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        No applications match this view.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card ring-1 ring-foreground/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Candidate
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Contact
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Applied for
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Resume
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Stage
            </th>
            <th className="px-5 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Applied
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((candidate) => {
            const stage = STAGE_CONFIG[candidate.stage]
            return (
              <tr key={candidate.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CandidateAvatar name={candidate.name} />
                    <p className="truncate font-medium text-foreground">{candidate.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Mail className="size-3.5 shrink-0" />
                      {candidate.email}
                    </span>
                    {candidate.phone && (
                      <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-xs">
                        <Phone className="size-3.5 shrink-0" />
                        {candidate.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-foreground">
                  {jobTitles[candidate.jobId] ?? '—'}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {candidate.resumeUrl ? (
                    <button
                      type="button"
                      onClick={() => onPreviewResume(candidate)}
                      className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary hover:underline"
                    >
                      <FileText className="size-3.5 shrink-0" />
                      <span className="max-w-40 truncate">View resume</span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-medium',
                      stage.badgeBg,
                      stage.text
                    )}
                  >
                    {stage.label}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {formatRelativeTime(candidate.appliedAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="border-t border-border px-5 py-3">
        <Link to="/dashboard/candidates" className="text-xs font-medium text-primary hover:underline">
          View full pipeline in Candidates →
        </Link>
      </div>
    </div>
  )
}
