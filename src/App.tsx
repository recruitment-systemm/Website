import { AppRoutes } from '@/routes/AppRoutes'
import { ScrollToTop } from '@/shared/components/ScrollToTop'
import { ScrollToHash } from '@/shared/components/ScrollToHash'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  return (
    <TooltipProvider delayDuration={100}>
      <ScrollToTop />
      <ScrollToHash />
      <AppRoutes />
    </TooltipProvider>
  )
}

export default App
