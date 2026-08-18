import { Navbar } from '@/landing/components/Navbar'
import { Footer } from '@/landing/components/Footer'
import { PublicJobBoard } from '@/jobs/components/PublicJobBoard'

export function JobBoardPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <PublicJobBoard />
      </main>
      <Footer />
    </div>
  )
}
