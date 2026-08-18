import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/shared/components/BrandMark'
import { adminLogout } from '@/admin/api/adminApi'

export function AdminLayout() {
  const navigate = useNavigate()

  function handleSignOut() {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="block w-fit">
            <BrandMark />
          </Link>
          {/* Marks this as the platform console rather than an org dashboard —
              the two look similar enough to be worth distinguishing. */}
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-medium text-primary">
            <ShieldCheck className="size-3" />
            Admin
          </span>
        </div>

        <Button variant="outline" size="sm" className="h-9" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </header>

      <main className="flex-1 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
