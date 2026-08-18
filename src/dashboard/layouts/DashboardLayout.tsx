import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/shared/components/BrandMark'
import { DashboardDock } from '@/dashboard/components/DashboardDock'
import { logout } from '@/auth/api/authApi'
import { getCurrentAccount, type CurrentAccount } from '@/auth/api/accountApi'

function accountLabel(account: CurrentAccount): string {
  return account.type === 'organization'
    ? account.organization.name
    : `${account.employee.firstName} ${account.employee.lastName}`
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<CurrentAccount | null>(null)

  useEffect(() => {
    let cancelled = false
    getCurrentAccount().then((current) => {
      if (!cancelled) setAccount(current)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSignOut() {
    void logout().finally(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        {/* Points at the dashboard index, not the marketing site — the dock has
            no "home" icon, so this is how you get back to the overview. */}
        <Link to="/dashboard" className="block w-fit">
          <BrandMark />
        </Link>

        <div className="flex items-center gap-3">
          {account && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {accountLabel(account)}
            </span>
          )}
          <Button variant="outline" size="sm" className="h-9" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      <DashboardDock />
    </div>
  )
}
