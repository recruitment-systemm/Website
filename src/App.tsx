import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/shared/components/ScrollToTop'
import { ScrollToHash } from '@/shared/components/ScrollToHash'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <TooltipProvider delayDuration={100}>
      <ScrollToTop />
      <ScrollToHash />
      <AppRoutes />
      <Toaster position="top-center" />
    </TooltipProvider>
  )
}

export default App
