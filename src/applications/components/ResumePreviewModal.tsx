import { Download, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Candidate } from '@/candidates/types/candidate'

interface ResumePreviewModalProps {
  candidate: Candidate | null
  onOpenChange: (open: boolean) => void
}

/** Cloudinary/stored-file URLs don't carry a reliable extension, so PDFs are
 * detected by the (very common) `.pdf` suffix; anything else falls back to a
 * download link, since only PDFs render inline in a browser anyway. */
function isPdfUrl(url: string): boolean {
  return url.toLowerCase().split('?')[0].endsWith('.pdf')
}

export function ResumePreviewModal({ candidate, onOpenChange }: ResumePreviewModalProps) {
  const resumeUrl = candidate?.resumeUrl

  return (
    <Dialog open={candidate !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{candidate?.name}'s resume</DialogTitle>
        </DialogHeader>

        {resumeUrl && isPdfUrl(resumeUrl) ? (
          <iframe
            src={resumeUrl}
            title={`Resume preview — ${candidate?.name}`}
            className="h-[70vh] w-full rounded-md border border-border"
          />
        ) : resumeUrl ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-16 text-center">
            <FileWarning className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This resume can't be previewed inline in the browser. Download it to view it.
            </p>
            <Button asChild size="sm" variant="outline">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" />
                Download resume
              </a>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-16 text-center">
            <FileWarning className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No resume was uploaded for this application.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
