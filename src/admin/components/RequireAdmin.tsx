import { Navigate, Outlet } from 'react-router-dom'
import { isAdminSignedIn } from '@/admin/api/adminApi'

/**
 * Route guard for `/admin/*`. Reads the admin session synchronously (it's a
 * single localStorage flag, unlike `RequireOrganization` which has to resolve
 * an org record), so there's no loading state to render.
 *
 * This is a UI convenience only, not real access control: authentication-
 * service's `SecurityConfig` has no role check on `/api/v1/admin/**` beyond
 * requiring *some* authenticated JWT — an org or employee session's token
 * could call those endpoints directly regardless of what this guard shows.
 * That's a backend gap, not something this guard can close from the client.
 */
export function RequireAdmin() {
  if (!isAdminSignedIn()) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
