import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getCurrentAccount, type CurrentAccount } from '@/auth/api/accountApi'
import { AccountContext } from '@/auth/context/AccountContext'

type AuthState =
  | { status: 'checking' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; account: CurrentAccount }

/**
 * Route guard for `/dashboard/*`. Signed-out visitors go to `/login`; orgs
 * still awaiting review go to `/pending-approval`; rejected ones go to
 * `/registration-rejected`. Only the admin console (`/admin`) can move an
 * organization between those states.
 *
 * Employee (HR/Interviewer) sessions skip the status check entirely — an
 * employee account can only be created under an already-`ACCEPTED`
 * organization (see `EmployeeService.createEmployee` on the backend), so
 * there's no pending/rejected state for an employee to land in.
 */
export function RequireOrganization() {
  const [state, setState] = useState<AuthState>({ status: 'checking' })

  useEffect(() => {
    let cancelled = false
    getCurrentAccount().then((account) => {
      if (cancelled) return
      setState(account ? { status: 'signed-in', account } : { status: 'signed-out' })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'checking') {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (state.status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (state.account.type === 'employee') {
    return (
      <AccountContext.Provider value={state.account}>
        <Outlet />
      </AccountContext.Provider>
    )
  }

  const { organization } = state.account

  if (organization.status === 'REJECTED') {
    return <Navigate to="/registration-rejected" replace />
  }

  if (organization.status !== 'ACCEPTED') {
    return <Navigate to="/pending-approval" replace />
  }

  return (
    <AccountContext.Provider value={state.account}>
      <Outlet />
    </AccountContext.Provider>
  )
}
