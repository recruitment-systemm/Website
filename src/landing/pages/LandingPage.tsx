import { Navbar } from '@/landing/components/Navbar'
import { Hero } from '@/landing/components/Hero'
import { Features } from '@/landing/components/Features'
import { HowItWorks } from '@/landing/components/HowItWorks'
import { CtaSection } from '@/landing/components/CtaSection'
import { Faq } from '@/landing/components/Faq'
import { Footer } from '@/landing/components/Footer'

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CtaSection />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
